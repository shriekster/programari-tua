import { Router } from 'express';

import { 
    // sms gateway
    getMessages,

} from '../../../lib/db.js';

const router = Router();


router.get('/', function(req, res) {

    if (req.query) {

        const clientApiKey = req.query.apiKey;

        if (clientApiKey) {

            const apiKey = process.env.API_KEY;

            if (apiKey && clientApiKey === apiKey) {

                const messages = getMessages(0); // TODO!! modify - get messages with sent = 0

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