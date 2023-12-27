import { useState, useEffect } from 'react';
import useRefreshToken from '../useRefreshToken';

import Login from './Login';

import Box from '@mui/system/Box';


export default function Admin() {

  const [isLoggedIn, setLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);

  //const tryRefreshToken = useRefreshToken();

  useEffect(() => {

    const checkAuthorization = async () => {

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
        const json = await response.json();
        console.log(json)

        

      } catch (err) {

        console.log(err)

      } finally {

        setLoading(false);

      }

    };

    // this is for when the page is first loaded or refreshed
    if (!isLoggedIn) {

      checkAuthorization();

    }

  }, [isLoggedIn]);

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

    if (isLoggedIn) {

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
  