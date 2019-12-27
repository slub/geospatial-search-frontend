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
import { ReactComponent as PolylineIcon} from './line.svg';
import { ReactComponent as PointIcon } from './point.svg';
import { ReactComponent as PolygonIcon } from './polygon.svg';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import './ListItem.scss';
import LangLabels from '../../views/MapView/components/Labels';

/**
 * Function component for rendering a ListITem.
 *
 * @param {{
 *   geometryType: string|undefined,
 *   id: string,
 *   onClick: Function,
 *   onMouseEnter: Function,
 *   onMouseLeave: Function
 *   properties: {
 *     collection: string,
 *     thumbnail: string,
 *     timestamp: string,
 *     title: string,
 *     type: string,
 *     record_id: string,
 *   }
 * }}
 * @returns {*}
 */
export default function ListItem({ geometryType, id, properties, onClick, onMouseEnter, onMouseLeave, withoutHref = false, showThumbnails = true }) {

  const titleMaxLength = showThumbnails ? 100 : 200;

	return (
		<a target="_top" className="list-element"
			href={!withoutHref ? properties.purl : undefined}
			onClick={() => onClick(id, properties)}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			rel="noopener noreferrer"
      title={properties.title}
		>
			<div>
        {
          showThumbnails === true &&
  				<div className="thumbnail-container">
            <LazyLoadImage
                alt={"Vorschaubild von " + properties.record_id}
                src={properties.thumbnail}
                onError={(e)=>{e.target.onerror = null; e.target.src=logo; e.target.alt="Kein Vorschaubild vorhanden."}}
            />
  				</div>
        }
				<div className="content-container">
					<div className="title">{properties.title.substring(0,titleMaxLength)}{ properties.title.length > titleMaxLength && ' [...]' }
          </div>
					<div className="footer">
						<div className="text">
              { LangLabels['geosearch.collection'] }: {properties.collection} <br />
							{ LangLabels['geosearch.structure'] }: { properties.type === 'monograph' && LangLabels['geosearch.structure.monograph'] }
              { properties.type === 'map' && LangLabels['geosearch.structure.map'] }
              { properties.type === 'volume' && LangLabels['geosearch.structure.volume'] } | ID: {properties.record_id}
						</div>
						{
							geometryType !== undefined && (
								<div className="image">
									{ geometryType === 'Polygon' && (<PolygonIcon />) }
									{ geometryType === 'LineString' && (<PolylineIcon />) }
									{ geometryType === 'Point' && (<PointIcon />) }
								</div>
							)
						}
					</div>
				</div>
			</div>
		</a>
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
	}).isRequired,
	withoutHref: PropTypes.bool,
};
