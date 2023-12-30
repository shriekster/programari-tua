import { useState, useEffect } from 'react';
import useRefreshToken from '../useRefreshToken';

import { useLocation } from 'wouter';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LogoutIcon from '@mui/icons-material/Logout';

import CircularProgress from '@mui/material/CircularProgress';

import TuaIcon from './TuaIcon';


export default function Admin({ accessToken, setAccessToken }) {

  const [loading, setLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const [location, setLocation] = useLocation();

  //const tryRefreshToken = useRefreshToken();

  const handleLogout = async () => {

    let status = 401,
    error = null;

    const requestOptions = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    setMenuAnchor(null);
    setLoading(true);

    await new Promise((resolve) => {

      let t = setTimeout(() => {

        clearTimeout(t);
        resolve();

      }, 2000);

    })

    try {

      const response = await fetch('/api/authorizations/current', requestOptions);
      status = response.status;

      if (!response.ok) {

        throw new Error('Something happened')

      }

    } catch (err) {

      // eslint-disable-next-line no-unused-vars
      error = err;

    } finally {

      //setLoading(false);

      switch (status) {


        case 200: {

          setAccessToken('');
          setLocation('/admin/login', {
            replace: true
          });
          break;

        }

        default: {

          //setErrorMessage('Eroare! Încearcă din nou în câteva secunde.');
          //setError(true);
          break;

        }

      }

    }

  };

  useEffect(() => {

    const checkAuthorization = async () => {

      let accessToken = '',
      error = null;

      setLoading(true);
    
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'refresh_token'
        }),
      };

      try {

        const response = await fetch('/api/authorizations', requestOptions);

        if (!response.ok) {

          throw new Error('Invalid authorization!');

        }

        const json = await response.json();
        accessToken = json?.data?.accessToken;

      } catch (err) {

        error = err;

      } finally {

        setLoading(false);

        if (!error) {

          setAccessToken(accessToken);

        } else {

          setLocation('/admin/login', {
            replace: true
          });

        }

      }

    };

    // skip the request if the user is already logged in
    if (!accessToken) {
      
      checkAuthorization();

    }

  }, [accessToken, setLocation, setAccessToken]);

  useEffect(() => {

    // TODO: fetch data after mounting the component
    // after every data fetch which returns a 401 status code, try to refresh the access token
    // if the refresh attempt fails, display the login component
    const fetchInitialData = async () => {

      let status = 401;

      setLoading(true);
    
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      try {

        const response = await fetch('/api/dates', requestOptions);
        status = response.status;

        const json = await response.json();

        console.log(json)

      } catch (err) {

        console.log(err)

      } finally {

        setLoading(false);

      }

      return status;

    };

    //const status = fetchInitialData();

    //if (401 === status) {

      //tryRefreshToken();

    //}

  }, []);

  const handleOpenUserMenu = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {

    setMenuAnchor(null);

  };

  return (
    <>
      <AppBar position="static" elevation={2}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
            <TuaIcon sx={{ fontSize: '28px' }} />
            <Typography
              variant='h5'
              noWrap
              sx={{
                mr: 2,
                display: 'flex',
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              TUA
            </Typography>
            <Box sx={{ flexGrow: 0}}>
              <Tooltip title='Setări'>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}
                  size='large'
                  disabled={loading}>
                  <MenuIcon fontSize='large' />
                </IconButton>
              </Tooltip>
              <Menu
                id='menu'
                keepMounted
                anchorEl={menuAnchor}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                open={Boolean(menuAnchor)}
                onClose={handleCloseUserMenu}
                slotProps={{
                  paper: {
                    elevation: 6,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: .5,
                      '&::before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 12,
                        width: 10,
                        height: 10,
                        backgroundColor: 'rgb(18, 18, 18)',
                        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.11))',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  }
                }}
                >
                <MenuItem onClick={handleCloseUserMenu}>
                  <ListItemIcon><ManageAccountsIcon /></ListItemIcon>
                  <ListItemText>Profil</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon><LogoutIcon color='error'/></ListItemIcon>
                  <ListItemText sx={{ color: '#F44336' }}>Deconectare</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <DateCalendar
        views={['day']}
        displayWeekNumber
        showDaysOutsideCurrentMonth
        disabled={loading}
        loading={loading}
        renderLoading={() => <DayCalendarSkeleton />}
        />
    </>
  );

}
  