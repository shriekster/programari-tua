
import { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import AutoDeleteIcon from '@mui/icons-material/AutoDelete';
import ReportIcon from '@mui/icons-material/Report';

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

    const dates = useGlobalStore((state) => state.dates);
    const timeRanges = useGlobalStore((state) => state.timeRanges);

    // eslint-disable-next-line react/prop-types
    const day = date?.$d?.toLocaleDateString('ro-RO') ?? '';
    const dateId = dates?.get(day)?.id ?? '';
    
    const timeRange = timeRanges.find((timeRange) => timeRange.id == timeRangeId);
    const ownAppointments = [1];

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

              await refreshAccessToken(handleDelete);
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
                        checked={timeRange.published}
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
              </DialogTitle>
              <DialogContent sx={{ position: 'relative', }}>
                <Box sx={{ width: '100%'}}>
                  {
                    (new Array(1000).fill(1)).map((val, i) => (
                      <div key={i}>{i}</div>
                    ))
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