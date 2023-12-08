'use client';

import { useState } from 'react';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/Key';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

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

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // TODO: finish the submit handler -> fetch + display a loader while fetching
  const handleSubmit = async (event) => {

    event.preventDefault();

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
              startAdornment: <InputAdornment position='start'><PersonIcon color='primary' /></InputAdornment>
            }}
            name='username'
            autoComplete='username'/>
          <TextField sx={{
              minWidth: '300px',
              width: '50%',
              maxWidth: '350px',
            }}
            color='primary'
            InputProps={{
              startAdornment: <InputAdornment position='start'><KeyIcon color='primary' /></InputAdornment>,
              endAdornment: <InputAdornment position='end'>
                  <IconButton
                    aria-label='schimba vizibilitatea parolei'
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge='end'
                    color='primary'
                    >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>,
            }}
            name='password'
            type={showPassword ? 'text' : 'password'}
            autoComplete='current-password'/>
          <Button 
            type='submit'
            variant='contained'
            sx={{
              minWidth: '300px',
              width: '50%',
              maxWidth: '350px',
            }}
            color='primary'
            size='large'>
            LOGIN
          </Button>
      </form>
    </ThemeProvider>
  )
}