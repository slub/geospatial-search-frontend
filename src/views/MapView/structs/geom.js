/**
 * Created by jacob.mendt@pikobytes.de on 19.07.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { transformExtent } from 'ol/proj';
import round from 'lodash.round';

/**
 * Calculates the centroid for a given coordinates and type.
 *
 * @param {[[*]]} coordinates
 * @param {string} type LineString, Polygon
 * @return {[lon, lat]}
 */
export function calculateCentroid(coordinates, type) {
  if (type !== 'Polygon' && type !== 'LineString') {
    throw new Error(`The given geometry type ("${type}") is not supported through the centroid function.`);
  }

  const coords = type === 'Polygon'
      ? coordinates[0]
      : coordinates;
  let sumLon = 0;
  let sumLat = 0;
  coords.forEach(
      c => {
        sumLon += c[0];
        sumLat += c[1];
      }
  );

  return [
    sumLon / coords.length,
    sumLat / coords.length,
  ]
}

/**
 * Function for correcting the extent in case we have an offsetWidth on the left
 * side of the extent.
 * @param {[minLon, minLat, maxLon, maxLat]|undefined} extent
 * @param {number} offsetWidth
 * @param {ol.Map} map
 * @returns {[minLon, minLat, maxLon, maxLat]|undefined}
 */
export function correctExtent(extent, offsetWidth, map) {
  if (offsetWidth > 0) {
    const p1 = map.getCoordinateFromPixel([offsetWidth, 0]);
    const p2 = map.getCoordinateFromPixel(map.getSize());
    const eRaw = transformExtent([p1[0], p2[1], p2[0], p1[1]], 'EPSG:3857', 'EPSG:4326');
    return [
      round(eRaw[0], 3),
      round(eRaw[1], 3),
      round(eRaw[2], 3),
      round(eRaw[3], 3)
    ]
  } else {
    return extent;
  }
}

export function shrinkExtent(extent, padding = 0.1) {
  const paddingLon = Math.abs(extent[2] - extent[0]) * padding;
  const paddingLat = Math.abs(extent[3] - extent[1]) * padding;
  return [
    extent[0] + paddingLon,
    extent[1] + paddingLat,
    extent[2] - paddingLon,
    extent[3] - paddingLat,
  ];
}