
export default async function refreshAccessToken() {

  // TODO: refresh the access token and then retry the action provided in the callback function
  let error = null, 
    status = 401;

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
    status = response.status;

    if (!response.ok) {

      throw new Error('Something happened');

    }

  } catch (err) {

    // eslint-disable-next-line no-unused-vars
    error = err;
    console.log(err);

  }

  return status;

}