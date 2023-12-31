import { Router } from 'express';

const router = Router();

router.get('/:timeRangeId', function(req, res) {

  res.json({
    data: {
      hello: 'world'
    }
  })

})

export default router;