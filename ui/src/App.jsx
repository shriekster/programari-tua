import { useEffect } from 'react';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { Switch, Route } from 'wouter';

import useGlobalStore from './useGlobalStore';

import Verifier from './Verifier';
import NotFound from './404';
import Home from './Home';
import Appointments from './Appointments';


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});



function App() {

  const [verifying, setVerifying] = useGlobalStore((state) => [state.verifying, state.setVerifying]);

  useEffect(() => {
    const v = Boolean(Math.round(Math.random()));
    console.log('verifying', v)
    setVerifying(v);
  }, [setVerifying]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Switch>
        <Route path='/' component={Home} />
        <Route path='/appointments' component={Appointments} />
        <Route path='/:anything*'component={NotFound} />
        </Switch>
      <Verifier />
    </ThemeProvider>
  )
}

export default App;
