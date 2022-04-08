const path = require("path");

describe('Test Open Liberty Starter - Maven', () => {
    const downloadsFolder = Cypress.config('downloadsFolder');
    // Allow users to specify URL via cypress environment variable
    // For example:
    //    npx cypress open --env website_url=https://openliberty.io
    let target_url = Cypress.env('website_url') || Cypress.env('default_website_url');
    target_url += "/start/";

    // default JDK can be change via cypress.env.json base on user env variable java
    let defaultJDK = Cypress.env('default_jdk');


    it('Default values for Open Liberty Starter', () => {
        cy.goToOpenLibertyStarter();
        cy.get("#Starter_Base_Package").should("have.value", "com.demo");
        cy.get("#Starter_App_Name").should("have.value", "app-name");
        cy.get("#starter_section input[type=radio]:checked").should("have.value", "maven");
        cy.get("#Starter_Java_Version").should("have.value", "11");
        cy.get("#Starter_Jakarta_Version").should("have.value", "9.1");
        cy.get("#Starter_MicroProfile_Version").should("have.value", "5.0");
    });

    it('Test zip file is downloaded with default values', () => {
        cy.exec(`rm -rf ${downloadsFolder}`);

        cy.goToOpenLibertyStarter();
        cy.get("#starter_submit").click();
        cy.get('.modal-dialog').should('be.visible');
        cy.get('#cmd_to_run').contains('mvnw liberty:dev');

        cy.readFile(path.join(downloadsFolder, "app-name.zip")).should("exist");
        cy.exec(`which unzip`).then((result) => {
            cy.log(result.stdout);
        });
        cy.log(`unzip app-name.zip to directory ${downloadsFolder}/app-name`);
        cy.exec(`unzip ${downloadsFolder}/app-name.zip -d ${downloadsFolder}/app-name`).its('stderr').should('be.empty');
    });

    it('Run mvnw liberty:dev', () => {
        cy.log(`run mvnw liberty:dev inside directory ${downloadsFolder}/app-name`);
        cy.exec(`scripts/buildMaven.sh ${downloadsFolder}/app-name`, { failOnNonZeroExit: true }).then((result) => {
            cy.log('Displaying output');
            cy.log(result.stdout);
            cy.log(result.code);
            cy.log(result.stderr);
        });
        cy.log(`waiting....it could take up to 2 minutes to build and wait for defaultServer to start`);
        cy.wait(90000);
        cy.readFile(downloadsFolder + '/app-name/output.txt').should('contain', 'CWWKF0011I: The defaultServer server is ready to run a smarter planet');
    });

    it('Check the local splash page after defaultServer is started', () => {
        cy.log(`Check the local OL splash page is running`);
        cy.goToLocalSplashPage();
        cy.get('h3').should('contain', 'Welcome to');
        cy.get('#inner-hero__title').should('have.attr', 'src', '/img/open_liberty_title.png');
    });

    it('Run mvnw liberty:stop', () => {
        cy.log(`run mvnw liberty:stop`);
        cy.exec(`cd ${downloadsFolder}/app-name && ./mvnw liberty:stop`).then((result) => {
            cy.log(result.stdout);
            cy.log(result.stderr);
        });
    });

});