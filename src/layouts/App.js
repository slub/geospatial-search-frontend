/**
 * Created by jacob.mendt@pikobytes.de on 24.04.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
/**
 * Created by jacob.mendt@pikobytes.de on 15.03.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { Component } from 'react';
import { addUrlProps, UrlQueryParamTypes } from 'react-url-query';
import PropTypes from "prop-types";
import { List } from 'immutable';
import { GEOM_METHOD } from '../views/MapView/structs/api';
import MapView from '../views/MapView/MapView';
import PrintView from '../views/PrintView/PrintView';
import SideBarView from '../views/SideBarView/SideBarView';
import SideBarToggle from '../components/SideBarToggle/SideBarToggle';
import { BREAK_POINT_XS } from '../settings';
import './App.scss';

// Global environmental settings for the solr
const SOLR_GEOM_METHOD = process.env.REACT_APP_SOLR_GEOM_METHOD;

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
  fetchOnlyPublic: { type: UrlQueryParamTypes.boolean, queryParam: 'searchPublic' },
  fulltextSearchTerms: { type: UrlQueryParamTypes.string, queryParam: 'searchTerms' },
  sorted: { type: UrlQueryParamTypes.boolean, queryParam: 'sorted' },
  spatialSearchMethode: { type: UrlQueryParamTypes.string, queryParam: 'spatialMethod' },
  toggleMode: { type: UrlQueryParamTypes.boolean, queryParam: 'toggle' },
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // Result set of search documents
      documents: List([]),

      // Signals if only public documents should be fetched
      fetchOnlyPublic: props.fetchOnlyPublic !== undefined ? props.fetchOnlyPublic : false,

      // Is set if a search document is focused
      focusDocument: undefined,

      // Signals if the fulltext search is open/close
      fulltextSearchOpen: props.fulltextSearchTerms !== undefined,

      // Array of terms which are used for fulltext search
      fulltextSearchTerms: props.fulltextSearchTerms !== undefined
        ? props.fulltextSearchTerms.split(',')
        : [],

      // For a specific document search, we fetch always only a subset of
      // documents from the server. This value contains the true document
      // count which the search index associated with the document search.
      maxDocuments: 0,

      // OffsetWidth is used in conjunction with the toggleIn
      offsetWidth: 0,

      // Signals if the print dialog is open
      printDialogOpen: false,

      // Currently selected documents
      selectDocuments: [],

      // Which spatial search mode is used
      spatialSearchMethode: props.spatialSearchMethode !== undefined && (
        props.spatialSearchMethode === GEOM_METHOD.INTERSECTS ||
        props.spatialSearchMethode === GEOM_METHOD.WITHIN
      ) ? props.spatialSearchMethode
        : SOLR_GEOM_METHOD === GEOM_METHOD.INTERSECTS
          ? GEOM_METHOD.INTERSECTS
          : GEOM_METHOD.WITHIN,

      // Signals if the documents result set should be sorted
      sorted: props.sorted !== undefined
        ? props.sorted
        : true,

      // Signals if the sidebar is viewed or not
      toggleIn: props.toggleMode !== undefined
        ? props.toggleMode
        : true,
    }
  }

  /**
   * @param {List<Feature>}documents
   * @param {number} maxDocuments
   */
  handleDocumentUpdate = (documents, maxDocuments) => {
    this.setState(
      Object.assign(
        { documents, maxDocuments },
        this.state.documents.size === 0 && documents.size > 0
          ? { toggleIn: true }
          : {},
        { selectDocuments: [] },
      )
    );
  };

  handleFetchOnlyPublicUpdate = (newFetchOnlyPublic) => {
    this.setState({ fetchOnlyPublic: newFetchOnlyPublic });

    // update the query parameters for fetchOnlyPublic
    this.props.onChangeFetchOnlyPublic(newFetchOnlyPublic);
  };

  handleFocusDocumentUpdate = (doc) => {
    this.setState({ focusDocument: doc });
  };

  handleFulltextSearchToggle = (newFulltextSearchOpen) => {
    this.setState({ fulltextSearchOpen: newFulltextSearchOpen });
  };

  handleFulltextSearchTermsUpdate = (newFulltextSearchTerms) => {
    this.setState({ fulltextSearchTerms: newFulltextSearchTerms });

    // update the query parameters for fulltextSearchTerms
    this.props.onChangeFulltextSearchTerms(
      newFulltextSearchTerms.join(',')
    );
  };

  handlePrintDialog = (printDialogOpen) => {
    this.setState({ printDialogOpen });
  };

  handleSelectDocumentsUpdate = (documents) => {
    this.setState({ selectDocuments: documents });
  };

  /**
   * Handle toggle sidebar event.
   * @param {boolean} newToggleIn
   */
  handleSidebarToggle = (newToggleIn) => {
    this.setState({ toggleIn: newToggleIn });

    // update the query parameters for toggle
    this.props.onChangeToggleMode(newToggleIn);
  };

  /**
   * @param {boolean} newSort
   */
  handleSortUpdate = (newSort) => {
    this.setState({ sorted: newSort });

    // update the query parameters for sorted
    this.props.onChangeSorted(newSort);
  };

  /**
   * @param {string} newSpatialSearchMethod
   */
  handleSpatialSearchMethodUpdate = (newSpatialSearchMethod) => {
    this.setState({ spatialSearchMethode: newSpatialSearchMethod });

    // update the query parameters for spatialSearchMethod
    this.props.onChangeSpatialSearchMethode(newSpatialSearchMethod);
  };

  render() {
    const {
      documents,
      fetchOnlyPublic,
      focusDocument,
      fulltextSearchOpen,
      fulltextSearchTerms,
      maxDocuments,
      offsetWidth,
      printDialogOpen,
      selectDocuments,
      sorted,
      spatialSearchMethode,
      toggleIn,
    } = this.state;

    return (
      <div className="digas-root">
        <MapView
          className={"front"}
          fetchOnlyPublic={fetchOnlyPublic}
          fulltextSearchTerms={fulltextSearchTerms}
          focusDocument={focusDocument}
          offsetWidth={!toggleIn || window.innerWidth < BREAK_POINT_XS ? 0 : offsetWidth}
          onDocumentUpdate={this.handleDocumentUpdate}
          onUpdateFocusDocument={this.handleFocusDocumentUpdate}
          onUpdateSelectDocuments={this.handleSelectDocumentsUpdate}
          selectDocuments={selectDocuments}
          spatialSearchMethod={spatialSearchMethode}
        />
        <SideBarView
          documents={documents}
          fetchOnlyPublic={fetchOnlyPublic}
          fulltextSearchOpen={fulltextSearchOpen}
          fulltextSearchTerms={fulltextSearchTerms}
          maxDocuments={maxDocuments}
          onClose={() => this.handleSidebarToggle(false)}
          onMount={(offsetWidth) => this.setState({ offsetWidth: offsetWidth })}
          onUpdateFetchOnlyPublic={this.handleFetchOnlyPublicUpdate}
          onUpdateFocusDocument={this.handleFocusDocumentUpdate}
          onUpdateFulltextSearchOpen={this.handleFulltextSearchToggle}
          onUpdateFulltextSearchTerms={this.handleFulltextSearchTermsUpdate}
          onUpdatePrintDialog={this.handlePrintDialog}
          onUpdateSelectDocuments={this.handleSelectDocumentsUpdate}
          onUpdateSort={this.handleSortUpdate}
          onUpdateSpatialSearchMethod={this.handleSpatialSearchMethodUpdate}
          printDialogOpen={printDialogOpen}
          sorted={sorted}
          spatialSearchMethod={spatialSearchMethode}
          toggleIn={toggleIn}
        />
        <SideBarToggle
          count={documents.size}
          onToggle={this.handleSidebarToggle}
          toggleIn={toggleIn}
        />
        {
          printDialogOpen && (
            <PrintView
              documents={documents.toArray()}
              onUpdatePrintDialog={this.handlePrintDialog}
            />
          )
        }
      </div>
    );
  }
}

App.propTypes = {
  fetchOnlyPublic: PropTypes.bool,
  fulltextSearchTerms: PropTypes.string,
  sorted: PropTypes.bool,
  spatialSearchMethode: PropTypes.string,
  toggleMode: PropTypes.number,
};

/**
 * Use the addUrlProps higher-order component to hook-in react-url-query.
 */
export default addUrlProps({ urlPropsQueryConfig })(App);
