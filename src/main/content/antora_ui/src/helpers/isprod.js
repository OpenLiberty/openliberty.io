'use strict'

function isprod(page) {
  console.log('page', page);
  if (page) {
    let host = page.url;
    console.log('page.url', host);
    console.log('page.parent', page.parent);
    console.log('page.canonicalUrl', page.canonicalUrl);
    console.log('prod env var ', $PROD_SITE);
    if (host.indexOf('openliberty.io') !== -1) {
      console.log('isProduction', true);
      return true;
    }
  }
  return false;
};

module.exports = isprod