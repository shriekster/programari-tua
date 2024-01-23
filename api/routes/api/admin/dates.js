import { Router } from 'express';
import validateDate from '../../../middlewares/validateDate.js';
import { addDate } from '../../../lib/db.js';

const router = Router();

router.get('/', function(req, res) {

  res.json({
    data: {
      hello: 'world'
    }
  })

});

router.get('/:locationId', function(req, res) {

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

export default router;