import { Router } from 'express';
import * as argon2 from 'argon2';
import { default as jwt } from 'jsonwebtoken';
import { nanoid } from 'nanoid';

import validate from '../../middlewares/validateCredentials.js';
import { getSecret, getCredentials } from '../../lib/db.js';

const router = Router();


router.post('/', validate, async function (req, res, next) {

  let status = 401, responseMessage = {
    error: true,
    message: 'Unauthorized'
  },
  error = null,
  accessToken = '', refreshToken = '';

  const { username, password } = req.body;
  
  if (username && password) {

    try {

      const credentials = getCredentials(username); // maybe I should check if the correct username was provided, but this middleware is good enough for now

      const isCorrectPassword = await argon2.verify(credentials.passwordHash, password);

      if (isCorrectPassword) {

        const accessSecret = getSecret('access');
        const refreshSecret = getSecret('refresh');

        const now = Math.floor(Date.now() / 1000);
        
        const jwtId = nanoid();

        accessToken = jwt.sign({
          iss: 'AST',
          iat: now,
          exp: now + 60 * 30, // the access token should expire after 30 minutes, *expressed in seconds, because it's a numeric value*
          aud: credentials.type,
          jti: jwtId,
        }, 
        accessSecret,
        {
          algorithm: 'HS512'
        });

        refreshToken = jwt.sign({
          iss: 'AST',
          iat: now,
          exp: now + 60 * 60 * 24 * 7, // the refresh token should expire after 7 days, *expressed in seconds, because it's a numeric value*
          aud: 'man',
        },
        refreshSecret,
        {
          algorithm: 'HS512'
        });

      } else {

        throw new Error('Incorrect credentials');

      }

    } catch (err) {

      error = err;

    } finally {

      if (!error) {

        res.cookie('refresh_token', refreshToken, {
          maxAge: 1000 * 60 * 60 * 24 * 7, // the refresh token cookie should expire after 7 days, *expressed in milliseconds*
          path: '/api/authorizations',
          sameSite: 'Strict',
          httpOnly: true,
        });

        return res.json({
          data: {
            accessToken
          }
        });

      }

    }

  }

  return res.status(status)
  .json(responseMessage);

});

export default router;
