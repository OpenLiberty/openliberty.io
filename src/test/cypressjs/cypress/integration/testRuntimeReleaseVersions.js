/**
 * Helper method to check that the array's elements are in custom runtime order
 * @param {*} array 
 * @returns 
 */
 function inCustomOrder(array) {
    
}

describe('Test that all runtime release versions are in the correct custom order', () => {
    before(() => {
        cy.goToOpenLibertyStarter();
    });

    it('Test that all runtime release versions are in the correct custom order', () => {

        const runtimeReleaseTable = cy.get(".release_table_body tr").eq(2);
        cy.log(runtimeReleaseTable);
        // const listOfReleases = runtimeReleaseTable.siblings(".nav-list")

    //     listOfFeatures.find("a").then((foo) => {
    //         foo.each((index, element) => {

    //             // *****
    //             // Check if this page needs to be skipped
    //             const page = element.href.split('/').pop()
    //             if(skipPages.indexOf(page) > -1) {
    //                 cy.log("Skipping page: " + page)
    //                 return true
    //             }

    //             // *****
    //             // Go to the feature page
    //             cy.visit(element.href)
                
    //             // *****
    //             // Check if the versions are sorted correctly
    //             cy.get("#feature_versions").children().then((versions) => {
    //                 if (versions.length > 1) {
    //                     // Only check features that have multiple versions
    //                     const arr = Array.from(versions).map(el => parseFloat(el.innerText))
    //                     cy.expect(isDescending(arr)).to.be.true
    //                 }
    //             })
    //         })
    //     })
    })
});
