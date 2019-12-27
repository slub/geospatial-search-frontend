/**
 * Created by jacob.mendt@pikobytes.de on 24.05.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import {
	parseAsCSV,
	parseDocument,
} from './parser';
import React from 'react'

// mocking ol
jest.mock('ol/Feature', () => ()=> <div id="Feature">Feature</div>);
jest.mock('ol/format/GeoJSON', () => ()=> <div id="GeoJSON">GeoJSON</div>);
jest.mock('ol/geom/Point', () => ()=> <div id="Point">Point</div>);
jest.mock('ol/proj', () => ()=> <div id="transformExtent">transformExtent</div>);

describe('./views/MapView/structs/parser.js', () => {
	let data;
	beforeEach(() => {
		data = {
			uid: [
				2924
			],
			collection:["EB - Ergebnisberichtsarchiv (GE)"],
			purl: "https://www.digas.sachsen.de/idEB00767-00044884",
			id: "2924LOG_0000",
			title: [
				"Vorratsberechnung Sand Alteno 1986"
			],
			type: [
				"monograph"
			],
			timestamp: [
				"2019-03-20T13:42:38.805Z"
			],
			thumbnail: [
				"https://www.digas.sachsen.de/digas/LfULG_EB02111-00047528/LfULG_EB02111-00047528_tif/jpegs/00000001.tif.thumbnail.jpg"
			],
			geom: [
				"{\"geometry\": {\"type\": \"Polygon\", \"coordinates\": [[[13.66081237793, 50.73743290922], [13.744926452637, 50.73743290922], [13.744926452637, 50.798231923779], [13.66081237793, 50.798231923779], [13.66081237793, 50.73743290922]]]}, \"type\": \"Feature\"}",
			],
		};
	});

	describe('#parseDocument()', () => {
		it('Parse default document type', () => {
			const subject = parseDocument(data);
			expect(subject.id).toBe(data.id);
			expect(subject.geometry.type).toBe('Polygon');
			expect(subject.properties.thumbnail).toBe(data.thumbnail[0]);
			expect(subject.properties.timestamp).toBe(data.timestamp[0]);
			expect(subject.properties.title).toBe(data.title[0]);
			expect(subject.properties.type).toBe(data.type[0]);
			expect(subject.properties.collection).toBe(data.collection[0]);
			expect(subject.properties.purl).toBe(data.purl);
			expect(subject.raw).toBeTruthy();
		});

		it('Parse default document type with polygon geometry', () => {
			const d = Object.assign(data, {
				geom: "{\"type\":\"Feature\",\"properties\":{},\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[11.898193359375,50.345460408605],[12.1728515625,49.674737880666],[12.952880859375,49.023461463214],[17.02880859375,50.12057809796],[16.69921875,50.757309850294],[14.490966796875,51.227527905265],[11.898193359375,50.345460408605]]]}}",
			});
			const subject = parseDocument(data);
			expect(subject.id).toBe(data.id);
			expect(subject.geometry.type).toBe('Polygon');
			expect(subject.properties.thumbnail).toBe(data.thumbnail[0]);
			expect(subject.properties.timestamp).toBe(data.timestamp[0]);
			expect(subject.properties.title).toBe(data.title[0]);
			expect(subject.properties.type).toBe(data.type[0]);
			expect(subject.properties.collection).toBe(data.collection[0]);
			expect(subject.properties.purl).toBe(data.purl);
			expect(subject.raw).toBeTruthy();
		});

		it('Parse default document type with polygon geometry', () => {
			const d = Object.assign(data, {
				geom: "{\"type\":\"Feature\",\"properties\":{},\"geometry\":{\"type\":\"LineString\",\"coordinates\":[[14.269866943359,51.460852446455],[14.097518920898,51.382495331187],[14.072799682617,51.359347885529],[14.098205566406,51.266641047969],[14.159317016602,51.139724789866],[14.1943359375,51.115592710641],[14.252700805664,50.977020806911],[14.250640869141,50.966211198961],[14.246520996094,50.955831608307],[14.152450561523,50.918619031558],[14.11262512207,50.921216224219],[14.003448486328,50.833697670981],[13.877105712891,50.804198994676],[13.871612548828,50.782496902352],[13.859252929688,50.782496902352],[13.783721923828,50.776418510714],[13.756256103516,50.752097042863]]}}",
			});
			const subject = parseDocument(data);
			expect(subject.id).toBe(data.id);
			expect(subject.geometry.type).toBe('LineString');
			expect(subject.properties.thumbnail).toBe(data.thumbnail[0]);
			expect(subject.properties.timestamp).toBe(data.timestamp[0]);
			expect(subject.properties.title).toBe(data.title[0]);
			expect(subject.properties.type).toBe(data.type[0]);
			expect(subject.properties.collection).toBe(data.collection[0]);
			expect(subject.properties.purl).toBe(data.purl);
			expect(subject.raw).toBeTruthy();
		});
	});

	describe('#parseAsCSV()', () => {
		it('Return csv as expected', () => {
			const subject = parseAsCSV([parseDocument(data),parseDocument(data)]);
			expect(subject.length).toBe(119);
		});
	});
});
