import {samples} from "../../docs_samples/java_samples";
describe('Java Accesibility Tests', () => {
    samples.forEach((version)=>{
        version.tests.forEach((test)=>{
            it(`Testing version ${version.version} ${test.section}`,()=>{
                cy.visit(test.url1);
                cy.getCompliance(`./JAVA/${version.version}/java_${test.section.toLowerCase()}1`);
                if(test.url2){
                    cy.visit(test.url2);
                    cy.getCompliance(`./JAVA/${version.version}/java_${test.section.toLowerCase()}2`);
                }            
            })
        })       
    })
})