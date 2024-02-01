import { Router } from 'express';
import { customAlphabet } from 'nanoid';
import validateAppointment from '../../middlewares/validateAppointment.js';
import { 
    // user
    getAllPageIds, addAppointment,

    // admin
    getTimeRanges, getAppointments
} from '../../lib/db.js';

import { publish } from './events.js';

const router = Router();

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 16);

const getNextPageId = () => {

    const pageIds = getAllPageIds();
    let nextPageId = '';

    try {

        nextPageId = nanoid();
    
        // dangerous!
        while (pageIds.has(nextPageId)) {
    
          nextPageId = nanoid();
    
        }
    
      } catch (_) {
    
        nextPageId = '';
    
      }
    
      return nextPageId;

};

router.post('/', validateAppointment, function(req, res) {

    const { timeRangeId, phoneNumber, participants } = req.body;
    
    const nextPageId = getNextPageId();

    if (nextPageId) {

        const result = addAppointment(timeRangeId, phoneNumber, nextPageId, participants);

        if (result && !result.error && !result.timeRangeIsFull) {

            const adminAppointments = getAppointments();
            const adminTimeRanges = getTimeRanges();
        
            const data = {
              registry: {
                timeRanges: adminTimeRanges,
                appointments: adminAppointments,
              }
            };
        
            publish('admins', 'update:appointments', data);

            return res.status(200)
            .json({
                data: {
                    message: 'OK'
                }
            });

        } else if (!result.error && result.timeRangeIsFull) {

            return res.status(403)
            .json({
                data: {
                    message: 'Forbidden'
                }
            })

        }

    }
    

    // TODO: send sms (websockets)

    return res.status(500)
    .json({
        data: {
            message: 'Internal Server Error'
        }
    });

});

export default router;