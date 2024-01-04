import { useState, useEffect } from 'react';
//import useRefreshToken from '../useRefreshToken';

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
//
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import CircularProgress from '@mui/material/CircularProgress';

import TuaIcon from './TuaIcon';

import Header from './Header';

// eslint-disable-next-line react/prop-types
export default function Admin() {

  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [profileInfo, setProfileInfo] = useState({});
  const [dates, setDates] = useState(null);
  const [timeRanges, setTimeRanges] = useState(null);
  const [appointments, setAppointments] = useState(null);

  // eslint-disable-next-line no-unused-vars
  const [location, setLocation] = useLocation();

  const refreshThenRetry = async (callback) => {

    let error = null, _accessToken = null;
  
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          api: true
      }),
    };
  
    try {
  
      const response = await fetch('/api/authorizations', requestOptions);
  
      if (!response.ok) {
  
        throw new Error('Something happened');
  
      }
  
      const json = await response.json();
  
      _accessToken = json?.data?.accessToken;
  
    } catch (err) {
  
      error = err;
      console.log(err);
  
    } finally {
  
      if (!error && _accessToken) {
  
        setAccessToken(_accessToken);
        callback();
  
      }
  
    }
  
  };

  useEffect(() => {
    
    const tryGetAccessToken = async () => {

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

        if (!error) {

          setAccessToken(accessToken);

        } else {

          // TODO: display an error snackbar if there's an error
          setLoading(false);
          setLocation('/admin/login', {
            replace: true
          });

        }

      }

    };

    tryGetAccessToken();

  }, [setLocation]);

  useEffect(() => {
    // TODO: fetch data after mounting the component
    // after every data fetch which returns a 401 status code, try to refresh the access token
    // if the refresh attempt fails, display the login component
    const fetchInitialData = async () => {

      setLoading(true);

      let  data, errors;

      const endpoints = [
        '/api/admin/profiles/1',
        '/api/admin/dates/all',
        '/api/admin/timeranges/all',
        '/api/admin/appointments/all'
      ];

      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      };

      try {

        const requests = endpoints.map((endpoint) => fetch(endpoint, requestOptions));
        const responses = await Promise.all(requests);
        const errors = responses.filter((response) => !response.ok);

        if (errors.length > 0) {
          throw errors.map((response) => Error(response.statusText));
        }

        const json = responses.map((response) => response.json());
        data = await Promise.all(json);

        //console.log(data);

      } catch (err) {

        errors = err;

      } finally {

        setLoading(false);

        if (!errors || 0 === errors?.length) {

          setProfileInfo(data[0].data.profile); // temporary
          for (let i = 0, n = data.length; i < n; ++i) {

            //

          }

        }

      }

    };

    if (accessToken) {
      
      fetchInitialData();

    }

  }, [accessToken]);

  return (
    <Box sx={{
        margin: 0,
        padding: 0,
        position: 'relative'
      }}>
      <Header accessToken={accessToken}
        loading={loading}
        setLoading={setLoading}
        hasMenu
        profileInfo={profileInfo}
        setProfileInfo={setProfileInfo}
        refreshThenRetry={refreshThenRetry}
        />
      <DateCalendar 
        views={['day']}
        showDaysOutsideCurrentMonth
        displayWeekNumber
        disabled={loading}
        loading={loading}
        renderLoading={() => <DayCalendarSkeleton />}/>
        <Box sx={{
          width: '320px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          height: '40px',
        }}>
          <Button startIcon={<FileDownloadIcon />} 
            size='medium'
            variant='contained'
            sx={{ width: '120px' }}
            >
            Descarcă
          </Button>
          <Button startIcon={<AddCircleIcon />} 
            size='medium'
            variant='contained'
            sx={{ width: '120px' }}
            >
            Adaugă
          </Button>
        </Box>
        <Box sx={{// TODO: determine the optimal height; 100dvh - 430px fits the screen without overflow
          height: 'calc(100dvh - 430px)',
          border: '1px solid red'
        }}>
          TEST
        </Box>
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
    </Box>
  );

}
  