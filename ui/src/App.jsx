import { useEffect } from 'react';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { Switch, Router, Route } from 'wouter';
import { useLocationProperty, navigate } from 'wouter/use-location';
import makeCachedMatcher from 'wouter/matcher';

import { pathToRegexp } from 'path-to-regexp';

import Verifier from './Verifier';
import NotFound from './404';
import Home from './Home';
import Appointments from './Appointments';


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// returns the current hash location in a normalized form
// (excluding the leading '#' symbol)
const hashLocation = () => window.location.hash.replace(/^#/, "") || "/";

const hashNavigate = (to) => navigate("#" + to);

const useHashLocation = () => {
  const location = useLocationProperty(hashLocation);
  return [location, hashNavigate];
};

const convertPathToRegexp = (path) => {
  let keys = [];

  // we use original pathToRegexp package here with keys
  const regexp = pathToRegexp(path, keys, { strict: false });
  return { keys, regexp };
};

const customMatcher = makeCachedMatcher(convertPathToRegexp);

function App() {

  useEffect(() => {

    console.log('CHECKING')

  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router hook={useHashLocation} matcher={customMatcher}>
          <Route path='/' component={Home} />
          <Route path='/appointments' component={Appointments} />
          <Route path='/:other' component={NotFound} />
      </Router>
      <Verifier />
    </ThemeProvider>
  )
}

export default App;
