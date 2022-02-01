'use strict'

function isprod(prod) {
  console.log('env var ', (prod));
  console.log('prod', process.env);
  console.log('page ', page);
  if (prod) {
    return true;
  }
  return false;
};

module.exports = isprod