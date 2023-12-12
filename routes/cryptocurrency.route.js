"use strict";
const express = require("express");
const router = express.Router();

const cryptocurrController = require("../controller/cryptocurrency.controller");

router.get("/update", cryptocurrController.createList);

router.post("/compare", cryptocurrController.compareCurrency);

module.exports = router;
