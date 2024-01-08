import { useState } from 'react';

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

  const [loading, setLoading] = useState(true);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ro'>
      <Header
        loading={loading}
        setLoading={setLoading}/>
      <Switch>
        <Route path='/admin/login'>
          <Login
            loading={loading}
            setLoading={setLoading}/>
        </Route>
        <Route path='/admin'>
          <Admin
            loading={loading}
            setLoading={setLoading}/>
        </Route>
        <Route path='/admin/profile'>
          <Profile
            loading={loading}
            setLoading={setLoading}/>
        </Route>
        <Route path='/appointments/:pageId' component={Appointments} />
        <Route path='/' component={Home} />
        <Route path='/:anything*' component={NotFound} />
      </Switch>
    </LocalizationProvider>
  )
}

export default App
