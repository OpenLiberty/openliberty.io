const path = require("path");

describe('Test Open Liberty Starter - Gradle', () => {
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
        cy.get('#build_system_gradle').click();
        cy.get("#starter_section input[type=radio]:checked").should("have.value", "gradle");
        cy.get("#Starter_Java_Version").should("have.value", "11");
        cy.get("#Starter_Jakarta_Version").should("have.value", "9.1");
        cy.get("#Starter_MicroProfile_Version").should("have.value", "5.0");
    });

    // it('Test Java SE 17', () => {

    // });
    // it('Test Java SE 11 ', () => {

    // });
    // it('Test Java SE 8 ', () => {

    // });


    it('Test zip files are downloaded with gradle', () => {
        cy.exec(`rm -rf ${downloadsFolder}`);

        cy.goToOpenLibertyStarter();

        //
        // Zip with Java SE 11
        //
        const javase_appname = {
            17: "app-name-seventeen", 
            11: "app-name-eleven", 
            8: "app-name-eight"
        };

        for(const javase in javase_appname) {
            const appname = javase_appname[javase];
            cy.get('#build_system_gradle').click();
            cy.get("#Starter_App_Name").clear().type(appname);
            cy.get('#Starter_Java_Version').select(javase);
            cy.get("#starter_submit").click();
            cy.get('.modal-dialog').should('be.visible');
            cy.get('#cmd_to_run').contains('gradlew libertyDev');
            cy.get("#gen_proj_popup_button").click(); // clear modal
    
            cy.readFile(path.join(downloadsFolder, `${appname}.zip`)).should("exist");
            cy.exec(`which unzip`).then((result) => {
                cy.log(result.stdout);
            });
            cy.log(`unzip ${appname}.zip to directory ${downloadsFolder}/${appname}`);
            cy.exec(`unzip ${downloadsFolder}/${appname}.zip -d ${downloadsFolder}/${appname}`).its('stderr').should('be.empty');
        }
    });

    it('Run gradlew libertyDev', () => {
        // const java17 = "/Library/Java/JavaVirtualMachines/ibm-semeru-open-17.jdk/Contents/Home";
        // const javahome = "/Library/Java/JavaVirtualMachines/temurin-11.jdk/Contents/Home";
        // const java8 = "/Library/Java/JavaVirtualMachines/adoptopenjdk-8.jdk/Contents/Home";
        const javase_javahome = {
            17: "/Library/Java/JavaVirtualMachines/ibm-semeru-open-17.jdk/Contents/Home", 
            11: "/Library/Java/JavaVirtualMachines/temurin-11.jdk/Contents/Home", 
            8: "/Library/Java/JavaVirtualMachines/adoptopenjdk-8.jdk/Contents/Home"
        };

        const javase_appname = {
            17: "app-name-seventeen", 
            11: "app-name-eleven", 
            8: "app-name-eight"
        };

        for(const javase in javase_javahome) {
            const appname = javase_appname[javase];
            const javahome = javase_javahome[javase];

            cy.log(`run gradlew libertyDev inside directory ${downloadsFolder}/${appname} with JAVA_HOME=${javahome}`);
            const execOptions = { failOnNonZeroExit: true, env: { JAVA_HOME: javahome } }
            cy.exec(`scripts/buildGradle.sh ${downloadsFolder}/${appname}`, execOptions).then((result) => {
                cy.log('Displaying output');
                cy.log(result.stdout);
                cy.log(result.code);
                cy.log(result.stderr);
            });
            cy.readFile(downloadsFolder + `/${appname}/output.txt`, {timeout: 300000}).should('contain', 'CWWKF0011I: The defaultServer server is ready to run a smarter planet');
    
            cy.log(`Check the local OL splash page is running`);
            cy.goToLocalSplashPage();
            cy.get('h3').should('contain', 'Welcome to');
            cy.get('#inner-hero__title').should('have.attr', 'src', '/img/open_liberty_title.png');
    
            cy.log(`run gradlew libertyStop`);
            cy.exec(`cd ${downloadsFolder}/${appname} && ./gradlew libertyStop`, {env: { JAVA_HOME: javahome }}).then((result) => {
                cy.log(result.stdout);
                cy.log(result.stderr);
            });
            cy.exec(`ps -eaf | grep java | grep GradleDaemon | awk '{ print $2 }' | xargs kill -9`, { failOnNonZeroExit: false });
        }


    });

    xit('Check the local splash page after defaultServer is started', () => {
        cy.log(`Check the local OL splash page is running`);
        cy.goToLocalSplashPage();
        cy.get('h3').should('contain', 'Welcome to');
        cy.get('#inner-hero__title').should('have.attr', 'src', '/img/open_liberty_title.png');
    });

    xit('Run gradlew libertyStop', () => {
        cy.log(`run gradlew libertyStop`);
        cy.exec(`cd ${downloadsFolder}/${appname} && ./gradlew libertyStop`).then((result) => {
            cy.log(result.stdout);
            cy.log(result.stderr);
        });
        cy.exec(`ps -eaf | grep java | grep GradleDaemon | awk '{ print $2 }' | xargs kill -9`, { failOnNonZeroExit: false });
    });
});