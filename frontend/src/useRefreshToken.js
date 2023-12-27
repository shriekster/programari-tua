import { useLocation } from 'wouter';

export default function useRefreshToken() {

  const [location, setLocation] = useLocation();

  const tryRefreshToken = async () => {

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      body: JSON.stringify({
          api: true
      }),
    };

    try {

      const response = await fetch('/api/authorizations', requestOptions);

      if (response.redirected) {

        setLocation(response.url, { replace: true });

      }

    } catch (err) {

      console.log(err);

    }

  };

  return tryRefreshToken;

}
