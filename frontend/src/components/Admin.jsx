import { useState, useEffect } from 'react';
import useRefreshToken from '../useRefreshToken';

import Login from './Login';

import Box from '@mui/system/Box';
import CircularProgress from '@mui/material/CircularProgress';


export default function Admin() {

  const [isLoggedIn, setLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);

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
          setLoggedIn(true);

        }

      }

    };

    // this is for when the page is first loaded or refreshed
    if (!isLoggedIn) {

      checkAuthorization();

    }

  }, [isLoggedIn, setAccessToken, setLoggedIn]);

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

    if (loading) {

      return (
        <Box
          sx={{
              margin: 0,
              padding: '2.5%',
              height: '100dvh',
              width: '100dvw',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
          }}>
          <CircularProgress
              size={64}
              color='primary'
              thickness={8}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-32px',
                marginLeft: '-32px',
              }}
              disableShrink
          />
        </Box>
      )

    }

    else if (isLoggedIn) {

      return (
        <>
          ADMIN
        </>
      )

    }

    return (
      <Login setLoggedIn={setLoggedIn}/>
    )
  }
  