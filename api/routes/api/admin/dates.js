import { Router } from 'express';
import validateDate from '../../../middlewares/validateDate.js';
import { addDate, updateDate, deleteDate } from '../../../lib/db.js';

const router = Router();

router.get('/', function(req, res) {

  res.json({
    data: {
      hello: 'world'
    }
  })

});

router.get('/:dateId', function(req, res) {

  res.json({
    data: {
      hello: 'world'
    }
  })

});

router.post('/', validateDate, function(req, res) {

  const { day, locationId } = req.body;

  const date = addDate(locationId, day);

  if (date) {

    return res.json({
      data: {
        date
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

router.put('/:dateId', validateDate, function(req, res) {

  const dateId = req.params.dateId;
  const { day, locationId } = req.body;

  const date = updateDate(dateId, locationId, day);

  if (date) {

    return res.json({
      data: {
        date
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

router.delete('/:dateId', function(req, res) {

  const dateId = req.params.dateId;

  if (dateId && !isNaN(dateId) && dateId > 0) {

    const result = deleteDate(dateId);

    if ([0, 1].includes(result)) {
  
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