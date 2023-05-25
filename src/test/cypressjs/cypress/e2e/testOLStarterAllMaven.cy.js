describe('Test Open Liberty Starter - Maven', () => {
   
  var starterURL = Cypress.env('default_website_url');
  
  it('Test zip files are downloaded for maven', () => {
      cy.log(`starterURL =  ` + starterURL);
      cy.visit(starterURL + '/start/');
      cy.downloadAndUnzipAllFiles('m');
      cy.buildAllAppsAndVerify('m');
  });

});