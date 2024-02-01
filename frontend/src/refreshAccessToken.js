import { navigate } from 'wouter/use-location';
import { useGlobalStore } from './useGlobalStore.js';

const { setLoading } = useGlobalStore.getState();

export default async function refreshAccessToken(callback) {

  let error = null;

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'refresh_token'
    }),
    credentials: 'same-origin'
  };

  try {

    const response = await fetch('/api/authorizations', requestOptions);

    if (!response.ok) {

      throw new Error('Something happened');

    }

  } catch (err) {

    // eslint-disable-next-line no-unused-vars
    error = err;
    console.log(err);

  } finally {

    if (!error) {

      callback();

    } else {


      if (setLoading) {

        setLoading(false);

      }

      navigate('/admin/login', {
        replace: true
      });

    }

  }

}