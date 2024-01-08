import { Router } from 'express';
import { getProfileName } from '../../../lib/token.js';
import { getProfile, updateProfile } from '../../../lib/db.js';
import { validatePhoneNumber } from '../../../middlewares/validatePhoneNumber.js';

const router = Router();

router.get('/current', function(req, res) {

  const accessToken = req.cookies?.['access_token'];
  const profileName = getProfileName('access', accessToken);

  if (profileName) {

    const profile = getProfile(profileName);

    return res.json({
      data: {
        profile,
      },
    });

  }

  return res.status(404)
  .json({
    data: {
      message: 'Not Found',
    },
  });

});


router.patch('/:profileId', validatePhoneNumber, function(req, res) {
  
  if (req.params && !isNaN(req.params.profileId)) {

    const { phoneNumber } = req.body;

    const newProfile = updateProfile(req.params.profileId, phoneNumber);

    return res.json({
      data: {
        profile: newProfile,
      },
    });

  }

  return res.status(404)
  .json({
    data: {
      message: 'Not Found',
    },
  });

});

export default router;