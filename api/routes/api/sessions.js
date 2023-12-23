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

  const { username, password } = req.body;

  req.body = {};
  
  if (username && password) {

    const credentials = getCredentials(username);

    try {

      const isCorrectPassword = await argon2.verify(credentials.password, password);

      if (isCorrectPassword) {

        const accessSecret = getSecret('access');
        const refreshSecret = getSecret('refresh');

        const now = Math.floor(Date.now() / 1000);
        
        const jwtId = nanoid();

        accessToken = jwt.sign({
          iss: 'AST',
          iat: now,
          exp: now + 60 * 30, // the access token should expire after 30 minutes, *expressed in seconds, because it's a numeric value*
          aud: 'man',
          jti: jwtId,
        }, accessSecret, {
          algorithm: 'HS512'
        });

        refreshToken = jwt.sign({
          iss: 'AST',
          iat: now,
          exp: now + 60 * 60 * 24 * 7, // the refresh token should expire after 7 days, *expressed in seconds, because it's a numeric value*
          aud: 'man',
        }, refreshSecret, {
          algorithm: 'HS512'
        });

      }

    } catch (err) {

      error = err;

    } finally {

      if (!error) {

        res.cookie('access_token', accessToken, {
          maxAge: 1000 * 60 * 30, // the access token cookie should expire after 30 minutes, *expressed in milliseconds*
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
