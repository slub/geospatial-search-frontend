/**
 * Created by jacob.mendt@pikobytes.de on 24.05.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import Point from 'ol/geom/Point';
import { csvFormatRows } from 'd3-dsv';
import { calculateCentroid } from './geom';


// Environmental parameters
const SOLR_GEOM_FIELD = process.env.REACT_APP_SOLR_GEOM_FIELD;

/**
 * Extend the String type with an replaceAll function. This function in
 * used within the modul.
 *
 * @param {string} target
 * @param {string} search
 * @param {string} replacement
 * @returns {*}
 */
function replaceAll(target, search, replacement) {
	return target.replace(new RegExp(search, 'g'), replacement);
}

/**
 * Parses a given array of documents into an CSV structure.
 * @param {[Object]} rawDocuments
 * @returns {string|undefined}
 */
export function parseAsCSV(rawDocuments) {
	if (rawDocuments.length === 0) {
		return;
	}
	// parse the keys and rows as arrays
  const keys = ['shelfmark_usi', 'title', 'record_id'];
	const rows = rawDocuments.map(
		row => keys.map(
      k => (row.properties[k]) ? row.properties[k] : row[k],
		),
	);

	// create the csv
	let csvContent = "Katalogsignatur, Titel, Datensatz-Identifier\n";
  //let csvContent = keys.join(",") + "\n";
	csvContent += csvFormatRows(rows);
	return csvContent;
}

/**
 * Parses a given search document to a structure supported (geojson) by the client.
 * @param {{
 *   geom_geojson: [string],
 *   id: string,
 *   thumbnail: [string],
 *   timestamp: [string],
 *   title: [string],
 *   type: [string],
 *   uid: [string]
 *   record_id: [string],
 * }} doc
 * @returns {{
 *   type: string,
 *   id: string,
 *   properties: {{
 *     thumbnail: string,
 *     timestamp: string,
 *     title: string,
 *     type: string,
 *     record_id: string,
 *   }}
 *   geometry: {{
 *     type: string,
 *     coordinates: [*]
 *   }}
 * }}
 */
export function parseDocument(doc) {
	// Make sure that the document contains all relevant fields
	if (doc[SOLR_GEOM_FIELD] === undefined) {
		throw new TypeError(`Document is missing relevant "${SOLR_GEOM_FIELD}" field.`);
	}
	if (doc.id === undefined) {
		throw new TypeError('Document is missing relevant "id" field.');
	}

	// parse the shape geometry
	const geometryShapeStr = replaceAll(
		Array.isArray(doc[SOLR_GEOM_FIELD]) ? doc[SOLR_GEOM_FIELD][0] : doc[SOLR_GEOM_FIELD],
		'\'',
		'"',
	);
	const geometryShape = JSON.parse(geometryShapeStr);

	return {
		type: 'Feature',
		id: doc.id,
		properties: {
			collection: doc.collection && Array.isArray(doc.collection) && doc.collection.length > 0
				? doc.collection[0]
				: doc.collection,
			purl: doc.purl
				? doc.purl
				: undefined,
			thumbnail: doc.thumbnail && Array.isArray(doc.thumbnail) && doc.thumbnail.length > 0
				? doc.thumbnail[0]
				: doc.thumbnail,
			timestamp: doc.timestamp && Array.isArray(doc.timestamp) && doc.timestamp.length > 0
				? doc.timestamp[0]
				: doc.timestamp,
			title: doc.title && Array.isArray(doc.title) && doc.title.length > 0
				? doc.title[0]
				: doc.title,
			type: doc.type && Array.isArray(doc.type) && doc.type.length > 0
				? doc.type[0]
				: doc.type,
      record_id: doc.record_id
				? doc.record_id
				: undefined,
      shelfmark_usi: doc.shelfmark_usi
				? doc.shelfmark_usi
				: undefined,
		},
		geometry: geometryShape.geometry,
		raw: doc,
	}
}

/**
 * Parses GeoJSON features to a structure for OL
 * @param {[{ geometry: *, id: string }]} documents
 * @param {string} idPrefix
 * @returns {*}
 */
export function parseGeoJsonFeatures(documents, idPrefix = '') {
	const parser = new GeoJSON();
	return documents.map(
		doc => {
			const feature = parser.readFeature({
				type: 'Feature',
				id: `${idPrefix}${doc.id}`,
				geometry: doc.geometry,
			});
			// transform the coordinates to EPSG:3587
			feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
			feature._rawFeature = doc;
			return feature;
		},
	);
}

/**
 * Transform an array of geojson features to an array of geojson which contains
 * only points features. In case of LineString or Polygon it calculates the center point.
 *
 * @Warning This function does only support Point, LineString and Polygon. It does not
 * support MultiLineString or MultiPolygon.
 *
 * @param {*} features
 * @returns {*}
 */
export function transformToPointFeatures(features) {
	return features.map(
			ft => {
				const geomType = ft.getGeometry().getType();
				if (geomType === 'Point') {
					return ft;
				} else {
					// calculate a point geometry for the feature geometry
					const geometry = geomType === 'Polygon'
						? ft.getGeometry().getInteriorPoint()
						: new Point(
							calculateCentroid(ft._rawFeature.geometry.coordinates, geomType)
						);

					// generate a new feature
					const newFt = new Feature({	geometry: geometry });
					newFt._rawFeature = ft._rawFeature;
					newFt.setId(ft.getId());

					return newFt;
				}
			}
	)
}
