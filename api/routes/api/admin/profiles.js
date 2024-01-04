import { Router } from 'express';
import { getProfile, updateProfile } from '../../../lib/db.js';
import { validatePhoneNumber } from '../../../middlewares/validatePhoneNumber.js';

const router = Router();

router.get('/:profileId', function(req, res) {
  
  if (req.params && '1' === req.params.profileId + '') {

    const profile = getProfile(1);

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
  
  if (req.params && '1' === req.params.profileId + '') {

    const { phoneNumber } = req.body;

    const newProfile = updateProfile(phoneNumber);

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