import React from 'react'
import logo from './logo.svg'
import './App.css'
import MyStoreCheckout from './MyStoreCheckout'

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Landing from './Landing'

import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';



// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);


class App extends React.Component {
  render () {
    return (
      <Elements stripe={stripePromise}>
        <Router>
         <Switch>
          <Route exact path='/subscribe' component={MyStoreCheckout} />
          <Route exact path='/' component={Landing} />
        </Switch>
      </Router>
      </Elements>
    )
  }
}
// ;<MyStoreCheckout />

export default App
