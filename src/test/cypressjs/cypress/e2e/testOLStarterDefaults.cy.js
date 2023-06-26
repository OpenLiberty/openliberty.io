
describe('Test Open Liberty Starter - Maven Default EE and MP', () => {
    // Test the default values for the starter   
  
    const default_javahome = Cypress.env('jdk_11_home');
    const appname = "app-name-m-default";
    const downloadsFolder = Cypress.config('downloadsFolder');
    const eeDefault = "10.0";
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

});