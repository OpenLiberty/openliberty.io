import {samples} from "../docs_samples/ol_spi_samples";
describe('Openliberty SPI Accesibility Tests', () => {
    samples.forEach((sample)=>{
        it(`Testing ${sample.section}`,()=>{
            cy.visit(sample.url1);
            cy.getCompliance(`./OL_SPI/ol_spi_${sample.section.toLowerCase()}1`);
            if(sample.url2){
                cy.visit(sample.url2);
                cy.getCompliance(`./OL_SPI/ol_spi_${sample.section.toLowerCase()}2`);
            }            
        })
    })
})