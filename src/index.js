/**
 * Created by jacob.mendt@pikobytes.de on 15.03.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { configureUrlQuery } from 'react-url-query';
import { createBrowserHistory } from 'history';
import './index.scss';
import App from './layouts/App';

// Load configurations from environmental settings
const ROOT_ID = process.env.REACT_APP_ROOT_ID;

// Make sure that we initialize a history. This is necessary for proper working
// of react-url-query which is used for writing and reading query params
const history = createBrowserHistory();
configureUrlQuery({ history });

// Element Id of the app container. The content of this element is replaced with
// the application rendered content.
ReactDOM.render(<App />,document.getElementById(ROOT_ID));
