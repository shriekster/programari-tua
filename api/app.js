import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import createHttpError from 'http-errors';

import apiRoutes from './routes/api/index.js';
import defaultRoute from './routes/default.js';

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
// TODO: add a WebSocket server that will allow the server to communicate with the SMS gateway ->
//  the sms gateway authenticates to the server with a username and a password, over HTTPS, thus obtaining an access token
//  the sms gateway initiates a WebSocket connection using the previously obtained access token (cookie with Origin/Referrer checking or Sec-Websocket-Protocol header)
//  the server exposes a HTTP API endpoint which will allow SMSs to be sent ->
//      the sms gateway will receive SMS details via the Websocket connection, then it will send the SMS, 
//      then it will send the status back to the server, via the same Websockets connection

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

export default app;
