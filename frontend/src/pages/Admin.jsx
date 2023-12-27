import { useState, useEffect } from 'react';

import { useLocation } from 'wouter';
import useRefreshToken from '../useRefreshToken';

import Box from '@mui/system/Box';


export default function Admin() {

  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useLocation();

  const tryRefreshToken = useRefreshToken();

  useEffect(() => {
    console.log('EFFECT')
    // TODO: fetch data after mounting the component
    // after every data fetch which returns a 401 status code, try to refresh the access token
    // if the refresh attempt fails, redirect (from server) to /admin/login
    // if redirected, follow the redirect, otherwise display the appropriate error message
    const fetchInitialData = async () => {

      let status = 401;

      setLoading(true);
    
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'follow'
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

  }, [tryRefreshToken]);

    return (
      <>ADMIN</>
    )
  }
  