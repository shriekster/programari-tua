// users and admin API SSE endpoint

import { Router } from 'express';
import { customAlphabet } from 'nanoid';
import { getProfileName } from '../../lib/token.js';
import { 
  // admin
  getDates, getTimeRanges, getAppointments, getPersonnelCategories, getLocations, getProfile,

  //user
  getUserDates, getUserTimeRanges, getContactInfo,
} from '../../lib/db.js';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 16);

const sseHeaders = [
  ['Content-Type', 'text/event-stream; charset=utf-8'],
  ['Connection', 'keep-alive'],
  ['Cache-Control', 'no-cache, no-transform'],
  ['X-Accel-Buffering', 'no'],
];

const subscriptions = new Map();
subscriptions.set('admins', new Map());
subscriptions.set('users', new Map());

const nextSubscriptionId = (targetChannel) => {

  let subscriptionId = '', map = null;
  const channels = ['admins', 'users'];

  if (!channels.includes(targetChannel)) {

    throw new Error(`${targetChannel} channel does not exist!`);

  }

  map = subscriptions.get(targetChannel);

  try {

    subscriptionId = nanoid();

    // dangerous!
    while (map.has(subscriptionId)) {

      subscriptionId = nanoid();

    }

  } catch (_) {

    subscriptionId = '';

  }

  return subscriptionId;

};

const publish = (channel, event, data, excludedSubscriptionId = 0) => {

  switch(channel) {

    case 'admins': {

      const adminSubscriptions = subscriptions.get('admins');
      
      for (const [_, client] of adminSubscriptions.entries()) {

        client.write((`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));

      }

      break;

    }

    case 'users': {

      const userSubscriptions = subscriptions.get('users');
      
      for (const [subscriptionId, client] of userSubscriptions.entries()) {

        if (subscriptionId !== excludedSubscriptionId) {

          client.write((`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));

        }

      }

      break;

    }

    default: break;

  }

};

const router = Router();

router.get('/', function(req, res) {
  
  const isAdmin = Boolean(req?.isAdmin);

  const channel = isAdmin? 'admins' : 'users';

  let newSubscriptionId = '', error = null;

  try {

    newSubscriptionId = nextSubscriptionId(channel);

  } catch (err) {

    error = err;

  }

  if (!error && newSubscriptionId) {

    let data = {};

    const targetSubscriptions = subscriptions.get(channel);

    targetSubscriptions.set(newSubscriptionId, res);

    const headers = [
      ...sseHeaders,
      ['X-Subscription-Id', newSubscriptionId]
    ];

    for (const [header, value] of headers) {

      res.setHeader(header, value);

    }

    if (isAdmin) {

      // admin data
      const accessToken = req.cookies?.['access_token'];
      const userName = getProfileName('access', accessToken);

      const dates = getDates();
      const timeRanges = getTimeRanges();
      const appointments = getAppointments();
      const personnelCategories = getPersonnelCategories();

      data.registry = {

        dates,
        timeRanges,
        appointments,
        personnelCategories,

      };

      const locations = getLocations();

      data.locations = locations;

      const profile = getProfile(userName);

      data.profile = profile;

    } else {

      // user data
      const dates = getUserDates();
      const timeRanges = getUserTimeRanges();
      const personnelCategories = getPersonnelCategories();
      
      data.registry = {

        dates,
        timeRanges,
        personnelCategories,

      };

      const contactInfo = getContactInfo();

      data.contactInfo = contactInfo;

    }

    res.write((`event: sync\ndata: ${JSON.stringify(data)}\n\n`));

  }

});

export {
  router,
  publish
};