import { Router } from 'express';
import { getProfileName } from '../../../lib/token.js';
import { getProfile, updateProfile } from '../../../lib/db.js';
import { validateAdminProfile } from '../../../middlewares/validateAdminProfile.js';

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


router.put('/:profileId', validateAdminProfile, function(req, res) {
  
  if (req.params && !isNaN(req.params.profileId)) {

    const { firstName, lastName, phoneNumber } = req.body;

    const newProfile = updateProfile(req.params.profileId, firstName, lastName, phoneNumber);

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