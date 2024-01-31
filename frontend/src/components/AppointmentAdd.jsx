/* eslint-disable react/prop-types */

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
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
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
import TaskIcon from '@mui/icons-material/Task';
import PlaceIcon from '@mui/icons-material/Place';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import WarningIcon from '@mui/icons-material/Warning';

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
    const [extraParticipant, setExtraParticipant] = useState(false);
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

    const handleLastName1Change = (event) => {

      setLastName1({
        value: event.target.value,
        helperText: ' ',
        error: false,
      });
  
    };

    const handleFirstName1Change = (event) => {

      setFirstName1({
        value: event.target.value,
        helperText: ' ',
        error: false,
      });
  
    };

    const handleAddExtraParticipant = () => {

      setExtraParticipant(true);

    };

    const handleRemoveExtraParticipant = () => {

      setExtraParticipant(false);

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

    };

    const handleLastName2Change = (event) => {

      setLastName2({
        value: event.target.value,
        helperText: ' ',
        error: false,
      });
  
    };

    const handleFirstName2Change = (event) => {

      setFirstName2({
        value: event.target.value,
        helperText: ' ',
        error: false,
      });
  
    };

    const closeConfirmationDialog = (event, reason) => {

      if (['escapeKeyDown', 'backdropClick'].includes(reason)) {

        return;

      }

      setShowConfirmation(false);

    };

    const handleSubmit = () => {

      let canSubmit = true;

      if (!phoneNumber.value) {

        setPhoneNumber({
          value: '',
          helperText: 'Completează numărul de telefon!',
          error: true,
        });

        canSubmit = false;

      }

      if (!lastName1.value) {

        setLastName1({
          value: '',
          helperText: 'Completează numele!',
          error: true,
        });

        canSubmit = false;

      }

      if (!firstName1.value) {

        setFirstName1({
          value: '',
          helperText: 'Completează prenumele!',
          error: true,
        });

        canSubmit = false;

      }

      if (extraParticipant) {

        if (!lastName2.value) {

          setLastName2({
            value: '',
            helperText: 'Completează numele!',
            error: true,
          });
  
          canSubmit = false;
  
        }

        if (!firstName2.value) {

          setFirstName2({
            value: '',
            helperText: 'Completează prenumele!',
            error: true,
          });
  
          canSubmit = false;
  
        }

      }

      if (canSubmit) {

        setShowConfirmation(true);

      }

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

    const handleCopyLocation = () => {

      navigator.clipboard.writeText(dateObj?.locationDisplayName?.toString())
      .then(() => {
        setCopied(true);
      })
      .catch((reason) => {
        setCopied(false);
      });

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

        setExtraParticipant(false);

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
              <DialogContent sx={{ position: 'relative', }}>
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
                    variant='outlined'
                    value={phoneNumber.value}
                    helperText={phoneNumber.helperText}
                    error={phoneNumber.error}
                    disabled={saving}
                    onChange={handlePhoneNumberChange}/>
                  <Paper elevation={24}
                    sx={{ borderRadius: '4px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    <PersonIcon fontSize='large' color='primary' sx={{ alignSelf: 'flex-end' }}/>
                    <TextField sx={{
                        width: '100%',
                        maxWidth: '300px',
                      }}
                      label='Nume'
                      color='primary'
                      inputProps={{
                        maxLength: 64
                      }}
                      name='lastName1'
                      autoComplete='family-name'
                      variant='standard'
                      value={lastName1.value}
                      helperText={lastName1.helperText}
                      error={lastName1.error}
                      disabled={saving}
                      onChange={handleLastName1Change}/>
                    <TextField sx={{
                        width: '100%',
                        maxWidth: '300px',
                      }}
                      label='Prenume'
                      color='primary'
                      inputProps={{
                        maxLength: 64
                      }}
                      name='firstName1'
                      autoComplete='given-name'
                      variant='standard'
                      value={firstName1.value}
                      helperText={firstName1.helperText}
                      error={firstName1.error}
                      disabled={saving}
                      onChange={handleFirstName1Change}/>
                  </Paper>
                    {
                      extraParticipant ? (
                        <>
                          <Paper elevation={24}
                            sx={{ borderRadius: '4px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', width: '100%' }}>
                            <PersonIcon fontSize='large' color='primary' sx={{ alignSelf: 'flex-end' }}/>
                            <TextField sx={{
                                width: '100%',
                                maxWidth: '300px',
                              }}
                              label='Nume'
                              color='primary'
                              inputProps={{
                                maxLength: 64
                              }}
                              name='lastName2'
                              autoComplete='family-name'
                              variant='standard'
                              value={lastName2.value}
                              helperText={lastName2.helperText}
                              error={lastName2.error}
                              disabled={saving}
                              onChange={handleLastName2Change}/>
                            <TextField sx={{
                                width: '100%',
                                maxWidth: '300px',
                              }}
                              label='Prenume'
                              color='primary'
                              inputProps={{
                                maxLength: 64
                              }}
                              name='firstName2'
                              autoComplete='given-name'
                              variant='standard'
                              value={firstName2.value}
                              helperText={firstName2.helperText}
                              error={firstName2.error}
                              disabled={saving}
                              onChange={handleFirstName2Change}/>
                          </Paper>
                          <Button
                            sx={{ textTransform: 'none', width: '100%', maxWidth: '300px' }}
                            variant='outlined'
                            color='error'
                            startIcon={<PersonRemoveIcon />}
                            onClick={handleRemoveExtraParticipant}>
                            Renunță la a doua persoană
                          </Button>
                        </>
                      ) : (
                        <Button
                          sx={{ textTransform: 'none', width: '100%', maxWidth: '300px' }}
                          variant='outlined'
                          color='secondary'
                          startIcon={<PersonAddIcon />}
                          onClick={handleAddExtraParticipant}>
                          Adaugă o persoană
                        </Button>
                      )

                    }
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', maxWidth: '300px', width: '100%' }}>
                      <PlaceIcon color='error' fontSize='large' />
                      <Typography>
                        {dateObj?.locationDisplayName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px', maxWidth: '300px', width: '100%' }}>
                      <Tooltip
                        open={copied}
                        title='Copiat!'
                        placement='right'
                        arrow>
                        <Button size='small'
                          startIcon={<ContentCopyIcon />}
                          sx={{ textTransform: 'none' }}
                          onClick={handleCopyLocation}
                          color='inherit'
                          >
                          Copiază adresa
                        </Button>
                      </Tooltip>
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
                  <Button
                    sx={{ width: '100%', maxWidth: '300px' }}
                    color='primary'
                    variant='contained'
                    disabled={saving}
                    onClick={handleSubmit}>
                    Solicită programare
                  </Button>
              </DialogActions>
              <Dialog open={showConfirmation}
                onClose={closeConfirmationDialog}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default', userSelect: 'none' }}>
                  <WarningIcon fontSize='large' color='warning' sx={{ marginRight: '4px' }}/>
                </DialogTitle>
                <DialogContent>
                  <Typography>
                    Este corect numărul de telefon pe care l-ai introdus,
                    <span style={{ fontWeight: 700, marginLeft: '4px' }}>{phoneNumber.value}</span>
                    ?
                  </Typography>
                </DialogContent>
                <DialogActions sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-evenly'
                  }}>
                  <Button onClick={closeConfirmationDialog}
                      color='error'
                      variant='contained'
                      disabled={saving}>
                      NU
                  </Button>
                  <Button onClick={requestAppointment}
                      color='primary'
                      variant='contained'
                      disabled={saving}>
                      DA
                  </Button>

              </DialogActions>
              </Dialog>
          </Dialog>
      );

    }

    return null;

}