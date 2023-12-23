const validator = require('validator');

const validate = (req, res, next) => {

  if (req?.body) {

    const username = req.body?.username?.toString()?.trim()?.normalize('NFC') ?? '';
    const password = req.body?.password?.toString()?.normalize('NFC') ?? '';

    const isValidUsername = validator.isLength('' + username, { min: 3, max: 64 });
    const isValidPassword = validator.isLength('' + password, {min: 8, max: 64 });

    if (isValidUsername && isValidPassword) {
      
      req.body = { username, password };

      return next();

    }

  }

  return res.status(401)
  .json({
    message: 'Unauthorized'
  });

};


module.exports = validate; 