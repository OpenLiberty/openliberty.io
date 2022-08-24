describe('Check to make sure all blog post author profile link resolves to their developer profile and not 404', () => {  
    before(() => {
        cy.goToBlogs();
    });
  
    it('Check for 404 URLs', () => {
        cy.get('.blog_post_author_name').each((el, index, list) => {
            var href = el[0].href
            cy.request({url: href, failOnStatusCode: true})
        });
    })

    xit('Check for 404 URLs on blog posts with many authors', () => {
        // There are posts that have many authors and can only get to the author's URL by opening the blog post
        cy.get('.blog_post_author_name_additional').each((el, index, list) => {
            // TODO
        });
    })
  });
