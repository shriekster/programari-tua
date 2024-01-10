import validator from 'validator';

export const validateAdminProfile = (req, res, next) => {

  if (req?.body) {

    const firstName = req.body?.firstName?.toString()?.trim()?.normalize('NFC') ?? '';
    const lastName = req.body?.lastName?.toString()?.trim()?.normalize('NFC') ?? '';
    const phoneNumber = req.body?.phoneNumber?.toString()?.trim()?.normalize('NFC') ?? '';

    const isValidFirstName = validator.isLength('' + username, { min: 2, max: 64 });
    const isValidLastName = validator.isLength('' + password, {min: 2, max: 64 });
    const isValidMobilePhone = validator.isMobilePhone(phoneNumber, 'ro-RO');

    if (isValidFirstName && isValidLastName && isValidMobilePhone) {
      
      req.body = { firstName, lastName, phoneNumber };

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