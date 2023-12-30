import { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// eslint-disable-next-line react/prop-types
export default function Profile({ open, handleClose, setLoading, profileInfo }) {

    const [phoneNumber, setPhoneNumber] = useState('');

    const handleSave = () => {

    };

    useEffect(() => {

        // eslint-disable-next-line react/prop-types
        setPhoneNumber(profileInfo?.phoneNumber);

    }, [profileInfo])

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Profilul tău</DialogTitle>
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
            />
            </DialogContent>
            <DialogActions>
            <Button onClick={handleClose} color='secondary'>Renunță</Button>
            <Button onClick={handleSave}>Salvează</Button>
            </DialogActions>
        </Dialog>
    );

}