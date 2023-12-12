"use strict";
const mongoose = require("mongoose");
const CryptoCurrency = mongoose.model("CryptoCurrency");
const coingeckoApiUrl = "https://api.coingecko.com/api/v3";
const axios = require("axios");
const asyncP = require("async");

const updateCryptoListReglar = async () => {
  try {
    const response = await axios.get(`${coingeckoApiUrl}/coins/list`);
    let cryptoCurrList = response.data.map((entry) => ({
      id: entry.id,
      name: entry.name,
      symbol: entry.symbol,
    }));

    const chunkSize = 2000;
    const chunks = [];

    for (let i = 0; i < cryptoCurrList.length; i += chunkSize) {
      const chunk = cryptoCurrList.slice(i, i + chunkSize);
      chunks.push(chunk);
    }

    asyncP.eachLimit(chunks, 5, async (chunk) => {
      const bulkOps = chunk.map((crypto) => ({
        updateOne: {
          filter: { id: crypto.id },
          update: { $set: crypto },
          upsert: true,
        },
      }));

      try {
        await CryptoCurrency.bulkWrite(bulkOps);
      } catch (error) {
        console.error(`Error updating chunk: ${error.message}`);
      }
    });
  } catch (error) {
    console.error(`Error updating cryptocurrency list: ${error.message}`);
  }
};

const createList = async (req, res, next) => {
  try {
    await updateCryptoListReglar();
    await res.json({ status: "success" });
  } catch (err) {
    next(err);
  }
};

setInterval(updateCryptoListReglar, 3600000);

const getFromToTime = (date) => {
  let [dd, mm, yyyy] = date.split("-");
  const fromTime = Math.floor(
    new Date(`${yyyy}-${mm}-${dd}T00:00:00`).getTime() / 1000
  );
  const toTime = Math.floor(
    new Date(`${yyyy}-${mm}-${dd}T23:59:59`).getTime() / 1000
  );
  return { fromTime, toTime };
};

const compareCurrency = async (req, res, next) => {
  try {
    const { fromCurrency, toCurrency, date } = req.body;

    const toCurrencyDB = await CryptoCurrency.findOne({
      name: {
        $regex: new RegExp(`^${toCurrency}$`, "i"),
      },
    });
    if (!toCurrencyDB) {
      return res.json({
        status: "error",
        message: "toCurrency does not exist",
      });
    }

    const fromCurrencyDB = await CryptoCurrency.findOne({
      name: {
        $regex: new RegExp(`^${fromCurrency}$`, "i"),
      },
    });
    if (!fromCurrencyDB) {
      return res.json({
        status: "error",
        message: "fromCurrency does not exist",
      });
    }

    const supportedVSCurrencies = (
      await axios.get(`${coingeckoApiUrl}/simple/supported_vs_currencies`)
    ).data;

    let vs_currencyIndex = supportedVSCurrencies.indexOf(
      toCurrencyDB.symbol.toLowerCase()
    );

    if (vs_currencyIndex == -1) {
      return res.json({
        status: "error",
        message: "toCurrency is not a supported versus currency",
      });
    }

    const { fromTime, toTime } = getFromToTime(date);

    const response = await axios.get(
      `${coingeckoApiUrl}/coins/bitcoin/market_chart/range`,
      {
        params: {
          id: fromCurrency,
          vs_currency: supportedVSCurrencies[vs_currencyIndex],
          from: fromTime,
          to: toTime,
        },
      }
    );

    const prices = response.data.prices;

    const price = prices.length > 0 ? prices[0][1] : null;

    if (price !== null) {
      const result = {
        fromCurrency,
        toCurrency,
        date,
        price,
      };
      res.status(200).json(result);
    } else {
      res
        .status(404)
        .json({ error: "Price data not available for the specified date." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  createList,
  compareCurrency,
};
