import { Router } from 'express';
import { customAlphabet } from 'nanoid';
import validateAppointment from '../../middlewares/validateAppointment.js';
import { 
    // user
    getPageId, addAppointment, getUserDates, getUserTimeRanges, 

    // admin
    getTimeRanges, getAppointments, getUserAppointment, deleteUserAppointment
} from '../../lib/db.js';

import { publish } from './events.js';

const router = Router();

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 16);

const getNextPageId = () => {

    let nextPageId = '';

    try {

        nextPageId = nanoid();
        let result = getPageId(nextPageId);
    
        // dangerous!
        while (!result.error && result.pageId) {
    
          nextPageId = nanoid();
          result = getPageId(nextPageId);
    
        }

        if (result?.error) {

          throw new Error('Error: getNextPageId');

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

        if (result && !result.error) {

          if (!result.alreadyBooked &&!result.timeRangeIsFull) {

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

          } else if (!result.alreadyBooked && result.timeRangeIsFull) {

            return res.status(403)
            .json({
                data: {
                    message: 'Forbidden'
                }
            });

          } else {
            
            //already booked!
            return res.status(409)
            .json({
                data: {
                    message: 'Conflict'
                }
            });

          }

        }

    }

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