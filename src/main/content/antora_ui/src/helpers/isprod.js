'use strict'

function isprod(env) {
  console.log('env', env);
  if (env) {
    let isProd = env.get(PROD_SITE);
    console.log('isProduction', isProd);
    if (isProd) {
      return true;
    }
  }
  return false;
};
//The map of environment variables

module.exports = isprod