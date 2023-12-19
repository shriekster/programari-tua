const { Router } = require('express');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
let nanoid;
import('nanoid').then((module) => {
  nanoid = module;
});

const validator = require('../../middlewares/validate_authentication_payload');
const { getSecret, getCredentials } = require('../../lib/db');

const router = Router();


router.post('/', validator, async function (req, res, next) {

  let status = 401, responseMessage = {
    error: true,
    message: 'Unauthorized'
  };

  const credentials = getCredentials(req.authentication.username);
  
  if (credentials) {

    try {

    const isCorrectPassword = await argon2.verify(credentials.password, req.authentication.password);

    if (isCorrectPassword) {

      const accessSecret = getSecret('access');
      const refreshSecret = getSecret('refresh');

      if (accessSecret && refreshSecret) {

        const now = Math.floor(Date.now() / 1000);

        const jwtId = await nanoid();

        const access_token = jwt.sign({
          iat: now,
          exp: now + 60 * 10, // the access token should expire after 10 minutes
          jti: jwtId,
        }, accessSecret, {
          algorithm: 'HS512'
        });

        const refresh_token = jwt.sign({
          iat: now,
          exp: now + 60 * 60 * 24 * 7, // the refresh token should expire after 7 days
        }, refreshSecret, {
          algorithm: 'HS512'
        });

      }

    }

    } catch (err) {

      //

    }

  }

  /*
  if (req?.body) {

    const { username, password } = req.body;

    const isValidUsername = validator.isLength('' + username, { min: 3, max: 64 });
    const isValidPassword = validator.isLength('' + password, {min: 8, max: 64 });

    if (isValidUsername && isValidPassword) {

      status = 303;
      responseMessage.error = false;
      responseMessage.message = 'OK';

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

      return res//.status(status)
      //.json(responseMessage)
      .redirect(303, '/admin');

    } else {

      status = 401;
      responseMessage.error = true;
      responseMessage.message = 'Unauthorized';

    }

    return res.status(401)
    .json(responseMessage);

  }
  */
  return res.status(status)
  .json(responseMessage);

});

module.exports = router;
