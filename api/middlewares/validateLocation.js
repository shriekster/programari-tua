import validator from 'validator';

const roBoundingBox = [20.2201924985, 43.6884447292, 29.62654341, 48.2208812526];

export default function validateLocation(req, res, next) {

  if (req?.body) {

    const placeId = '' + req.body?.placeId ?? '0';
    const osmId = '' + req.body?.osmId ?? '0';

    const name = req.body?.name?.toString()?.trim()?.normalize('NFC') ?? '';
    const displayName = req.body?.displayName?.toString()?.trim()?.normalize('NFC') ?? '';

    const lon = req.body?.lon ?? '';
    const lat = req.body?.lat ?? '';

    const isValidPlaceId = validator.isInt(placeId) && !isNaN(placeId) && 0 < placeId;
    const isValidOsmId = validator.isInt(osmId) && !isNaN(osmId) && 0 < osmId;
    const isValidName = validator.isLength('' + name, { min: 3, max: 256 });
    const isValidDisplayName = validator.isLength('' + displayName, { min: 3, max: 256 });
    const isValidLongitude = validator.isFloat(lon);
    const isValidLatitude = validator.isFloat(lat);
    const isInRomania = 
        roBoundingBox[0] <= lon     &&
        lon <= roBoundingBox[2]     &&
        roBoundingBox[1] <= lat     &&
        lat <= roBoundingBox[3];

    const isValidData = 
        isValidPlaceId      &&
        isValidOsmId        &&
        isValidName         &&
        isValidDisplayName  &&
        isValidLongitude    &&
        isValidLatitude     &&
        isInRomania;

    if (isValidData) {
      
        req.body = { 

            placeId,
            osmId,
            name,
            displayName,
            lon,
            lat

        };

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