const express = require('express');
const stripe = require('stripe')('sk_test_51R3BLMA5gH1ZfN724Wr3J8qNjXloTYulF4jO8hSqE385zu32zVZShvaE7K16ZukLVgnlHCSYRTWDHILZ39RoDbWN00TvfKTE4X');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/create-payment-intent', async (req, res) => {
  const { amount } = req.body;
  console.log(amount);

  

  // // Check if amount is provided
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Amount is required and should be a valid number' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      payment_method_types: ['card'],
    });
  
    res.json({
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(400).json({
      error: error.message || 'An error occurred while processing the payment intent.',
    });
  }
});

app.listen(4000, () => console.log('Server running on port 4000'));
