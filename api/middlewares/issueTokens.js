const jwt = require('jsonwebtoken');
let nanoid;
import('nanoid').then((module) => {
  nanoid = module.nanoid;
});

const { getSecret } = require('../lib/db');

// this middleware should execute only if the new access token if it expired and the refresh token is valid
// and is should issue the new tokens (new access token, obtained with the refresh token, then the new refresh token, 'rotated')
const issue = (req, res, next) => {

  let newAccessToken, newRefreshToken;

  const accessSecret = getSecret('access');
  const refreshSecret = getSecret('refresh');

  try {

    const jwtId = nanoid();

    newAccessToken = jwt.sign({
      iat: now,
      exp: now + 60 * 30, // the access token should expire after 30 minutes, *expressed in seconds, because it's a numeric value*
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
        maxAge: 1000 * 60 * 30, // the access token cookie should expire after 10 minutes, *expressed in milliseconds*
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

      return res.status(200)
      .json({
        message: 'Authorized'
      });

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

};

module.exports = issue;