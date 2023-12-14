const { Router } = require('express');

const router = Router({
  mergeParams: true,
});

const authorizationRoute = require('./authorizations');

router.use('/authorizations', authorizationRoute);

module.exports = router;
