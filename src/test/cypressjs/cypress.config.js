const { defineConfig } = require('cypress')

module.exports = defineConfig({
  defaultCommandTimeout: 10000,
  reporter: 'junit',
  chromeWebSecurity: false,
  reporterOptions: {
    mochaFile: 'results/cypressTest-[hash].xml',
  },

  env: {
    default_website_url: 'https://staging-openlibertyio.mqj6zf7jocq.us-south.codeengine.appdomain.cloud',
    default_jdk: '11',
    jdk_17_home: '/Library/Java/JavaVirtualMachines/ibm-semeru-open-17.jdk/Contents/Home',
    jdk_11_home: '/Library/Java/JavaVirtualMachines/ibm-semeru-certified-11.jdk/Contents/Home',
    jdk_8_home:  '/Library/Java/JavaVirtualMachines/jdk1.8.0_311.jdk/Contents/Home',
    redirects_url: 'https://raw.githubusercontent.com/OpenLiberty/docs-playbook/staging/doc-redirects.properties',
  },
 
  viewportWidth: 1280,
  e2e: {
    supportFile: '/__w/openliberty.io/openliberty.io/src/test/cypressjs/cypress/support/e2e.js',
    specPattern: '/__w/openliberty.io/openliberty.io/src/test/cypressjs/cypress/e2e/*.cy.js',
    downloadsFolder: '__w/openliberty.io/openliberty.io/src/test/cypressjs/cypress/downloads',
  },
})
