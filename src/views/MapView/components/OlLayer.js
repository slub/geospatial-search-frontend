/**
 * Created by jacob.mendt@pikobytes.de on 23.05.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import {
	Circle as CircleStyle,
	Fill,
	Stroke,
	Style,
} from 'ol/style.js';
import 'ol/ol.css';
import { parseGeoJsonFeatures } from '../structs/parser';

const MAP_STYLES = {
	POINT: new Style({
		image: new CircleStyle({
			radius: 7,
			fill: new Fill({ color: '#46a946' }),
			stroke: new Stroke({ color: '#fff', width: 1 })
		})
	}),
	POINT_HIGHLIGHT: new Style({
		image: new CircleStyle({
			radius: 16,
			fill: new Fill({ color: '#46a946' }),
			stroke: new Stroke({ color: '#fff', width: 2 })
		})
	}),
	POLYGON: new Style({
		stroke: new Stroke({
			color: 'blue',
			width: 3
		}),
		fill: new Fill({
			color: 'rgba(0, 0, 255, 0.1)'
		})
	}),
};

/**
 * React wrapper class for the OpenLayers map object
 */
export default class OlLayer extends Component {
	constructor (props) {
		super(props);

		this.state = {
			defaultCursor: undefined,
			defaultLayer: undefined,
			highlightLayer: undefined,
			selectLayer: undefined,
		}
	}

	/**
	 * Listeners which is used for click interactions
	 * @param {{
	 *   coordinate: [number, number]
	 *   pixel: [number, number],
	 * }}
	 */
	handlePointerClick = ({ pixel }) => {
		const { map } = this.props;
		const { defaultLayer } = this.state;

		// iterate over all features for each feature at the mouse position ...
		const documentsAtPixel = [];
		map.forEachFeatureAtPixel(pixel, (feature, layer) => {
			// only allow hover effact to take place for features of the defaultLayer.
			// If this check is missing the hoverLayer itself will dispatch hover effects.
			if (layer !== defaultLayer) {
				return;
			}

			documentsAtPixel.push(feature);
		});

		// If documents are detected, set them as selected
		if (this.props.onDocumentSelect) {
			this.props.onDocumentSelect(documentsAtPixel);
		}
	};

	/**
	 * Listeners which is used for adding highlight style on hover
	 * @param {{
	 *   pixel: [number, number],
	 * }}
	 */
	handlePointerMove = ({ pixel }) => {
		const { map } = this.props;
		const { defaultLayer } = this.state;

		// // clear the current hover feature
		// const source = highlightLayer.getSource();
		// source.clear();

		// iterate over all features for each feature at the mouse position ...
		const documentsAtPixel = [];
		map.forEachFeatureAtPixel(pixel, (feature, layer) => {
			// only allow hover effact to take place for features of the defaultLayer.
			// If this check is missing the hoverLayer itself will dispatch hover effects.
			if (layer !== defaultLayer) {
				return;
			}

			documentsAtPixel.push(feature);
		});



		// if a hover function is defined dispatch the hovered feature
		if (this.props.onDocumentHover) {
			if (documentsAtPixel.length > 0) {
				// dispatch the hover to the global state
				this.props.onDocumentHover(documentsAtPixel[0]);
			} else {
				// dispatch the hover to the global state
				this.props.onDocumentHover(undefined);
			}
		}
	};

	/**
	 * Set a hover style for a selected document
	 */
	setHoverDocument() {
		const { hoverDocument, map } = this.props;
		const { highlightLayer } = this.state;

		// clear the current hover feature
		const source = highlightLayer.getSource();
		source.clear();

		// set the current centroid hover feature
		source.addFeature(hoverDocument);

		// extract the real geometry and generate a feature for it and than add
		// it as well as a hover
		source.addFeature(
			parseGeoJsonFeatures([hoverDocument._rawFeature], 'shape-')[0],
		);

		// also add update the map cursor for better user feedback
		const element = map.getTargetElement();
		element.style.cursor = 'pointer';
	}

	/**
	 * Remove hover style for a selected document
	 */
	clearHoverDocument() {
		const { map } = this.props;
		const { defaultCursor, highlightLayer } = this.state;

		// clear the current hover feature
		const source = highlightLayer.getSource();
		source.clear();

		// also reset the map cursor update the map cursor for better user feedback
		const element = map.getTargetElement();
		if (element.style.cursor !== defaultCursor) {
			element.style.cursor = defaultCursor;
		}
	}

	/**
	 * Set a select style for a selected document
	 */
	setSelectDocument() {
		const { selectDocument } = this.props;
		const { selectLayer } = this.state;

		// clear the current hover feature
		const source = selectLayer.getSource();
		source.clear();

		// set the current centroid hover feature
		source.addFeature(selectDocument);

		// extract the real geometry and generate a feature for it and than add
		// it as well as a hover
		source.addFeature(
			parseGeoJsonFeatures([selectDocument._rawFeature], 'shape-')[0],
		);
	}

	/**
	 * Remove select style for a selected document
	 */
	clearSelectDocument() {
		const { selectLayer } = this.state;

		// clear the current hover feature
		const source = selectLayer.getSource();
		source.clear();
	}

	componentDidMount () {
		const { documents, map, mapClickOn } = this.props;

		//
		// Add default layer. The default layer should always show
		// the documents with a circle style which are currently in viewport.
		//
		const defaultLayer = new VectorLayer({
			source: new VectorSource({
				features: documents.toArray(),
				wrapX: false
			}),
			style: MAP_STYLES.POINT,
		});

		//
		// Add highlight layer. The highlight layer should be used
		// for displaying hovered features
		//
		const highlightLayer = new VectorLayer({
			source: new VectorSource({
				features: [],
				wrapX: false
			}),
			style: (feature) => {
				return feature.getGeometry().getType() === 'Polygon'
					? MAP_STYLES.POLYGON
					: MAP_STYLES.POINT_HIGHLIGHT;
			},
		});

		//
		// Add select layer. The select layer should be used
		// for displaying selected features
		//
		const selectLayer = new VectorLayer({
			source: new VectorSource({
				features: [],
				wrapX: false
			}),
			style: (feature) => {
				return feature.getGeometry().getType() === 'Polygon'
					? MAP_STYLES.POLYGON
					: MAP_STYLES.POINT_HIGHLIGHT;
			},
		});

		//
		// Add hover layer, which should be used for focus a document
		//
		if (mapClickOn) {
			map.on('click', this.handlePointerClick);
		}
		map.on('pointermove', this.handlePointerMove);

		// Persist the layer within the state and add them to the map
		this.setState({
			defaultCursor: map.getTargetElement().style.cursor,
			defaultLayer: defaultLayer,
			highlightLayer: highlightLayer,
			selectLayer: selectLayer,
		}, () => {
			map.addLayer(defaultLayer);
			map.addLayer(highlightLayer);
			map.addLayer(selectLayer);
		})
	}

	componentWillUnmount () {
		const { map, mapClickOn } = this.props;
		const { defaultLayer, highlightLayer, selectLayer } = this.state;

		// remove listener
		if (mapClickOn) {
			map.un('click', this.handlePointerClick);
		}
		map.un('pointermove', this.handlePointerMove);

		// remove the layer from the map
		map.removeLayer(defaultLayer);
		map.removeLayer(highlightLayer);
		map.removeLayer(selectLayer);
	}

	componentDidUpdate (prevProps, prevState, snapshot) {
		const { documents, hoverDocument, selectDocument } = this.props;
		const { defaultLayer, highlightLayer } = this.state;

		//
		// Update documents data if it changed
		//
		if (defaultLayer !== undefined && !prevProps.documents.equals(documents)) {
			// clear highlight layer
			highlightLayer.getSource().clear();

			// clear and update defaultLayer
			const defaultSource = defaultLayer.getSource();
			defaultSource.clear();
			defaultSource.addFeatures(documents.toArray());
		}

		//
		// Update hoverDocument if it changed
		//
		if (
			hoverDocument !== undefined &&
			(
				prevProps.hoverDocument === undefined ||
				prevProps.hoverDocument.getId() !== hoverDocument.getId()
			)
		) {
			// Set hover feature
			this.setHoverDocument();
		} else if (hoverDocument === undefined && prevProps.hoverDocument !== undefined) {
			// Reset hover feature
			this.clearHoverDocument();
		}

		//
		// Update selectDocument if it changed
		//
		if (
			selectDocument !== undefined &&
			(
				prevProps.selectDocument === undefined ||
				prevProps.selectDocument.getId() !== selectDocument.getId()
			)
		) {
			// Set hover feature
			this.setSelectDocument();
		} else if (selectDocument === undefined && prevProps.selectDocument !== undefined) {
			// Reset hover feature
			this.clearSelectDocument();
		}
	}

	render() {
		return (
			<div style={{ display: 'none' }} className="digas-ol-layer" />
		);
	}
}

OlLayer.defaultProps = {
	mapClickOn: true,
};

OlLayer.propTypes = {
	documents: PropTypes.instanceOf(List).isRequired,
	map: PropTypes.instanceOf(Map).isRequired,
	mapClickOn: PropTypes.bool,
	hoverDocument: PropTypes.instanceOf(Feature),
	onDocumentHover: PropTypes.func,
	onDocumentSelect: PropTypes.func,
	onMultipleDocumentsSelect: PropTypes.func,
	selectDocument: PropTypes.instanceOf(Feature),
};
