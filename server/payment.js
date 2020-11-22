const mongoose = require('mongoose')
const Schema = mongoose.Schema

const StripeSchema = new Schema({
userId: {
    type: 'string',
  },
  customerId: {
    type: 'string'
  },
  subscriptionId: {
    type: 'string'
  },
  plan: {
    type: 'string'
  },
  price: {
    type: 'number',
  },
  status: {
    type: 'string'
  },
  cardNumber: {
    type: 'number'
  },
  cardExpiryMonth: {
    type: 'number'
  },
  cardExpiryYear: {
    type: 'number'
  },
})

const StripePayment = mongoose.model('StripePayment', StripeSchema);

module.exports = StripePayment;
