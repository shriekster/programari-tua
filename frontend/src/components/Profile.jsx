// TODO
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

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

    const [phoneHelperText, setPhoneHelperText] = useState(' ');
    const [phoneError, setPhoneError] = useState(false);

    const loading = useGlobalStore((state) => state.loading);
    const profileUrl = useGlobalStore((state) => state.profileUrl);
    const fullName = useGlobalStore((state) => state.fullName);
    const phoneNumber = useGlobalStore((state) => state.phoneNumber);

    const handleNameChange = (event) => {

        setFullName(event.target.value);

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
            setPhoneHelperText('Număr invalid!')

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

                    // TODO: display an error message?
                    break;

                }

            }


        }

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

                    default: break; // TODO: display error message?

                }

            }

            }
    
        };

        if (!profileDownloaded) {
            // if the profile has not already been downloaded (the /admin/profile page was accessed directly),
            // fetch it

            fetchProfile();

        }

    }, []);

    return (
        <form onSubmit={handleSave} style={{
            width: '100dvw',
            height: 'calc(100dvh - 56px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: '0 16px',
        }}>
            <Box sx={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', }}>
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
                    helperText={isEmptyStringRegex.test(fullName) ? 'Adaugă numele și prenumele' : ' '}
                    error={isEmptyStringRegex.test(fullName)}
                    onChange={handleNameChange}
                    disabled={loading}
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
                    error={phoneError}
                    onChange={handlePhoneChange}
                    disabled={loading}
                />
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Button type='submit' onClick={handleSave} disabled={loading} variant='contained'>
                        Salvează
                    </Button>
                </Box>
            </Box>
            {
                loading && (
                <CircularProgress
                    size={32}
                    color='primary'
                    thickness={6}
                    sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-16px',
                    marginLeft: '-16px',
                    }}
                    disableShrink
                />
                )
            }
        </form>
    );

}