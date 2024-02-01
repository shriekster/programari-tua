
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { useRoute } from 'wouter';
import { navigate } from 'wouter/use-location';

import { useGlobalStore } from '../useGlobalStore.js';

// get the functions from the global store as non-reactive, fresh state,
// because this proves the linter that the functions are not changing between renders
// why? because it's annoying to specify functions as effect depedencies and I could not think of
// a better solution, at least for now
const {
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

export default function Appointments() {

  const [loading, setLoading] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  const [match, params] = useRoute('/appointments/:pageId');

  // add the 'visibilitychange' event listener and remove it when the component unmounts
  useEffect(() => {

    const fetchAppointment = async () => {

      setLoading(true);

      let error = null, status = 401, data = null;

      try {

        const requestOptions = {
            method: 'GET',
            credentials: 'same-origin'
        };

        const response = await fetch(`/api/appointments/${params.pageId}`, requestOptions);
        status = response.status;

        data = await response.json();


    } catch (err) {

        // eslint-disable-next-line no-unused-vars
        error = err;
        status = 400; // client-side error

    } finally {

      setLoading(false);

    }

    switch (status) {

        case 200: {

            setLoading(false);

            if (data) {

              //

            }

            break;

        }

        default: {

            setLoading(false);
            setErrorMessage('Eroare! Încearcă din nou în câteva secunde.');
            setError(true);
            break;

        }

    }

    };
  
    // eslint-disable-next-line no-unused-vars
    const onVisibilityChange = (e) => {

      if ('visible' === document.visibilityState) {

        if (params.pageId) {

          fetchAppointment();
    
        }

      }

    };

    if (params.pageId) {

      fetchAppointment();

    }

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {

      document.removeEventListener('visibilitychange', onVisibilityChange);

    };

  }, [params.pageId]);

  return (
    <Box sx={{
      margin: 0,
      padding: 0,
      position: 'relative',
    }}>
      <Box sx={{
        margin: 0,
        padding: 0,
        height: 'calc(100dvh - 56px)',
      }}>
        Pagina {params.pageId}
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
  )
}
  