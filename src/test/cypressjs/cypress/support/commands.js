// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

var websiteUrl = Cypress.env('website_url') || Cypress.env('default_website_url');
const path = require("path");
const downloadsFolder = Cypress.config('downloadsFolder');

Cypress.Commands.add('goToBlogs', () => { 
    cy.visit(websiteUrl + '/blog/');
})

Cypress.Commands.add('goToFeatureDocs', () => {
    cy.visit(websiteUrl + "/docs/latest/reference/feature/feature-overview.html")
})

Cypress.Commands.add('goToOpenLibertyStarter', () => {
    cy.visit(websiteUrl + '/start/');
})

Cypress.Commands.add('goToLocalSplashPage', () => {
    cy.visit('https://localhost:9443', { failOnStatusCode: true });
})

Cypress.Commands.add('checkLocalSplashPage', () => {
    cy.log(`Check the local OL splash page is running`);
    cy.goToLocalSplashPage();
    cy.get('h3').should('contain', 'Welcome to');
    cy.get('#inner-hero__title').should('have.attr', 'src', '/img/open_liberty_title.png');
})

// helper functions
Cypress.Commands.add('checkDownloadFile', () => {
    // checking for download zip file
    cy.readFile(path.join(downloadsFolder, `app-name.zip`)).should("exist");
    cy.exec(`which unzip`).then((result) => {
        cy.log(result.stdout);
    });
})

Cypress.Commands.add('unzipDownloadFile', (appname) => {
    // rename app-name.zip to ${appname}.zip
    cy.log(`mv app-name.zip to ${downloadsFolder}/${appname}`);
    cy.exec(`mv ${downloadsFolder}/app-name.zip ${downloadsFolder}/${appname}.zip`).its('stderr').should('be.empty');

    // unzip ${appname}.zip
    cy.log(`unzip ${appname}.zip to directory ${downloadsFolder}/${appname}`);
    cy.exec(`unzip ${downloadsFolder}/${appname}.zip -d ${downloadsFolder}/${appname}`).its('stderr').should('be.empty');
})

Cypress.Commands.add('downloadAndUnZipFileMaven', (appname, jdkVer, jktVer, mpVer) => {
    cy.log('appname ' + appname);
    cy.log('jdkVer ' + jdkVer);  

    // input appname does not always work in cypress for some reason
    // work around is to download the app-name.zip and rename zip to ${appname}.zip

    // select jdk version, jakarta version, mp version
    if (jdkVer) {
        cy.get('#Starter_Java_Version').select(jdkVer);
    }
    if (jktVer) {
        cy.log('jktVer ' + jktVer);
        cy.get('#Starter_Jakarta_Version').select(jktVer);
    }
    if (mpVer) {
        cy.log('mpVer ' + mpVer);
        cy.get('#Starter_MicroProfile_Version').select(mpVer);
    }
    cy.get("#starter_submit").click({force: true});

    // for some unknown reason have to add the wait along with click force true to close the modal
    cy.wait(5000);
    cy.get('.modal-dialog').should('be.visible');
    cy.get('#cmd_to_run').contains('mvnw liberty:dev');
    cy.get('#gen_proj_popup_button').click({force: true}); // clear modal

    cy.checkDownloadFile();
    cy.unzipDownloadFile(appname);
});

Cypress.Commands.add('downloadAndUnZipFileGradle', (appname, jdkVer, jktVer, mpVer) => {
    cy.log('appname ' + appname);
    cy.log('jdkVer ' + jdkVer);

    // input appname does not always work in cypress for some reason
    // work around is to download the app-name.zip and rename zip to ${appname}.zip

    // select gradle
    cy.get('#build_system_gradle').click();
    // select jdk version, jakarta version, mp version
    if (jdkVer) {
        cy.get('#Starter_Java_Version').select(jdkVer);
    }
    if (jktVer) {
        cy.log('jktVer ' + jktVer);
        cy.get('#Starter_Jakarta_Version').select(jktVer);
    }
    if (mpVer) {
        cy.log('mpVer ' + mpVer);
        cy.get('#Starter_MicroProfile_Version').select(mpVer);
    }
    cy.get("#starter_submit").click({force: true});

    // for some unknown reason have to add the wait along with click force true to close the modal
    cy.wait(5000);
    cy.get('.modal-dialog').should('be.visible');
    cy.get('#cmd_to_run').contains('gradlew libertyDev');
    cy.get('#gen_proj_popup_button').click({force: true}); // clear modal

    cy.checkDownloadFile();
    cy.unzipDownloadFile(appname);
});

Cypress.Commands.add('runMVNWLibertyDev', (appname, javahome, waitTime) => {
    const defaultWaitTime = 120000;
    // make sure no defaultServer process is running
    cy.exec(`ps -eaf | grep java | grep defaultServer | awk '{ print $2 }' | xargs kill -9`, { failOnNonZeroExit: false });

    cy.log(`run mvnw liberty:dev inside directory ${downloadsFolder}/${appname} with JAVA_HOME=${javahome}`);
    const options = { failOnNonZeroExit: true, env: { JAVA_HOME: javahome } };
    cy.exec(`scripts/buildMaven.sh ${downloadsFolder}/${appname}`, options).then((result) => {
        cy.log('Displaying output');
        cy.log(result.stdout);
        cy.log(result.code);
        cy.log(result.stderr);
    });
    cy.log(`waiting....it could take up to 2 minutes to build and wait for defaultServer to start`);
    cy.readFile(downloadsFolder + `/${appname}/output.txt`, { timeout: waitTime ? waitTime : defaultWaitTime })
      .should('contain', 'CWWKF0011I: The defaultServer server is ready to run a smarter planet');
});

Cypress.Commands.add('runMVNWLibertyStop', (appname, javahome) => {
    cy.log(`run mvnw liberty:stop with JAVA_HOME=${javahome}`);
    cy.exec(`cd ${downloadsFolder}/${appname} && ./mvnw liberty:stop`, {env: { JAVA_HOME: javahome }}).then((result) => {
        cy.log(result.stdout);
        cy.log(result.stderr);
    });
});

Cypress.Commands.add('runGradlewLibertyDev', (appname, javahome, waitTime) => {
    const defaultWaitTime = 240000;

    // make sure no java process is running
    cy.exec(`ps -eaf | grep java | grep defaultServer | awk '{ print $2 }' | xargs kill -9`, { failOnNonZeroExit: false });
    cy.exec(`ps -eaf | grep java | grep GradleDaemon | awk '{ print $2 }' | xargs kill -9`, { failOnNonZeroExit: false });

    cy.log(`run gradlew libertyDev inside directory ${downloadsFolder}/${appname} with JAVA_HOME=${javahome}`);
    const execOptions = { failOnNonZeroExit: true, env: { JAVA_HOME: javahome } };
    cy.exec(`scripts/buildGradle.sh ${downloadsFolder}/${appname}`, execOptions).then((result) => {
        cy.log('Displaying output');
        cy.log(result.stdout);
        cy.log(result.code);
        cy.log(result.stderr);
    });
    cy.log(`waiting....it could take up to 3 minutes to build and wait for defaultServer to start`);
    cy.readFile(downloadsFolder + `/${appname}/output.txt`, { timeout: waitTime ? waitTime : defaultWaitTime })
      .should('contain', 'CWWKF0011I: The defaultServer server is ready to run a smarter planet');
});

Cypress.Commands.add('runGradlewLibertyStop', (appname, javahome) => {
    cy.log(`run gradlew libertyStop with JAVA_HOME=${javahome}`);
    cy.exec(`cd ${downloadsFolder}/${appname} && ./gradlew libertyStop`, {env: { JAVA_HOME: javahome }}).then((result) => {
        cy.log(result.stdout);
        cy.log(result.stderr);
    });
    cy.exec(`ps -eaf | grep java | grep GradleDaemon | awk '{ print $2 }' | xargs kill -9`, { failOnNonZeroExit: false });
});
