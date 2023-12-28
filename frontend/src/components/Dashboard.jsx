
import { useState, useEffect } from 'react';

import Button from '@mui/material/Button';

export default function Dashboard({ setLoggedIn, accessToken, setAccessToken }) {

  const handleLogout = async () => {

    let status = 401,
    error = null;

    const requestOptions = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {

      const response = await fetch('/api/authorizations/current', requestOptions);
      status = response.status;

      if (!response.ok) {

        throw new Error('Something happened')

      }

    } catch (err) {

      // eslint-disable-next-line no-unused-vars
      error = err;

    } finally {

      //setLoading(false);

      switch (status) {

        case 200: {

          setLoggedIn(false);
          setAccessToken('');
          break;

        }

        case 401: {

          //setErrorMessage('Ai greșit utilizatorul sau parola!');
          //setError(true);
          break;

        }

        default: {

          //setErrorMessage('Eroare! Încearcă din nou în câteva secunde.');
          //setError(true);
          break;

        }

      }

    }

  };

  return (
    <>
    DASHBOARD
    <Button onClick={handleLogout}>
      LOGOUT
    </Button>
    </>
  )

}