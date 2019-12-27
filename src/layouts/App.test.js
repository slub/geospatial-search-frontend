/**
 * Created by jacob.mendt@pikobytes.de on 24.04.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
/**
 * Created by jacob.mendt@pikobytes.de on 15.03.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import App from './App';

// Mock the OlMap component, because it contains reference to OpenLayers which
// makes problems with the transpiler of the current testing environment
jest.mock('../views/MapView/components/OlMap', () => ()=> <div id="OlMap">OlMap</div>);
jest.mock('../views/MapView/components/OlLayer', () => ()=> <div id="OlLayer">OlLayer</div>);
jest.mock('../views/SideBarView/SideBarView', () => () => <div id="SideBarView">SideBarView</div>);
jest.mock('ol/Map', () => ()=> <div id="Map">Map</div>);
jest.mock('ol/Feature', () => ()=> <div id="Feature">Feature</div>);
jest.mock('ol/format/GeoJSON', () => ()=> <div id="GeoJSON">GeoJSON</div>);
jest.mock('ol/proj', () => ()=> <div id="transformExtent">transformExtent</div>);
jest.mock('ol/geom/Point', () => ()=> <div id="Point">Point</div>);

describe('./layouts/App.js', () => {
  it('renders without crashing', () => {
    const subject = shallow(<App />);
    expect(subject.length).toBe(1);
  });

  it('mounts without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
