# How to run [Cypress.io](https://www.cypress.io/) automated UI tests Locallly

## Step 1: First time setting up local environment with Cypress
- Run `npm install` in the directory containing this `README.md`
- `node_modules` is created containing Cypress and its dependencies.

## Step 2: Setup URL you want the to test and the default java (2 options)
  Update the value for `default_website_url` in `cypress.config.js` with target URL (usually either
  the staging or production site). To execute the testOLStarterAll*.cy.js tests update the default java
  and the location of the java levels on your local machine to the version you wish to test. 

NOTE - do not check in the cypress.config.js file with any changes for your local environment   

## Step 3:  Launch the Cypress test runner or run headless

- `npx cypress open` to run in the ui
- `npx cypress run --spec "cypress/e2e/xxxxx.cy.js"` to run headless with xxxxx being the test to run

NOTE - the testOLStarterAllGradle.cy.js and cypress/e2e/testOLMavenAllGradle.cy.js tests use a 
lot of system memory and run more reliably headless

# Alternatively - Run Tests with GitHub Actions In Git

## Step 1: Go to https://github.com/OpenLiberty/openliberty.io/actions
   Here you will see an action called 'General Starter and Redirect Tests'. This action will execute all of the tests in 
   the cypressjs/cypress/e2e directory with the exception of the testOLStarterAllMaven and testOLStarterAllGradle. These 
   two tests can be run from the starter repo - https://github.com/OpenLiberty/start.openliberty.io/actions. 

