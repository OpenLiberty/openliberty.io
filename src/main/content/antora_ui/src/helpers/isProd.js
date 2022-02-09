'use strict'

function isProd(env) {
  var isProdSite = env.PROD_SITE;
  if (isProdSite) {
    return true;
  }
  return false;
};

module.exports = isProd