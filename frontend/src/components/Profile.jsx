import { useState, useEffect, useRef, useCallback } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

const isRomanianMobilePhoneRegex = /^(\+?40|0)\s?7\d{2}(\/|\s|\.|-)?\d{3}(\s|\.|-)?\d{3}$/;

// eslint-disable-next-line react/prop-types
export default function Profile({accessToken, setAccessToken, loading, setLoading, refreshAccessToken}) {

    const [phoneNumber, setPhoneNumber] = useState('');
    const [helperText, setHelperText] = useState(' ');
    const [phoneError, setPhoneError] = useState(false);

    const saveRemotely = async (phoneNumber) => {

        let error = null, data = null, status = 400;

        try {

            const requestOptions = {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    phoneNumber,
                }),
            };

            const response = await fetch('/api/admin/profiles/1', requestOptions);
    
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

        return {
            status,
            data
        };

    };

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

    const updatePhoneNumber = async () => {

    };

    const handleSave = async () => {

        if (phoneNumber && !phoneError) {

            setLoading(true);

            const { status, data } = await saveRemotely(phoneNumber);

            setLoading(false);

            switch (status) {

                case 200: {

                    break;

                }

                case 401: {

                    // TODO: try to refresh the access token, then retry the action (i.e., save the phone number on the server)
                    // OR try to find a better solution (DRY)
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

        const fetchProfileData = async () => {

            let error = null,
            status = 401,
            data = null;
    
            setLoading(true);
    
            const requestOptions = {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`
                },
              };
          
              try {
          
                // eslint-disable-next-line no-unused-vars
                const response = await fetch('/api/admin/profiles/1', requestOptions);
                status = response.status;
    
                const json = await response.json();
                data = json?.data;
          
              } catch (err) {
          
                // eslint-disable-next-line no-unused-vars
                error = err;
          
              } finally {
    
                if (!error) {
    
                    if (200 === status) {
    
                        setLoading(false);
                        setPhoneNumber(data?.profile?.phoneNumber);
    
                    } else {
    
                        const newAccessToken = await refreshAccessToken();
                        setAccessToken(newAccessToken);
                        await fetchProfileData();
    
                    }
    
                }
    
              }
    
        };

        fetchProfileData();

    }, [accessToken, setAccessToken, refreshAccessToken, setLoading]);

    return (
        <form onSubmit={handleSave} style={{
            position: 'relative'
        }}>

            <>
                Utilizatorii te pot contacta prin intermediul numărului tău de telefon.
            </>
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
            <Button type='submit' onClick={handleSave} disabled={loading}>
                Salvează
            </Button>
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