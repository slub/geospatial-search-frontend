/**
 * Created by jacob.mendt@pikobytes.de on 31.10.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ReactComponent as AddFilterIcon} from './addToFilter.svg';
import {ReactComponent as RemoveAllFilterIcon} from './removeAllFilter.svg';
import '../../_polyfills/array.find';
import LangLabels from '../../views/MapView/components/Labels';
import './FulltextSearch.scss';

export default class FulltextSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputValue: '',
    }
  }

  /**
   * Dispatches a new terms array which does contain
   * the passed term.
   * @param {string} term
   */
  handleAddTerm = () => {
    const {inputValue} = this.state;
    this.setState(
      {inputValue: ''},
      () => {
        const {terms} = this.props;

        // make sure that the given terms does not contain
        // the new term
        if (terms.find(t => t === inputValue) === undefined) {
          this.props.onChange([
            ...terms,
            inputValue,
          ])
        }
      },
    );
  };

  /**
   * Update the value of the input field.
   * @param {{ target: { value: * }}}
   */
  handleChangeInput = ({target}) => {
    this.setState({inputValue: target.value});
  };

  handleClearInput = () => {
    this.setState({inputValue: ''});
  };

  handleKeyDown = ({key}) => {
    if (key === 'Enter') {
      this.handleAddTerm();
    }
  };

  /**
   * Resets all terms.
   */
  handleResetAllTerms = () => {
    this.props.onChange([]);
  };

  /**
   * Dispatches a new terms array which does not contain
   * the passed term.
   * @param {string} term
   */
  handleRemoveTerm = (term) => {
    const {terms} = this.props;
    this.props.onChange(
      terms.filter(t => t !== term),
    );
  };

  render() {
    const {inputValue} = this.state;
    const {terms} = this.props;

    return (
      <div
        className="digas-fulltextsearch-container"
      >
        <div className="container-help">
          <p>{LangLabels['geosearch.searchft.help']}</p>
        </div>
        <div className="container-add-controls">
          <div className="input-fields">
            <input
              value={inputValue}
              onChange={this.handleChangeInput}
              onKeyDown={this.handleKeyDown}
            />
          </div>
          <div className="add-input">
            <button onClick={this.handleAddTerm} title={LangLabels['geosearch.searchft.addterm']}>
              <AddFilterIcon/>
            </button>
          </div>
        </div>
        {
          terms.length > 0 && (
            <React.Fragment>
              <div className="remove-all-filter">
                <button onClick={() => this.handleResetAllTerms()} title={LangLabels['geosearch.searchft.resetterms']}>
                  <RemoveAllFilterIcon/>
                  <span>{LangLabels['geosearch.searchft.resetterms']}</span>
                </button>
              </div>
              <div className="container-terms">
                {
                  terms.map(
                    (term, index) => {
                      return (
                        <div className="term-item" key={index}>
                          <span>{term}</span>
                          <button onClick={() => this.handleRemoveTerm(term)} title={LangLabels['geosearch.searchft.delterm']}/>
                        </div>
                      )
                    }
                  )
                }
              </div>
            </React.Fragment>
          )
        }
      </div>
    )
  }
}

FulltextSearch.defaultProps = {
  terms: [],
};

FulltextSearch.propTypes = {
  terms: PropTypes.arrayOf(
    PropTypes.string,
  ),
  onChange: PropTypes.func.isRequired,
};
