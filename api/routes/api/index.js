//const { Router } = require('express');
import { Router } from 'express';

const router = Router();

//const sessionRoute = require('./sessions.js');
//const authorizationRoute = require('./authorizations.js');
import sessionRoute from './sessions.js';
import authorizationRoute from './authorizations.js';

// login
router.use('/sessions', sessionRoute);

// refresh token
router.use('/authorizations', authorizationRoute);

// the rest of the API will use an authorization middleware, which will check the access token

//module.exports = router;
export default router;
