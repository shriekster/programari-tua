const { Router } = require('express');
const validator = require('validator');
const jwt = require('jsonwebtoken');
let nanoid;
import('nanoid').then((module) => {
  nanoid = module.nanoid;
});

const { getSecret } = require('../../lib/db');
const validateTokens = require('../../middlewares/validateTokens');

const router = Router();

// TODO: rewrite this route handler
// if the both tokens are valid, send an OK response (message: 'authorized')
// if the access token has expired and the refresh token is valid, recreate both tokens and send them in the response;
// if both tokens have expired, redirect to /admin/login
// if any token is missing or is not valid, send a HTTP 401 response
router.post('/', validateTokens, function (req, res, next) {
  
  const accessSecret = getSecret('access');
  const refreshSecret = getSecret('refresh');

  let accessTokenError = null, refreshTokenError = null, signError = null,

  status = 401, responseMessage = {
    error: true,
    message: 'Unauthorized'
  },

  newAccessToken = '', newRefreshToken = '',

  accessClaims = null, refreshClaims = null;

  const { access_token, refresh_token } = req.cookies;

  if (access_token && refresh_token) {

    try {

      accessClaims = jwt.decode(access_token, accessSecret, {
        algorithms: ['HS512']
      });

    } catch (err) {

      accessTokenError = err;

    }

    if (accessTokenError && 'TokenExpiredError' === accessTokenError?.name) {

      try {

        const refreshClaims = jwt.decode(refresh_token, refreshSecretSecret, {
          algorithms: ['HS512']
        });
  
      } catch (err) {
  
        refreshTokenErrorTokenError = err;
  
      }

      if (!refreshTokenError) {

        try {

          const jwtId = nanoid();

          newAccessToken = jwt.sign({
            iat: now,
            exp: now + 60 * 10, // the access token should expire after 10 minutes, *expressed in seconds, because it's a numeric value*
            jti: jwtId,
          }, accessSecret, {
            algorithm: 'HS512'
          });
    
          newRefreshToken = jwt.sign({
            iat: now,
            exp: now + 60 * 60 * 24 * 7, // the refresh token should expire after 7 days, *expressed in seconds, because it's a numeric value*
          }, refreshSecret, {
            algorithm: 'HS512'
          });

        } catch (err) {

          signError = err;

        } finally {

          if (!signError) {

            res.cookie('access_token', newAccessToken, {
              maxAge: 1000 * 60 * 10, // the access token cookie should expire after 10 minutes, *expressed in milliseconds*
              path: '/api',
              sameSite: 'Strict',
              httpOnly: true,
            });
    
            res.cookie('refresh_token', newRefreshToken, {
              maxAge: 1000 * 60 * 60 * 24 * 7, // the refresh token cookie should expire after 7 days, *expressed in milliseconds*
              path: '/api/authorizations',
              sameSite: 'Strict',
              httpOnly: true,
            });

            //return res.redirect(303, '/admin/login');

          }

        }

      }

    } else {

      res.cookie('access_token', '', {
        maxAge: 0, // the access token cookie should expire instantly
        path: '/api',
        sameSite: 'Strict',
        httpOnly: true,
      });

      res.cookie('refresh_token', '', {
        maxAge: 0, // the refresh token cookie should expire instantly
        path: '/api/authorizations',
        sameSite: 'Strict',
        httpOnly: true,
      });

      return res.redirect(303, '/admin/login');

    }

  }

  return res.status(status)
  .json(responseMessage);

});

module.exports = router;
