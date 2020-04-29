/**
 * Created by jacob.mendt@pikobytes.de on 09.05.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { Component } from 'react';
import { addUrlProps, UrlQueryParamTypes } from 'react-url-query';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import Feature from 'ol/Feature';
import { BREAK_POINT_XS } from '../../settings';
import ListItem from '../../components/ListItem/ListItem';
import OlLayer from './components/OlLayer';
import OlMap from './components/OlMap';
import OlPopup from './components/Popup/Popup';
import { fetchDocuments } from './structs/api';
import { correctExtent } from './structs/geom';
import {
  parseDocument,
  parseGeoJsonFeatures,
  transformToPointFeatures,
} from './structs/parser';
import { extentUrlType, centerUrlType } from './structs/types';
import './MapView.scss';
import LangLabels from '../../views/MapView/components/Labels';


// Load configurations from environmental settings
const MAP_BASEMAP = process.env.REACT_APP_MAP_BASEMAP;
const MAP_BASEMAP_ATTRIBUTION = process.env.REACT_APP_MAP_BASEMAP_ATTRIBUTION;
const MAP_CLICK_ON = process.env.REACT_APP_FUNCTION_MAP_CLICK_ON === 'true';
const MAP_INITIAL_VIEW = JSON.parse(process.env.REACT_APP_MAP_INITAL_VIEW);
const MAP_SHOW_RESULTS = process.env.REACT_APP_FUNCTION_MAP_SHOW_RESULTS === 'true';
const TRIGGER_SEARCH = process.env.REACT_APP_FUNCTION_TRIGGER_SEARCH === 'true';
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
  centerUrl: { type: centerUrlType, queryParam: 'c' },
  extentUrl: { type: extentUrlType, queryParam: 'e' },
  zoomUrl: { type: UrlQueryParamTypes.number, queryParam: 'z' },
};

export class MapView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      documents: List([]),
      map: undefined,
      mapView: {
        center: props.centerUrl !== undefined
          ? props.centerUrl
          : MAP_INITIAL_VIEW.center,
        extent: props.extentUrl !== undefined
            ? props.extentUrl
            : undefined,
        zoom: props.zoomUrl !== undefined
          ? props.zoomUrl
          : MAP_INITIAL_VIEW.zoom,
      },
    };
  }

  /**
   * React life-cycle method, which is called after the component has updated the
   * internal state or the props.
   * @param {{
   *   fetchOnlyMaps: boolean,
   *   fetchOnlyPublic: boolean,
   *   fulltextSearchTerms: string[],
   *   spatialSearchMethod: string,
   * }} prevProps
   */
  componentDidUpdate(prevProps) {
    if (
      prevProps.fetchOnlyMaps !== this.props.fetchOnlyMaps ||
      prevProps.fetchOnlyPublic !== this.props.fetchOnlyPublic ||
      prevProps.fulltextSearchTerms.length !== this.props.fulltextSearchTerms.length ||
      prevProps.spatialSearchMethod !== this.props.spatialSearchMethod
    ) {
      // In this case the fetchOnlyMaps, fetchOnlyPublic or fulltextSearchTerms has been updated
      // and we want to trigger a new document search.
      this.updateDocuments();
    }
  }

  /**
   * Fetches documents for a given set of search parameters (map extent) from
   * the backend.
   * @param {[minLon, minLat, maxLon, maxLat]|undefined} extent
   */
  updateDocuments = (extent = undefined) => {
    const { map, mapView } = this.state;
    const { fetchOnlyMaps, fetchOnlyPublic, fulltextSearchTerms, spatialSearchMethod } = this.props;
    // if we do not use the sidebar toggle feature, offsetwith is always 0
    const { offsetWidth } = '0'; //this.props;

    // This function could be called when the map is not initialized. In this case
    // Return
    if (map === undefined) {
      return;
    }

    // In case the sidebar is open, we calculate the extent with an offset
    // if not use the default extraction path for extent
    const extentMapView = correctExtent(mapView.extent, offsetWidth, map);

    if (extent !== undefined || extentMapView !== undefined) {
      const searchExtent = extent !== undefined ? extent : extentMapView;

      fetchDocuments(
        searchExtent,
        fetchOnlyMaps,
        fetchOnlyPublic,
        fulltextSearchTerms,
        spatialSearchMethod,
        ({ response }) => {
          if (response !== undefined) {
            const docs = List(
              transformToPointFeatures(
                parseGeoJsonFeatures(
                  response.docs.map(parseDocument)
                ),
              ),
            );

            // If a listener is registered for document update call it.
            if (this.props.onDocumentUpdate) {
              this.props.onDocumentUpdate(docs, response.numFound);
            }

            // Update the extent to signal that a search has been performed
            this.props.onChangeExtentUrl(searchExtent);

            // Update the component state
            this.setState({
              documents: docs,
            })
          }
        }
      )
    }
  };

  /**
   * Handler for listing to map view changes
   * @param {{
   *   center: [lon, lat],
   *   extent: [minLon, minLat, maxLon, maxLat],
   *   zoom: number,
   * }} newMapView
   */
  handleMapChange(newMapView) {
    const { mapView } = this.state;
    // update url params
    this.props.onChangeZoomUrl(newMapView.zoom);
    this.props.onChangeCenterUrl(newMapView.center);

    // If the mapView has been updated, update it.
    if (
      mapView.center[0] !== newMapView.center[0] ||
      mapView.center[1] !== newMapView.center[1] ||
      mapView.zoom !== newMapView.zoom
    ) {
      this.setState(
        { mapView: newMapView },
        () => {
          if (!TRIGGER_SEARCH) {
            this.updateDocuments();
          }
        }
      );
    }
  }

  /**
   * Handler for listing to initial map load
   * @param {ol.Map} map
   * @param {number[]} extent
   */
  handleMapLoad(map, extent) {
    this.setState(
      { map: map },
      () => {
        // Initialy trigger a document fetch
        this.updateDocuments(extent);
      },
    );
  }

  handleMouseMoveOverPopup = (doc) => {
    const { selectDocuments } = this.props;

    if (selectDocuments.length <= 1) {
      // This mouse over handler does not works in cases, where there is
      // only document selected
      return;
    }

    // The hover behavior is disabled on small screens by default
    if (window.innerWidth >= BREAK_POINT_XS) {
      this.props.onUpdateFocusDocument(doc)
    }

    if (doc === undefined) {
      this.props.onUpdateFocusDocument(undefined)
    }
  };

  /**
   * Function triggers a document search for a explicitly configured
   * map extent.
   * @param {[minLon, minLat, maxLon, maxLat]} extent
   */
  handleOnSearch = (extent) => {
    this.updateDocuments(extent);
  };

  render() {
    const { className, focusDocument, offsetWidth, selectDocuments } = this.props;
    const { documents, map, mapView } = this.state;

    return (
      <div className={`digas-view-map${className.length ? ` ${className}` : ''}`}>
        <OlMap
          mapAttribution={MAP_BASEMAP_ATTRIBUTION}
          mapUrl={MAP_BASEMAP}
          mapView={mapView}
          offsetWidth={offsetWidth}
          onChange={this.handleMapChange.bind(this)}
          onLoad={this.handleMapLoad.bind(this)}
          onSearch={this.handleOnSearch}
        >
          {
            (map !== undefined && documents.size > 0 && MAP_SHOW_RESULTS) && (
              <OlLayer
                documents={documents}
                map={map}
                mapClickOn={MAP_CLICK_ON}
                hoverDocument={focusDocument}
                onDocumentHover={(doc) => this.props.onUpdateFocusDocument(doc)}
                onDocumentSelect={(docs) => this.props.onUpdateSelectDocuments(docs)}
                selectDocument={
                  selectDocuments.length === 1
                    ? selectDocuments[0]
                    : undefined
                }
              />)
          }
        </OlMap>
        {
          (map !== undefined && selectDocuments.length > 0) && (
            <OlPopup
              className="digas-documents-popup"
              label={LangLabels['geosearch.searchresultsfound'].replace('%i', selectDocuments.length)}
              onMount={() => {
                // and focus map to the document
                map.getView().animate({
                  center: selectDocuments[0].getGeometry().getFlatCoordinates(),
                  duration: 500
                });
              }}
              onClose={() => this.props.onUpdateSelectDocuments([])}
            >
              <div className="documents-picker">
                <div className="header">
                  <h3>{LangLabels['geosearch.searchresultsfound'].replace('%i', selectDocuments.length)}</h3>
                </div>
                <div className="content">
                  {
                    selectDocuments.map(
                      feature => {
                        const doc = feature._rawFeature;
                        return (
                          <ListItem
                            geometryType={doc.geometry.type}
                            key={doc.id}
                            id={doc.id}
                            onClick={() => console.log('Item click')}
                            onMouseEnter={() => this.handleMouseMoveOverPopup(feature)}
                            onMouseLeave={() => this.handleMouseMoveOverPopup(undefined)}
                            properties={doc.properties}
                            showThumbnails={SHOW_THUMBNAILS}
                          />
                        );
                      }
                    )
                  }
                </div>
              </div>
            </OlPopup>
          )
        }
      </div>
    );
  }
}

MapView.defaultProps = {
  className: '',
  fetchOnlyMaps: false,
  fetchOnlyPublic: false,
  fulltextSearchTerms: [],
  focusDocument: undefined,
  offsetWidth: 0,
  selectDocuments: [],
};

MapView.propTypes = {
  className: PropTypes.string,
  fetchOnlyMaps: PropTypes.bool,
  fetchOnlyPublic: PropTypes.bool,
  fulltextSearchTerms: PropTypes.arrayOf(
    PropTypes.string,
  ),
  focusDocument: PropTypes.instanceOf(Feature),
  offsetWidth: PropTypes.number,
  onDocumentUpdate: PropTypes.func,
  onUpdateFocusDocument: PropTypes.func.isRequired,
  onUpdateSelectDocuments: PropTypes.func.isRequired,
  selectDocuments: PropTypes.arrayOf(
    PropTypes.instanceOf(Feature),
  ),
  spatialSearchMethod: PropTypes.string,
};

/**
 * Use the addUrlProps higher-order component to hook-in react-url-query.
 */
export default addUrlProps({ urlPropsQueryConfig })(MapView);
