describe('Test No Copy attribute on code blocks', () => {  
    before(() => {
        cy.goToBlogs();
        cy.url().then(foo => {
            cy.visit(foo+"2021/09/03/microprofile-21009.html");
        })
    });
  
    it('Test code block with and without "no_copy" className', () => {
        cy.get('.no_copy').first().trigger('mouseover');
        cy.get('#copy_to_clipboard').should('not.exist');

        cy.get('pre').first().trigger('mouseover');
        cy.get('#copy_to_clipboard').should('be.visible');
    })
  });
