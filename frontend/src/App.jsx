import { useState, useCallback } from 'react';

import { Route, Switch } from 'wouter';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ro';

import Header from './components/Header';
import Home from './components/Home';
import Appointments from './components/Appointments';
import Login from './components/Login';
import Admin from './components/Admin';
import Profile from './components/Profile';
import NotFound from './components/NotFound';

/* 
  In wouter, any Route with empty path is considered always active. 
  This can be used to achieve "default" route behaviour within Switch. 
  Note: the order matters! 
*/
function App() {

  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);

  const refreshThenRetry = useCallback(async (callback) => {

    // TODO: refresh the access token and then retry the action provided in the callback function
    let error = null, _accessToken = null;
  
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
  
        throw new Error('Something happened');
  
      }
  
      const json = await response.json();
  
      _accessToken = json?.data?.accessToken;
  
    } catch (err) {
  
      error = err;
      console.log(err);
  
    } finally {
  
      if (!error && _accessToken) {
  
        setAccessToken(_accessToken);
        callback();
  
      }
  
    }

  }, [setAccessToken]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ro'>
      <Header accessToken={accessToken}
        setAccessToken={setAccessToken}
        loading={loading}
        setLoading={setLoading}/>
      <Switch>
        <Route path='/admin/login'>
          <Login setAccessToken={setAccessToken}
            loading={loading}
            setLoading={setLoading}/>
        </Route>
        <Route path='/admin'>
          <Admin accessToken={accessToken}
            loading={loading}
            setLoading={setLoading}
            refreshThenRetry={refreshThenRetry}/>
        </Route>
        <Route path='/admin/profile'>
          <Profile accessToken={accessToken}
            loading={loading}
            setLoading={setLoading}
            refreshThenRetry={refreshThenRetry}
            />
        </Route>
        <Route path='/appointments/:pageId' component={Appointments} />
        <Route path='/' component={Home} />
        <Route path='/:anything*' component={NotFound} />
      </Switch>
    </LocalizationProvider>
  )
}

export default App
