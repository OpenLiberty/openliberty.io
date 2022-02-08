'use strict'

const Handlebars = require('handlebars')

Handlebars.registerHelper('prod', () => {
  console.error('env', process.env);
  console.error('prod', process.env.PROD_SITE);
  return process.env.PROD_SITE === true;
})

function isProd(env) {
  console.error('env', env);
  isProd = env.PROD_SITE;
  console.error('env PROD_SITE', isProd);
  if (isProd === true) {
    console.error('isProd', true);
    return true;
  }
  return false;
};

module.exports = isProd