'use strict'

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