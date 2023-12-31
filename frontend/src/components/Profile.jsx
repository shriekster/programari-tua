import { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const isRomanianMobilePhoneRegex = /^(\+?40|0)\s?7\d{2}(\/|\s|\.|-)?\d{3}(\s|\.|-)?\d{3}$/;

// eslint-disable-next-line react/prop-types
export default function Profile({ open, handleClose, setLoading, profileInfo, accessToken }) {

    const [phoneNumber, setPhoneNumber] = useState('');
    const [helperText, setHelperText] = useState(' ');
    const [phoneError, setPhoneError] = useState(false);

    const handlePhoneChange = (event) => {

        setPhoneNumber(event.target.value);

    };

    // TODO: phone number is internal state, but its initial value is the profileInfo.phoneNumber prop
    // TODO: validate phone number before saving (Romanian mobile number)
    // TODO: set loading to true (setLoading) while saving
    const handleSave = () => {

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
            <form>
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
                        />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color='secondary'>Renunță</Button>
                    <Button onClick={handleSave}>Salvează</Button>
                </DialogActions>
            </form>
        </Dialog>
    );

}