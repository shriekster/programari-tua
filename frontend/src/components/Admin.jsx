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

import CircularProgress from '@mui/material/CircularProgress';

import TuaIcon from './TuaIcon';

import Header from './Header';


// eslint-disable-next-line react/prop-types
export default function Admin({ accessToken, setAccessToken }) {

  const [loading, setLoading] = useState(false);
  const [profileInfo, setProfileInfo] = useState({});
  const [dates, setDates] = useState(null);
  const [timeRanges, setTimeRanges] = useState(null);
  const [appointments, setAppointments] = useState(null);

  // eslint-disable-next-line no-unused-vars
  const [location, setLocation] = useLocation();

  //const tryRefreshToken = useRefreshToken();

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
    const fetchCalendarData = async () => {
      
      let status = 401, data = null;

      setLoading(true);
    
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      };

      try {

        const response = await fetch('/api/dates/all/timeranges/all', requestOptions);
        status = response.status;

        const json = await response.json();
        data = json?.data;

        console.log(json)

      } catch (err) {

        console.log(err)

      } finally {

        setLoading(false);

      }

      return data;

    };

    const fetchProfileInfo = async () => {
      
      let status = 401, data = null;

      setLoading(true);
    
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      };

      try {

        const response = await fetch('/api/profiles/1', requestOptions);
        status = response.status;

        const json = await response.json();
        data = json?.data;

        console.log(json)

      } catch (err) {

        console.log(err)

      } finally {

        setLoading(false);

        if (200 === status && data && data?.profile) {

          setProfileInfo(data.profile);

        }

      }

      return data;

    };

    const fetchInParallel = async () => {

      const tasks = [new Promise(fetchCalendarData), new Promise(fetchProfileInfo)];

      const results = await Promise.all(tasks);
      console.log({results})

    };

    if (accessToken) {

      fetchInParallel();

    }

  }, [accessToken]);

  return (
    <>
    <Header accessToken={accessToken}
      setAccessToken={setAccessToken}
      loading={loading}
      setLoading={setLoading}
      hasMenu
      profileInfo={profileInfo}
      setProfileInfo={setProfileInfo}
      />
      <DateCalendar 
        views={['day']}
        showDaysOutsideCurrentMonth
        displayWeekNumber
        disabled={loading}
        loading={loading}
        renderLoading={() => <DayCalendarSkeleton />}/>
    </>
  );

}
  