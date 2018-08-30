const mongoose = require("mongoose");
const Joi = require("joi");

const Movie = mongoose.model(
  "Movie",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      min: 3,
      max: 25
    },
    genre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Genre"
    },
    created: {
      type: Date,
      default: Date.now
    }
  })
);

function validateMovie(movie) {
  const schema = {
    name: Joi.string()
      .min(3)
      .max(25)
      .required(),
    genre: Joi.string().required()
  };
  return Joi.validate(movie, schema);
}

exports.Movie = Movie;
exports.validate = validateMovie;
