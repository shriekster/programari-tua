import { Suspense, lazy } from 'react';

import { Route, Switch } from 'wouter';

import Box from '@mui/material/Box';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ro';

import Header from './components/Header';
import Loading from './components/Loading';

// most of the 'page' components are loaded lazily
const Home = lazy(() => import('./components/Home'));
const Appointments = lazy(() => import('./components/Appointments'));
const Login = lazy(() => import('./components/Login'));
const Admin = lazy(() => import('./components/Admin'));
const Locations = lazy(() => import('./components/Locations'));
const Profile = lazy(() => import('./components/Profile'));

import NotFound from './components/NotFound';
import ErrorSnackbar from './components/ErrorSnackbar';

/* 
  In wouter, any Route with empty path is considered always active. 
  This can be used to achieve 'default' route behaviour within Switch. 
  Note: the order matters! 
*/
function App() {

  return (
    <Box sx={{
      width: '100%',
      maxWidth: '960px',
      margin: '0 auto',
    }}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ro'>
        <Header />
        <Suspense fallback={<Loading />}>
          <Switch>
            <Route path='/admin/login' component={Login} />
            <Route path='/admin' component={Admin} />
            <Route path='/admin/locations' component={Locations} />
            <Route path='/admin/profile' component={Profile} />
            <Route path='/appointments/:pageId' component={Appointments} />
            <Route path='/' component={Home} />
            <Route path='/:anything*' component={NotFound} />
          </Switch>
        </Suspense>
      </LocalizationProvider>
      <ErrorSnackbar />
    </Box>
  )
}

export default App
