"use strict";
const express = require("express");
const router = express.Router();

router.use("/cryptocurrency", require("./cryptocurrency.route"));

module.exports = router;
