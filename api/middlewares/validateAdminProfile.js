import validator from 'validator';

export const validateAdminProfile = (req, res, next) => {

  if (req?.body) {

    const fullName = req.body?.firstName?.toString()?.trim()?.normalize('NFC') ?? '';
    const phoneNumber = req.body?.phoneNumber?.toString()?.trim()?.normalize('NFC') ?? '';

    const isValidName = validator.isLength('' + username, { min: 5, max: 256 });
    const isValidMobilePhone = validator.isMobilePhone(phoneNumber, 'ro-RO');

    if (isValidName && isValidMobilePhone) {
      
      req.body = { fullName, phoneNumber };

      return next();

    }

  }

  return res.status(400)
  .json({
    data: {
      message: 'Bad Request'
    }
  });

}