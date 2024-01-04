import validator from 'validator';

export const validatePhoneNumber = (req, res, next) => {

  console.log(req.body)
  const { phoneNumber } = req.body;

  if (phoneNumber) {

    const isValid = validator.isMobilePhone('' + phoneNumber, 'ro-RO');

    if (isValid) {

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