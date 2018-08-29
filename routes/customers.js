const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Joi = require("joi");

const Customer = mongoose.model(
  "Customer",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 25
    },
    isGold: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 25
    },
    created: {
      type: Date,
      default: Date.now
    }
  })
);

// async function createCustomer(name, isGold, phone) {
//     const customer = new Customer({
//         name: name,
//         isGold: isGold,
//         phone: phone
//     });
//     const result = await customer.save();
//     console.log(result);
// }

router.get("/", async (req, res) => {
  const customers = await Customer.find().sort("name");
  res.send(customers);
});

router.get("/:id", async (req, res) => {
  const customer = await Customer.findById(req.params.id)
    .sort({ name: 1 })
    .catch(err => console.log("Error", err.message));
  if (!customer)
    return res
      .status(404)
      .send("The customer with the given ID was not found.");
  res.send(customer);
});

router.post("/", async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let customer = new Customer({
    name: req.body.name,
    isGold: req.body.isGold,
    phone: req.body.phone
  });
  customer = await customer.save();

  res.send(customer);
});

router.put("/:id", async (req, res) => {
  const { error } = validateCustomer(req.body);
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
      .send("The customer with the given ID was not found.");

  res.send(customer);
});

router.delete("/:id", async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id).catch(err =>
    console.log("Error", err.message)
  );
  if (!customer)
    return res
      .status(404)
      .send("The customer with the given ID was not found.");
  res.send(customer);
});

function validateCustomer(customer) {
  console.log(customer);
  const schema = {
    name: Joi.string()
      .min(5)
      .max(50)
      .required(),
    phone: Joi.string()
      .min(5)
      .max(50)
      .required(),
    isGold: Joi.boolean()
  };

  return Joi.validate(customer, schema);
}

module.exports = router;
