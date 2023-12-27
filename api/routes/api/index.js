//const { Router } = require('express');
import { Router } from 'express';

const router = Router();

//const sessionRoute = require('./sessions.js');
//const authorizationRoute = require('./authorizations.js');
import sessionRoute from './sessions.js';
import authorizationRoute from './authorizations.js';

router.use('/sessions', sessionRoute);
router.use('/authorizations', authorizationRoute);

//module.exports = router;
export default router;
