'use strict'

function isprod(env) {
  var isProdSite = env.PROD_SITE;
  if (isProdSite) {
    return true;
  }
  return false;
};

module.exports = isprod