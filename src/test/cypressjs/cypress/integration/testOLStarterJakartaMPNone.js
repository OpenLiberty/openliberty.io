describe('Test Open Liberty Starter -  Java EE/Jakarta EE/Microprofile None', () => {
    // If we select None for MicroProfile, should have zero influence on the Java EE/Jakarta EE value and
    // If we select None for Java EE/Jakarta EE, it should have zero influence on the MicroProfile
    // Previously when we select None for MicroProfile it automatically sets Java EE/Jakarta EE default value 9.1 and 
    // when we select None for Java EE/Jakarta EE it automatically sets MicroProfile default value 5.0 with message banner
    // Now no message banner should be shown if we select None for Java EE/Jakarta EE/Microprofile
    
    let jakarta_mp_versions = [
        {
          jakarta: "9.1",
          mp: "None"
        },
        {
          jakarta: "8.0",
          mp: "None"
        },
        {
          jakarta: "7.0",
          mp: "None"
        },
        {
          jakarta: "None",
          mp: "5.0"
        },
        {
          jakarta: "None",
          mp: "4.1"
        },
        {
          jakarta: "None",
          mp: "3.3"
        },
        {
          jakarta: "None",
          mp: "2.2"
        },
        {
          jakarta: "None",
          mp: "1.4"
        },
        {
          jakarta: "None",
          mp: "None"
        }
    ]

    // tests
    it('Test None for all alternate Java EE/Jakarta EE/Microprofile Versions', () => {
        cy.goToOpenLibertyStarter();
        for (let i = 0; i < jakarta_mp_versions.length; i++) {
            const version = jakarta_mp_versions[i];
            const jktVer = version.jakarta;
            cy.log(`jakarta version ` + jktVer);
            const mpVer = version.mp;
            cy.log(`mp version ` + mpVer);
            cy.get('#Starter_Jakarta_Version').select(jktVer);
            cy.get('#Starter_MicroProfile_Version').select(mpVer);
        }
    })

    
    it('Test if None Selected no message banner is shown and if correct versions selected message banner is shown', () => {
        cy.get('#Starter_Jakarta_Version').select("8.0");
        cy.get('#Starter_MicroProfile_Version').select("4.1");
        cy.get('#starter_warnings p').should('exist')
        cy.get('#Starter_MicroProfile_Version').select("None");
        cy.get('#starter_warnings p').should('not.exist')
        cy.get('#Starter_MicroProfile_Version').select("1.4");
        cy.get('#starter_warnings p').should('exist')
        cy.get('#Starter_Jakarta_Version').select("None");
        cy.get('#starter_warnings p').should('not.exist')
    })

    it('Test if None selected for both Java EE/Jakarta EE and Microprofile Version Generate Project should be disabled and viceversa', () => {
        cy.get('#Starter_Jakarta_Version').select("None");
        cy.get('#Starter_MicroProfile_Version').select("None");
        cy.get('#starter_submit').should('have.class', 'disabled'); //button should be disabled

        cy.get('#Starter_MicroProfile_Version').select("3.3");
        cy.get('#Starter_Jakarta_Version').select("None");
        cy.get('#starter_submit').should('not.have.class', 'disabled'); //button should be enabled
    });

});