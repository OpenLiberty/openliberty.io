'use strict'

const { posix: path } = require('path')

function isprod(site) {
  console.log('prod env var', process.env.PROD_SITE);
  let host = site.homeUrl;
  console.log('site.homeUrl', host);
  if (host.indexOf('openliberty.io') !== -1) {
    console.log('isProduction', true);
    return true;
  }
  return false;
}

module.exports = isprod