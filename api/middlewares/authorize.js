import checkToken from '../lib/checkToken.js';

export default function authorize(req, res, next) {

  const authorizationHeader = req.headers['authorization'];

  if (authorizationHeader) {

    const accessToken = authorizationHeader.substring(7); // get the substring after 'Bearer ';

    const tokenStatus = checkToken('access', accessToken);

    if ('ok' === tokenStatus) {

      return next(); // if the access token is valid, pass control to the next middleware

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

} 