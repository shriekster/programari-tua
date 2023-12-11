'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/Key';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const theme = createTheme({
  palette: {
    primary: {
      main: '#7f805d'
    },
    mode: 'dark'
  },
  
});

// TODO: test and change the project's file and folder structure
// TODO: add validation and error state to the text fields (input maxsize, empty input)
// TODO: add an error message when the username and/or password are/is wrong
export default function LoginForm() {

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
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(false);

  const router = useRouter();

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

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // TODO: finish the submit handler -> fetch + display a loader while fetching
  const handleSubmit = async (event) => {

    event.preventDefault();

    if (!username.value || !password.value) {

      setUsername((username) => ({
        value: username.value,
        helperText: 'Completează câmpul!',
        error: true,
      }));

      setPassword((password) => ({
        value: password.value,
        helperText: 'Completează câmpul!',
        error: true,
      }));

    } else {

      setLoading(true);

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'follow',
        body: JSON.stringify({
          username: username.value,
          password: password.value,
        }),
      };

      try {

        const response = await fetch('/api/sessions', requestOptions);
        console.log('redirected?', response.redirected, response)

        if (response.redirected) {

          router.replace(response.url);

        }
        //const json = await response.json();

        //console.log(json)

      } catch (err) {

        // TODO

      } finally {

        // TODO

      }


    }

  };

  return (
    <ThemeProvider theme={theme}>
      <form style={{
          margin: 'auto',
          padding: 0,
          height: '50dvh',
          minHeight: '350px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          position: 'relative'
        }}
        autoComplete='on'
        onSubmit={handleSubmit}>
          {/*
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
          {
            loading && (
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
          */}
      </form>
    </ThemeProvider>
  )
}