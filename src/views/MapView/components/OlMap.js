/**
 * Created by jacob.mendt@pikobytes.de on 23.05.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import round from 'lodash.round';
import { defaults as defaultControls, Attribution } from 'ol/control';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat, toLonLat, transformExtent } from 'ol/proj';
import { Control} from 'ol/control';
import { DragBox } from 'ol/interaction';
import 'ol/ol.css';
import './OlMap.scss';
import MousePosition from 'ol/control/MousePosition';
import ScaleLine from 'ol/control/ScaleLine';
import langLabels from '../components/Labels';

// Load configurations from environmental settings
const DEBUG = process.env.REACT_APP_DEBUG === 'true';

/**
 * This function bind behavior for manually triggering of search interactions
 * to the map.
 * @param {ol.Map} map
 * @param {Function} onSearch
 */
function addSearchControl(map, onSearch) {
	// Cursor is used for giving a feedback to the user in case
	// of a running dragbox operation.
	const defaultCursor = map.getTargetElement().style.cursor;

	// Signals that a dragbox interaction should be started
	let triggerDragBox = false;

	// button of the search control element.
	let button;

	/**
	 * Definition of a SearchControl tightly bundled with OL
	 * @constructor
	 * @extends {module:ol/control/Control~Control}
	 * @param {Object=} opt_options Control options.
	 */
	const SearchControl = (function (Control) {
		function SearchControl(options = {}) {
			button = document.createElement('button');
      button.title = langLabels['geosearch.searchrectangle'];
			button.innerHTML = 'S';

			const element = document.createElement('div');
			element.className = 'search-control ol-unselectable ol-control';
			element.appendChild(button);

			Control.call(this, {
				element: element,
				target: options.target
			});

			button.addEventListener(
				'click',
				() => {
					// Signal a dragbox operation should be started
					triggerDragBox = true;

					// Improve user feedback through special cursor
					const element = map.getTargetElement();
					element.style.cursor = 'pointer';
				},
				false);
		}

		if ( Control ) SearchControl.__proto__ = Control;
		SearchControl.prototype = Object.create( Control && Control.prototype );
		SearchControl.prototype.constructor = SearchControl;
		return SearchControl;
	}(Control));

	// Create and define a dragbox for selecting features
	const dragBox = new DragBox({
		condition: () => {
			// This signals that the dragbox was activated and a dragbox interaction
			// should be started
			if (triggerDragBox) {
				triggerDragBox = false;
				return true;
			}
			return false;
		}
	});

	// Listen to boxend event
	dragBox.on('boxend', function() {
		// extract extent which is selected
		const extent = transformExtent(dragBox.getGeometry().getExtent(), 'EPSG:3857', 'EPSG:4326');

		// Reset the default cursor and remove the focus
		const element = map.getTargetElement();
		if (element.style.cursor !== defaultCursor) {
			element.style.cursor = defaultCursor;

			if (button) {
				button.blur();
			}
		}

		// give feedback via callback
		onSearch(
			[round(extent[0], 3), round(extent[1], 3), round(extent[2], 3), round(extent[3], 3)]
		)
	});

	// add the interaction and the control
	map.addInteraction(dragBox);
	map.addControl(new SearchControl());
}

/**
 * React wrapper class for the OpenLayers map object
 */
export default class OlMap extends Component {
	constructor (props) {
		super(props);

		this.state = {
			map: undefined,
			refMap: React.createRef(),
		}
	}

	componentDidMount () {
		const { refMap } = this.state;
		const { mapAttribution, mapUrl, mapView } = this.props;

		// Generate custom attribution
		const attribution = new Attribution({
			collapsible: false
		});

		// Load the map
		const map = new Map({
			controls: defaultControls({attribution: false}).extend([
				...[
					attribution,
					new ScaleLine({
						bar: true,
						minWidth: 100
					})
				],
				...DEBUG ? [new MousePosition({ projection: 'EPSG:4326' })] : []
			]),
			target: refMap.current,
			layers: [
				new TileLayer({
					source: new XYZ({
						attributions: [mapAttribution],
						url: mapUrl,
					})
				})
			],
			view: new View({
				center: fromLonLat(mapView.center),
				zoom: mapView.zoom,
        maxZoom: 14,
        minZoom: 8
			})
		});

		// If this onSearch is defined add behavior for manual triggering of
		// search process
		if (this.props.onSearch) {
			addSearchControl(map, this.props.onSearch);
		}


		// use postcompose for initial publishing the map to parent component
		map.once('rendercomplete', () => {
			// transform the extent to the correct projection and dispatch it
			const extent = transformExtent(
				map.getView().calculateExtent(map.getSize()),
				'EPSG:3857',
				'EPSG:4326',
			);

			if (this.props.onLoad) {
				this.props.onLoad(map, extent);
			}

			// initial trigger also a mapview change
			this.handleMapViewChange({ map });
		});

		// register permanent map and view listeners
		map.on('moveend', this.handleMapViewChange);

		// update the state
		this.setState({
			map: map,
		})
	}

	componentWillUnmount () {
		const { map } = this.state;

		if (map !== undefined) {
			// remove listeners from map or view
			map.un('moveend', this.handleMapViewChange);
		}
	}

	handleMapViewChange = ({ map }) => {
		const view = map.getView();
		const zoom = view.getZoom();
		const center = toLonLat(view.getCenter());

		// transform the extent to the correct projection and dispatch it
		const extent = transformExtent(
			view.calculateExtent(map.getSize()),
			'EPSG:3857',
			'EPSG:4326',
		);
		if (this.props.onChange) {
			this.props.onChange({
				center: [round(center[0], 3), round(center[1], 3)],
				extent: [round(extent[0], 3), round(extent[1], 3), round(extent[2], 3), round(extent[3], 3)],
				zoom: zoom,
			})
		}
	};

	render() {
		const { children, className } = this.props;
		const { refMap } = this.state;

		return (
			<div
				className={`digas-map-container${className.length > 0 ? ` ${className}` : ''}`}
				ref={refMap}
				style={{ width: '100%', height: '100%', overflow: 'hidden' }}
			>{children}</div>
		);
	}
}

OlMap.defaultProps = {
	className: '',
	mapUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	mapView: {
		center: [13.45, 51.04],
		zoom: 10
	}
};

OlMap.propTypes = {
	className: PropTypes.string,
	mapAttribution: PropTypes.string,
	mapUrl: PropTypes.string,
	mapView: PropTypes.shape({
		center: PropTypes.arrayOf(PropTypes.number),
		zoom: PropTypes.number,
	}),
	offsetWidth: PropTypes.number,
	onChange: PropTypes.func,
	onLoad: PropTypes.func,
	onSearch: PropTypes.func,
};
