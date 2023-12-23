import { useState, useEffect } from 'react';

import { useLocation } from 'wouter';

import useGlobalStore from '../globalStore';

import Box from '@mui/system/Box';


export default function Admin() {

  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useLocation();

  const [isAdmin, setAdmin] = useGlobalStore((state) => [state.isAdmin, state.setAdmin]);

  useEffect(() => {

    // TODO: fetch data after mounting the component
    // after every data fetch which returns a 401 status code, try to refresh the access token (globalStore hook which exposes a fetching method);
    // if the refresh attempt fails, redirect (from server) to /admin/login
    // if redirected, follow the redirect, otherwise display the appropriate error message
    const checkAuthorization = async () => {

      setLoading(true);
    
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'follow',
        body: JSON.stringify({
            test: 'test'
        }),
      };

      try {

        const response = await fetch('/api/authorizations', requestOptions);
        console.log('redirected?', response.redirected, response)

        if (response.redirected) {

          setLocation(response.url, { replace: true });

        }
        //const json = await response.json();

        //console.log(json)

      } catch (err) {

        // TODO

      } finally {

        setLoading(false);

      }

    };

    
    //if (!isAdmin) {

      checkAuthorization();

    //}

  }, []);

    return (
      <>ADMIN</>
    )
  }
  