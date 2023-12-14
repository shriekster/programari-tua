const { Router } = require('express');

const router = Router({
  mergeParams: true,
});

const sessionsRoute = require('./sessions');
const tokensRoute = require('./tokens');

//router.post('/sessions', (req, res) => res.json({hello: 'world'}))

router.use('/sessions', sessionsRoute);
router.use('/tokens', tokensRoute);

//router.use('/sessions', (req, res) => { console.log('/api'); return res.json({hi: 'what?'})})

module.exports = router;
