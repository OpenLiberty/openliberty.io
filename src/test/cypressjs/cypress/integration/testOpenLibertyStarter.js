const path = require("path");

describe('Test Open Liberty Starter', () => {
    const downloadsFolder = Cypress.config('downloadsFolder');
    // Allow users to specify URL via cypress environment variable
    // For example:
    //    npx cypress open --env website_url=https://openliberty.io
    let target_url = Cypress.env('website_url') || Cypress.env('default_website_url');
    target_url += "/start/";

    beforeEach(() => {
        cy.exec(`rm -rf ${downloadsFolder}`)
    });

    before(() => {
        cy.goToOpenLibertyStarter();
    });
  
    it('Default values for Open Liberty Starter', () => {
        cy.get("#Starter_Base_Package").should("have.value", "com.demo");
        cy.get("#Starter_App_Name").should("have.value", "app-name");
        cy.get("#starter_section input[type=radio]:checked").should("have.value", "maven");
        cy.get("#Starter_Java_Version").should("have.value", "11");
        cy.get("#Starter_Jakarta_Version").should("have.value", "9.1");
        cy.get("#Starter_MicroProfile_Version").should("have.value", "5.0");
    });

    it('Test zip file is downloaded with default values', () => {
        cy.get("#starter_submit").click();
        cy.readFile(path.join(downloadsFolder, "app-name.zip")).should("exist");
        cy.exec(`which unzip`);
        cy.exec(`unzip ${downloadsFolder}/app-name.zip -d ${downloadsFolder}/app-name`).its('stderr').should('be.empty');
        cy.exec(`${downloadsFolder}/app-name/mvnw liberty:dev`, { timeout: 30000, failOnNonZeroExit: false }); // 30 secs
    });

  });
  