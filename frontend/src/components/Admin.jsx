
// TODO: 'global' snackbar
// TODO: find a solution for geocoding (location search)
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SettingsIcon from '@mui/icons-material/Settings';
import Divider from '@mui/material/Divider';

import dayjs from 'dayjs';

import { fetchEventSource } from '@microsoft/fetch-event-source';

import { useGlobalStore } from '../useGlobalStore.js';

import refreshAccessToken from '../refreshAccessToken.js';

import DateAdd from './DateAdd.jsx';
import TimeRange from './TimeRange.jsx';


// get the functions from the global store as non-reactive, fresh state,
// because this proves the linter that the functions are not changing between renders
// why? because it's annoying to specify functions as effect depedencies and I could not think of
// a better solution, at least for now
const {
  setLoading,
  setSubscriptionId,
  setLocationsDownloaded,
  setLocations,
  setProfileDownloaded,
  setProfileUrl,
  setFullName,
  setPhoneNumber,
  setRegistryDownloaded,
  setDates,
  setTimeRanges,
  setAppointments,
  setPersonnelCategories,
  setError,
  setErrorMessage,
} = useGlobalStore.getState();

// eslint-disable-next-line react/prop-types
export default function Admin() {

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeRangeId, setSelectedTimeRangeId] = useState(0);
  const [openAddDate, setOpenAddDate] = useState(false);
  const [openAddTimeRange, setOpenAddTimeRange] = useState(false);
  const [openEditTimeRange, setOpenEditTimeRange] = useState(false);

  const [displaySettings, setDisplaySettings] = useState(false);

  const loading = useGlobalStore((state) => state.loading);
  const subscriptionId = useGlobalStore((state) => state.subcriptionId);
  const dates = useGlobalStore((state) => state.dates);
  const timeRanges = useGlobalStore((state) => state.timeRanges);
  const appointments = useGlobalStore((state) => state.appointments);
  const personnelCategories = useGlobalStore((state) => state.personnelCategories);

  const handleChangeSelectedDate = (newDate) => {

    setSelectedDate(newDate);

  };

  const handleToggleAddDate = (bool = undefined) => {

    if (undefined !== bool) {

      setOpenAddDate(bool);

    } else {

      setOpenAddDate((prevState) => !prevState);

    }

  };



  // subscribe to admin events
  // AND get relevant data (profile and registry data)
  useEffect(() => {

    // this flag is needed because after the SSE connection is opened,
    // the admin receives profile and registry data and the
    // the UI should no longer be in a 'loading' state,
    // so when the first message arrives, the state is updated accordingly
    let initiallyWaitingForData = true;

    setLoading(true);

    class RetriableError extends Error { }
    class FatalError extends Error { }

    const abortController = new AbortController();
    const eventStreamContentType = 'text/event-stream; charset=utf-8';

    const subscriptionIdRegex = /^[a-zA-Z0-9]{16}$/;
    
    fetchEventSource('/api/admin/events', {

      async onopen(response) {

        const contentTypeHeader = response.headers.get('content-type');
        const subscriptionIdHeader = response.headers.get('x-subscription-id');

        const everythingIsGood = 
          response.ok                                   && 
          eventStreamContentType === contentTypeHeader  &&
          subscriptionIdRegex.test(subscriptionIdHeader);

        if (everythingIsGood) {
          
          setSubscriptionId(subscriptionIdHeader);
          return; // everything's good

        } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          
          if (401 === response.status) {

            // try to refresh the access token if it's expired,
            // then retry
            await refreshAccessToken(fetchEventSource);

          } else {

            // non-retriable error for every other client-side error:
            throw new FatalError();

          }

        } else {

            throw new RetriableError();

        }

      },

      onmessage(msg) {

        // if the server emits an error message, throw an exception
        // so it gets handled by the onerror callback below:
        if (msg.event === 'FatalError') {

            throw new FatalError(msg.data);

        }

        if (initiallyWaitingForData) {

          // TODO: first update the profile and registry data
          // TODO: then update the flag and the loading state

          initiallyWaitingForData = false;
          setLoading(false);

        }

        console.log({msg})

      },

      onclose() {

        // if the server closes the connection unexpectedly, retry:
        throw new RetriableError();

      },

      onerror(err) {
        
        if (err instanceof FatalError) {

            throw err; // rethrow to stop the operation

        } else {
            // do nothing to automatically retry. You can also
            // return a specific retry interval here.
            return 1000;
        }

      },

      signal: abortController.signal,

    });

    // unsubscribe from admin events
    return () => {

      console.log('Unsubscribing...');
      abortController.abort();

    };

  }, []);

  // this effect 'configures' whether the settings button is displayed or not
  useEffect(() => {

    if (dates && selectedDate) {

      const localeDate = selectedDate.$d.toLocaleDateString('ro-RO');

      if (dates.has(localeDate)) {

        setDisplaySettings(true);

      } else {

        setDisplaySettings(false);

      }

    } else {

      setDisplaySettings(false);

    }

  }, [dates, selectedDate]);

  return (
    <Box sx={{
        margin: 0,
        padding: 0,
      }}>
      <DateCalendar 
        views={['day']}
        showDaysOutsideCurrentMonth
        displayWeekNumber
        disabled={loading}
        loading={loading}
        renderLoading={() => <DayCalendarSkeleton />}
        value={selectedDate}
        onChange={handleChangeSelectedDate}
        />
        <Box sx={{
          width: '320px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '40px',
        }}>
          <Divider variant='fullWidth' sx={{ width: '100%', flex: 1 }} />
          {
            displaySettings && (
              <IconButton color='primary' disabled={loading}>
                <SettingsIcon fontSize='large' />
              </IconButton>
            )
          }
        </Box>

          {
            selectedDate ? (
              displaySettings ? (
                <List sx={{
                  width: '320px',
                  margin: '0 auto'
                }}>
                  {
                    dates.map((date) => (
                      <ListItem key={date.id}>
                        
                      </ListItem>
                    ))
                  }
                </List>
              ) : (
                <Button variant='contained' 
                  sx={{ display: 'block', margin: '0 auto' }}
                  disabled={loading}
                  onClick={handleToggleAddDate}>
                  Configurează ziua de antrenament
                </Button>
              )
            ) : (
              <Typography textAlign='center' sx={{ color: 'rgba(255, 255, 255, .5)', cursor: 'default', userSelect: 'none' }}>
                Selectează o zi din calendar
              </Typography>
            )
          }
        <DateAdd open={openAddDate} 
          handleClose={handleToggleAddDate}
          date={selectedDate}/>
        {/*<TimeRange />*/}
    </Box>
  );

}
  