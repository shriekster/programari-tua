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
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import BlockIcon from '@mui/icons-material/Block';
import PersonIcon from '@mui/icons-material/Person';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';
import CheckIcon from '@mui/icons-material/Check';
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
    const [maturity1, setMaturity1] = useState({
      value: '',
      helperText: ' ',
      error: false
    });
    const [personnelCategory1, setPersonnelCategory1] = useState({
      value: '',
      helperText: ' ',
      error: false
    });
    const [personnelCategory1Index, setPersonnelCategory1Index] = useState(-1);
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
    const [maturity2, setMaturity2] = useState({
      value: '',
      helperText: ' ',
      error: false
    });
    const [personnelCategory2, setPersonnelCategory2] = useState({
      value: '',
      helperText: ' ',
      error: false
    });
    const [personnelCategory2Index, setPersonnelCategory2Index] = useState(-1);

    const [copied, setCopied] = useState(false);
    const [isSecureContext, setSecureContext] = useState(false);

    const timeRange = useGlobalStore((state) => state.timeRanges).find((timeRange) => timeRange?.id == timeRangeId);
    const personnelCategories = useGlobalStore((state) => state.personnelCategories);
    const contactInfo = useGlobalStore((state) => state.contactInfo);

    // eslint-disable-next-line react/prop-types
    const day = date?.$d?.toLocaleDateString('ro-RO') ?? '';

    const timeoutRef = useRef(null);

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

    const handleMaturity1Change = (event) => {

      setMaturity1({
        value: event.target.value,
        helperText: ' ',
        error: false
      });

    };

    const handlePersonnelCategory1Change = (event) => {

      setPersonnelCategory1({
        value: event.target.value,
        helperText: ' ',
        error: false
      });

      const newIndex = personnelCategories?.findIndex((category) => category?.name === event.target.value);

      if (0 <= newIndex && newIndex < personnelCategories?.length) {

        setPersonnelCategory1Index(newIndex);

      }

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

      setMaturity2({
        value: '',
        helperText: ' ',
        error: false
      });

      setPersonnelCategory2({
        value: '',
        helperText: ' ',
        error: false
      });

      setPersonnelCategory2Index(-1);

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

    const handleMaturity2Change = (event) => {

      setMaturity2({
        value: event.target.value,
        helperText: ' ',
        error: false
      });

    };

    const handlePersonnelCategory2Change = (event) => {

      setPersonnelCategory2({
        value: event.target.value,
        helperText: ' ',
        error: false
      });

      const newIndex = personnelCategories?.findIndex((category) => category?.name === event.target.value);

      if (0 <= newIndex && newIndex < personnelCategories?.length) {

        setPersonnelCategory2Index(newIndex);

      }

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

      if (!maturity1.value) {

        setMaturity1({
          value: '',
          helperText: 'Selectează vârsta!',
          error: true
        });

      }

      if (!personnelCategory1.value) {

        setPersonnelCategory1({
          value: '',
          helperText: 'Selectează categoria!',
          error: true
        });

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

        if (!maturity2.value) {

          setMaturity2({
            value: '',
            helperText: 'Selectează vârsta!',
            error: true
          });
  
        }
  
        if (!personnelCategory2.value) {

          setPersonnelCategory2({
            value: '',
            helperText: 'Selectează categoria!',
            error: true
          });
  
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

        const participants = [];

        participants.push({
          // TODO;
        })

        const requestOptions = {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              timeRangeId: timeRange?.id,
              phoneNumber: phoneNumber.value,
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

        setMaturity1({
          value: '',
          helperText: ' ',
          error: false
        });

        setPersonnelCategory1({
          value: '',
          helperText: ' ',
          error: false
        });

        setPersonnelCategory1Index(-1);

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

        setMaturity2({
          value: '',
          helperText: ' ',
          error: false
        });

        setPersonnelCategory2({
          value: '',
          helperText: ' ',
          error: false
        });

        setPersonnelCategory2Index(-1);

        setSecureContext(window.isSecureContext);

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

        }, 2000);

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
                  <Paper elevation={24}
                    sx={{ borderRadius: '4px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    <LocalPhoneIcon fontSize='large' color='primary' sx={{ alignSelf: 'flex-start' }}/>
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
                      variant='standard'
                      value={phoneNumber.value}
                      helperText={phoneNumber.helperText}
                      error={phoneNumber.error}
                      disabled={saving}
                      onChange={handlePhoneNumberChange}/>
                  </Paper>
                  <Paper elevation={24}
                    sx={{ borderRadius: '4px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    <PersonIcon fontSize='large' color='primary' sx={{ alignSelf: 'flex-start' }}/>
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
                    <FormControl error={maturity1.error} sx={{ width: '100%', maxWidth: '300px' }}>
                      <FormLabel id='maturity1'>Vârstă</FormLabel>
                      <RadioGroup sx={{ display: 'flex', flexDirection: 'row !important', alignItems: 'center', justifyContent: 'space-between' }}
                        aria-labelledby='maturity1'
                        name='maturity-1'
                        value={maturity1.value}
                        onChange={handleMaturity1Change}
                      >
                        <FormControlLabel value='minor' control={<Radio />} label='Minor' />
                        <FormControlLabel value='adult' control={<Radio />} label='Adult' />
                      </RadioGroup>
                      <FormHelperText>{maturity1.helperText}</FormHelperText>
                    </FormControl>
                    <FormControl error={personnelCategory1.error} sx={{ width: '100%', maxWidth: '300px' }}>
                      <Typography>Categoria de personal pentru care candidează</Typography>
                      <Select
                        id='select-personnel-category-1'
                        value={personnelCategory1.value}
                        onChange={handlePersonnelCategory1Change}
                      >
                        {
                          personnelCategories?.map((category) => (
                            <MenuItem key={`${category?.id}_1`} 
                              value={category?.name}>
                              {category?.name}
                            </MenuItem>
                          ))
                        }
                      </Select>
                      <FormHelperText>{personnelCategory1.helperText}</FormHelperText>
                    </FormControl>
                    {
                      !extraParticipant && (
                        <Button
                          sx={{ textTransform: 'none', alignSelf: 'flex-end' }}
                          variant='outlined'
                          color='secondary'
                          startIcon={<PersonAddIcon />}
                          onClick={handleAddExtraParticipant}>
                          Adaugă o persoană
                        </Button>
                      )
                    }
                  </Paper>
                    {
                      extraParticipant && (
                        <Paper elevation={24}
                          sx={{ borderRadius: '4px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', width: '100%' }}>
                          <PersonIcon fontSize='large' color='primary' sx={{ alignSelf: 'flex-start' }}/>
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
                          <FormControl error={maturity2.error} sx={{ width: '100%', maxWidth: '300px' }}>
                            <FormLabel id='maturity2'>Vârstă</FormLabel>
                            <RadioGroup sx={{ display: 'flex', flexDirection: 'row !important', alignItems: 'center', justifyContent: 'space-between' }}
                              aria-labelledby='maturity2'
                              name='maturity-2'
                              value={maturity2.value}
                              onChange={handleMaturity2Change}
                            >
                              <FormControlLabel value='minor' control={<Radio />} label='Minor' />
                              <FormControlLabel value='adult' control={<Radio />} label='Adult' />
                            </RadioGroup>
                            <FormHelperText>{maturity2.helperText}</FormHelperText>
                          </FormControl>
                          <FormControl error={personnelCategory2.error} sx={{ width: '100%', maxWidth: '300px' }}>
                            <Typography>Categoria de personal pentru care candidează</Typography>
                            <Select
                              id='select-personnel-category-2'
                              value={personnelCategory2.value}
                              onChange={handlePersonnelCategory2Change}
                            >
                              {
                                personnelCategories?.map((category) => (
                                  <MenuItem key={`${category?.id}_2`} 
                                    value={category?.name}>
                                    {category?.name}
                                  </MenuItem>
                                ))
                              }
                            </Select>
                            <FormHelperText>{personnelCategory2.helperText}</FormHelperText>
                          </FormControl>
                          <Button
                            sx={{ textTransform: 'none', alignSelf: 'flex-end' }}
                            variant='outlined'
                            color='error'
                            startIcon={<PersonRemoveIcon />}
                            onClick={handleRemoveExtraParticipant}>
                            Renunță la persoană
                          </Button>
                        </Paper>
                      )

                    }
                  <Paper elevation={24}
                    sx={{ borderRadius: '4px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', width: '100%' }}>
                        <PlaceIcon color='error' fontSize='large' sx={{ alignSelf: 'flex-start' }} />
                        <Typography>
                          {dateObj?.locationDisplayName}
                        </Typography>
                      {
                        isSecureContext && (
                          <Tooltip
                            open={copied}
                            title='Copiat!'
                            placement='right'
                            arrow>
                            <Button size='small'
                              startIcon={<ContentCopyIcon />}
                              sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
                              onClick={handleCopyLocation}
                              color='inherit'
                              >
                              Copiază adresa
                            </Button>
                          </Tooltip>
                        )
                      }
                      <Button
                        href={`https://www.waze.com/ul?ll=${dateObj?.latitude},${dateObj.longitude}&navigate=yes&zoom=18`}
                        target='_blank'
                        variant='outlined'
                        color='info'
                        sx={{ textTransform: 'none', alignSelf: 'flex-end' }}
                        endIcon={<OpenInNewIcon />}>
                        Deschide cu Waze
                      </Button>
                    </Paper>
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
              <DialogActions>
                <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '16px',
                      width: '100%'
                  }}>
                  <Button
                    sx={{ width: '100%', maxWidth: '300px' }}
                    color='error'
                    variant='contained'
                    disabled={saving}
                    onClick={handleClose}>
                    Renunță
                  </Button>
                  <Button
                    sx={{ width: '100%', maxWidth: '300px' }}
                    color='primary'
                    variant='contained'
                    disabled={saving}
                    onClick={handleSubmit}>
                    Solicită programare
                  </Button>
                </Box>
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
                      sx={{ width: '50%' }}
                      disabled={saving}>
                      NU
                  </Button>
                  <Button onClick={requestAppointment}
                      color='primary'
                      variant='contained'
                      sx={{ width: '50%' }}
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