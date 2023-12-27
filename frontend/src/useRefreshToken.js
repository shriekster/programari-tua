import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

export function useRefreshToken() {

  const [location, setLocation] = useLocation();

  useEffect(() => {

    const checkAuthorization = async () => {

      //setLoading(true);
    
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

        //setLoading(false);

      }

    };

    checkAuthorization();

  }, [setLocation]);

}
