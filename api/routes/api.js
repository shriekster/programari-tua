const express = require('express');
const validator = require('validator');

const router = express.Router();

let nanoid;

import('nanoid').then((module) => {

  nanoid = module;

});

router.post('/sessions', async function (req, res) {

  let status = 400, responseMessage = {
    error: true,
    message: 'Bad Request'
  };

  if (req?.body) {

    const { username, password } = req.body;
    console.log({username, password})

    const isValidUsername = validator.isLength('' + username, { min: 3, max: 64 });
    const isValidPassword = validator.isLength('' + password, {min: 8, max: 64 });

    if (isValidUsername && isValidPassword) {

      status = 303;
      responseMessage.error = false;
      responseMessage.message = 'OK';

      //res.setHeader('Set-Cookie', `access_token=testing; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Strict; HttpOnly`);
      //res.setHeader('Set-Cookie', `refresh_token=testing; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Strict; HttpOnly`);

      res.cookie('access_token', 'testing', {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        sameSite: 'Strict',
        httpOnly: true,
      });

      res.cookie('refresh_token', 'testing', {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        sameSite: 'Strict',
        httpOnly: true,
      });

      res//.status(status)
      //.json(responseMessage)
      .redirect(303, '/admin');

    } else {

      status = 401;
      responseMessage.error = true;
      responseMessage.message = 'Unauthorized';

    }

  }

});

router.post('/tokens', async function (req, res) {

  if (req.body) {

    const { accessToken, refreshToken } = req.body;

    // TODO: check API key

    return res.status(200)
    .json({
      error: false,
      message: 'OK'
    })

  }

  return res.status(400)
  .json({
    error: true,
    message: 'Bad Request'
  })

})

module.exports = router;
