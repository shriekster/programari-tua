const { Router } = require('express');

const router = Router();

const sessionRoute = require('./sessions');
const authorizationRoute = require('./authorizations');

router.use('/sessions', sessionRoute);
router.use('/authorizations', authorizationRoute);

module.exports = router;
