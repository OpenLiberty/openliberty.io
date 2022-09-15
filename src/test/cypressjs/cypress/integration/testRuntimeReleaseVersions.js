describe('Test that all runtime release versions are in the correct custom order', () => {
    before(() => {
        cy.goToOpenLibertyStarter();
    });

    it('Test that all runtime release versions are in the correct custom order', () => {
        let ind = [];
        let packages = [];
        let listOfPackLists = [[]];
        let currInd = 0;
        let orderGuide = [
            "Jakarta EE 9",
            "Web Profile 9",
            "MicroProfile 5",
            "Jakarta EE 8",
            "Java EE 8",
            "Web Profile 8",
            "MicroProfile 4",
            "MicroProfile 3",
            "Kernel",
            "All GA Features"]
        cy.get("td[headers='runtime_releases_package']").each((elm, i) => {
            packages.push(elm.text());
            if(elm.text() === "All GA Features"){
                ind.push(i);
            }
        }).then(() => {
            for(let j = 0; j < packages.length; j++){
                listOfPackLists[currInd].push(packages[j]);
                if(packages[j] === "All GA Features"){
                    listOfPackLists.push([]);
                    currInd++;
                }
            }
            listOfPackLists.pop()
        }).then(() => {
            listOfPackLists.forEach((item) => {
                for(let i = 0; i < item.length-1; i++){
                    let itemIndex = orderGuide.indexOf(item[i]);
                    let nextItemIndex = orderGuide.indexOf(item[i+1]);
                    cy.expect(itemIndex).to.be.lessThan(nextItemIndex);
                }

            })
        })
    })
});
