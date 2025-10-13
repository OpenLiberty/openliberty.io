import {samples,other_samples} from "../../docs_samples/microprofile_samples";
describe('Microprofile Accesibility Tests', () => {
    samples.forEach((version)=>{
        version.tests.forEach((test)=>{
            it(`Testing version ${version.version} ${test.section}`,()=>{
                cy.visit(test.url1);
                cy.getCompliance(`./MICROPROFILE/${version.version}/microprofile_${test.section.toLowerCase()}1`);
                if(test.url2){
                    cy.visit(test.url2);
                    cy.getCompliance(`./MICROPROFILE/${version.version}/microprofile_${test.section.toLowerCase()}2`);
                }            
            })
        })       
    })
    other_samples.forEach((sample)=>{
        it(`Testing ${sample.name}`,()=>{
            cy.visit(sample.url);
            cy.getCompliance(`./MICROPROFILE/other_samples/${sample.name.toLowerCase()}`);
        })    
    })
})