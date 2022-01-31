'use strict'

const Handlebars = require('handlebars')

Handlebars.registerHelper('prod', () => {
  console.log('prod', process.env.PROD_SITE);
  return process.env.PROD_SITE === 'production';
})

function isprod(prod) {
  console.log('env var ', (prod));
  //if (prod == true) {
  //    return true;
  //}
  //return false;
};

module.exports = isprod