const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { Customer, validate } = require('../models/customer');

// @route   GET /api/customers/
// @desc    List all customers
// @access  Public
// @params  none

router.get('/', async (req, res) => {
  const customers = await Customer.find().sort('name');
  res.send(customers);
});

// @route   GET /api/customers/:id
// @desc    Find a customer by id
// @access  Public
// @params  none
router.get('/:id', async (req, res) => {
  const customer = await Customer.findById(req.params.id)
    .sort({ name: 1 })
    .catch(err => console.log('Error', err.message));
  if (!customer)
    return res
      .status(404)
      .send('The customer with the given ID was not found.');
  res.send(customer);
});

// @route   POST /api/customers/:id
// @desc    Create a new customer
// @access  Private
// @params  (customer)name, isGold, phone(number)
router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = new Customer({
    name: req.body.name,
    isGold: req.body.isGold,
    phone: req.body.phone
  });
  await customer.save();

  res.send(customer);
});

// @route   PUT /api/customers/:id
// @desc    Update a customer
// @access  Private
// @params  (customer)name, isGold, phone(number)
router.put('/:id', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      isGold: req.body.isGold,
      phone: req.body.phone
    },
    { new: true }
  );

  if (!customer)
    return res
      .status(404)
      .send('The customer with the given ID was not found.');

  res.send(customer);
});

// @route   DELETE /api/customers/:id
// @desc    Delete a customer
// @access  Private
// @params  none
router.delete('/:id', [auth, admin], async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id).catch(err =>
    console.log('Error', err.message)
  );
  if (!customer)
    return res
      .status(404)
      .send('The customer with the given ID was not found.');
  res.send(customer);
});

module.exports = router;
