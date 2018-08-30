const express = require("express");
const app = express();
const mongoose = require("mongoose");
const genres = require("./routes/genres");
const movies = require("./routes/movies");
const customers = require("./routes/customers");

mongoose
  .connect("mongodb://localhost/vidly")
  .then(() => console.log("Connected to MongoDB/vidly..."))
  .catch(err => console.error("Could not connect to MongoDB/vidly..."));

app.use(express.json());
app.use("/api/genres", genres);
app.use("/api/movies", movies);
app.use("/api/customers", customers);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
