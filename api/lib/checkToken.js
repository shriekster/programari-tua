import { default as jwt } from 'jsonwebtoken';
import { getSecret } from './db.js';

const checkToken = (type, token) => {

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

export default checkToken;