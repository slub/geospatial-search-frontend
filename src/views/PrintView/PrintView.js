/**
 * Created by jacob.mendt@pikobytes.de on 22.07.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
/**
 * Created by jacob.mendt@pikobytes.de on 09.05.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { addUrlProps } from 'react-url-query';
import { PrintOutline } from 'react-ionicons';
import { CloseOutline } from 'react-ionicons';
import ListItem from '../../components/ListItem/ListItem';
import { extentUrlType } from '../MapView/structs/types';
import './PrintView.scss';

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
  extentUrl: { type: extentUrlType, queryParam: 'e' },
};

export class PrintView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      printing: false,
    }
  }

  componentDidMount() {
    // make sure to detect the closing of the window print dialog
    window.addEventListener('afterprint', this.handlePrintEnd);
  }

  componentWillUnmount() {
    window.removeEventListener('afterprint', this.handlePrintEnd);
  }

  handlePrintEnd = () => {
    this.setState({ printing: false });
  };

  handlePrintStart = () => {

    this.setState(
      { printing: true },
      () => window.print(),
    )
  };

  render() {
    const { printing } = this.state;
    const {
      documents,
      extentUrl,
    } = this.props;

    return (
      <div className={`digas-view-print ${printing ? 'printing' : ''}`}>
        <div className="print-header">
          <div className="feedback">
            {
              documents.length === 0 && (
                <h3>Keine Suchergebnisse gefunden</h3>
              )
            }
            {
              documents.length > 0 && (
                <React.Fragment>
                  <h3>{`${documents.length} Dokumente gefunden`}</h3>
                  <p>Suchausschnitt: {extentUrl.join(', ')} (WGS84)</p>
                </React.Fragment>
              )
            }
          </div>
          <div className="controls">
            <div className={`digas-control`}
              onClick={this.handlePrintStart}
            >
              <PrintOutline
                color={'#00000'}
                title={'Drucken'}
                height="35px"
                width="35px"
              />
            </div>
            <div className={`digas-control`}
                 onClick={() => this.props.onUpdatePrintDialog(false)}
            >
              <CloseOutline
                color={'#00000'}
                title={'Schließe Print-Dialog'}
                height="35px"
                width="35px"
              />
            </div>
          </div>
        </div>
        <div className="print-content">
          <div>
            <ul>
              {
                documents.length > 0
                  ? (
                    documents.map(
                      (feature) => {
                        const doc = feature._rawFeature;
                        return (
                          <li key={doc.id}>
                            <ListItem
                              id={doc.id}
                              onClick={() => {}}
                              onMouseEnter={() => {}}
                              onMouseLeave={() => {}}
                              properties={doc.properties}
                              withoutHref={true}
                            />
                          </li>
                        );
                      },
                    )
                  ) : ''
              }
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

PrintView.defaultProps = {
  documents: [],
};

PrintView.propTypes = {
  className: PropTypes.string,
  documents: PropTypes.array,
  extentUrl: PropTypes.arrayOf(
    PropTypes.number,
  ),
  onUpdatePrintDialog: PropTypes.func.isRequired,
};

export default addUrlProps({ urlPropsQueryConfig })(PrintView);
