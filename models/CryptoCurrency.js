"use strict";
const mongoose = require("mongoose");
const cryptocurrencySchema = new mongoose.Schema(
  {
    id: String,
    symbol: String,
    name: String,
  },
  {
    timestamps: true,
  }
);

cryptocurrencySchema.methods.toJson = function () {
  return {
    objectId: this._id,
    id: this.id,
    symbol: this.symbol,
    name: this.name,
  };
};

module.exports = mongoose.model("CryptoCurrency", cryptocurrencySchema);
