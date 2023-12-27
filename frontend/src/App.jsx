import { useState } from 'react';
import { Route, Switch } from 'wouter';

import Home from './pages/Home';
import Appointments from './pages/Appointments';
import Login from './pages/Login';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

/* 
  in wouter, any Route with empty path is considered always active. 
  This can be used to achieve "default" route behaviour within Switch. 
  Note: the order matters! 
*/
function App() {

  const [accessToken, setAccessToken] = useState('');

  return (
    <Switch>
      <Route path='/admin/login'>
        <Login setAccessToken={setAccessToken} />
      </Route>
      <Route path='/admin'>
        <Admin accessToken={accessToken}
          setAccessToken={setAccessToken} />
      </Route>
      <Route path='/appointments/:pageId'>
        <Appointments />
      </Route>
      <Route path='/'>
        <Home />
      </Route>
      <Route path='/:anything*'>
        <NotFound />
      </Route>
    </Switch>
  );
  
}

export default App
