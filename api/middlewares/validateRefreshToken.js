import checkToken from '../lib/checkToken.js';

export const validateRefreshToken = (req, res, next) => {

  const { refresh_token } = req.cookies;

  if (refresh_token) {

    const tokenStatus = checkToken('refresh', refresh_token);

    // if the refresh token is valid...
    if ('ok' === tokenStatus) {

      return next(); // ...the next middleware should issue the new tokens

    }

    // the cookie holding the refresh token should expire
    return res.status(401)
    .cookie('refresh_token', '', {
      maxAge: 0,
      path: '/api/authorizations',
      sameSite: 'Strict',
      httpOnly: true,
    })
    .json({
      data: {
        message: 'Unauthorized'
      }
    });

  }

  // the cookie holding the refresh token should expire
  return res.status(400)
  .cookie('refresh_token', '', {
    maxAge: 0,
    path: '/api/authorizations',
    sameSite: 'Strict',
    httpOnly: true,
  })
  .json({
    data: {
      message: 'Bad Request'
    }
  });

};