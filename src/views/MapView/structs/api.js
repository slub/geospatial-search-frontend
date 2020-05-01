/**
 * Created by jacob.mendt@pikobytes.de on 24.05.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import axios from 'axios';

// Global environmental settings for the solr
const SOLR_ENDPOINT = process.env.REACT_APP_SOLR_ENDPOINT;
const SOLR_GEOM_FIELD = process.env.REACT_APP_SOLR_GEOM_FIELD;
const SOLR_GEOM_ERROR = parseFloat(process.env.REACT_APP_SOLR_GEOM_ERROR);
const SOLR_INDEX = process.env.REACT_APP_SOLR_INDEX;
const SOLR_MAXCOUNT = parseInt(process.env.REACT_APP_SOLR_MAXCOUNT, 10);

// Supported geom methods
export const GEOM_METHOD = {
	INTERSECTS: 'intersects',
	WITHIN: 'within',
};

// Timeout for delaying http requests
const REQUEST_TIMEOUT = 50;

/**
 * Reference to a current request
 * @type {{ ref: *, token: * }|undefined}
 */
let REF_REQUEST = undefined;

/**
 * Makes sure that currently running requests are cancelled and cleared.
 */
function clearRequest() {
	// make sure this function does not work on an undefined REF_REQUEST
	if (REF_REQUEST === undefined) return;

	const { ref, token } = REF_REQUEST;

	// Resets the timeout and clears the reference. In case the request was not dispatched
	// yet this will prevent the request from dispatching in the future
	clearTimeout(ref);

	// In case the requests is dispatched and pending, we cancel the connection
	token.cancel();

	// finally reset the reference
	REF_REQUEST = undefined;
}

/**
 * Currently the SolR has problem with queries at the datums border so we make sure that
 * the requests does not miss it.
 * @param {[minLon, minLat, maxLon, maxLat]} extent
 * @returns {[minLon, minLat, maxLon, maxLat]}
 */
export function fixExtent(extent) {
	const [minLon, minLat, maxLon, maxLat] = extent;
	return [
		minLon < -180
			? -180
			: minLon > 180
				? 179
				: minLon,
		minLat,
		maxLon < -180
			? -179
			: maxLon > 180
				? 180
				: maxLon,
		maxLat,
	];
}

/**
 * This function fetches documents from the solR via spatial search. It uses timeout
 * and cancel connection functions for preventing to much unnecessary http connections.
 *
 * @param {[minLon, minLat, maxLon, maxLat]} extent
 * @param {boolean} fetchOnlyMaps
 * @param {boolean} fetchOnlyPublic
 * @param {string[]} fulltextSearchTerms
 * @param {string} spatialSearchMethod
 * @param {Function} callback
 */
export function fetchDocuments(
	extent,
	fetchOnlyMaps,
	fetchOnlyPublic,
	fulltextSearchTerms,
	spatialSearchMethod,
	callback
) {
	// If currently a requests is scheduled or pending make sure to kill it, before
	// generating a new request
	if (REF_REQUEST !== undefined) {
		clearRequest();
	}

	//
	// Generate a new request
	//

	// Start with creating a cancelToken
	const cancelToken = axios.CancelToken.source();
	// Default error msg
	const errorMsg = 'Something went wrong while trying to fetch data from the backend';
	// Solr extent param for filtering by an Arbitrary Rectangle, see:
	// https://lucene.apache.org/solr/guide/7_7/spatial-search.html#filtering-by-an-arbitrary-rectangle
	// SolR has problem with extents at the datums border so we fix it.
	const adjustExtent = fixExtent(extent);

	// build the core term query part
	const fulltextQuery = fulltextSearchTerms.length > 0
		? fulltextSearchTerms.reduce(
			(acc, currVal, currInd) => {
				return currInd < fulltextSearchTerms.length - 1
					? `${acc}${currVal}* AND `
					: `${acc}${currVal}*`;
			},
			'',
		) : '';

	// Request URL in the form:
	// http://localhost:8983/solr/digas-v3/select?&q=*:*&fq=geom:[50.861,14.743 TO 50.926,14.846]
	const url = `${SOLR_ENDPOINT}/` +
		`${SOLR_INDEX}/select?q=*:*&${getSpatialFitler(adjustExtent, spatialSearchMethod)}` +
		`${fetchOnlyMaps ? '&fq=type:map' : ''}` +
		`${fetchOnlyPublic ? '&fq=accessCondition_uui:nein' : ''}` +
		`${fulltextQuery.length > 0 ? '&fq=' + fulltextQuery : ''}` +
		`&start=0&rows=${SOLR_MAXCOUNT}`;

	// Create the request
	REF_REQUEST = {
		ref: setTimeout(
			() => {
				axios.get(
					url,
					Object.assign(
						{ cancelToken: cancelToken.token },
					),
				)
				.then(
					response => {
						if (response.status === 200) {
							callback(response.data)
						} else {
							console.error(errorMsg);
						}

						REF_REQUEST = undefined;
					}
				)
				.catch(
					error => {
						// in case a cancel action is catched, we log no error messages
						if (error instanceof axios.Cancel) {
							return;
						}

						console.error(errorMsg);
						console.error(error);
						REF_REQUEST = undefined;
					});
			},
			REQUEST_TIMEOUT,
		),
		token: cancelToken,

	}
}

/**
 * Creates the filter string for the spatial query part.
 *
 * @param {[minLon, minLat, maxLon, maxLat]} extent
 * @param {string} filterMethod {within|intersects}
 * @returns {string}
 */
export function getSpatialFitler(extent, filterMethod) {
	// First perform if the given input parameters are correct.
	if (![GEOM_METHOD.INTERSECTS, GEOM_METHOD.WITHIN].includes(filterMethod)) {
		throw new Error('The given method is not a valid spatial filter type.');
	}
	if (extent.length !== 4) {
		throw new Error('The given extent is not supported by the method.');
	}

	// Create the correct filter
	const [minLon, minLat, maxLon, maxLat] = extent;
	const geojsonStr = `{'type':'Polygon','coordinates':[[[${minLon}, ${minLat}],`
		+ `[${maxLon}, ${minLat}],[${maxLon}, ${maxLat}],[${minLon}, ${maxLat}],`
		+ `[${minLon}, ${minLat}]]]}`;

	return filterMethod === GEOM_METHOD.INTERSECTS
		? `fq=${SOLR_GEOM_FIELD}:"Intersects(${geojsonStr})"`
		: `fq=${SOLR_GEOM_FIELD}:"IsWithin(${geojsonStr}) distErrPct=${isNaN(SOLR_GEOM_ERROR) ? 0 : SOLR_GEOM_ERROR}"`;
}
