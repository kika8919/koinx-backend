const mongoose = require("mongoose");
require("../models/CryptoCurrency");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI, {
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      readPreference: "secondary",
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;
