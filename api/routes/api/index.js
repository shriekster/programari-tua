const { Router } = require('express');

const router = Router({
  mergeParams: true,
});

const sessionsRoute = require('./sessions');
const tokensRoute = require('./tokens');

router.use('/sessions', sessionsRoute);
router.use('/tokens', tokensRoute);

module.exports = router;
