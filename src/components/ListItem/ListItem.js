/**
 * Created by jacob.mendt@pikobytes.de on 29.05.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import PropTypes from 'prop-types';
import logo from '../../_image/coverBG.png';
import {ReactComponent as PolylineIcon} from './line.svg';
import {ReactComponent as PointIcon} from './point.svg';
import {ReactComponent as PolygonIcon} from './polygon.svg';
import {ReactComponent as DlfBasketAdd} from './DlfBasketAdd.svg';
import {ReactComponent as DlfBasketRemove} from './DlfBasketRemove.svg';
import {LockOpenOutline} from 'react-ionicons';
import {LockClosed} from 'react-ionicons';
import {useCookies} from 'react-cookie';

import {LazyLoadImage} from 'react-lazy-load-image-component';
import './ListItem.scss';
import LangLabels from '../../views/MapView/components/Labels';

/**
 * Function component for rendering a ListItem.
 * @returns {*}
 */
export default function ListItem({geometryType, id, properties, onClick, onMouseEnter, onMouseLeave, withoutHref = false, showThumbnails = true }) {

  const titleMaxLength = showThumbnails ? 100 : 200;
  const [cookies, setCookie] = useCookies(['dlf-requests']);

  function getBasketIdsFromCookie() {
    const basketCookie = cookies['dlf-requests'];
    return typeof basketCookie === 'undefined' ? [] : basketCookie;
  }

  function updateCookie() {
    let basketIds = getBasketIdsFromCookie();
    basketIds.includes(properties.record_id)
      ? basketIds = basketIds.filter(id => id !== properties.record_id)
      : basketIds = [...basketIds, properties.record_id];
    setCookie('dlf-requests', basketIds, {path: '/'});
  }

  return (
    <div className="list-item" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {showThumbnails === true &&
        <div className="thumbnail-container">
          <LazyLoadImage
            alt={"Vorschaubild von " + properties.record_id}
            src={properties.thumbnail}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = logo;
              e.target.alt = "Kein Vorschaubild vorhanden.";
            }}/>
        </div>}
      <div className="content-container">
        <a target="_top" className="title"
          href={!withoutHref ? properties.purl : undefined}
          onClick={() => onClick(id, properties)}
          rel="noopener noreferrer"
          title={properties.title}
        >
          {properties.title.substring(0, titleMaxLength)}{properties.title.length > titleMaxLength && ' [...]'}
        </a>
        <div className="footer">
          <div className="public-docs">
            {properties.restrictions === 'nein'
              ? <LockOpenOutline
                color={'#464646'}
                title={LangLabels['document.restrictions.no']}
                height="20px"
                width="20px"/>
              : <><LockClosed
                color={'#464646'}
                title={LangLabels['document.restrictions.yes']}
                height="20px"
                width="20px"/>
              </>}
          </div>
          <div className="text">
            {LangLabels['geosearch.collection']}: {properties.collection} <br/>
            {LangLabels['geosearch.structure']}: {properties.type === 'monograph' && LangLabels['geosearch.structure.monograph']}
            {properties.type === 'map' && LangLabels['geosearch.structure.map']}
            {properties.type === 'volume' && LangLabels['geosearch.structure.volume']} |
            <span className="tx-dlf-metadata-record_id" data-id={properties.record_id}>{properties.record_id}</span>
            <span className="tx-dlf-metadata-restrictions" style={{display: 'none'}}>{properties.restrictions}</span>
          </div>
          {properties.restrictions === 'ja' &&
            <div
              className="basket-link"
              title={getBasketIdsFromCookie().includes(properties.record_id) ? LangLabels['basket.remove'] : LangLabels['basket.add']}
              onClick={() => updateCookie()}
            >
              {getBasketIdsFromCookie().includes(properties.record_id)
                ? <DlfBasketRemove/>
                : <DlfBasketAdd/>
              }
            </div>
          }
          {geometryType !== undefined && (
            <div className="type-icon">
              {geometryType === 'Polygon' && (<PolygonIcon/>)}
              {geometryType === 'LineString' && (<PolylineIcon/>)}
              {geometryType === 'Point' && (<PointIcon/>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Definition of input data
ListItem.propTypes = {
  geometryType: PropTypes.string,
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  properties: PropTypes.shape({
    collection: PropTypes.string,
    thumbnail: PropTypes.string,
    timestamp: PropTypes.string,
    title: PropTypes.string,
    type: PropTypes.string,
    record_id: PropTypes.string,
    restrictions: PropTypes.string,
  }).isRequired,
  withoutHref: PropTypes.bool,
};
