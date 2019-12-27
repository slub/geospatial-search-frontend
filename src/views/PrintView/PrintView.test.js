/**
 * Created by jacob.mendt@pikobytes.de on 22.07.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from 'react';
import { shallow } from 'enzyme';
import PrintView from './PrintView';

// Mock the OlMap component, because it contains reference to OpenLayers which
// makes problems with the transpiler of the current testing environment
jest.mock('ol/Map', () => ()=> <div id="Map">Map</div>);
jest.mock('ol/Feature', () => ()=> <div id="Feature">Feature</div>);
jest.mock('ol/format/GeoJSON', () => ()=> <div id="GeoJSON">GeoJSON</div>);
jest.mock('ol/proj', () => ()=> <div id="transformExtent">transformExtent</div>);
jest.mock('ol/geom/Point', () => ()=> <div id="Point">Point</div>);

describe('./views/PrintView/PrintView.js', () => {
  let defaultProps = {
    onUpdatePrintDialog: () => {},
  };

  describe('#constructor', () => {
    it('Proper initialization with default parameters', () => {
      const subject = shallow(<PrintView
          {...defaultProps}
      />);
      expect(subject).toBeTruthy();
    });
  });
});