import { default as jwt } from 'jsonwebtoken';
import { getSecret } from '../lib/db.js';

const validateToken = (type, token) => {

  const secret = getSecret(type);

  if (secret) {

    let claims = null, tokenError = null;

    try {

      claims = jwt.verify(token, secret, {
        algorithms: ['HS512']
      });

    } catch (err) {

      tokenError = err; console.log(err)

    }

    if (!tokenError) {

      return 'ok';

    } else {

      if ('TokenExpiredError' === tokenError?.name) {

        return 'expired';

      }

      return 'invalid';

    }

  }

  return 'invalid';

};

export const validateRefreshToken = (req, res, next) => {

  const { refresh_token } = req.cookies;

  if (refresh_token) {

    const tokenStatus = validateToken('refresh', refresh_token);

    // if the refresh token is valid...
    if ('ok' === tokenStatus) {

      return next(); // ...the next middleware should issue the new tokens

    }

    return res.status(401)
    .json({
      data: {
        message: 'Unauthorized'
      }
    });

  }

  return res.status(400)
  .json({
    data: {
      message: 'Bad Request'
    }
  });

};