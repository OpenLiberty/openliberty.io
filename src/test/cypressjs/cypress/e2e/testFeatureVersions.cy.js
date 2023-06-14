/**
 * Helper method to check that the array's elements are in descending order
 * @param {*} array 
 * @returns 
 */
function isDescending(array) {
    return array.every(function (x, i) {
        return i === 0 || x <= array[i - 1];
    });
}

describe('Test that all feature versions are in descending order', () => {
    before(() => {
        cy.goToFeatureDocs();
    });

    it('Test that all feature versions are in descending order', () => {
        // These pages do not have the same structure as the rest of the feature pages.
        // Do not know why these pages are different
        const skipPages = ["j2eeManagement-1.1.html", "kernel.html"]

        const tableOfContent_features = cy.get("a.nav-link").contains("Features")
        const listOfFeatures = tableOfContent_features.siblings(".nav-list")

        listOfFeatures.find("a").then((foo) => {
            foo.each((index, element) => {

                // *****
                // Check if this page needs to be skipped
                const page = element.href.split('/').pop()
                if(skipPages.indexOf(page) > -1) {
                    cy.log("Skipping page: " + page)
                    return true
                }

                // *****
                // Go to the feature page
                cy.visit(element.href)
                
                // *****
                // Check if the versions are sorted correctly
                cy.get("#feature_versions").children().then((versions) => {
                    if (versions.length > 1) {
                        // Only check features that have multiple versions
                        const arr = Array.from(versions).map(el => parseFloat(el.innerText))
                        cy.expect(isDescending(arr)).to.be.true
                    }
                })
            })
        })
    })
});
