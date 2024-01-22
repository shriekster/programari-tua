import { Router } from 'express';
import validateLocation from '../../../middlewares/validateLocation.js';
import { addLocation } from '../../../lib/db.js';

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

router.post('/', validateLocation, function(req, res) {

  const { 
    placeId,
    osmId,
    name,
    displayName,
    lon,
    lat
  } = req.body;

  const newLocation = addLocation(placeId, osmId, name, displayName, lon, lat);

  return res.json({
    data: {
      location: newLocation,
    },
  });

});

export default router;