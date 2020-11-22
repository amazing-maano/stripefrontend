import React from "react";
import "./App.css";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe } from "@stripe/react-stripe-js";   //useElements
import { injectStripe, CardElement, useElements } from "react-stripe-elements";
import { Container, Button } from "reactstrap";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
if (!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
  console.error("**Stripe publishable key environment variable not set**");
  console.error(
    "**Add an environemnt variable REACT_APP_STRIPE_PUBLISHABLE_KEY**"
  );
  console.error("**Replace .env.example with .env and **");
}

const CheckoutForm = ({error}) => {
  const stripe = useStripe();
  //const elements = useElements();


  function handlePaymentThatRequiresCustomerAction({
    subscription,
    invoice,
    priceId,
    paymentMethodId,
    isRetry,
  }) {
    if (subscription && subscription.status === "active") {
      // subscription is active, no customer actions required.
      return { subscription, priceId, paymentMethodId };
    }

    // If it's a first payment attempt, the payment intent is on the subscription latest invoice.
    // If it's a retry, the payment intent will be on the invoice itself.
    const paymentIntent = invoice
      ? invoice.payment_intent
      : subscription.latest_invoice.payment_intent;

    if (
      paymentIntent.status === "requires_action" ||
      (isRetry === true && paymentIntent.status === "requires_payment_method")
    ) {
      return stripe
        .confirmCardPayment(paymentIntent.client_secret, {
          payment_method: paymentMethodId,
        })
        .then((result) => {
          if (result.error) {
            // start code flow to handle updating the payment details
            // Display error message in your UI.
            // The card was declined (i.e. insufficient funds, card has expired, etc)
            throw result;
          } else {
            if (result.paymentIntent.status === "succeeded") {
              // There's a risk of the customer closing the window before callback
              // execution. To handle this case, set up a webhook endpoint and
              // listen to invoice.payment_succeeded. This webhook endpoint
              // returns an Invoice.
              return {
                priceId: priceId,
                subscription: subscription,
                invoice: invoice,
                paymentMethodId: paymentMethodId,
              };
            }
          }
        });
    } else {
      // No customer action needed
      return { subscription, priceId, paymentMethodId };
    }
  }

  function handleRequiresPaymentMethod({
    subscription,
    paymentMethodId,
    priceId,
  }) {
    if (subscription.status === 'active') {
      // subscription is active, no customer actions required.
      return { subscription, priceId, paymentMethodId };
    } else if (
      subscription.latest_invoice.payment_intent.status ===
      'requires_payment_method'
    ) {
      // Using localStorage to store the state of the retry here
      // (feel free to replace with what you prefer)
      // Store the latest invoice ID and status
      localStorage.setItem('latestInvoiceId', subscription.latest_invoice.id);
      localStorage.setItem(
        'latestInvoicePaymentIntentStatus',
        subscription.latest_invoice.payment_intent.status
      );
      throw new Error('Your card was declined.');
    } else {
      return { subscription, priceId, paymentMethodId };
    }
  }

  function confirmSubscription(userData) {
    userData.plan = this.props.plan
    return (
      fetch("/user/subscription", {
        method: "post",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(userData),
      })
        .then((response) => {
          return response.json();
        })
        // If the card is declined, display an error to the user.
        .then((result) => {
          if (result.error) {
            // The card had an error when trying to attach it to a customer

            throw result;
          }
          return result;
        })
        // Normalize the result to contain the object returned
        // by Stripe. Add the addional details we need.
        .then(payload => {
            console.log('WE GOT FROM SERVER ', payload)
          })
        // Some payment methods require a customer to do additional
        // authentication with their financial institution.
        // Eg: 2FA for cards.
        .then(handlePaymentThatRequiresCustomerAction)
        // If attaching this card to a Customer object succeeds,
        // but attempts to charge the customer fail. You will
        // get a requires_payment_method error.
        .then(handleRequiresPaymentMethod)
        // No more actions required. Provision your service for the user.

        .catch((error) => {
          // An error has happened. Display the failure to the user here.
          // We utilize the HTML element we created.
          console.log(error)
        })
    );
  }

  const handleSubmit = () => {
    // Block native form submission.
    // event.preventDefault;

    const { stripe } = this.props
    if (stripe) {
      stripe.createToken().then(payload => {
        if (payload.error) {
          this.setState({ error: payload.error })
        } else {
          confirmSubscription(payload)
        }
      })

    } else {
      alert('Stripe is not connected')
    }
  };

   

  console.log(error)
  return (
      <Container>
        <div style={{ border: '1px solid black', padding: '10px', width: '50%' }}>
          <form onSubmit={handleSubmit()}>
            <CardElement />
            {error && <p style={{ marginTop: '6px' }}>{error.message}</p>}
            <Button className='btn btn-success' style={{ margin: '10px' }}>
              Confirm order
            </Button>
          </form>
        </div>
      </Container>
  )

};

const paymentForm = (props) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm {...props} />
  </Elements>
);

export default injectStripe(paymentForm);
