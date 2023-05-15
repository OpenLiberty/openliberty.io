
describe('Test Open Liberty Starter - Maven Default EE and MP', () => {
    const downloadsFolder = Cypress.config('downloadsFolder');
    // Allow users to specify URL via cypress environment variable
    // For example:
    //    npx cypress open --env website_url=https://openliberty.io

    // user can modify the java home path for jdk17, jdk11 in cypress.env.json
    const javase_javahome = {
        17: Cypress.env('jdk_17_home'),
        11: Cypress.env('jdk_11_home'),
    };

    const javase_appname = {
        17: "app-name-m-jdkseventeen",
        11: "app-name-m-jdkeleven",
   };


    // tests
    it('Default values for Open Liberty Starter', () => {
        cy.goToOpenLibertyStarter();
        cy.get("#Starter_Base_Package").should("have.value", "com.demo");
        cy.get("#Starter_App_Name").should("have.value", "app-name");
        cy.get("#starter_section input[type=radio]:checked").should("have.value", "maven");
        cy.get("#Starter_Java_Version").should("have.value", "11");
        cy.get("#Starter_Jakarta_Version").should("have.value", "10");
        cy.get("#Starter_MicroProfile_Version").should("have.value", "6.0");
    });

    it('Test zip file is downloaded with default values', () => {
        cy.exec(`rm -rf ${downloadsFolder}`);
        // download zip for all JDKs
        for (const javase in javase_appname) {
            const appname = javase_appname[javase];
            cy.log('appname ' + appname);
            cy.log('javase ' + javase);

            cy.goToOpenLibertyStarter();
            cy.downloadAndUnZipFileMaven(appname, javase);
        }
    });

    it('Test Open Liberty Starter - JDK17 Jarkata 10, MP 6.0', () => {
        const appname = javase_appname[17];
        const javahome = javase_javahome[17];
       
        cy.runMVNWLibertyDev(appname, javahome);
        cy.checkLocalSplashPage();
        cy.runMVNWLibertyStop(appname, javahome);
    });

    it('Test Open Liberty Starter - JDK11 Jarkata 10, MP 6.0', () => {
        const appname = javase_appname[11];
        const javahome = javase_javahome[11];

        cy.runMVNWLibertyDev(appname, javahome);
        cy.checkLocalSplashPage();
        cy.runMVNWLibertyStop(appname, javahome);
    });

});
