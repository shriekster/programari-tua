import validator from 'validator';

export default function validateTimeRange(req, res, next) {
  
  if (req?.body) {

    const dateId = req.body?.dateId?.toString()?.trim()?.normalize('NFC') ?? ''
    const startTime = req.body?.startTime?.toString()?.trim()?.normalize('NFC') ?? '';
    const endTime = req.body?.endTime?.toString()?.trim()?.normalize('NFC') ?? '';
    const capacity = req.body?.capacity?.toString()?.trim()?.normalize('NFC') ?? '';
    const published = req.body?.published;

    const isValidDateId = validator.isInt('' + dateId, { gt: 0 });
    const isValidStartTime = validator.isTime('' + startTime);
    const isValidEndTime = validator.isTime('' + endTime);
    const isValidCapacity = validator.isInt('' + capacity, { gt: 0 });
    const isValidPublished = [true, false].includes(published);

    const allDataIsValid = 
        isValidDateId       &&
        isValidStartTime    &&
        isValidEndTime      &&
        isValidCapacity     &&
        isValidPublished;
    
    if (allDataIsValid) {
      
      req.body = { dateId, startTime, endTime, capacity, published };

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