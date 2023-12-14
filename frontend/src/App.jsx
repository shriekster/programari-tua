import { Route, Switch } from 'wouter';

import Home from './pages/Home';
import Appointments from './pages/Appointments';
import Login from './pages/Login';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

function App() {

  return (
    <Switch>
      <Route path='/admin/login' component={Login} />
      <Route path='/admin' component={Admin} />
      <Route path='/appointments/:pageId' component={Appointments} />
      <Route path='/' component={Home} />

      {/* 
        in wouter, any Route with empty path is considered always active. 
        This can be used to achieve "default" route behaviour within Switch. 
        Note: the order matters! See examples below.
      */}
      <Route component={NotFound}/>
    </Switch>
  )
}

export default App
