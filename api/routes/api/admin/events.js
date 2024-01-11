// admin API SSE endpoint

import { Router } from 'express';

const sseHeaders = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
};

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

export {
    router,
    
};