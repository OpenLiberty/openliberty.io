
describe('Test Open Liberty Starter - Maven Default EE and MP', () => {
    // Allow users to specify URL via variables found in cypress.env.json    
    // java home path for jdk17, jdk11, jdk8 can be change via cypress.env.json base on user env var
    // this test will only download the starter for the default_jdk in that file

    const default_javahome = Cypress.env('jdk_11_home');
    const appname = "app-name-m-default";
    const downloadsFolder = Cypress.config('downloadsFolder');
    const eeDefault = "10";
    const mpDefault = "6.0"
    const javaDefault = Cypress.env('default_jdk');

    // tests
    it('Default values for Open Liberty Starter', () => {
        cy.goToOpenLibertyStarter();
        cy.get("#Starter_Base_Package").should("have.value", "com.demo");
        cy.get("#Starter_App_Name").should("have.value", "app-name");
        cy.get("#starter_section input[type=radio]:checked").should("have.value", "maven");
        cy.get("#Starter_Java_Version").should("have.value", javaDefault);
        cy.get("#Starter_Jakarta_Version").should("have.value", eeDefault);
        cy.get("#Starter_MicroProfile_Version").should("have.value", mpDefault);
    });

    it('Test zip file is downloaded with default values', () => {
        cy.exec(`rm -rf ${downloadsFolder}`, { failOnNonZeroExit: false });
        // download zip for the defaults      
        cy.log('appname ' + appname);
        cy.log('javaLevel ' + javaDefault);
        cy.goToOpenLibertyStarter();
        cy.downloadAndUnzipFile(appname, eeDefault, mpDefault,'m');
        cy.runMVNWLibertyDev(appname, default_javahome);
        cy.checkLocalSplashPage();
        cy.runMVNWLibertyStop(appname, default_javahome);
    });
});