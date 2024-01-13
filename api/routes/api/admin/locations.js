import { Router } from 'express';

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

export default router;