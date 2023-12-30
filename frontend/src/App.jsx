import { useState } from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ro';

import { Route, Switch } from 'wouter';

import Home from './components/Home';
import Appointments from './components/Appointments';
import Login from './components/Login';
import Admin from './components/Admin';
import NotFound from './components/NotFound';

/* 
  in wouter, any Route with empty path is considered always active. 
  This can be used to achieve "default" route behaviour within Switch. 
  Note: the order matters! 
*/
function App() {

  const [accessToken, setAccessToken] = useState('');

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ro'>
      <Switch>
        <Route path='/admin'>
          <Admin accessToken={accessToken}
            setAccessToken={setAccessToken}/>
        </Route>
        <Route path='/admin/login'>
          <Login setAccessToken={setAccessToken}/>
        </Route>
        <Route path='/appointments/:pageId' component={Appointments} />
        <Route path='/' component={Home} />
        <Route path='/:anything*' component={NotFound} />
      </Switch>
    </LocalizationProvider>
  )
}

export default App
