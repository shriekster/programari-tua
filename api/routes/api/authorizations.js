import { Router } from 'express';
import { default as jwt } from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { getSecret } from '../../lib/db.js';

import { validateRefreshToken } from '../../middlewares/validateRefreshToken.js';

const router = Router();

// The last middleware in this route handler issues a new access token and a new refresh token
router.post('/', validateRefreshToken, function (req, res) {

  let newAccessToken = '', newRefreshToken = '',
  status = 500,
  maxAge = 0,
  error = null;

  const accessSecret = getSecret('access');
  const refreshSecret = getSecret('refresh');

  try {

    const jwtId = nanoid();

    newAccessToken = jwt.sign({
      iss: 'AST',
      jti: jwtId,
    },
    accessSecret, {
      algorithm: 'HS512',
      expiresIn: '30m', // the access token should expire after 30 minutes, *expressed in seconds or a string describing a time span (vercel/ms)*
    });

    newRefreshToken = jwt.sign({
      iss: 'AST',
    },
    refreshSecret, {
      algorithm: 'HS512',
      expiresIn: '7d', // the refresh token should expire after 7 days, *expressed in seconds or a string describing a time span (vercel/ms)*
    });

  } catch (err) {

    error = err; console.log(err)

  }

  if (!error) {

    status = 200;
    maxAge = 1000 * 60 * 60 * 24 * 7; // the refresh token cookie should expire after 7 days, *expressed in milliseconds*;

  } else {

    status = 500;
    maxAge = 0; // the refresh token cookie should expire instantly
    newRefreshToken = ''; // explicitly set newRefreshToken to an empty string

  }

  res.cookie('refresh_token', newRefreshToken, {
    maxAge: maxAge,
    path: '/api/authorizations',
    sameSite: 'Strict',
    httpOnly: true,
  });

  return res.status(status)
  .json({
    data: {
      accessToken: newAccessToken
    }
  });

});

// logout route handler
router.delete('/current', validateRefreshToken, function(req, res) {

  // the cookie holding the refresh token should expire
  return res.status(200)
  .cookie('refresh_token', '', {
    maxAge: 0,
    path: '/api/authorizations',
    sameSite: 'Strict',
    httpOnly: true,
  })
  .json({
    data: {
      message: 'See you next time!'
    }
  });

});

export default router;
