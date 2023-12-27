import { Router } from 'express';

const router = Router();

router.all('*', function (req, res){

  return res.status(404).json({
    message: 'Not Found'
  });

});

export default router;