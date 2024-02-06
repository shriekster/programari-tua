import { Router } from 'express';

import { 
    // sms gateway
    getUnsentMessages, updateMessage,
    //updateMessage

} from '../../../lib/db.js';

const router = Router();


router.get('/', function(req, res) {

    if (req.query) {

        const clientApiKey = req.query.apiKey;

        if (clientApiKey) {

            const apiKey = process.env.API_KEY;

            if (apiKey && clientApiKey === apiKey) {

                const messages = getUnsentMessages();

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

router.patch('/messages/:messageId', function (req, res) {

    if (req.query && req.params && req.body) {

        const clientApiKey = req.query.apiKey;
        const messageId = req.params.messageId;
        const message = req.body;

        if (clientApiKey) {

            const apiKey = process.env.API_KEY;

            if (apiKey && clientApiKey === apiKey) {

                if (messageId) {

                    const result = updateMessage(message?.id, message?.sent, message?.sentAt);

                    if (!result.error) {

                        return res.status(200)
                        .json({
                            data: {
                                message: 'OK'
                            }
                        });

                    }

                }

                return res.status(400)
                .json({
                    data: {
                        message: 'Bad Request'
                    }
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