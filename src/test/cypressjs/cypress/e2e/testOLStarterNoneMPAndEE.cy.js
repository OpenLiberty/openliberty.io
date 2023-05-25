describe('Test Open Liberty Starter -  Java EE/Jakarta EE/Microprofile if version selected as None', () => {
    // If we select None for MicroProfile, should have zero influence on the Java EE/Jakarta EE value and
    // If we select None for Java EE/Jakarta EE, it should have zero influence on the MicroProfile
    
    // TODO need to figure out what the correct behavior here is, there is currently an open issue
    // to determin this https://github.com/OpenLiberty/openliberty.io/issues/3117
    
    let jakarta_mp_versions = [
      {
        jakarta: "10",
        mp: "6.0"
      },
      {
        jakarta: "10",
        mp: "None"
      },
      {
        jakarta: "9.1",
        mp: "5.0"
      },
      {
        jakarta: "9.1",
        mp: "None"
      },
      {
        jakarta: "8.0",
        mp: "4.1"
      },
      {
        jakarta: "8.0",
        mp: "3.3"
      },
      {
        jakarta: "8.0",
        mp: "2.2"
      },
      {
        jakarta: "8.0",
        mp: "None"
      },
      {
        jakarta: "7.0",
        mp: "1.4"
      },
      {
        jakarta: "7.0",
        mp: "None"
      },
      {
        jakarta: "None",
        mp: "6.0"
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
            cy.pause();
        }
    })

    
    it('Test if None Selected no message banner is shown and if correct versions selected message banner is shown', () => {
        cy.goToOpenLibertyStarter(); 
        cy.get('#Starter_Jakarta_Version').select("8.0");
        cy.get('#Starter_MicroProfile_Version').select("4.1");
        cy.get('#starter_warnings p').should('exist') //message should be shown

        cy.get('#Starter_MicroProfile_Version').select("None");
        cy.get('#starter_warnings p').should('not.exist') //message should not be shown

        cy.get('#Starter_MicroProfile_Version').select("1.4");
        cy.get('#starter_warnings p').should('exist') //message should be shown

        cy.get('#Starter_Jakarta_Version').select("None");
        cy.get('#starter_warnings p').should('not.exist') //message should not be shown
    })

    it('Test if None selected for both Java EE/Jakarta EE and Microprofile Version Generate Project should be disabled and viceversa', () => {
        cy.goToOpenLibertyStarter();
        cy.get('#Starter_Jakarta_Version').select("None");
        cy.get('#Starter_MicroProfile_Version').select("None");
        cy.get('#starter_submit').should('have.class', 'disabled'); //button should be disabled

        cy.get('#Starter_MicroProfile_Version').select("3.3");
        cy.get('#Starter_Jakarta_Version').select("None");
        cy.get('#starter_submit').should('not.have.class', 'disabled'); //button should be enabled
    });

});
