import validator from 'validator';

export default function validateTimeRange(req, res, next) {
  
  if (req?.body) {

    const timeRangeId = req.params?.timeRangeId?.toString()?.trim()?.normalize('NFC') ?? '';
    const isValidTimeRangeId = '' === timeRangeId || (timeRangeId && validator.isInt('' + timeRangeId, { gt: 0 }));

    const id = req.body?.id?.toString()?.trim()?.normalize('NFC') ?? '';
    const dateId = req.body?.dateId?.toString()?.trim()?.normalize('NFC') ?? ''
    const startTime = req.body?.startTime?.toString()?.trim()?.normalize('NFC') ?? '';
    const endTime = req.body?.endTime?.toString()?.trim()?.normalize('NFC') ?? '';
    const capacity = req.body?.capacity?.toString()?.trim()?.normalize('NFC') ?? '';
    const published = req.body?.published;

    const isValidId = '' === id || (id && validator.isInt('' + id, { gt: 0 }));
    const isValidDateId = validator.isInt('' + dateId, { gt: 0 });
    const isValidStartTime = validator.isTime('' + startTime);
    const isValidEndTime = validator.isTime('' + endTime);
    const isValidCapacity = validator.isInt('' + capacity, { gt: 0 });
    const isValidPublished = [true, false].includes(published);

    const allDataIsValid =
      isValidId           &&
      isValidDateId       &&
      isValidStartTime    &&
      isValidEndTime      &&
      isValidCapacity     &&
      isValidPublished    &&
      isValidTimeRangeId;
    
    if (allDataIsValid) {
      
      req.params = { timeRangeId };
      req.body = { id, dateId, startTime, endTime, capacity, published };

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