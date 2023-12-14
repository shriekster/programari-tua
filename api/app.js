const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const apiRoutes = require('./routes/api/index');
const defaultRoute = require('./routes/default');

const app = express();

app.set('x-powered-by', false);
app.set('strict routing', false);
app.set('trust proxy', 'loopback');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api', apiRoutes);
app.use('*', defaultRoute);

module.exports = app;
