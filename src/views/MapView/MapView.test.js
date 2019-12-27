/**
 * Created by jacob.mendt@pikobytes.de on 18.07.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from 'react';
import { mount, shallow } from 'enzyme';
import { MapView } from './MapView';

// Mock the OlMap component, because it contains reference to OpenLayers which
// makes problems with the transpiler of the current testing environment
jest.mock('./components/OlMap', () => ()=> <div id="OlMap">OlMap</div>);
jest.mock('./components/OlLayer', () => ()=> <div id="OlLayer">OlLayer</div>);
jest.mock('ol/Map', () => ()=> <div id="Map">Map</div>);
jest.mock('ol/Feature', () => ()=> <div id="Feature">Feature</div>);
jest.mock('ol/format/GeoJSON', () => ()=> <div id="GeoJSON">GeoJSON</div>);
jest.mock('ol/proj', () => ()=> <div id="transformExtent">transformExtent</div>);
jest.mock('ol/geom/Point', () => ()=> <div id="Point">Point</div>);

describe('./views/MapView/MapView.js', () => {
  let defaultProps = {};
  beforeEach(() => {
    defaultProps = {
      onUpdateFocusDocument: () => {},
      onUpdateSelectDocuments: () => {},
    }
  });

  describe('#constructor', () => {
    it('Proper initialization with default parameters', () => {
      const subject = shallow(<MapView
        {...defaultProps}
      />);
      expect(subject).toBeTruthy();
    });
  });

  it('Does not fail in case with sidebar open on initialize', () => {
    const subject = mount(<MapView
        {...defaultProps}
    />);
    subject.setProps({ offsetWidth: 400 });
    expect(subject).toBeTruthy();
  });
});