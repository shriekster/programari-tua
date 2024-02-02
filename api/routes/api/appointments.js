import { Router } from 'express';
import { customAlphabet } from 'nanoid';
import validateAppointment from '../../middlewares/validateAppointment.js';
import { 
    // user
    getAllPageIds, addAppointment, getUserDates, getUserTimeRanges, 

    // admin
    getTimeRanges, getAppointments, getUserAppointment, deleteUserAppointment
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
        
            const adminData = {
              registry: {
                timeRanges: adminTimeRanges,
                appointments: adminAppointments,
              }
            };
        
            publish('admins', 'update:appointments', adminData);

            const userDates = getUserDates();
            const userTimeRanges = getUserTimeRanges();
        
            const userData = {
              registry: {
                dates: userDates,
                timeRanges: userTimeRanges,
              }
            };
        
            publish('users', 'update', userData);

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

router.get('/:pageId', function(req, res) {

    const appointment = getUserAppointment(req.params.pageId);

    if (appointment) {

        return res.status(200)
        .json({
            data: {
                appointment
            }
        });

    }

    return res.status(404)
    .json({
        data: {
            message: 'Not Found'
        }
    });

});

router.delete('/:pageId', function(req, res) {

    const result = deleteUserAppointment(req.params.pageId);

    if (1 === result) {

        const adminAppointments = getAppointments();
        const adminTimeRanges = getTimeRanges();
    
        const adminData = {
          registry: {
            timeRanges: adminTimeRanges,
            appointments: adminAppointments,
          }
        };
    
        publish('admins', 'update:appointments', adminData);

        const userDates = getUserDates();
        const userTimeRanges = getUserTimeRanges();
    
        const userData = {
          registry: {
            dates: userDates,
            timeRanges: userTimeRanges,
          }
        };
    
        publish('users', 'update', userData);
  
      return res.json({
        data: {
          message: 'OK'
        }
      });
  
    }

    return res.status(500).json({
        data: {
          message: 'Internal Server Error'
        }
    });

});

export default router;