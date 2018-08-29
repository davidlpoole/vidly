const mongoose = require("mongoose");
const Joi = require("joi");

const Genre = mongoose.model(
  "Genre",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      min: 3,
      max: 25
    },
    created: {
      type: Date,
      default: Date.now
    }
  })
);

function validateGenre(genre) {
  const schema = {
    name: Joi.string()
      .min(3)
      .max(25)
      .required()
  };
  return Joi.validate(genre, schema);
}

exports.Genre = Genre;
exports.validate = validateGenre;
