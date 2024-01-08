import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
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
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MapIcon from '@mui/icons-material/Map';
import CircularProgress from '@mui/material/CircularProgress';

import { navigate } from 'wouter/use-location';

import refreshAccessToken from '../refreshAccessToken.js';

// eslint-disable-next-line react/prop-types
export default function Admin({ loading, setLoading }) {

  const [dates, setDates] = useState(null);
  const [timeRanges, setTimeRanges] = useState(null);
  const [appointments, setAppointments] = useState(null);

  const [disableAdd, setAddDisabled] = useState(false);
  const [disableDownload, setDownloadDisabled] = useState(false);

  useEffect(() => {

    // TODO: make sure this effect runs when it's supposed to run!
    // TODO: refresh the access token if it's expired or missing
    const fetchInitialData = async () => {

      setLoading(true);

      let data, errors, notAuthorized = false;

      const endpoints = [
        '/api/admin/dates/all',
        '/api/admin/timeranges/all',
        '/api/admin/appointments/all'
      ];

      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      try {

        const requests = endpoints.map((endpoint) => fetch(endpoint, requestOptions));
        const responses = await Promise.all(requests);
        const errors = responses.filter((response) => !response.ok);

        notAuthorized = responses.every(response => 401 === response.status);

        if (errors.length > 0) {

          throw errors.map((response) => Error(response.statusText));

        }

        const json = responses.map((response) => response.json());
        data = await Promise.all(json);

        //console.log(data);

      } catch (err) {

        errors = err;

      } finally {
        
        if (!errors || 0 === errors?.length) {

          setLoading(false);

          //setProfileInfo(data[0].data.profile); // temporary
          for (let i = 0, n = data.length; i < n; ++i) {

            //

          }

        } else {

          if (notAuthorized) {
            
            const status = await refreshAccessToken();

            if (401 === status) {

              navigate('/admin/login', {
                replace: true
              });  

            } 

            else 

            if (200 === status) {

              await fetchInitialData();

            }

          }

        }

      }

    };

    fetchInitialData();

  }, [setLoading]);

  return (
    <Box sx={{
        margin: 0,
        padding: 0,
        position: 'relative'
      }}>
      <DateCalendar 
        views={['day']}
        showDaysOutsideCurrentMonth
        displayWeekNumber
        disabled={loading}
        loading={loading}
        renderLoading={() => <DayCalendarSkeleton />}
        />
        <Box sx={{
          width: '320px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '40px',
        }}>
          <IconButton color='primary'
            disabled={disableAdd}>
            <AddCircleIcon fontSize='large'/>
          </IconButton>
          <IconButton color='success'
            disabled={disableDownload}>
            <FileDownloadIcon fontSize='large'/>
          </IconButton>
        </Box>

    </Box>
  );

}
  