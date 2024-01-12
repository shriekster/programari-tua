// users and admin API SSE endpoint

import { Router } from 'express';
import { customAlphabet } from 'nanoid';

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

const publish = (channel, data, excludedSubscriptionId = 0) => {

  switch(channel) {

    case 'admins': {

      const adminSubscriptions = subscriptions.get('admins');
      
      for (const [_, client] of adminSubscriptions.entries()) {

        client.write((`data: ${JSON.stringify(data)}\n\n`));

      }

      break;

    }

    case 'users': {

      const userSubscriptions = subscriptions.get('users');
      
      for (const [subscriptionId, client] of userSubscriptions.entries()) {

        if (subscriptionId !== excludedSubscriptionId) {

          client.write((`data: ${JSON.stringify(data)}\n\n`));

        }

      }

      break;

    }

    default: break;

  }

};

const router = Router();

router.get('/', function(req, res) {

  const channel = Boolean(req?.isAdmin) ? 'admins' : 'users';

  let newSubscriptionId = '', error = null;

  try {

    newSubscriptionId = nextSubscriptionId(channel);

  } catch (err) {

    error = err;
    console.log(err);

  }

  if (!error && newSubscriptionId) {

    const targetSubscriptions = subscriptions.get(channel);

    targetSubscriptions.set(newSubscriptionId, res);

    const headers = [
      ...sseHeaders,
      ['X-Subscription-Id', newSubscriptionId]
    ];

    for (const [header, value] of headers) {

      res.setHeader(header, value);

    }

    res.write((`event: hello_world\ndata: ${JSON.stringify({hello: 'world!'})}\n\n`));

  }

});

export {
  router,
  publish
};