/**
 * Created by jacob.mendt@pikobytes.de on 19.07.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import {
  calculateCentroid,
  shrinkExtent,
} from './geom';
import React from 'react';

// mocking ol
jest.mock('ol/Feature', () => ()=> <div id="Feature">Feature</div>);
jest.mock('ol/format/GeoJSON', () => ()=> <div id="GeoJSON">GeoJSON</div>);
jest.mock('ol/geom/Point', () => ()=> <div id="Point">Point</div>);
jest.mock('ol/proj', () => ()=> <div id="transformExtent">transformExtent</div>);

describe('./views/MapView/structs/geom.js', () => {
  describe('#calculateCentroid()', () => {
    it('Calculate centroid for LineString', () => {
      const subject = calculateCentroid([
        [-122.48369693756104, 37.83381888486939],
        [-122.48348236083984, 37.83317489144141],
        [-122.48339653015138, 37.83270036637107],
        [-122.48356819152832, 37.832056363179625],
        [-122.48404026031496, 37.83114119107971],
        [-122.48404026031496, 37.83049717427869],
      ], 'LineString');
      expect(subject[0]).toBe(-122.48370409011841);
      expect(subject[1]).toBe(37.83223147853665);
    });

    it('Calculate centroid for Polygon', () => {
      const subject = calculateCentroid([
        [
          [13.66081237793, 50.73743290922],
          [13.744926452637, 50.73743290922],
          [13.744926452637, 50.798231923779],
          [13.66081237793, 50.798231923779],
          [13.66081237793, 50.73743290922],
        ]], 'Polygon');
      expect(subject[0]).toBe(13.694458007812802);
      expect(subject[1]).toBe(50.7617525150436);
    });
  });

  describe('#shrinkExtent()', () => {
    it('Calculate shrinkExtent with padding 0.1', () => {
      const subject = shrinkExtent([12.423, 50.396, 12.491, 50.428], 0.1);
      expect(subject[0]).toBe(12.4298);
      expect(subject[1]).toBe(50.3992);
      expect(subject[2]).toBe(12.4842);
      expect(subject[3]).toBe(50.4248);
    });
  });
});