const jwt = require('jsonwebtoken');
const { getSecret } = require('../lib/db');

const validateToken = (type, token) => {

  const secret = getSecret(type);

  if (secret) {

    let claims = null, tokenError = null;

    try {

      claims = jwt.decode(token, secret, {
        algorithms: ['HS512']
      });

    } catch (err) {

      tokenError = err;

    }

    if (!tokenError) {

      const {iss, aud} = claims;

      if ('AST' === '' + iss && 'man' === '' + aud) {

        return 'ok';

      }

    } else {

      if ('TokenExpiredError' === tokenError?.name) {

        return 'expired';

      }

      return 'invalid';

    }

  }

  return 'invalid';

};

const validate = (req, res, next) => {

  const { access_token, refresh_token } = req.cookies;

  if (access_token && refresh_token) {

    const accessTokenStatus = validateToken('access', access_token);

    switch (accessTokenStatus) {

      case 'ok': {

        return res.status(200)
        .json({
          message: 'Authorized'
        });

      }

      case 'expired': {

        const refreshTokenStatus = validateToken('refresh', refresh_token);

        if ('ok' === refreshTokenStatus) {

          return next(); // the next middleware should issue the new tokens

        }

        break;

      }

      case 'invalid':
      default: {

        break;

      }

    }

  }

  return res.status(400)
  .json({
    message: 'Bad Request'
  });

};

module.exports = validate;