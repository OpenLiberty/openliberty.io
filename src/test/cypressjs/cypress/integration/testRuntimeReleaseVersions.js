describe('Test that all runtime release versions are in the correct custom order', () => {
    before(() => {
        cy.goToOpenLibertyStarter();
    });

    it('Test that all runtime release versions are in the correct custom order', () => {
        let ind = [];
        let packages = [];
        let listOfPackLists = [[]];
        let currInd = 0;

        // This list has to be updated whenever new levels are added, basically just make sure that
        // the order represents the top to bottom order in terms of what would be listed first
        // for example Jakarta EE 8 is never listed higher than Web Profile 9 and MicroProfile 5 but always 
        // higher than MicroProfile 4 and Web Profile 8
        
        let orderGuide = [
            "Jakarta EE 10",
            "Jakarta EE 9",          
            "Web Profile 10",
            "Web Profile 9",           
            "MicroProfile 6",
            "MicroProfile 5",
            "Jakarta EE 8",
            "Web Profile 8",            
            "MicroProfile 4",
            "Kernel",
            "All GA Features"]
        cy.get("td[headers='runtime_releases_package']").each((elm, i) => {
            if (elm.text().includes("Jakarta EE 10")) {              
                packages.push("Jakarta EE 10");
            } else {
               if (elm.text().includes("Jakarta EE 8")) {               
                packages.push("Jakarta EE 8");
               } else {
                packages.push(elm.text());
               }
            }   
           
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
