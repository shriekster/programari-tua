import { lazy, Suspense } from 'react';
import { Route } from 'wouter';

import Loading from './Loading';

const Verify = lazy(() => import('./Verify'));

function App() {

  return (
    <Suspense fallback={<Loading />}>
      <Verify />
    </Suspense>
  )
}

export default App;
