
import { useState, useEffect, useRef } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Fade from '@mui/material/Fade';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import AutoDeleteIcon from '@mui/icons-material/AutoDelete';
import ReportIcon from '@mui/icons-material/Report';
import BlockIcon from '@mui/icons-material/Block';
import PersonIcon from '@mui/icons-material/Person';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';
import CheckIcon from '@mui/icons-material/Check';
import PlaceIcon from '@mui/icons-material/Place';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { useGlobalStore } from '../useGlobalStore';

// get the functions from the global store as non-reactive, fresh state,
// because this proves the linter that the functions are not changing between renders
// why? because it's annoying to specify functions as effect depedencies and I could not think of
// a better solution, at least for now
const {
    setError,
    setErrorMessage,
    // TODO
} = useGlobalStore.getState();

const isRomanianMobilePhoneRegex = /^(\+?40|0)\s?7\d{2}(\/|\s|\.|-)?\d{3}(\s|\.|-)?\d{3}$/;

// eslint-disable-next-line react/prop-types
export default function AppointmentAdd({ open, handleClose, date, dateObj, timeRangeId }) {
    
    const [saving, setSaving] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState({
      value: '',
      helperText: ' ',
      error: false
    });
    const [lastName1, setLastName1] = useState({
      value: '',
      helperText: 'Doar numere de telefon din România',
      error: false
    });
    const [firstName1, setFirstName1] = useState({
      value: '',
      helperText: ' ',
      error: false
    });
    const [lastName2, setLastName2] = useState({
      value: '',
      helperText: ' ',
      error: false
    });
    const [firstName2, setFirstName2] = useState({
      value: '',
      helperText: ' ',
      error: false
    });

    const [copied, setCopied] = useState(false);

    const timeoutRef = useRef(null);

    const handleCopyLocation = () => {

      navigator.clipboard.writeText(dateObj?.locationDisplayName?.toString())
      .then(() => {
        setCopied(true);
      })
      .catch((reason) => {
        setCopied(false);
      });

    };

    const timeRange = useGlobalStore((state) => state.timeRanges).find((timeRange) => timeRange?.id == timeRangeId);
    
    // eslint-disable-next-line react/prop-types
    const day = date?.$d?.toLocaleDateString('ro-RO') ?? '';

    const handlePhoneNumberChange = (event) => {

      const value = event.target.value;
      const error = !isRomanianMobilePhoneRegex.test(value);
      const helperText = error ? 'Doar numere de telefon din România' : ' ';

      setPhoneNumber({
        value,
        helperText,
        error,
      });
  
    };

    const showConfirmationDialog = () => {

      setShowConfirmation(true);

    };

    const closeConfirmationDialog = (event, reason) => {

      if (['escapeKeyDown', 'backdropClick'].includes(reason)) {

        return;

      }

      setShowConfirmation(false);

    };

    const requestAppointment = async () => {

      setShowConfirmation(false);
      setSaving(true);

      let error = null, status = 403;

      try {

          const requestOptions = {
              method: 'POST',
              headers: {
              'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                test: 'test'
                // TODO
              }),
              credentials: 'same-origin'
          };

          const response = await fetch(`/api/appointments`, requestOptions);
          status = response.status;
  
  
      } catch (err) {

          // eslint-disable-next-line no-unused-vars
          error = err;
          status = 400; // client-side error

      }

      switch (status) {

          case 200: {

              setSaving(false);

              // TODO: dialog: everything is ok, maybe display the appointment link

              handleClose();

              break;

          }

          case 403: {

            setSaving(false);
            setErrorMessage('Nu mai sunt locuri libere în intervalul orar!');
            setError(true);
            handleClose();
            break;

        }

          default: {

              setSaving(false);
              setErrorMessage('Eroare! Încearcă din nou în câteva secunde.');
              setError(true);
              handleClose();
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

    useEffect(() => {

      if (open) {

        setPhoneNumber({
          value: '',
          helperText: ' ',
          error: false
        });

        setLastName1({
          value: '',
          helperText: ' ',
          error: false
        });

        setFirstName1({
          value: '',
          helperText: ' ',
          error: false
        });

        setLastName2({
          value: '',
          helperText: ' ',
          error: false
        });

        setFirstName2({
          value: '',
          helperText: ' ',
          error: false
        });

      }

    }, [open]);

    useEffect(() => {

      if (copied) {

        if (timeoutRef.current) {

          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;

        }

        timeoutRef.current = setTimeout(() => {

          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;

          setCopied(false);

        }, 1500);

      }

    }, [copied]);

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
                  <InsertInvitationIcon fontSize='large' sx={{ marginRight: '8px' }}/>
                  <Box sx={{ width: '100%' }}>
                    <Typography fontSize={17} fontWeight={500}>{ day }, {timeRange?.startTime} - {timeRange?.endTime}</Typography>
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ position: 'relative', border: '1px solid rgba(128, 128, 128, .25)', borderRadius: '4px', margin: '2px' }}>
                <Box sx={{ width: '100%', padding: '8px 0'}}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px'  }}>
                  <TextField sx={{
                      width: '100%',
                      maxWidth: '300px',
                    }}
                    type='tel'
                    label='Număr de telefon'
                    color='primary'
                    InputProps={{
                      endAdornment: <InputAdornment position='end'>
                          {
                            phoneNumber.value ? (
                              phoneNumber.error ? (
                                <BlockIcon color='error' />
                              ) : (
                                <CheckIcon color='success' />
                              )
                            ) : null
                          }
                        </InputAdornment>
                    }}
                    inputProps={{
                      maxLength: 16
                    }}
                    name='phoneNumber'
                    autoComplete='tel-national'
                    value={phoneNumber.value}
                    helperText={phoneNumber.helperText}
                    error={phoneNumber.error}
                    disabled={saving}
                    onChange={handlePhoneNumberChange}/>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', maxWidth: '300px', width: '100%' }}>
                      <PlaceIcon color='error' fontSize='large' />
                      <Typography>
                        Locație: {dateObj?.locationDisplayName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px', maxWidth: '300px', width: '100%' }}>
                      <IconButton onClick={handleCopyLocation}>
                        <ContentCopyIcon />
                      </IconButton>
                      <Typography>
                        Copiază locația
                      </Typography>
                      <Fade in={copied}>
                        <CheckIcon color='success' />
                      </Fade>
                    </Box>
                    <Button
                      href={`https://www.waze.com/ul?ll=${dateObj?.latitude},${dateObj.longitude}&navigate=yes&zoom=18`}
                      target='_blank'
                      variant='contained'
                      color='info'
                      sx={{ textTransform: 'none', width: '100%', maxWidth: '300px' }}
                      endIcon={<OpenInNewIcon />}>
                      Deschide cu Waze
                    </Button>
                  </Box>
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
                    sx={{ width: '100%', maxWidth: '300px' }}
                    color='primary'
                    variant='contained'
                    disabled={saving}>
                    Solicită programare
                  </Button>
              </DialogActions>
              <Dialog open={showConfirmation}
                onClose={closeConfirmationDialog}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', cursor: 'default', userSelect: 'none' }}>
                  <ReportIcon fontSize='large' color='error' sx={{ marginRight: '4px' }}/>
                  Atenție!
                </DialogTitle>
                <DialogContent>
                  Ești sigur că vrei să ștergi intervalul orar? Vei șterge și programările din acest interval orar!
                </DialogContent>
                <DialogActions sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-evenly'
                  }}>
                  <Button onClick={requestAppointment}
                      color='error'
                      variant='contained'
                      disabled={saving}>
                      DA
                  </Button>
                  <Button onClick={closeConfirmationDialog}
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