import { Router } from 'express';
import validateLocation from '../../../middlewares/validateLocation.js';
import { getLocations, addLocation, deleteLocation } from '../../../lib/db.js';

const router = Router();

router.get('/', function(req, res) {

  const locations = getLocations();

  if (locations) {

    return res.json({
      data: {
        locations
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

router.get('/:locationId', function(req, res) {

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

router.delete('/:locationId', function(req, res) {

  const locationId = req.params.locationId;
  let result = -1;

  if (!isNaN(locationId)) {

    result = deleteLocation(locationId);

  }

  if ([0, 1].includes(result)) {

    return res.json({
      data: {
        message: 'OK'
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