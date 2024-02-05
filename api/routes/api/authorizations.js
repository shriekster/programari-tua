import { Router } from 'express';
import { default as jwt } from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { getTokenSecret, getProfileName } from '../../lib/token.js';

import validateRefreshToken from '../../middlewares/validateRefreshToken.js';

const router = Router();

// The last middleware in this route handler issues a new access token and a new refresh token
router.post('/', validateRefreshToken, function (req, res) {

  let newAccessToken = '', newRefreshToken = '',
  status = 500,
  accessTokenCookieMaxAge = 0,
  refreshTokenCookieMaxAge = 0,
  error = null;

  const { refresh_token } = req.cookies;

  const profileName = getProfileName('refresh_token', refresh_token);

  const accessTokenSecret = getTokenSecret('access_token');
  const refreshTokenSecret = getTokenSecret('refresh_token');

  try {

    if (!profileName) {

      throw new Error('Error getting aud claim from refresh token!');

    }

    const jwtId = nanoid();

    newAccessToken = jwt.sign({
      iss: 'AST',
      aud: `${profileName}`,
      jti: jwtId,
    },
    accessTokenSecret, {
      algorithm: 'HS512',
      expiresIn: '30m', // the access token should expire after 30 minutes, *expressed in seconds or a string describing a time span (vercel/ms)*
    });

    newRefreshToken = jwt.sign({
      iss: 'AST',
      aud: `${profileName}`,
    },
    refreshTokenSecret, {
      algorithm: 'HS512',
      expiresIn: '7d', // the refresh token should expire after 7 days, *expressed in seconds or a string describing a time span (vercel/ms)*
    });

  } catch (err) {

    error = err;

  }

  if (!error) {

    status = 200;
    accessTokenCookieMaxAge = 1000 * 60 * 30; // the access token cookie should expire after 30 minutes, *expressed in milliseconds*
    refreshTokenCookieMaxAge = 1000 * 60 * 60 * 24 * 7; // the refresh token cookie should expire after 7 days, *expressed in milliseconds*

  } else {

    status = 500;
    maxAge = 0; // the refresh token cookie should expire instantly
    newRefreshToken = ''; // explicitly set newRefreshToken to an empty string

  }

  return res.cookie('access_token', newAccessToken, {
    maxAge: accessTokenCookieMaxAge,
    path: '/api/admin',
    sameSite: 'Strict',
    httpOnly: true,
  })
  .cookie('refresh_token', newRefreshToken, {
    maxAge: refreshTokenCookieMaxAge,
    path: '/api/authorizations',
    sameSite: 'Strict',
    httpOnly: true,
  })
  .json({
    data: {
      message: 'OK'
    }
  });

});

// logout route handler
router.delete('/current', validateRefreshToken, function(req, res) {

  // the cookie holding the refresh token should expire
  return res.status(200)
  .cookie('access_token', '', {
    maxAge: 0,
    path: '/api/admin',
    sameSite: 'Strict',
    httpOnly: true,
  })
  .cookie('refresh_token', '', {
    maxAge: 0,
    path: '/api/authorizations',
    sameSite: 'Strict',
    httpOnly: true,
  })
  .json({
    data: {
      message: 'OK'
    }
  });

});

export default router;
