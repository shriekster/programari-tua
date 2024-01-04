import { Router } from 'express';
import { getProfile } from '../../../lib/db.js';

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


router.patch('/:profileId', function(req, res) {



});

export default router;