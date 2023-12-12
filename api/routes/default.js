const { Router } = require('express');
const validator = require('validator');

const router = Router();

router.all('*', function (req, res){

  return res.status(404).json({
    message: 'Not Found'
  });

});

module.exports = router;