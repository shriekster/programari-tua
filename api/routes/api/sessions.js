const { Router } = require('express');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
let nanoid;
import('nanoid').then((module) => {
  nanoid = module.nanoid;
});

const validator = require('../../middlewares/validateCredentials');
const { getSecret, getCredentials } = require('../../lib/db');

const router = Router();


router.post('/', validator, async function (req, res, next) {

  let status = 401, responseMessage = {
    error: true,
    message: 'Unauthorized'
  },
  error = null,
  accessToken = '', refreshToken = '';

  const credentials = getCredentials(req.authentication.username);
  
  if (credentials) {

    try {

    const isCorrectPassword = await argon2.verify(credentials.password, req.authentication.password);

    if (isCorrectPassword) {

      const accessSecret = getSecret('access');
      const refreshSecret = getSecret('refresh');

      const now = Math.floor(Date.now() / 1000);
      
      const jwtId = nanoid();

      accessToken = jwt.sign({
        iat: now,
        exp: now + 60 * 10, // the access token should expire after 10 minutes
        jti: jwtId,
      }, accessSecret, {
        algorithm: 'HS512'
      });

      refreshToken = jwt.sign({
        iat: now,
        exp: now + 60 * 60 * 24 * 7, // the refresh token should expire after 7 days
      }, refreshSecret, {
        algorithm: 'HS512'
      });

    }

    } catch (err) {

      error = err; console.log(err)

    } finally {

      if (!error) {

        res.cookie('access_token', accessToken, {
          maxAge: 1000 * 60 * 10, // the access token cookie should expire after 10 minutes, *expressed in milliseconds*
          path: '/api',
          sameSite: 'Strict',
          httpOnly: true,
        });

        res.cookie('refresh_token', refreshToken, {
          maxAge: 1000 * 60 * 60 * 24 * 7, // the refresh token cookie should expire after 7 days, *expressed in milliseconds*
          path: '/api/authorizations',
          sameSite: 'Strict',
          httpOnly: true,
        });

        return res.redirect(303, '/admin');

      }

    }

  }

  return res.status(status)
  .json(responseMessage);

});

module.exports = router;
