import validator from 'validator';

export default function validateDate(req, res, next) {

  if (req?.body) {

    const dateId = req.params?.dateId?.toString()?.trim()?.normalize('NFC') ?? '';
    const isValidDateId = '' === dateId || (dateId && validator.isInt('' + dateId, { gt: 0 }));
    
    const day = req.body?.day?.toString()?.trim()?.normalize('NFC') ?? '';
    const locationId = req.body?.locationId?.toString()?.trim()?.normalize('NFC') ?? '';

    
    const isValidDay = validator.isDate('' + day, {
        format: 'DD.MM.YYYY',
        strictMode: true,
        delimiters: ['.']
    });
    const isValidLocationId = validator.isInt('' + locationId, { gt: 0 });

    
    if (isValidDateId && isValidDay && isValidLocationId) {
      
      req.params = { dateId };
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