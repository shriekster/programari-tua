import { Router } from 'express';

import sessionRoute from './sessions.js';
import authorizationRoute from './authorizations.js';

import adminProfilesRoute from './admin/profiles.js';
import adminDatesRoute from './admin/dates.js';
import adminTimeRangesRoute from './admin/timeRanges.js';
import adminAppointmentsRoute from './admin/appointments.js';

import { router as adminEventsRoute } from './admin/events.js';
import { router as userEventsRoute } from './events.js';


import authorize from '../../middlewares/authorize.js';
import getSubcriptionId from '../../middlewares/getSubscriptionId.js';

const router = Router();

// login
router.use('/sessions', sessionRoute);

// refresh token
router.use('/authorizations', authorizationRoute);

// the rest of the API will use an authorization middleware, which will check the access token

// admin API
router.use('/admin/profiles', authorize, adminProfilesRoute);
router.use('/admin/dates', authorize, adminDatesRoute);
router.use('/admin/timeranges', authorize, adminTimeRangesRoute);
router.use('/admin/appointments', authorize, adminAppointmentsRoute);
router.use('/admin/events', getSubcriptionId, adminEventsRoute);

// user API
router.use('/events', getSubcriptionId, userEventsRoute);


//module.exports = router;
export default router;
