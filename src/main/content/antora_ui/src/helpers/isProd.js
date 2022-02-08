'use strict'

function isProd(env) {
  console.error('env', env);
  var isProduction = env.PROD_SITE;
  console.error('env PROD_SITE', isProduction);
  if (isProduction) {
    console.error('isProd', true);
    return true;
  }
  console.error('isProd', false);
  return false;
};

module.exports = isProd