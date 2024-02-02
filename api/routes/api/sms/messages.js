import { Router } from 'express';

import { 
    // sms gateway
    getMessages,

    // admin
    getSecret
} from '../../../lib/db.js';

const router = Router();


router.get('/', function(req, res) {

    console.log(req.query);

    return res.status(404)
    .json({
        data: {
            message: 'Not Found'
        }
    });

});


export default router;