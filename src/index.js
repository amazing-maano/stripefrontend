import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'
import { StripeProvider } from 'react-stripe-elements'
import 'bootstrap/dist/css/bootstrap.min.css'


ReactDOM.render(
  <StripeProvider apiKey='pk_test_51Hk02TDhRIY5Kn5Lhwb41r7xmrZHnJoF8Wp6jG9CdkiD1xyE7Iktd3zr1ScxLrCedp2A0rptjhonWykqeCfGBfnC00T1ru8IK0'>
    <App />
  </StripeProvider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
