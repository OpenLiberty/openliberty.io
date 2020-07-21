'use strict'

function debug(optionalValue) {
    console.log("Current Context");
    console.log("====================");
    console.log(this);
  
    if (optionalValue) {
      console.log("Value");
      console.log("====================");
      console.log(optionalValue);
    }
};

module.exports = debug