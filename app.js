"use strict";
require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOption");
const mongoose = require("mongoose");
const db = require("./config/db.connect");
db();

const PORT = process.env.PORT || 3000;

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api", require("./routes"));
app.use("/health", (req, res, next) => {
  res.json({
    uptime: process.uptime(),
    status: "UP",
  });
});

//not found error handler
app.use((_req, _res, next) => {
  const error = new Error("not found");
  error.status = 404;
  next(error);
});

app.use((err, _req, res, _next) => {
  res.status(err.status || 500);
  res.json({ errors: { message: err.message, err } });
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;
