describe('Accessibility tests for main pages', () => {
    it('Testing Home page',()=>{
        cy.visit('https://openliberty.io/');
        cy.getCompliance('./OL.io/home');
    });
    it('Testing Start page',()=>{
        cy.visit('https://openliberty.io/start/');
        cy.getCompliance('./OL.io/start');
    });
    it('Testing Guides page',()=>{
        cy.visit('https://openliberty.io/guides/');
        cy.getCompliance('./OL.io/guides');
    });
    it('Testing Blogs page',()=>{
        cy.visit('https://openliberty.io/blogs/');
        cy.getCompliance('./OL.io/blogs');
    })
    it('Testing Support page',()=>{
        cy.visit('https://openliberty.io/support/');
        cy.getCompliance('./OL.io/support');
    })
    it('Testing Docs page',()=>{
        cy.visit('https://openliberty.io/docs/latest/overview.html');
        cy.getCompliance('./OL.io/docs');
    })
});