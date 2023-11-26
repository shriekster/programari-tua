import { lazy, Suspense } from 'react';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { Switch, Route } from 'wouter';

import Loading from './Loading';
import Verifier from './Verifier';
import NotFound from './404';

const Verify = lazy(() => import('./Verify'));

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {

  

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route path='/verify' component={Verify} />
          <Route path='/'>TEST</Route>
          <Route path='/:other' component={NotFound} />
        </Switch>
      </Suspense>
      <Verifier />
    </ThemeProvider>
  )
}

export default App;
