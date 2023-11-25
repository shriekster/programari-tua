import { Route } from 'wouter';
import Verify from './Verify';

function App() {

  return (
    <Route path='/verify' component={Verify} />
  )
}

export default App
