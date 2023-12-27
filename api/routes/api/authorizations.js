import { Router } from 'express';
import { default as jwt } from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { getSecret } from '../../lib/db.js';

import validateRefreshToken from '../../middlewares/validateRefreshToken.js';

const router = Router();

// TODO: explain a bit what's happening here
router.post('/', validateRefreshToken, function (req, res) {

  let newAccessToken = null, newRefreshToken = null,
  status = 500,
  error = null;

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

    error = err;

  }

  if (!error) {

    status = 200;

    res.cookie('refresh_token', newRefreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // the refresh token cookie should expire after 7 days, *expressed in milliseconds*
      path: '/api/authorizations',
      sameSite: 'Strict',
      httpOnly: true,
    });

  } else {

    status = 500;

    res.cookie('refresh_token', '', {
      maxAge: 0, // the refresh token cookie should expire instantly
      path: '/api/authorizations',
      sameSite: 'Strict',
      httpOnly: true,
    });

  }

  return res.status(status)
  .json({
    data: {
      accessToken: newAccessToken
    }
  });

});

export default router;
