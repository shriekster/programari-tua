
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PersonIcon from '@mui/icons-material/Person';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';
import CheckIcon from '@mui/icons-material/Check';
import PlaceIcon from '@mui/icons-material/Place';

import { useRoute } from 'wouter';
import { navigate } from 'wouter/use-location';

export default function Appointments() {

  const [loading, setLoading] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);
  const [showConfirmationDialog, setConfirmationDialog] = useState(false);

  const [match, params] = useRoute('/appointments/:pageId');

  const handleCancelAppointment = () => {

    setConfirmationDialog(true);

  };

  const closeConfirmationDialog = (event, reason) => {

  };

  const requestCancelAppointment = async () => {

  };

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
        height: 'calc(100dvh - 56px)',
        minHeight: 'max-content',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {
          appointmentData && (
            <Box sx={{
                margin: '16px',
                padding: '16px',
                minHeight: 'max-content',
                minWidth: '300px',
                width: '100%',
                maxWidth: '450px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '32px',
                border: '1px solid rgba(128, 128, 128, .5)',
                borderRadius: '4px',
                cursor: 'default',
                userSelect: 'none'
              }}>
              <Box sx={{
                margin: 0,
                minHeight: 'max-content',
                minWidth: '300px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
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
                      <PersonIcon />
                      <Typography>
                        {participant?.lastName} {participant?.firstName}
                      </Typography>
                    </Box>
                  ))
                }
              </Box>
              <Button
                href={`https://www.waze.com/ul?ll=${appointmentData?.latitude},${appointmentData?.longitude}&navigate=yes&zoom=18`}
                target='_blank'
                variant='outlined'
                color='inherit'
                sx={{ textTransform: 'none', width: '100%' }}
                startIcon={<PlaceIcon color='error'/>}
                endIcon={<OpenInNewIcon color='info' />}>
                {appointmentData?.location}
              </Button>
              <Button
                href={`tel:${appointmentData?.contactPhone}`}
                target='_blank'
                variant='contained'
                color='success'
                sx={{ textTransform: 'none', width: '100%' }}
                startIcon={<ContactPhoneIcon />}>
                {appointmentData?.contactPhone}
              </Button>
              <Box sx={{ width: '100%', marginTop: '64px' }}>
                <Divider variant='fullWidth' sx={{ borderTop: '1px solid rgba(128, 128, 128, .5)', marginBottom: '16px' }} />
                <Button
                  variant='contained'
                  color='error'
                  sx={{ width: '100%' }}
                  startIcon={<DeleteForeverIcon />}>
                  Anulează programarea
                </Button>
              </Box>
            </Box>
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
  