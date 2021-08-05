# How to run [Cypress.io](https://www.cypress.io/) automated UI tests

## Step 1: First time setting up local environment with Cypress
- Run `npm install` in the directory containing this `README.md`
- `node_modules` is created containing Cypress and its dependencies.

## Step 2: Setup URL you want the to test (2 options)
  - **Choose one of the options: 1 or 2** 
  - **Option 1:** Update the value for `default_website_url` in `cypress.env.json` with target URL
  - **Option 2**: Supply a command line variable when launching cypress instead of changing `cypress.env.json`.  Option 2 is preferred to avoid changing a file tracked by `git`.

## Step 3:  Launch the Cypress test runner
- `cd cypress`
- **Option 1 from step 2** using `cypress.env.json`
  - `npx cypress open`
- **Option 2 from step 2** using CLI variable instead of `cypress.env.json`
  - `npx cypress open --env website_url=https://openliberty.io`
