import validator from 'validator';

export default function validateDate(req, res, next) {

  if (req?.body) {

    const day = req.body?.day?.toString()?.trim()?.normalize('NFC') ?? '';
    const locationId = req.body?.locationId ?? 0;

    const isValidDay = validator.isDate('' + day, {
        format: 'DD.MM.YYYY',
        strictMode: true,
        delimiters: ['.']
    });
    const isValidLocationId = validator.isInt('' + locationId, { gt: 0 });

    if (isValidDay && isValidLocationId) {
      
      req.body = { day, locationId };

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