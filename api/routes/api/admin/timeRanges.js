import { Router } from 'express';
import validateTimeRange from '../../../middlewares/validateTimeRange.js';
import { addTimeRange } from '../../../lib/db.js';

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

export default router;