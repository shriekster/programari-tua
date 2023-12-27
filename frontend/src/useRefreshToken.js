export default function useRefreshToken() {

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


    } catch (err) {

      console.log(err);

    }

  };

  return tryRefreshToken;

}
