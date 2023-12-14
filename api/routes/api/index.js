const { Router } = require('express');

const router = Router();

const authorizationRoute = require('./authorizations');

router.use('/authorizations', authorizationRoute);

module.exports = router;
