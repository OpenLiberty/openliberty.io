'use strict'

function isprod(prod) {
  console.log('env var ', (prod));
  console.log('prod', process.env);
  //if (prod == true) {
  //    return true;
  //}
  //return false;
};

module.exports = isprod