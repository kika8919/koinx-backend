"use strict";

const validateId = (id) => {
  return id.match(/[0-9a-zA-Z]{24}/gi);
};

module.exports = { validateId };
