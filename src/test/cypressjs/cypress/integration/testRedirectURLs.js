describe('Test Redirect URLs', () => {
  let redirects = "";
  // Allow users to specify URL via cypress environment variable
  // For example:
  //    npx cypress open --env website_url=https://openliberty.io
  const target_url = Cypress.env('website_url') || Cypress.env('default_website_url');

  before(() => {
    cy.request(Cypress.env('redirects_url')).then((res) => {
      // Remove all the Java Properties comment lines, i.e. #...
      redirects = res?.body?.split('\n').filter((f) => !f.startsWith('#'))
    })
  });

  it('Verifying redirect urls', () => {
    redirects.forEach((redirect) => {
      const tokens = redirect.split('=');
      if (tokens[0].endsWith('*') || !tokens[0].startsWith('/docs')) {
        // Do not know how to handle redirects that have * at the end
        // Do not know how to handle urls that are not /docs
        return;
      } else {
        cy.visit(Cypress.env('website_url') + tokens[0])
      }
    })
  })
});
