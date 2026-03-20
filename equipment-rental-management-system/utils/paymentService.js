const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'ffd621ec7e2502ec852d612dec0d4ba96e08c6139429fbc2ec373aad2929099a');

const createStripeCustomer = async (user) => {
  try {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      metadata: {
        userId: user.id.toString()
      }
    });
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
};

const createPaymentMethod = async (paymentMethodId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    return paymentMethod;
  } catch (error) {
    console.error('Error retrieving payment method:', error);
    throw error;
  }
};

const calculateRentalAmount = (equipment, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  return durationDays * equipment.daily_rate;
};

module.exports = {
  createStripeCustomer,
  createPaymentMethod,
  calculateRentalAmount
};