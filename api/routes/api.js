const express = require('express');
const router = express.Router();

let nanoid;

import('nanoid').then((module) => {

  nanoid = module;

});


/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(nanoid)
  res.status(200).send("HELLO")
});

/**
 * GET humanity status
 */
router.get('/')

module.exports = router;
