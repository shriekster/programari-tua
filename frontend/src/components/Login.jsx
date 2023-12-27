import { useState, forwardRef } from 'react';

import { useLocation } from 'wouter';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/system/Box';
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

import tuaImage from '../assets/tua.webp';


const loginTheme = createTheme({
    palette: {
        primary: {
        main: '#7f805d'
        },
        mode: 'dark'
    },
    
});

const Login = forwardRef((props, ref) => {
  
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
    const [showError, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
  
    const [location, setLocation] = useLocation();
  
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

    const handleClose = (event, reason) => {

      if (reason === 'clickaway') {
        return;
      }
  
      setError(false);

    };
  
    // TODO: finish the submit handler
    const handleSubmit = async (event) => {
  
      event.preventDefault();

      let status = 0, 
      ok = false, 
      redirected = false,
      url = '',
      error = null;
  
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
        setError(false);
  
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
          status = response.status;
          ok = response.ok;
          redirected = response.redirected;
          url = response.url;

          if (!response.ok) {

            throw new Error('Something happened')

          }
  
        } catch (err) {
  
          error = err;
  
        } finally {
  
          setLoading(false);

          if (error) {

            // HTTP 401: Unauthorized
            if (401 === status) {

              setErrorMessage('Ai greșit utilizatorul sau parola!');

            } else {

              // Any other client-side or server-side error
              if (400 <= status && status <= 599) {

                setErrorMessage('Eroare! Încearcă din nou în câteva secunde.');

              }

            }

            setError(true);

          } else {

            if (ok && redirected && url) {

              setLocation(url, { replace: true });
    
            }

          }
  
        }
  
      }
  
    };

    return (
      <ThemeProvider theme={loginTheme}>
        <Box ref={ref}
            sx={{
                margin: 0,
                padding: '2.5%',
                height: '100dvh',
                width: '100dvw',
                display: 'flex',
                flexDirection: 'column',
            }}>
            <img
            src={tuaImage}
            alt='Logo traseul utilitar-aplicativ'
            width={300}
            style={{
                margin: 'auto'
            }}
            />
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
            </form>
            <Snackbar open={showError} autoHideDuration={6000} onClose={handleClose}>
              <Alert onClose={handleClose} severity='error' variant='outlined' sx={{ width: '100%' }}>
                {errorMessage}
              </Alert>
            </Snackbar>
        </Box>
      </ThemeProvider>
    )

  });

  Login.displayName = 'Login';
  

  export default Login;