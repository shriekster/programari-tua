import { useState } from 'react';

import Box from '@mui/system/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/Key';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

import { navigate } from 'wouter/use-location';

import { useGlobalStore } from '../useGlobalStore.js';

import tuaImage from '../assets/tua.webp';


// eslint-disable-next-line react/prop-types
export default function Login() {
  
  const [username, setUsername] = useState({
      value: '',
      helperText: ' ',
      error: false,
  });
  const [password, setPassword] = useState({
    value: '',
    helperText: ' ',
    error: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useGlobalStore((state) => [state.loading, state.setLoading]);
  const setError = useGlobalStore((state) => state.setError);
  const setErrorMessage = useGlobalStore((state) => state.setErrorMessage);

  const handleUsernameChange = (event) => {

    setUsername({
      value: event.target.value,
      helperText: ' ',
      error: false,
    });

  };

  const handlePasswordChange = (event) => {

    setPassword({
      value: event.target.value,
      helperText: ' ',
      error: false,
    });

  };

  const handleClickShowPassword = () => {
    
    setShowPassword((show) => !show);

  }

  const handleMouseDownPassword = (event) => {

    event.preventDefault();
    
  };

  const handleSubmit = async (event) => {

    event.preventDefault();

    let status = 401, 
    error = null;

    if (!username.value) {

      setUsername((username) => ({
        value: username.value,
        helperText: 'Completează câmpul!',
        error: true,
      }));

    }

    if (!password.value) {

      setPassword((password) => ({
        value: password.value,
        helperText: 'Completează câmpul!',
        error: true,
      }));

    }

    if (username.value && password.value) {

      setLoading(true);
      setError(false);

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username.value,
            password: password.value,
        }),
      };

      try {

        const response = await fetch('/api/sessions', requestOptions);
        status = response.status;

      } catch (err) {

        // eslint-disable-next-line no-unused-vars
        error = err;

      } finally {

        setLoading(false);

        switch (status) {

          case 200: {

            navigate('/admin', {
              replace: true
            });
            break;

          }

          case 401: {

            setErrorMessage('Ai greșit utilizatorul sau parola!');
            setError(true);
            break;

          }

          default: {

            setErrorMessage('Eroare! Încearcă din nou în câteva secunde.');
            setError(true);
            break;

          }

        }

      }

    }

  };

  return (
    <Box
      sx={{
          margin: 0,
          height: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
      }}>
      <img
        src={tuaImage}
        alt='Logo traseul utilitar-aplicativ'
        width={300}
      />
      <form style={{
          padding: 0,
          height: '300px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          position: 'relative',
          flexShrink: 0,
        }}
        autoComplete='on'
        onSubmit={handleSubmit}>
        <TextField sx={{
            minWidth: '300px',
            width: '50%',
            maxWidth: '350px',
          }}
          autoFocus
          color='primary'
          InputProps={{
            startAdornment: <InputAdornment position='start'><PersonIcon color={username.error ? 'error' : 'primary'} /></InputAdornment>
          }}
          inputProps={{
            maxLength: 64
          }}
          name='username'
          autoComplete='username'
          value={username.value}
          helperText={username.helperText}
          error={username.error}
          disabled={loading}
          onChange={handleUsernameChange}/>
        <TextField sx={{
            minWidth: '300px',
            width: '50%',
            maxWidth: '350px',
          }}
          color='primary'
          InputProps={{
            startAdornment: <InputAdornment position='start'><KeyIcon color={password.error ? 'error' : 'primary'} /></InputAdornment>,
            endAdornment: <InputAdornment position='end'>
                <IconButton
                    aria-label='schimba vizibilitatea parolei'
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge='end'
                    color={password.error ? 'error' : 'primary'}
                    disabled={loading}
                    >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>,
          }}
          inputProps={{
            maxLength: 64
          }}
          name='password'
          type={showPassword ? 'text' : 'password'}
          autoComplete='current-password'
          value={password.value}
          helperText={password.helperText}
          error={password.error}
          disabled={loading}
          onChange={handlePasswordChange}/>
        <Button 
            type='submit'
            variant='contained'
            sx={{
              minWidth: '300px',
              width: '50%',
              maxWidth: '350px',
            }}
            color='primary'
            size='large'
            disabled={loading}>
            LOGIN
        </Button>
      </form>
    </Box>
  );

}