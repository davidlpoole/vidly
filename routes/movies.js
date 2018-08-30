const express = require("express");
const router = express.Router();

const { Movie, validate } = require("../models/movie");

router.get("/", async (req, res) => {
  const movies = await Movie.find()
    .sort("name")
    .select("name")
    .populate("genre", "name");
  res.send(movies);
});

router.get("/:id", async (req, res) => {
  const movie = await Movie.findById(req.params.id)
    .sort({ name: 1 })
    .select("name")
    .populate("genre", "name")
    .catch(err => console.log("Error", err.message));
  if (!movie)
    return res.status(404).send("The movie with the given ID was not found.");
  res.send(movie);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let movie = new Movie({
    name: req.body.name,
    genre: req.body.genre
  });
  movie = await movie.save();

  res.send(movie);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const movie = await movie.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      genre: req.body.genre
    },
    { new: true }
  );

  if (!movie)
    return res.status(404).send("The movie with the given ID was not found.");

  res.send(movie);
});

router.delete("/:id", async (req, res) => {
  const movie = await movie
    .findByIdAndRemove(req.params.id)
    .catch(err => console.log("Error", err.message));
  if (!movie)
    return res.status(404).send("The movie with the given ID was not found.");
  res.send(movie);
});

module.exports = router;
