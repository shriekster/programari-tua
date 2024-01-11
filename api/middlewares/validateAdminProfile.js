import validator from 'validator';

export default function validateAdminProfile(req, res, next) {

  if (req?.body) {

    const fullName = req.body?.fullName?.toString()?.trim()?.normalize('NFC') ?? '';
    const phoneNumber = req.body?.phoneNumber?.toString()?.trim()?.normalize('NFC') ?? '';

    const isValidName = validator.isLength('' + fullName, { min: 5, max: 256 });
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