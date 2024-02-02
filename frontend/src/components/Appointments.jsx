
import { useState, useEffect, Fragment } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PersonIcon from '@mui/icons-material/Person';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import PlaceIcon from '@mui/icons-material/Place';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReportIcon from '@mui/icons-material/Report';

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

    if (['escapeKeyDown', 'backdropClick'].includes(reason)) {

      return;

    }

    setConfirmationDialog(false);

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

  return (
    <Box sx={{
      margin: 0,
      padding: 0,
    }}>
      {
        appointmentData && (
          <Box sx={{
              margin: '16px auto',
              padding: '16px',
              minHeight: 'max-content',
              minWidth: '300px',
              width: '100%',
              maxWidth: '450px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'default',
              userSelect: 'none'
            }}>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '8px',
                width: '100%',
              }}>
                <EventIcon />
                <Typography>
                  {appointmentData?.day}
                </Typography>
              </Box>
              <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '8px',
                  width: '100%',
                  marginBottom: '16px',
              }}>
                <AccessTimeIcon />
                <Typography>
                  {appointmentData?.startTime} - {appointmentData?.endTime}
                </Typography>
              </Box>
              {
                appointmentData?.participants?.map((participant) => (
                  <Fragment key={participant?.id}>
                    <Box 
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        width: '100%',
                        gap: '8px'
                    }}>
                      <PersonIcon />
                      <Typography>
                        {participant?.lastName} {participant?.firstName}
                      </Typography>
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        width: '100%',
                        gap: '8px'
                      }}>
                      <Chip variant='filled' 
                        label={participant.age}
                        size='small'
                        sx={{ marginRight: '8px' }}/>
                      <Chip variant='outlined' 
                        label={`candidează pt. ${participant.personnelCategoryName}`}
                        size='small'/>
                    </Box>
                  </Fragment>
                ))
              }
            <Button
              href={`https://www.waze.com/ul?ll=${appointmentData?.latitude},${appointmentData?.longitude}&navigate=yes&zoom=18`}
              target='_blank'
              variant='outlined'
              color='inherit'
              sx={{ textTransform: 'none', width: '100%', marginTop: '32px' }}
              startIcon={<PlaceIcon color='error'/>}
              endIcon={<OpenInNewIcon color='info' />}
              disabled={loading}>
              {appointmentData?.location}
            </Button>
            <Button
              href={`tel:${appointmentData?.contactPhone}`}
              target='_blank'
              variant='contained'
              color='success'
              sx={{ textTransform: 'none', width: '100%', marginTop: '32px' }}
              startIcon={<ContactPhoneIcon />}
              disabled={loading}>
              {appointmentData?.contactPhone}
            </Button>
            <Box sx={{ width: '100%', marginTop: '64px' }}>
              <Divider variant='fullWidth' sx={{ borderTop: '1px solid rgba(128, 128, 128, .5)', marginBottom: '16px' }} />
              <Button onClick={handleCancelAppointment}
                variant='contained'
                color='error'
                sx={{ width: '100%' }}
                startIcon={<DeleteForeverIcon />}
                disabled={loading}>
                Anulează programarea
              </Button>
            </Box>
          </Box>
        )
      }
      {
        loading && (
          <Box sx={{
            margin: 0,
            height: 'calc(100dvh - 56px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CircularProgress
              size={48}
              color='primary'
              thickness={8}
              disableShrink
            />
          </Box>
        )
      }
      <Dialog open={showConfirmationDialog}
        onClose={closeConfirmationDialog}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default', userSelect: 'none' }}>
          <ReportIcon fontSize='large' color='error'/>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Dorești să anulezi programarea?
          </Typography>
        </DialogContent>
        <DialogActions sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-evenly'
          }}>
          <Button onClick={requestCancelAppointment}
              color='error'
              variant='contained'
              sx={{ width: '50%' }}
              disabled={loading}>
              DA
          </Button>
          <Button onClick={closeConfirmationDialog}
              color='primary'
              variant='contained'
              sx={{ width: '50%' }}
              disabled={loading}>
              NU
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
  