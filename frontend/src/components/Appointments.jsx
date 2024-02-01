
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { useRoute } from 'wouter';
import { navigate } from 'wouter/use-location';

export default function Appointments() {

  const [loading, setLoading] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  const [match, params] = useRoute('/appointments/:pageId');

  // add the 'visibilitychange' event listener and remove it when the component unmounts
  useEffect(() => {

    const fetchAppointment = async () => {

      setLoading(true);

      let error = null, status = 401, json = null;

      try {

        const requestOptions = {
            method: 'GET',
            credentials: 'same-origin'
        };

        const response = await fetch(`/api/appointments/${params.pageId}`, requestOptions);
        status = response.status;

        json = await response.json();


    } catch (err) {

        // eslint-disable-next-line no-unused-vars
        error = err;
        status = 400; // client-side error

    } finally {

      setLoading(false);

    }

    switch (status) {

        case 200: {

          if (json && json?.data?.appointment) {

            setAppointmentData(json.data.appointment);

          }

          break;

        }

        default: {

          navigate('/not-found', {
            replace: false
          });
          break;

        }

    }

    };
  
    // eslint-disable-next-line no-unused-vars
    const onVisibilityChange = (e) => {

      if ('visible' === document.visibilityState) {

        if (params.pageId) {

          fetchAppointment();
    
        }

      }

    };

    if (params.pageId) {

      fetchAppointment();

    }

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {

      document.removeEventListener('visibilitychange', onVisibilityChange);

    };

  }, [params.pageId]);
  console.log(appointmentData)
  return (
    <Box sx={{
      margin: 0,
      padding: 0,
      position: 'relative',
    }}>
      <Box sx={{
        margin: 0,
        padding: '16px 8px',
        height: 'calc(100dvh - 56px)',
        minHeight: 'max-content',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        {
          appointmentData && (
            <>
            <Typography textAlign='center'>
              {appointmentData?.day}
            </Typography>
            <Typography textAlign='center'>
              {appointmentData?.startTime} - {appointmentData?.endTime}
            </Typography>
            {
              appointmentData?.participants?.map((participant) => (
                <Box key={participant?.id}
                  sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                  <Typography>
                    {participant?.lastName} {participant?.firstName}
                  </Typography>
                </Box>
              ))
            }
            </>
          )
        }
      </Box>
      {
        loading && (
          <CircularProgress
            size={48}
            color='primary'
            thickness={8}
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-24px',
                marginLeft: '-24px',
            }}
            disableShrink
          />
        )
      }
    </Box>
  )
}
  