import { Router } from 'express';

const router = Router();

router.get('/:dateId', function(req, res) {

  res.json({
    data: {
      hello: 'world'
    }
  })

});

export default router;