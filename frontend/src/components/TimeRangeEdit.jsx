
import { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import AutoDeleteIcon from '@mui/icons-material/AutoDelete';
import ReportIcon from '@mui/icons-material/Report';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';

import { useGlobalStore } from '../useGlobalStore';
import refreshAccessToken from '../refreshAccessToken.js';

// get the functions from the global store as non-reactive, fresh state,
// because this proves the linter that the functions are not changing between renders
// why? because it's annoying to specify functions as effect depedencies and I could not think of
// a better solution, at least for now
const {
    setError,
    setErrorMessage,
    updateTimeRange,
    deleteTimeRange,
} = useGlobalStore.getState();

// eslint-disable-next-line react/prop-types
export default function TimeRangeEdit({ open, handleClose, date, timeRangeId }) {
    
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const timeRange = useGlobalStore((state) => state.timeRanges).find((timeRange) => timeRange?.id == timeRangeId);
    console.log({timeRange})
    const ownAppointments = useGlobalStore((state) => state.appointments).filter((appointment) => appointment?.timeRangeId == timeRange?.id);
    
    // eslint-disable-next-line react/prop-types
    const day = date?.$d?.toLocaleDateString('ro-RO') ?? '';

    const handleTogglePublished = async (event) => {

      const checked = event.target.checked;

      setSaving(true);

      let error = null, status = 401, returnedTimeRange = null;

      try {

          const requestOptions = {
              method: 'PUT',
              headers: {
              'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...timeRange,
                published: checked,
              }),
              credentials: 'same-origin'
          };

          const response = await fetch(`/api/admin/timeranges/${timeRange?.id}`, requestOptions);
          status = response.status;

          const json = await response.json();
          returnedTimeRange = json.data.timeRange;
  
  
      } catch (err) {

          // eslint-disable-next-line no-unused-vars
          error = err;
          status = 400; // client-side error

      }

      switch (status) {

          case 200: {

              setSaving(false);

              if (returnedTimeRange) {

                  updateTimeRange(returnedTimeRange);

              }

              break;

          }

          case 401: {

              await refreshAccessToken(handleTogglePublished);
              break;

          }

          default: {

              setSaving(false);
              setErrorMessage('Eroare! Încearcă din nou în câteva secunde.');
              setError(true);
              handleClose(false);
              break;

          }

      }

    };

    const showDeleteDialog = () => {

      setShowDeleteConfirmation(true);

    };

    const closeDeleteDialog = (event, reason) => {

      if (['escapeKeyDown', 'backdropClick'].includes(reason)) {

        return;

      }

      setShowDeleteConfirmation(false);

    };

    const requestDeletion = async () => {

      setShowDeleteConfirmation(false);
      setSaving(true);

      let error = null, status = 401;

      try {

          const requestOptions = {
              method: 'DELETE',
              headers: {
              'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                test: 'test'
              }),
              credentials: 'same-origin'
          };

          const response = await fetch(`/api/admin/timeranges/${timeRange.id}`, requestOptions);
          status = response.status;
  
  
      } catch (err) {

          // eslint-disable-next-line no-unused-vars
          error = err;
          status = 400; // client-side error

      }

      switch (status) {

          case 200: {

              setSaving(false);

              deleteTimeRange(timeRange);

              handleClose(false);

              break;

          }

          case 401: {

              await refreshAccessToken(requestDeletion);
              break;

          }

          default: {

              setSaving(false);
              setErrorMessage('Eroare! Încearcă din nou în câteva secunde.');
              setError(true);
              handleClose(false);
              break;

          }

      }

    };

    const onClose = (event, reason) => {

      if (['escapeKeyDown', 'backdropClick'].includes(reason)) {

        return;

      }

      handleClose(false);

    };

    const canDeleteTimeRange = !timeRange?.published;
    const relativeAttendance = Math.round((timeRange?.occupied / timeRange?.capacity) * 100);
    const barColor = !isNaN(relativeAttendance) ? (relativeAttendance < 50 ? 'success' : ( relativeAttendance < 90 ? 'warning' : 'error')) : 'info';

    if (open) {

      return (
          <Dialog
              open={open} 
              onClose={onClose}
              fullWidth
              maxWidth='sm'
              >
              <DialogTitle sx={{ cursor: 'default', userSelect: 'none', }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                  <RecentActorsIcon fontSize='large' sx={{ marginRight: '8px' }}/>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <Typography fontSize={17} fontWeight={500}>{ day }</Typography>
                    <Typography fontSize={17} fontWeight={500} sx={{ margin: '0 8px' }}> | </Typography>
                    <Typography fontSize={17} fontWeight={500}>{timeRange?.startTime} - {timeRange?.endTime}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <FormControlLabel 
                    control={
                      <Switch color='success'
                        disabled={saving}
                        checked={Boolean(timeRange?.published)}
                        onChange={handleTogglePublished}/>
                    }
                    label='Publicat' />
                  {
                    canDeleteTimeRange && (
                      <Button startIcon={<AutoDeleteIcon />}
                        color='error'
                        variant='contained'
                        size='small'
                        disabled={saving}
                        onClick={showDeleteDialog}>
                        Șterge
                      </Button>
                    )
                  }
                </Box>
                <Box sx={{ width: '100%', marginTop: '16px'}}>
                  <Typography sx={{ marginBottom: '4px' }}>
                    Locuri ocupate: {timeRange?.occupied ?? '??'} din {timeRange?.capacity ?? '??'}
                  </Typography>
                  <LinearProgress variant='determinate'
                    value={!isNaN(relativeAttendance) ? relativeAttendance : 0}
                    color={barColor}
                    sx={{
                      borderRadius: '4px',
                      height: '8px',
                      '& .MuiLinearProgress-bar1Determinate': {
                        //borderRadius: '4px',
                      }
                    }}/>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ position: 'relative', }}>
                <Box sx={{ width: '100%'}}>
                  {
                    ownAppointments?.map((appointment) => appointment ? (
                        <Box key={`${appointment.timeRangeId}-${appointment.appointmentId}`}
                          sx={{ 
                              width: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid rgba(255, 255, 255, .25)',
                              borderRadius: '4px',
                              padding: '8px'
                            }}>
                          <Button href={`tel:${appointment.phoneNumber}`}
                            sx={{
                              width: '100%',
                              maxWidth: '350px',
                              marginBottom: '8px',
                            }}
                            startIcon={<LocalPhoneIcon />}
                            variant='contained'
                            color='info'>
                            {appointment.phoneNumber}
                          </Button>
                          <Box sx={{
                              width: '100%',
                              maxWidth: '350px',
                              marginBottom: '8px',
                            }}>
                            {
                              appointment?.participants?.map((participant) => (
                                <Box key={`${appointment.appointmentId}-${appointment.timeRangeId}-${participant.participantId}`}
                                  sx={{ marginBottom: '8px', }}>
                                  <Typography>
                                    {participant.lastName} {participant.firstName}
                                  </Typography>
                                  <Box sx={{
                                      width: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-evenly'
                                    }}>
                                      <Chip variant='filled' 
                                        label={participant.isAdult ? 'adult' : 'minor'}
                                        color={participant.isAdult ? 'default' : 'warning'}/>
                                      <Chip variant='filled' 
                                        label={`candidează pt. ${participant.personnelCategoryAbbreviation}`}/>
                                  </Box>
                                </Box>
                              ))
                            }
                          </Box>
                        </Box>

                      ) : null
                    )
                  }
                </Box>
                {
                    saving && (
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
              </DialogContent>
              <DialogActions sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                  }}>
                  <Button onClick={() => { handleClose(false) }}
                      color='primary'
                      variant='contained'
                      disabled={saving}>
                      OK
                  </Button>
              </DialogActions>
              <Dialog open={showDeleteConfirmation}
                onClose={closeDeleteDialog}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', cursor: 'default', userSelect: 'none' }}>
                  <ReportIcon fontSize='large' color='error' sx={{ marginRight: '4px' }}/>
                  Atenție!
                </DialogTitle>
                <DialogContent>
                  Ești sigur că vrei să ștergi intervalul orar?
                </DialogContent>
                <DialogActions sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-evenly'
                  }}>
                  <Button onClick={requestDeletion}
                      color='error'
                      variant='contained'
                      disabled={saving}>
                      DA
                  </Button>
                  <Button onClick={closeDeleteDialog}
                      color='primary'
                      variant='contained'
                      disabled={saving}>
                      NU
                  </Button>
              </DialogActions>
              </Dialog>
          </Dialog>
      );

    }

    return null;

}