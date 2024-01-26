import { Router } from 'express';
import validateTimeRange from '../../../middlewares/validateTimeRange.js';
import { addTimeRange, updateTimeRange } from '../../../lib/db.js';

const router = Router();

router.get('/', function(req, res) {

  res.json({
    data: {
      hello: 'world'
    }
  })

});

router.post('/', validateTimeRange, function(req, res) {
  
  const { dateId, startTime, endTime, capacity, published } = req.body;

  const timeRange = addTimeRange(dateId, startTime, endTime, capacity, published);

  if (timeRange) {

    return res.json({
      data: {
        timeRange
      }
    });

  }

  return res.status(500)
  .json({
    data: {
      message: 'Internal Server Error'
    }
  });

});

router.put('/:timeRangeId', validateTimeRange, function(req, res) {

  const timeRangeId = req.params.timeRangeId;

  const { id, dateId, startTime, endTime, capacity, published } = req.body;
  
  if (id == timeRangeId) {

    const timeRange = updateTimeRange(timeRangeId, dateId, startTime, endTime, capacity, published);

    if (timeRange) {

      return res.json({
        data: {
          timeRange
        }
      });

    }

    return res.status(500)
    .json({
      data: {
        message: 'Internal Server Error'
      }
    });

  }

  return res.status(400)
  .json({
    data: {
      message: 'Bad Request'
    }
  });

});

router.delete('/:timeRangeId', validateTimeRange, function(req, res) {

});

export default router;