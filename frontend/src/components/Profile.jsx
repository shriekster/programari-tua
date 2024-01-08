import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

import { navigate } from 'wouter/use-location';

import refreshAccessToken from '../refreshAccessToken.js';

const isRomanianMobilePhoneRegex = /^(\+?40|0)\s?7\d{2}(\/|\s|\.|-)?\d{3}(\s|\.|-)?\d{3}$/;

// eslint-disable-next-line react/prop-types
export default function Profile({loading, setLoading}) {

    const [profileUrl, setProfileUrl] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [helperText, setHelperText] = useState(' ');
    const [phoneError, setPhoneError] = useState(false);

    const handlePhoneChange = (event) => {

        const nextPhoneNumber = event.target.value;

        setPhoneNumber(nextPhoneNumber);

        const isValidPhoneNumber = isRomanianMobilePhoneRegex.test(nextPhoneNumber);
        
        if (isValidPhoneNumber) {

            setPhoneError(false);
            setHelperText(' ');

        } else {

            setPhoneError(true);
            setHelperText('Număr invalid!')

        }


    };

    const handleSave = async (event) => {

        event.preventDefault();

        if (phoneNumber && !phoneError) {

            setLoading(true);

            let error = null, data = null, status = 401;

            try {
    
                const requestOptions = {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phoneNumber,
                    }),
                    credentials: 'same-origin'
                };
    
                const response = await fetch(profileUrl, requestOptions);
        
                status = response.status;
        
                if (!response.ok) {
        
                  throw new Error('Something happened')
        
                }
    
                const json = await response.json();
                data = json?.data;
        
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

                    // TODO: display an error message
                    break;

                }

            }


        }

    };

    useEffect(() => {

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
                        setProfileUrl(data?.profile?.url);
                        setPhoneNumber(data?.profile?.phoneNumber);
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

        fetchProfile();

    }, [setLoading]);

    return (
        <form onSubmit={handleSave} style={{
            position: 'relative',
            padding: '16px',
        }}>
            <Box sx={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ textAlign: 'center'}}>
                    Utilizatorii te pot contacta prin intermediul numărului tău de telefon.
                </Typography>
                <TextField
                    autoFocus
                    margin='dense'
                    id='name'
                    label='Număr de telefon'
                    type='tel'
                    fullWidth
                    variant='standard'
                    value={phoneNumber}
                    helperText={helperText}
                    error={phoneError}
                    onChange={handlePhoneChange}
                    disabled={loading}
                />
                <Button type='submit' onClick={handleSave} disabled={loading} sx={{ margin: '0 auto' }} variant='contained'>
                    Salvează
                </Button>
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