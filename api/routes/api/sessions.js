import { Router } from 'express';
import * as argon2 from 'argon2';
import { default as jwt } from 'jsonwebtoken';
import { nanoid } from 'nanoid';

import { validateCredentials } from '../../middlewares/validateCredentials.js';
import { getSecret, getCredentials } from '../../lib/db.js';

const router = Router();

// POST /api/sessions
router.post('/', validateCredentials, async function (req, res) {

  let error = null,
  accessToken = '', refreshToken = '',
  credentials;

  const { username, password } = req.body;
  
  if (username && password) {

    try {

      // if the correct username is provided, the credentials object will contain data, otherwise it will be undefined or null
      credentials = getCredentials(username);

      const isCorrectPassword = await argon2.verify(credentials.passwordHash, password);

      if (isCorrectPassword) {

        const accessSecret = getSecret('access');
        const refreshSecret = getSecret('refresh');
        
        const jwtId = nanoid();

        accessToken = jwt.sign({
          iss: 'AST',
          jti: jwtId
        }, 
        accessSecret, {
          algorithm: 'HS512',
          expiresIn: '30m', // the access token should expire after 30 minutes, *expressed in seconds or a string describing a time span (vercel/ms)*
        });

        refreshToken = jwt.sign({
          iss: 'AST',
        }, 
        refreshSecret, {
          algorithm: 'HS512',
          expiresIn: '7d', // the refresh token should expire after 7 days, *expressed in seconds or a string describing a time span (vercel/ms)*
        });

      } else {

        throw new Error('Incorrect credentials');

      }

    } catch (err) {

      error = err;

    }

    if (!error) {

      // only set the cookie containing the refresh token if the user is human, because 
      // a device (that is, the sms gateway) doesn't need the refresh token
      if ('human' === credentials?.type) {

        res.cookie('refresh_token', refreshToken, {
          maxAge: 1000 * 60 * 60 * 24 * 7, // the refresh token cookie should expire after 7 days, *expressed in milliseconds*
          path: '/api/authorizations',
          sameSite: 'Strict',
          httpOnly: true,
        });

      }

      res.cookie('access_token', accessToken, {
        maxAge: 1000 * 60 * 30, // the access token cookie should expire after 30 minutes, *expressed in milliseconds*
        path: '/api/admin',
        sameSite: 'Strict',
        httpOnly: true,
      });

      return res.json({
        data: {
          message: 'OK'
        }
      });

    }

  }

  return res.status(401)
  .json({
    data: {
      message: 'Unauthorized'
    }
  });

});

export default router;
