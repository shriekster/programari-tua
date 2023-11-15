import { Route } from 'wouter';
import Verify from './Verify';

function App() {

  return (
    <main>
      <Route path='/verify' component={Verify} />
    </main>
  )
}

export default App
