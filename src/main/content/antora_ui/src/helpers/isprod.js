'use strict'

function isprod(site) {
  console.log('site', site);
  if (site) {
    let host = site.homeUrl;
    console.log('site.homeUrl', host);
    console.log('site.url', site.url);
    console.log('site.ui.url', site.ui.url);
    //console.log('prod env var', process.env.PROD_SITE);
    if (host.indexOf('openliberty.io') !== -1) {
      console.log('isProduction', true);
      return true;
    }
  }
  return false;
};

module.exports = isprod