'use strict'

function isProd(env) {
  console.error('env', env);
  var isProduction = env.PROD_SITE;
  console.error('env PROD_SITE', isProduction);
  if (isProduction === true) {
    console.error('isProd', true);
    return true;
  }
  return false;
};

module.exports = isProd