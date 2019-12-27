/**
 * Created by jacob.mendt@pikobytes.de on 18.07.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { fixExtent, getSpatialFitler } from './api';

describe('./views/MapView/structs/api.js', () => {
  describe('#fixExtent()', () => {
    it('[-3.44, 40.848, 22.641, 57.576]', () => {
      const e = [-3.44, 40.848, 22.641, 57.576];
      const subject = fixExtent(e);
      expect(subject[0]).toBe(e[0]);
      expect(subject[1]).toBe(e[1]);
      expect(subject[2]).toBe(e[2]);
      expect(subject[3]).toBe(e[3]);
    });

    it('[-154.972, -76.59, 261.299, 89.293]', () => {
      const e = [-154.972, -76.59, 261.299, 89.293];
      const subject = fixExtent(e);
      expect(subject[0]).toBe(e[0]);
      expect(subject[1]).toBe(e[1]);
      expect(subject[2]).toBe(180);
      expect(subject[3]).toBe(e[3]);
    });

    it('[-254.972, -76.59, 261.299, 89.293]', () => {
      const e = [-254.972, -76.59, 261.299, 89.293];
      const subject = fixExtent(e);
      expect(subject[0]).toBe(-180);
      expect(subject[1]).toBe(e[1]);
      expect(subject[2]).toBe(180);
      expect(subject[3]).toBe(e[3]);
    });
  });

  describe('#getSpatialFilter()', () => {
    it('Returns within filter', () => {
      const subject = getSpatialFitler([-3.44, 40.848, 22.641, 57.576], 'within');
      expect(subject)
        .toBe('fq=geom:\"IsWithin({\'type\':\'Polygon\',\'coordinates\':[[[-3.44, 40.848],[22.641, 40.848],[22.641, 57.576],[-3.44, 57.576],[-3.44, 40.848]]]}) distErrPct=0\"');

    });

    it('Returns intersects filter', () => {
      const subject = getSpatialFitler([-3.44, 40.848, 22.641, 57.576], 'intersects');
      expect(subject)
        .toBe('fq=geom:\"Intersects({\'type\':\'Polygon\',\'coordinates\':[[[-3.44, 40.848],[22.641, 40.848],[22.641, 57.576],[-3.44, 57.576],[-3.44, 40.848]]]})\"');
    });

    it('Export to throw an error for an unsupported method value', () => {
      expect(
        () => getSpatialFitler([-3.44, 40.848, 22.641, 57.576], 'test')
      ).toThrow(
        new Error('The given method is not a valid spatial filter type.')
      );
    });
  });
});