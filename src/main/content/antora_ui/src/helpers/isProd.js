'use strict'

function isProd(prod) {
  console.error('checking if prod', (prod));
  console.error('process.env', process.env.PROD_SITE);
  //console.error('prod.env', prod.data.root.env);
  console.error('hostname', location.hostname);
  console.error('this hostname', this.hostname);
  let prodSite = prod.data.root.env.PROD_SITE;
  console.error('prod.env', prodSite);
  if (prodSite === true) {
    console.error('isProd', true);
    return true;
  }
  return false;
};

module.exports = isProd