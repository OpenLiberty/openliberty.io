// Common methods called from the scripts to select the java, jakarta(ee) and microprofile levels
// and dowload the created zip files for all of them 
// It will build either the gradle or maven version of the zipfile based on the passed in
// parameter to downloadZipFiles

// NOTE - Right now, all possible combinations are allowed by the ui so we go ahead and create the
// invalid zip files for java 8 with EE 10 or mp 6 but the github actions that will try to 
// test the zips files skip these - when the ui is fixed to prevent those combinations, this
// code will need to change



const convertNum2Str = {
    '8': '8',
    '11': '11',
    '17': '17',
    '10': '10',
    '9.1': '91',
    '7': '7',
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
      jakarta: "8",
      mp: "4.1"
    },
    {
      jakarta: "8",
      mp: "3.3"
    },
    {
      jakarta: "8",
      mp: "2.2"
    },
    {
      jakarta: "8",
      mp: "None"
    },
    {
      jakarta: "7",
      mp: "1.4"
    },
    {
      jakarta: "7",
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
// java home path for jdk17, jdk11, jdk8 can be change via Cypress.config.js
const javase_javahome = {
  17: Cypress.env('jdk_17_home'),
  11: Cypress.env('jdk_11_home'),
   8: Cypress.env('jdk_8_home')
};

var jdkVer = Cypress.env('default_jdk');
var javahome = javase_javahome[jdkVer];
var websiteUrl = Cypress.env('default_website_url');
const downloadsFolder = Cypress.config('downloadsFolder');

Cypress.Commands.add('goToBlogs', () => { 
    cy.visit(websiteUrl + '/blog/');
});

Cypress.Commands.add('goToFeatureDocs', () => {
    cy.visit(websiteUrl + "/docs/latest/reference/feature/feature-overview.html")
});

Cypress.Commands.add('goToOpenLibertyStarter', () => {
    cy.visit(websiteUrl + '/start/');
});

Cypress.Commands.add('goToLocalSplashPage', () => {
    cy.visit('https://localhost:9443');
});

Cypress.Commands.add('checkLocalSplashPage', () => {
    cy.log(`Check the local OL splash page is running`);
    cy.goToLocalSplashPage();
    cy.get('h3').should('contain', 'Welcome to');
    cy.get('#inner-hero__title').should('have.attr', 'src', '/img/open_liberty_title.png');
});

// Loop through all possible combinations of jakarta and microprofile to create the starter zip files
// gOrM - values are g or m for gradle or maven

Cypress.Commands.add('downloadAndUnzipAllFiles',(gOrM) => {
  // first remove existing files in downloads folder
  cy.exec(`rm -r ${downloadsFolder}`,{failOnNonZeroExit: false}); 
  for (let i = 0; i < jakarta_mp_versions.length; i++) {
          const version = jakarta_mp_versions[i];
          const jktVer = version.jakarta;
          cy.log(`jakarta version ` + jktVer);
          const mpVer = version.mp;
          cy.log(`mp version ` + mpVer);
        
          const appname = 'appzip-jdk' + convertNum2Str[jdkVer] + '-ee' + convertNum2Str[jktVer] + '-mp' + convertNum2Str[mpVer];
          cy.log(`appname ` + appname);
          cy.downloadAndUnzipFile(appname, jktVer, mpVer, gOrM); 
  }
});


// Method that actually interacts with the website to download the zip
// and unzip it and remove the zip file
// appname - for building the downloaded filename  appzip-jdk?-ee?-mp?.zip
// jktVer - which jakarta version to pick
// mpVer - which microprofile version to pick
// gOrM - gradle or maven, g or m

Cypress.Commands.add('downloadAndUnzipFile', (appname, jktVer, mpVer, gOrM) => {
  cy.log('appname ' + appname);
  cy.log('jdkVer ' + jdkVer);
  const downloadsFolder = Cypress.config('downloadsFolder');
  const path = require("path");

  // select gradle or maven
  if (gOrM == 'g') {
     cy.get('#build_system_gradle',{ timeout:10000 }).click();
  } else {
      cy.get('#build_system_maven',{ timeout:10000 }).click(); 
  }

  // select jdk version, jakarta version, mp version
  if (jktVer) {
    cy.log('jktVer ' + jktVer);
    cy.get('#Starter_Jakarta_Version').select(jktVer);
  }
  if (mpVer) {
    cy.log('mpVer ' + mpVer);
    cy.get('#Starter_MicroProfile_Version').select(mpVer);
    // because this is broken right now - we have to go back and reselect None
    if (jktVer == "None") {
        cy.log('jktVer had to be reselected now');
        cy.get('#Starter_Jakarta_Version').select(jktVer);  
    }
  }
  cy.get("#starter_submit").click({force: true});

  // for some unknown reason have to add the wait along with click force true to close the modal
  cy.wait(10000);
  cy.get('.modal-dialog',{ timeout:10000 }).should('be.visible');
  if (gOrM == 'g') {    
      cy.get('#cmd_to_run').contains('gradlew libertyDev');
  } else {
         cy.get('#cmd_to_run').contains('mvnw liberty:dev');
  }  
  cy.get('#gen_proj_popup_button').click({force: true}).then(() => {
    // need to make this synchronous because it can do the move and keep going in the loop before
    // the click for the popup happens
         
    cy.readFile(path.join(downloadsFolder, `app-name.zip`)).should("exist");
 
    // rename app-name.zip to ${appname}.zip
    cy.log(`mv app-name.zip to ${downloadsFolder}/${appname}`);
    cy.exec(`mv ${downloadsFolder}/app-name.zip ${downloadsFolder}/${appname}.zip`).then((result) => {
      cy.readFile(downloadsFolder + `/` + appname + `.zip`).should("exist");
    }); 

    // unzip ${appname}.zip
    cy.log(`unzip ${appname}.zip to directory ${downloadsFolder}/${appname}`);
    cy.exec(`unzip ${downloadsFolder}/${appname}.zip -d ${downloadsFolder}/${appname}`).then((result) => {
        cy.readFile(downloadsFolder + `/`  + appname + `/src/main/liberty/config/server.xml`).should("exist");
        // remove zip file 
        cy.exec(`rm ${downloadsFolder}/${appname}.zip`); 
    })
    
  })   
});

// Loop through all the unzipped starter apps and executes the correct build (maven or gradle)
// and then verifies the url for the created server
// gOrM - values are g or m for gradle or maven

Cypress.Commands.add('buildAllAppsAndVerify',(gOrM) => {
  for (let i = 0; i < jakarta_mp_versions.length; i++) {
          const version = jakarta_mp_versions[i];
          const jktVer = version.jakarta;
          cy.log(`jakarta version ` + jktVer);
          const mpVer = version.mp;
          cy.log(`mp version ` + mpVer);

          var jdkVer = Cypress.env('default_jdk');
          var javahome = javase_javahome[jdkVer];

          const appname = 'appzip-jdk' + convertNum2Str[jdkVer] + '-ee' + convertNum2Str[jktVer] + '-mp' + convertNum2Str[mpVer];
          cy.log(`appname ` + appname);
          if (gOrM == 'g') {
             cy.runGradlewLibertyDev(appname,javahome);
             cy.checkLocalSplashPage();
             cy.runGradlewLibertyStop(appname, javahome);
          } else {
             cy.runMVNWLibertyDev(appname,javahome);
             cy.checkLocalSplashPage();
             cy.runMVNWLibertyStop(appname, javahome);
          }
  }
});


Cypress.Commands.add('runGradlewLibertyStop', (appname, javahome) => {
  cy.log(`run gradlew libertyStop with JAVA_HOME=${javahome}`);
  cy.exec(`cd ${downloadsFolder}/${appname} && ./gradlew libertyStop`, {env: { JAVA_HOME: javahome }}).then((result) => {
      cy.log(result.stdout);
      cy.log(result.stderr);
  });
  cy.exec(`ps -eaf | grep java | grep GradleDaemon | awk '{ print $2 }' | xargs kill -9`, { failOnNonZeroExit: false });
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
    const execOptions = { failOnNonZeroExit: false};
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