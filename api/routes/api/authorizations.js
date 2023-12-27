/*
const { Router } = require('express');
let nanoid;
import('nanoid').then((module) => {
  nanoid = module.nanoid;
});

const { getSecret } = require('../../lib/db');
const validateTokens = require('../../middlewares/validateTokens');
const issueTokens = require('../../middlewares/issueTokens');
*/

import { Router } from 'express';

import validateTokens from '../../middlewares/validateTokens.js';
import issueTokens from '../../middlewares/validateTokens.js';

const router = Router();

// if both tokens are valid, send an OK response (message: 'authorized')
// if the access token has expired and the refresh token is valid, re-issue both tokens and send them in the response;
// if both tokens have expired, redirect to /admin/login
// if any token is missing or is not valid, send a HTTP 401 response
router.post('/', validateTokens, issueTokens);

//module.exports = router;
export default router;
