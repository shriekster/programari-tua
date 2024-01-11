import { default as jwt } from 'jsonwebtoken';
import { getSecret } from './db.js';

const checkToken = (tokenType, token) => {

  if (token) {

    const secret = getSecret(tokenType);

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

  }

  return 'invalid';

};

const getProfileName = (tokenType, token) => {

  if (token) {

    const secret = getSecret(tokenType);

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

        return claims.aud;

      }

    }

  }

  return null;

};

export {
  checkToken,
  getProfileName
};