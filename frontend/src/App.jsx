import { Route, Switch } from 'wouter';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ro';

import Home from './components/Home';
import Appointments from './components/Appointments';
import Login from './components/Login';
import Admin from './components/Admin';
import NotFound from './components/NotFound';

/* 
  In wouter, any Route with empty path is considered always active. 
  This can be used to achieve "default" route behaviour within Switch. 
  Note: the order matters! 
*/
function App() {

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ro'>
      <Switch>
        <Route path='/admin' component={Admin} />
        <Route path='/admin/login' component={Login} />
        <Route path='/appointments/:pageId' component={Appointments} />
        <Route path='/' component={Home} />
        <Route path='/:anything*' component={NotFound} />
      </Switch>
    </LocalizationProvider>
  )
}

export default App
