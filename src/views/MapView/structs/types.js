/**
 * Created by jacob.mendt@pikobytes.de on 22.07.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import isNumber from 'lodash.isnumber';

const MAP_INITIAL_VIEW = JSON.parse(process.env.REACT_APP_MAP_INITAL_VIEW);

/**
 * Specify custom type for translation of extents via state url. This type is
 * updated, everytime we perform a search operation.
 */
export const extentUrlType = {
  decode: (encoded) => {
    // not a valid center
    if (encoded === undefined) {
      return;
    }

    const c = encoded.split(',');

    // not a valid extent
    if (c.length !== 4) {
      return;
    }

    const llng = parseFloat(c[0]);
    const llat = parseFloat(c[1]);
    const ulng = parseFloat(c[2]);
    const ulat = parseFloat(c[3]);

    // not a valid center
    if (!isNumber(llng) || !isNumber(llat) || !isNumber(ulng) || !isNumber(ulat)) {
      return;
    }

    return [llng, llat, ulng, ulat];
  },
  encode: (decoded) => {
    return `${decoded[0]},${decoded[1]},${decoded[2]},${decoded[3]}`;
  },
};

/**
 * We specify a custom type for translation the views state to the url
 */
export const centerUrlType = {
  decode: (encoded) => {
    const d = MAP_INITIAL_VIEW.center;

    // not a valid center
    if (encoded === undefined) {
      return d;
    }

    const c = encoded.split(',');

    // not a valid center
    if (c.length !== 2) {
      return d;
    }

    const lng = parseFloat(c[0]);
    const lat = parseFloat(c[1]);

    // not a valid center
    if (!isNumber(lng) || !isNumber(lat)) {
      return d;
    }

    return [lng, lat];
  },
  encode: (decoded) => {
    return `${decoded[0]},${decoded[1]}`;
  },
};