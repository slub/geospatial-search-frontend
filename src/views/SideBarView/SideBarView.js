/**
 * Created by jacob.mendt@pikobytes.de on 09.05.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, {Component, createRef} from 'react';
import {addUrlProps, UrlQueryParamTypes} from 'react-url-query';
import {ReactComponent as SortIcon} from './ControlIcons/sort.svg';
import {ReactComponent as SearchIcon} from './ControlIcons/search.svg';
import {ReactComponent as DownloadIcon} from './ControlIcons/download.svg';
import {ReactComponent as GeoresearchIcon} from './ControlIcons/georesearch.svg';
import {ReactComponent as LocalDocumentsIcon} from './ControlIcons/localdoc.svg';
import {ReactComponent as AllDocumentsIcon} from './ControlIcons/alldoc.svg';
import {ReactComponent as PrintIcon} from './ControlIcons/print.svg';
import {ReactComponent as PublicDocumentsIcon} from './ControlIcons/public.svg';
import {List} from 'immutable';
import PropTypes from 'prop-types';
import FileSaver from 'file-saver';
import {BREAK_POINT_XS} from '../../settings';
import {GEOM_METHOD} from '../MapView/structs/api';
import {parseAsCSV} from '../MapView/structs/parser';
import LangLabels from '../../views/MapView/components/Labels';
import ListItem from '../../components/ListItem/ListItem';
import FulltextSearch from '../../components/FulltextSearch/FulltextSearch';
import DlfBasket from "../../components/DlfBasket/DlfBasket";
import './SideBarView.scss';

// Global environmental settings for the solr
const SOLR_MAXCOUNT = parseInt(process.env.REACT_APP_SOLR_MAXCOUNT, 10);
const SHOW_THUMBNAILS = process.env.REACT_APP_FUNCTION_MAP_SHOW_THUMBNAILS === 'true';

/**
 * Specify how the URL gets decoded here. This is an object that takes the prop
 * name as a key, and a query param specifier as the value. The query param
 * specifier can have a `type`, indicating how to decode the value from the
 * URL, and a `queryParam` field that indicates which key in the query
 * parameters should be read (this defaults to the prop name if not provided).
 *
 * The queryParam value for `views` here matches the one used in the changeFoo
 * action.
 */
const urlPropsQueryConfig = {
  documentId: {type: UrlQueryParamTypes.string, queryParam: 'doc'},
};

/**
 * Generate refs for the automatic scroll behavior in case we wanna restore a list
 * @param {[*]} documents
 * @returns {*}
 */
function createRefs_(documents) {
  return documents.reduce((acc, feature) => {
    acc[feature._rawFeature.id] = createRef();
    return acc;
  }, {});
}

class SideBarView extends Component {
  constructor(props) {
    super(props);

    // For internal management flattened the documents to an array
    const docs = props.documents.toArray();

    this.state = {
      docs: docs,
      focusStartId: props.documentId !== undefined ? props.documentId : undefined,
      focusEndId: undefined,
      refs: docs.length > 0 ? createRefs_(docs) : {},
      refSidebar: React.createRef(),
    };

    // reset the url parameter for documentId
    this.props.onChangeDocumentId(undefined);
  }

  componentDidUpdate(prevProps) {
    const {focusStartId, focusEndId} = this.state;
    const {refs} = this.state;

    if (!prevProps.documents.equals(this.props.documents)) {
      const newDocs = this.props.documents.toArray();
      const newRefs = createRefs_(newDocs);
      this.setState(
        Object.assign(
          {docs: newDocs, refs: newRefs},
          focusStartId === undefined && focusEndId !== undefined
            ? {focusEndId: undefined}
            : {},
        ),
      );
    }

    // Check after render if there is focusStartId defined and the id is rendered
    if (focusStartId !== undefined && refs[focusStartId] !== undefined) {
      if (refs[focusStartId].current !== null) {
        this.setState(
          {focusStartId: undefined, focusEndId: focusStartId},
          () => {
            refs[focusStartId].current.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          },
        );
      }
    }
  }

  componentDidMount() {
    const {refSidebar} = this.state;

    if (this.props.onMount) {
      this.props.onMount(refSidebar.current.offsetWidth);
    }
  }

  handleClick = (id, {purl}) => {
    // Is a synchrone action
    this.props.onChangeDocumentId(id);

    // after updating the url jump route to the page
    window.location.href = purl;
  };

  handleExportCSV = () => {
    const {documents} = this.props;

    // Create the CSV string
    const csvString = parseAsCSV(
      documents.map(d => d._rawFeature),
    );

    // Save and Download it
    const blob = new Blob([csvString], {type: 'data:text/csv;charset=utf-8'});

    var saveTime = new Date();
    FileSaver.saveAs(blob, "searchresults-" + saveTime.getTime() + ".csv");
  };

  handleMouseMove = (doc) => {
    if (window.innerWidth >= BREAK_POINT_XS) {
      this.props.onUpdateFocusDocument(doc)
    }

    if (doc === undefined) {
      this.props.onUpdateFocusDocument(undefined)
    }
  };

  render() {
    const {
      className,
      maxDocuments,
      fetchOnlyMaps,
      fetchOnlyPublic,
      fulltextSearchOpen,
      fulltextSearchTerms,
      printDialogOpen,
      sorted,
      spatialSearchMethod,
      toggleIn,
    } = this.props;
    const {
      docs,
      focusEndId,
      refs,
      refSidebar,
    } = this.state;

    if (sorted) {
      docs.sort(
        (a, b) => {
          // Make sure that Point > LineString > Polygon
          const geomTypeA = a._rawFeature.geometry.type;
          const geomTypeB = b._rawFeature.geometry.type;
          const sortValueA = geomTypeA === 'Point'
            ? 0
            : geomTypeA === 'LineString'
              ? 1
              : 2;
          const sortValueB = geomTypeB === 'Point'
            ? 0
            : geomTypeB === 'LineString'
              ? 1
              : 2;

          // a should sorted behind b
          if (sortValueA > sortValueB) {
            return 1;
          }

          // a should be sorted before b
          if (sortValueB > sortValueA) {
            return -1;
          }

          // a is same as b
          return 0;
        }
      )
    }

    // select the spatial search method
    const intersectOn = spatialSearchMethod === GEOM_METHOD.INTERSECTS;

    return (
      <div ref={refSidebar} className={`digas-view-sidebar${className.length > 0 ? className : ''}${toggleIn ? ' toggle-in' : ' toggle-out'}`}>
        <div className="sidebar-inner-container">
          <div className="sidebar-header">
            <div className="controls">
              {
                <React.Fragment>
                  <div title={LangLabels['geosearch.sort']}
                    className={`digas-control order-list ${sorted ? 'active' : ''}`}
                    onClick={() => this.props.onUpdateSort(!sorted)}
                  >
                    <SortIcon/>
                  </div>
                  <div title={LangLabels['geosearch.onlymaps']}
                    className={`digas-control only-maps ${fetchOnlyMaps ? 'active' : ''}`}
                    onClick={() => this.props.onUpdateFetchOnlyMaps(!fetchOnlyMaps)}
                  >
                    <GeoresearchIcon/>
                  </div>
                  <div title={LangLabels['geosearch.publicdocs']}
                    className={`digas-control only-public-docs ${fetchOnlyPublic ? 'active' : ''}`}
                    onClick={() => this.props.onUpdateFetchOnlyPublic(!fetchOnlyPublic)}
                  >
                    <PublicDocumentsIcon/>
                  </div>
                  <div title={
                    intersectOn
                      ? LangLabels['geosearch.spatialsearchwithin']
                      : LangLabels['geosearch.spatialsearchintersects']
                  }
                    className={`digas-control select-spatial-search ${spatialSearchMethod}`}
                    onClick={
                      () => this.props.onUpdateSpatialSearchMethod(intersectOn ? GEOM_METHOD.WITHIN : GEOM_METHOD.INTERSECTS)
                    }
                  >{
                    intersectOn ? <LocalDocumentsIcon/> : <AllDocumentsIcon/>
                  }
                  </div>
                  <div title={
                    fulltextSearchOpen
                      ? LangLabels['geosearch.searchft.close']
                      : LangLabels['geosearch.searchft.open']
                  }
                    className={`digas-control toggle-fulltextsearch ${fulltextSearchOpen ? 'active' : ''}`}
                    onClick={() => this.props.onUpdateFulltextSearchOpen(!fulltextSearchOpen)}
                  >
                    <SearchIcon/>
                  </div>
                  <div title={LangLabels['geosearch.exportcsv']}
                    className="digas-control export-list"
                    onClick={this.handleExportCSV}
                  >
                    <DownloadIcon/>
                  </div>
                  <div title={LangLabels['geosearch.print']}
                    className={`digas-control print-list ${docs.length > 0 ? 'active' : ''}`}
                    onClick={() => {
                      if (docs.length > 0) {
                        this.props.onUpdatePrintDialog(!printDialogOpen);
                      }
                    }}
                  >
                    <PrintIcon/>
                  </div>
                  <DlfBasket />
                </React.Fragment>
              }
            </div>
          </div>
          {
            fulltextSearchOpen && (
              <div className="sidebar-fulltextsearch">
                <FulltextSearch
                  terms={fulltextSearchTerms}
                  onChange={this.props.onUpdateFulltextSearchTerms}
                />
              </div>
            )
          }
          <div className="search-feedback">
            {
              docs.length >= SOLR_MAXCOUNT
                ? (<p className="warning">
                    {LangLabels['geosearch.searchresultsmax'].replace('%i', SOLR_MAXCOUNT)}
                  </p>
                ) : (<p>
                    {LangLabels['geosearch.searchresultsfound'].replace('%i', docs.length)}
                  </p>
                )
            }
          </div>
          <div className="sidebar-content">
            <ul>
              {
                docs.length > 0
                  ? (
                    docs.map(
                      (feature) => {
                        const doc = feature._rawFeature;
                        return (
                          <li
                            key={doc.id}
                            ref={refs[doc.id]}
                            className={focusEndId === doc.id ? 'focus' : ''}
                          >
                            <ListItem
                              geometryType={doc.geometry.type}
                              id={doc.id}
                              onClick={this.handleClick}
                              onMouseEnter={() => this.handleMouseMove(feature)}
                              onMouseLeave={() => this.handleMouseMove(undefined)}
                              properties={doc.properties}
                              withoutHref={true}
                              showThumbnails={SHOW_THUMBNAILS}
                            />
                          </li>
                        )
                      }
                    )
                  ) : ''
              }
            </ul>
          </div>
          <div className="sidebar-footer">
            {`${LangLabels['geosearch.documents']}: ${docs.length} / ${maxDocuments}`}
          </div>
        </div>
      </div>
    )
  }
}

SideBarView.defaultProps = {
  className: '',
  documents: [],
  fetchOnlyPublic: false,
  fetchOnlyMaps: false,
  fulltextSearchOpen: false,
  fulltextSearchTerms: [],
  maxDocuments: 0,
  printDialogOpen: false,
  sorted: false,
  toggleIn: false,
};

SideBarView.propTypes = {
  className: PropTypes.string,
  documents: PropTypes.instanceOf(List),
  fetchOnlyMaps: PropTypes.bool,
  fetchOnlyPublic: PropTypes.bool,
  fulltextSearchOpen: PropTypes.bool,
  fulltextSearchTerms: PropTypes.arrayOf(
    PropTypes.string,
  ),
  maxDocuments: PropTypes.number,
  onClose: PropTypes.func,
  onMount: PropTypes.func,
  onUpdateFetchOnlyMaps: PropTypes.func.isRequired,
  onUpdateFetchOnlyPublic: PropTypes.func.isRequired,
  onUpdateFocusDocument: PropTypes.func.isRequired,
  onUpdateFulltextSearchOpen: PropTypes.func.isRequired,
  onUpdateFulltextSearchTerms: PropTypes.func.isRequired,
  onUpdatePrintDialog: PropTypes.func.isRequired,
  onUpdateSelectDocuments: PropTypes.func.isRequired,
  onUpdateSort: PropTypes.func.isRequired,
  onUpdateSpatialSearchMethod: PropTypes.func.isRequired,
  printDialogOpen: PropTypes.bool,
  sorted: PropTypes.bool,
  spatialSearchMethod: PropTypes.string,
  toggleIn: PropTypes.bool,
};

/**
 * Use the addUrlProps higher-order component to hook-in react-url-query.
 */
export default addUrlProps({urlPropsQueryConfig})(SideBarView);
