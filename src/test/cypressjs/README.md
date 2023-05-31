# How to run [Cypress.io](https://www.cypress.io/) automated UI tests

## Step 1: First time setting up local environment with Cypress
- Run `npm install` in the directory containing this `README.md`
- `node_modules` is created containing Cypress and its dependencies.

## Step 2: Setup URL you want the to test and the default java (2 options)
  Update the value for `default_website_url` in `cypress.config.js` with target URL, update
  the default_jdk with which java you want to test for tests that only test one, update the
  locations of the java levels on your local machine

NOTE - do not check in the cypress.config.js file with any changes for your local environment   

## Step 3:  Launch the Cypress test runner or run headless

- `npx cypress open` to run in the ui
- `npx cypress run --spec "cypress/e2e/???.cy.js"` to run headless

NOTE - the testOLStarterAllGradle.cy.js and cypress/e2e/testOLMavenAllGradle.cy.js tests use a 
lot of system memory and run more reliably headless

