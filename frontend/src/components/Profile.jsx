import { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';

const isRomanianMobilePhoneRegex = /^(\+?40|0)\s?7\d{2}(\/|\s|\.|-)?\d{3}(\s|\.|-)?\d{3}$/;

// eslint-disable-next-line react/prop-types
export default function Profile({ open, handleClose, loading, setLoading, profileInfo, accessToken }) {

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

    // TODO: phone number is internal state, but its initial value is the profileInfo.phoneNumber prop
    // TODO: validate phone number before saving (Romanian mobile number)
    // TODO: set loading to true (setLoading) while saving
    const handleSave = async (event) => {

        event.preventDefault();

        if (!phoneError && phoneNumber) {

            setLoading(true)

        }

    };

    useEffect(() => {

        // eslint-disable-next-line react/prop-types
        if (profileInfo?.phoneNumber) {

            // eslint-disable-next-line react/prop-types
            setPhoneNumber(profileInfo?.phoneNumber);

        }

    }, [profileInfo])

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Profilul tău</DialogTitle>
            <form onSubmit={handleSave} style={{
                    position: 'relative'
                }}>
                <DialogContent>
                    <DialogContentText>
                        Utilizatorii te pot contacta prin intermediul numărului tău de telefon.
                    </DialogContentText>
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color='secondary' disabled={loading}>
                        Renunță
                    </Button>
                    <Button type='submit' onClick={handleSave} disabled={loading}>
                        Salvează
                    </Button>
                </DialogActions>
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
        </Dialog>
    );

}