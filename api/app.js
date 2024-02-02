import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
//import createHttpError from 'http-errors';

import apiRoutes from './routes/api/index.js';
import defaultRoute from './routes/default.js';

const app = express();

app.set('x-powered-by', false);
app.set('strict routing', false);
app.set('query parser', 'extended');
app.set('trust proxy', 'loopback'); // TODO: review the proxy settings for production

app.use(logger('dev'));
app.use(express.json({
    limit: '64kb',
    strict: true,
    type: 'application/json',
}));
app.use(cookieParser());

app.use('/api', apiRoutes);
app.use('*', defaultRoute);

// TODO: finish the error handler
// console.log(createError(413).message)
// check if the error object has a status / statusCode property; if it does,
// create an error with that code, extract its message property and respond with
// that status and a JSON body containing the message
app.use(function(err, req, res, next) {

    console.log({error: err});

    res.status(500).json({
        message: 'Internal Server Error'
    });

});

export default app;
