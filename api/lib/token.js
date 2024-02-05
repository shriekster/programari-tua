import { default as jwt } from 'jsonwebtoken';

const getTokenSecret = (tokenType) => {

  let secret = '';

  switch (tokenType) {

    case 'access_token': {

      secret = process.env.ACCESS_TOKEN_SECRET;
      break;

    }

    case 'refresh_token': {

      secret = process.env.REFRESH_TOKEN_SECRET;
      break;

    }

    default: break;

  }

  return secret;

};

const checkToken = (tokenType, token) => {

  if (token) {

    const secret = getTokenSecret(tokenType);

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

    const secret = getTokenSecret(tokenType);

    if (secret) {

      let claims = null, tokenError = null;

      try {

        claims = jwt.verify(token, secret, {
          algorithms: ['HS512']
        });

      } catch (err) {

        tokenError = err;

      }

      if (!tokenError) {

        return claims.aud;

      }

    }

  }

  return null;

};

export {
  getTokenSecret,
  checkToken,
  getProfileName
};