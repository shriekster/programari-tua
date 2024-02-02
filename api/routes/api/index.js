import { Router } from 'express';

import sessionRoute from './sessions.js';
import authorizationRoute from './authorizations.js';

import adminLocationsRoute from './admin/locations.js';
import adminProfilesRoute from './admin/profiles.js';
import adminDatesRoute from './admin/dates.js';
import adminTimeRangesRoute from './admin/timeRanges.js';

import appointmentsRoute from './appointments.js';

import smsRoute from './sms/messages.js';

import { router as eventsRoute } from './events.js';


import authorize from '../../middlewares/authorize.js';
import getSubcriptionId from '../../middlewares/getSubscriptionId.js';

const router = Router();

// login
router.use('/sessions', sessionRoute);

// refresh token
router.use('/authorizations', authorizationRoute);

// the admin API uses an authorization middleware, which validates the access token
router.use('/admin/locations', authorize, adminLocationsRoute);
router.use('/admin/profiles', authorize, adminProfilesRoute);
router.use('/admin/dates', authorize, adminDatesRoute);
router.use('/admin/timeranges', authorize, adminTimeRangesRoute);
router.use('/admin/events', authorize, getSubcriptionId, eventsRoute);

// user API
router.use('/events', getSubcriptionId, eventsRoute);
router.use('/appointments', appointmentsRoute);

// sms API
router.use('/', smsRoute);

//module.exports = router;
export default router;
