'use strict'

function isprod(siteUrl) {
  console.log('site', siteUrl);
  //console.log('prod env var', process.env.PROD_SITE);
  if (siteUrl) {
    let host = siteUrl;
    //console.log('site.homeUrl', host);
    if (host.indexOf('openliberty.io') !== -1) {
      console.log('isProduction', true);
      return true;
    }
  }
  return false;
};

module.exports = isprod