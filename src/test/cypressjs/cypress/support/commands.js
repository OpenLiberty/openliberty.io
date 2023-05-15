// Common methods called from the scripts to select the java, jakarta(ee) and microprofile levels
// and dowload the created zip files for all of them 
// It will build either the gradle or maven version of the zipfile based on the passed in
// parameter to downloadZipFiles

// NOTE - Right now, all possible combinations are allowed by the ui so we go ahead and create the
// invalid zip files for java 8 with EE 10 or mp 6 but the github actions that will try to 
// test the zips files skip these - when the ui is fixed to prevent those combinations, this
// code will need to change



// used for file naming
const convertNum2Str = {
    '8': '8',
    '11': '11',
    '17': '17',
    '10': '10',
    '9.1': '91',
    '8.0': '8',
    '7.0': '7',
    '6.0': '6',
    '5.0': '5',
    '4.1': '41',
    '3.3': '33',
    '2.2': '22',
    '1.4': '14',
    None: 'None'
};

// must define all possible valid combinations of jakarta and mp
// keep in mind not all java versions work with all of these for ex. ee10, mp6 cannot use java 8

let jakarta_mp_versions = [
    {
      jakarta: "10",
      mp: "6.0"
    },
    {
      jakarta: "10",
      mp: "None"
    },
    {
      jakarta: "9.1",
      mp: "5.0"
    },
    {
      jakarta: "9.1",
      mp: "None"
    },
    {
      jakarta: "8.0",
      mp: "4.1"
    },
    {
      jakarta: "8.0",
      mp: "3.3"
    },
    {
      jakarta: "8.0",
      mp: "2.2"
    },
    {
      jakarta: "8.0",
      mp: "None"
    },
    {
      jakarta: "7.0",
      mp: "1.4"
    },
    {
      jakarta: "7.0",
      mp: "None"
    },
    {
      jakarta: "None",
      mp: "6.0"
    },
    {
      jakarta: "None",
      mp: "5.0"
    },
    {
      jakarta: "None",
      mp: "4.1"
    },
    {
      jakarta: "None",
      mp: "3.3"
    },
    {
      jakarta: "None",
      mp: "2.2"
    },
    {
      jakarta: "None",
      mp: "1.4"
    }
]


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
   
    const options = { failOnNonZeroExit: true };
    cy.exec(`scripts/buildMaven.sh ${downloadsFolder}/${appname} ${javahome}`, options).then((result) => {
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
    const execOptions = { failOnNonZeroExit: true};
    cy.exec(`scripts/buildGradle.sh ${downloadsFolder}/${appname}  ${javahome}`, execOptions).then((result) => {
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
