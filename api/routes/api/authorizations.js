const { Router } = require('express');
const validator = require('validator');
const jwt = require('jsonwebtoken');
let nanoid;
import('nanoid').then((module) => {
  nanoid = module.nanoid;
});

const { getSecret } = require('../../lib/db');

const router = Router();


router.post('/', function (req, res, next) {
  
  const accessSecret = getSecret('access');
  const refreshSecret = getSecret('refresh');

  let status = 401, responseMessage = {
    error: true,
    message: 'Unauthorized'
  };

  const { access_token, refresh_token } = req.cookies;

  if (access_token && refresh_token) {

    try {

      const accessClaims = jwt.decode(access_token, accessSecret, {
        algorithms: ['HS512']
      });

      console.log(accessClaims)

    } catch (err) {

      //

    }

  }

  /*
  if (req?.body) {

    const { username, password } = req.body;

    const isValidUsername = validator.isLength('' + username, { min: 3, max: 64 });
    const isValidPassword = validator.isLength('' + password, {min: 8, max: 64 });

    if (isValidUsername && isValidPassword) {

      status = 303;
      responseMessage.error = false;
      responseMessage.message = 'OK';

      res.cookie('access_token', 'testing', {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        sameSite: 'Strict',
        httpOnly: true,
      });

      res.cookie('refresh_token', 'testing', {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        sameSite: 'Strict',
        httpOnly: true,
      });

      return res//.status(status)
      //.json(responseMessage)
      .redirect(303, '/admin');

    } else {

      status = 401;
      responseMessage.error = true;
      responseMessage.message = 'Unauthorized';

    }

    return res.status(401)
    .json(responseMessage);

  }
  */
  return res.status(status)
  .json(responseMessage);

});

module.exports = router;
