const express = require("express");
const app = express();
const mongoose = require("mongoose");
const genres = require("./routes/genres");
const customers = require("./routes/customers");

app.use(express.json());
app.use("/api/genres", genres);
app.use("/api/customers", customers);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

mongoose
  .connect("mongodb://localhost/vidly")
  .then(() => console.log("Connected to MongoDB/vidly..."))
  .catch(() => console.err("Could not connect to MongoDB/vidly...", err));
