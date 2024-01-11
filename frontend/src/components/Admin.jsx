// TODO: subscribe to admin events (SSE)
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
import PlaceIcon from '@mui/icons-material/Place';
import CircularProgress from '@mui/material/CircularProgress';

import { fetchEventSource } from '@microsoft/fetch-event-source';

import { useGlobalStore } from '../useGlobalStore.js';

import refreshAccessToken from '../refreshAccessToken.js';

// get the functions from the global store as non-reactive, fresh state,
// because this proves the linter that the functions are not changing between renders
// why? because it's annoying to specify functions as effect depedencies and I could not think of
// a better solution, at least for now
const {
  setLoading,
  setSubcriptionId,
  setProfileDownloaded,
  setProfileUrl,
  setFullName,
  setPhoneNumber,
  setRegistryDownloaded,
  setLocations,
  setDates,
  setTimeRanges,
  setAppointments,
  setPersonnelCategories,
} = useGlobalStore.getState();

// eslint-disable-next-line react/prop-types
export default function Admin() {

  const loading = useGlobalStore((state) => state.loading);
  const subscriptionId = useGlobalStore((state) => state.subcriptionId);

  // subscribe to admin events
  // AND get relevant data (profile and registry data)
  // TODO: make sure to refresh the access token if it expires!
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
    
    fetchEventSource('/api/admin/events', {

      async onopen(response) {

        if (response.ok && 
            eventStreamContentType === response.headers.get('content-type')) {

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
        console.log(err, typeof err)
        if (err instanceof FatalError) {

            throw err; // rethrow to stop the operation

        } else {
            // do nothing to automatically retry. You can also
            // return a specific retry interval here.
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

  // download data
  useEffect(() => {

    const {
      profileDownloaded,
      registryDownloaded
    } = useGlobalStore.getState();

    // TODO: make sure this effect runs when it's supposed to run!
    // TODO: refresh the access token if it's expired or missing
    const fetchRegistryAndProfile = async () => {
      
      setLoading(true);

      let data, errors, notAuthorized = false;

      const endpoints = [
        '/api/admin/profiles/current',
        '/api/admin/dates',
        '/api/admin/timeranges',
        '/api/admin/appointments'
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

        } else if (notAuthorized) {
            
          await refreshAccessToken(fetchRegistryAndProfile);

        }

      }

    };

    // if the profile or the registry have not been downloaded,
    // download them both
    //if (!profileDownloaded || !registryDownloaded) {

    //  fetchRegistryAndProfile();

    //}

  }, []);

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
          <IconButton color='secondary'
            disabled={loading}
            >
            <PlaceIcon fontSize='large'/>
          </IconButton>
          <IconButton color='primary'
            disabled={loading}>
            <AddCircleIcon fontSize='large'/>
          </IconButton>
          <IconButton color='success'
            disabled={loading}>
            <FileDownloadIcon fontSize='large'/>
          </IconButton>
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
  