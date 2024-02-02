import { Router } from 'express';

import { 
    // sms gateway
    getMessages,

    // admin
    getSecret
} from '../../../lib/db.js';

const router = Router();


router.get('/', function(req, res) {
    console.log(req.query)
    if (req.query) {

        const apiKey = req.query.apiKey;
        const fromId = req.query.fromId;

        if (apiKey) {

            const serverApiKey = getSecret('api_key');
            console.log(serverApiKey)

            if (serverApiKey && apiKey === serverApiKey && !isNaN(fromId)) {

                const messages = getMessages(fromId);

                return res.status(200)
                .json({
                    data: messages
                });

            }

        }

    }

    return res.status(401)
    .json({
        data: {
            message: 'Unauthorized'
        }
    });

});


export default router;