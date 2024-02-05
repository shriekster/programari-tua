import { checkToken } from '../lib/token.js';

export default function authorize(req, res, next) {

  const accessToken = req.cookies?.['access_token'];

  const tokenStatus = checkToken('access_token', accessToken);

  if ('ok' === tokenStatus) {

    req.isAdmin = true;
    return next(); // if the access token is valid, pass control to the next middleware

  }
  
  return res.status(401)
  .json({
    data: {
      message: 'Unauthorized'
    }
  });

} 