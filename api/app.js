const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');

const apiRoutes = require('./routes/api/index');
const defaultRoute = require('./routes/default');

const app = express();

app.set('x-powered-by', false);
app.set('strict routing', false);
app.set('trust proxy', 'loopback'); // TODO: review the proxy settings for production

app.use(logger('dev'));
app.use(express.json({
    limit: '0.5kb',
    strict: true,
    type: 'application/json',
}));
app.use(cookieParser());

app.use('/api', apiRoutes);
app.use('*', defaultRoute);

// TODO: add a SSE route that will allow the server to keep connections for normal users and for admin(s)

// TODO: finish the error handler
// console.log(createError(413).message)
// check if the error object has a status / statusCode property; if it does,
// create an error with that code, extract its message property and respond with
// that status and a JSON body containing the message
app.use(function(err, req, res, next) {
    console.log('err', err);
    res.status(500).json({
        message: 'Internal Server Error'
    });
})

module.exports = app;
