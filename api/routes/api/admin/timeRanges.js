import { Router } from 'express';
import validateTimeRange from '../../../middlewares/validateTimeRange.js';
import { 
  // admin
  addTimeRange, updateTimeRange, deleteTimeRange,

  // user
  getUserDates, getUserTimeRanges 
} from '../../../lib/db.js';

import { publish } from '../events.js';

const router = Router();

router.post('/', validateTimeRange, function(req, res) {
  
  const { dateId, startTime, endTime, capacity, published } = req.body;

  const timeRange = addTimeRange(dateId, startTime, endTime, capacity, published);

  if (timeRange) {

    const userDates = getUserDates();
    const userTimeRanges = getUserTimeRanges();

    const data = {
      registry: {
        dates: userDates,
        timeRanges: userTimeRanges,
      }
    };

    publish('users', 'update', data);

    return res.json({
      data: {
        timeRange: {
          ...timeRange,
          occupied: 0
        }
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

  const { id, dateId, startTime, endTime, capacity, published, occupied } = req.body;
  
  if (id == timeRangeId) {

    const timeRange = updateTimeRange(timeRangeId, dateId, startTime, endTime, capacity, published);

    if (timeRange) {

      const userDates = getUserDates();
      const userTimeRanges = getUserTimeRanges();
  
      const data = {
        registry: {
          dates: userDates,
          timeRanges: userTimeRanges,
        }
      };
  
      publish('users', 'update', data);

      return res.json({
        data: {
          timeRange: {
            ...timeRange,
            occupied: Number(occupied)
          }
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

router.delete('/:timeRangeId', function(req, res) {

  const timeRangeId = req.params.timeRangeId;

  if (!isNaN(timeRangeId) && timeRangeId > 0) {

    const result = deleteTimeRange(timeRangeId);

    if ([0, 1].includes(result)) {

      const userDates = getUserDates();
      const userTimeRanges = getUserTimeRanges();
  
      const data = {
        registry: {
          dates: userDates,
          timeRanges: userTimeRanges,
        }
      };
  
      publish('users', 'update', data);
  
      return res.json({
        data: {
          message: 'OK'
        }
      });
  
    }

  }

  return res.status(500)
  .json({
    data: {
      message: 'Internal Server Error'
    }
  });

});

export default router;