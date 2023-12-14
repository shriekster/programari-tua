const { Router } = require('express');
const validator = require('validator');

const router = Router({
  mergeParams: true,
});

let nanoid;

import('nanoid').then((module) => {

  nanoid = module;

});

router.post('/', async function (req, res) {

  if (req.body) {

    const { accessToken, refreshToken } = req.body;

    return res.status(200)
    .json({
      error: false,
      message: 'OK'
    });

  }

  return res.status(400)
  .json({
    error: true,
    message: 'Bad Request'
  })

})

module.exports = router;
