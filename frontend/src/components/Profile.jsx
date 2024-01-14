// TODO
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import PhoneIcon from '@mui/icons-material/Phone';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { useGlobalStore } from '../useGlobalStore.js';

import refreshAccessToken from '../refreshAccessToken.js';

const isRomanianMobilePhoneRegex = /^(\+?40|0)\s?7\d{2}(\/|\s|\.|-)?\d{3}(\s|\.|-)?\d{3}$/;
const isEmptyStringRegex = /^$/;

const {
    setLoading,
    setProfileDownloaded,
    setProfileUrl,
    setFullName,
    setPhoneNumber,
  } = useGlobalStore.getState();

// eslint-disable-next-line react/prop-types
export default function Profile() {

    const [nameHelperText, setNameHelperText] = useState(' ');
    const [nameError, setNameError] = useState(false);
    const [phoneHelperText, setPhoneHelperText] = useState(' ');
    const [phoneError, setPhoneError] = useState(false);
    const [showFetchError, setFetchError] = useState(false);
    const [fetchErrorMessage, setFetchErrorMessage] = useState('');

    const loading = useGlobalStore((state) => state.loading);
    const profileUrl = useGlobalStore((state) => state.profileUrl);
    const fullName = useGlobalStore((state) => state.fullName);
    const phoneNumber = useGlobalStore((state) => state.phoneNumber);

    const handleNameChange = (event) => {

        const nextFullName = event.target.value;

        setFullName(event.target.value);

        const isValidName = !isEmptyStringRegex.test(nextFullName);
        
        if (isValidName) {

            setNameError(false);
            setNameHelperText(' ');

        } else {

            setNameError(true);
            setNameHelperText('Completează numele și prenumele!');

        }

    };

    const handlePhoneChange = (event) => {

        const nextPhoneNumber = event.target.value;

        setPhoneNumber(nextPhoneNumber);

        const isValidPhoneNumber = isRomanianMobilePhoneRegex.test(nextPhoneNumber);
        
        if (isValidPhoneNumber) {

            setPhoneError(false);
            setPhoneHelperText(' ');

        } else {

            setPhoneError(true);
            setPhoneHelperText('Număr invalid!');

        }


    };

    const handleSave = async (event) => {

        event.preventDefault();

        const canUpdateProfile = 
            !isEmptyStringRegex.test(fullName)      &&
            !isEmptyStringRegex.test(phoneNumber)   && 
            !phoneError;

        if (canUpdateProfile) {

            setLoading(true);

            let error = null, status = 401;

            try {
    
                const requestOptions = {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fullName,
                        phoneNumber,
                    }),
                    credentials: 'same-origin'
                };
    
                const response = await fetch(profileUrl, requestOptions);
        
                status = response.status;
        
                if (!response.ok) {
        
                  throw new Error('Something happened')
        
                }
        
            } catch (err) {
    
                // eslint-disable-next-line no-unused-vars
                error = err;
    
            }

            switch (status) {

                case 200: {

                    setLoading(false);
                    break;

                }

                case 401: {

                    await refreshAccessToken(handleSave)
                    break;

                }

                default: {

                    setLoading(false);
                    setFetchErrorMessage('Eroare! Încearcă din nou în câteva secunde.');
                    setFetchError(true);
                    break;

                }

            }


        } else {

            if (isEmptyStringRegex.test(fullName)) {

                setNameError(true);
                setNameHelperText('Completează numele și prenumele!');

            }

            if (isEmptyStringRegex.test(phoneNumber)) {

                setPhoneError(true);
                setPhoneHelperText('Număr invalid!');

            }

        }

    };

    const handleErrorClose = (event, reason) => {

        if (reason === 'clickaway') {
          return;
        }
    
        setFetchError(false);
    
    };

    useEffect(() => {

        const profileDownloaded = useGlobalStore.getState().profileDownloaded;

        const fetchProfile = async () => {

            let error = null,
            status = 401,
            data = null;
    
            setLoading(true);
    
            const requestOptions = {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'same-origin'
            };
          
            try {
        
            // eslint-disable-next-line no-unused-vars
            const response = await fetch('/api/admin/profiles/current', requestOptions);
            status = response.status;

            const json = await response.json();
            data = json?.data;
        
            } catch (err) {
        
                // eslint-disable-next-line no-unused-vars
                error = err;
        
            } finally {

            if (!error) {

                switch (status) {

                    case 200: {

                        setLoading(false);

                        const profileDataExists = 
                            data?.profile &&
                            data?.profile?.url &&
                            data?.profile?.fullName &&
                            data?.profile?.phoneNumber;

                        if (profileDataExists) {

                            setProfileDownloaded(true);
                            setProfileUrl(data.profile.url);
                            setFullName(data.profile.fullName);
                            setPhoneNumber(data.profile.phoneNumber);

                        }

                        break;

                    }

                    case 401: {

                        await refreshAccessToken(fetchProfile);
                        break;

                    }

                    default: {

                        setLoading(false);
                        setFetchError(true);
                        setFetchErrorMessage('Eroare! Reîmprospătează pagina (refresh).');
                    }

                }

            }

            }
    
        };

        // if the profile has not already been downloaded (the /admin/profile page was accessed directly),
        // fetch it
        if (!profileDownloaded) {

            fetchProfile();

        }

    }, []);

    return (
        <form onSubmit={handleSave} style={{
            padding: '64px 8px 8px 8px',
            margin: '0 8px',
            overflowY: 'scroll',
        }}>
            <Box sx={{ 
                    maxWidth: '400px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    margin: '0 auto',
                }}>
                <Typography>
                    Datele tale de contact
                </Typography>
                <TextField
                    margin='dense'
                    id='fullName'
                    name='fullName'
                    label='Nume și prenume'
                    type='text'
                    fullWidth
                    variant='standard'
                    value={fullName}
                    helperText={nameHelperText}
                    error={nameError}
                    onChange={handleNameChange}
                    disabled={loading}
                    InputProps={{
                        startAdornment: <InputAdornment position='start'><PersonPinIcon color={nameError ? 'error' : 'primary'} /></InputAdornment>
                    }}
                    inputProps={{
                        maxLength: 256
                    }}
                />
                <TextField
                    margin='dense'
                    id='phoneNumber'
                    name='phoneNumber'
                    label='Număr de telefon'
                    type='tel'
                    fullWidth
                    variant='standard'
                    value={phoneNumber}
                    helperText={phoneHelperText}
                    error={!loading && phoneError}
                    onChange={handlePhoneChange}
                    disabled={loading}
                    InputProps={{
                        startAdornment: <InputAdornment position='start'><PhoneIcon color={phoneError ? 'error' : 'primary'} /></InputAdornment>
                    }}
                    inputProps={{
                        maxLength: 10
                    }}
                />
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Button type='submit' onClick={handleSave} disabled={loading} variant='contained'>
                        Salvează
                    </Button>
                </Box>
            </Box>
            <Snackbar open={showFetchError} autoHideDuration={6000} onClose={handleErrorClose}>
                <Alert onClose={handleErrorClose} severity='error' variant='outlined' sx={{ width: '100%' }}>
                {fetchErrorMessage}
                </Alert>
            </Snackbar>
        </form>
    );

}