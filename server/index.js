const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config({ path: './.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const app = express()
const mongoose = require('mongoose')
const StripePayment = require('./payment')
const uristring = process.env.MONGODB_URI || 'mongodb://localhost/stripeintegration';

mongoose.connect(
        uristring, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true }
    )
    .then(() => console.log('DB Connected'))
mongoose.connection.on('error', err => {
    console.log('DB connection error: ${err.message}')
});

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/user/subscription', function (req, res) {
  res.json({ message: 'Hello world' })
})


app.post('/user/subscription', async function (req, res) {
  const data = req.body;
  const cardNumber = data.cardNumber;
  const cardExpiryMonth = data.cardExpiryMonth;
  const cardExpiryYear = data.cardExpiryYear;
    // Create customer
    await stripe.customers.create(
    {
      source: data.token.id, // obtained with Stripe.js
      name: 'Jenny Rosen',
      address: {
        line1: '510 Townsend St',
        postal_code: '98140',
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
      },
      payment_method: data.payment_method,
      invoice_settings: {
        default_payment_method: data.payment_method,
      },
    },
    (err, customer) => {
      // asynchronously called
      if (err) {
        console.log('The following error happened' + err);
        return res.status(400).json({ error: 'Your customer creation failed' });
      } else {
        try {
          stripe.paymentMethods.attach(req.body.paymentMethodId, {
            customer: req.body.customerId,
          });
        } catch (error) {
          return res.status('402').send({ error: { message: error.message } });
        }

        stripe.subscriptions.create(
          {
            customer: customer.id,
            items: [
              {
                price: data.plan,
              },
            ],
            expand: ['latest_invoice.payment_intent'],
          })
          .then(subscription => {
            let transactionData = {
              customerId: subscription.customer,
              subscriptionId: subscription.id,
              plan: subscription.plan.id,
              price: subscription.plan.amount,
              status: subscription.status,
            };
            // Insert data to user
            try {

              const newTransaction = StripePayment.create(transactionData);
              //   const tasks = await fetchAllTasks(req.userId);
              res.send({
                newTransaction,
                success: true,
              });
              console.log({MSG: 'Transaction Created Successfully'});
            } catch (err) {
              res.serverError(err);
            }
            console.log(subscription);
          });
        console.log('Stripe returned ', customer);
      }
    }
    );
  })


/*
  stripe.customers.create(
    {
      source: data.token.id, // obtained with Stripe.js
      name: 'Jenny Rosen',

      payment_method: data.payment_method,
      invoice_settings: {
        default_payment_method: data.payment_method
      }
    },
    (err, customer) => {
      // asynchronously called
      if (err) {
        console.log('The following error happened')
        console.log(err)
        return res.status(400).json({ error: 'Your customer creation failed' })
      } else {
        stripe.subscriptions.create(
          {
            customer: customer.id,
            items: [
              {
                price: data.plan
              }
            ],
            expand: ['latest_invoice.payment_intent'],
          },
          function (err, subscription) {
            // asynchronously called
            if (err) {
              console.log('The Subscription error happened')
              console.log(err)
              return res.status(400).json({ error: 'Your subscription failed' })
            } else {
              console.log('The Subscription Was successful')
              console.log(subscription)
              return res.json({ message: 'Your subscription was successful' })
            }
          }
        )

        console.log('Stripe returned ', customer)
      }
    }
  )*/

app.listen(5000, function () {
  console.log('Server is listening on port ', 5000)
})
