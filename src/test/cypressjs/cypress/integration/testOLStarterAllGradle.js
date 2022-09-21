
describe('Test Open Liberty Starter - Gradle', () => {
    const downloadsFolder = Cypress.config('downloadsFolder');
    // Allow users to specify URL via cypress environment variable
    // For example:
    //    npx cypress open --env website_url=https://openliberty.io
    
    let jdkVer = Cypress.env('default_jdk');

    const javase_javahome = {
        17: Cypress.env('jdk_17_home'),
        11: Cypress.env('jdk_11_home'),
        8: Cypress.env('jdk_8_home')
    };

    const javase_appname = {
        17: "app-name-jdkseventeen",
        11: "app-name-jdkeleven",
        8: "app-name-jdkeight"
    };

    const convertNum2Str = {
        '9.1': 'jktnineone',
        '8.0': 'jkteight',
        '7.0': 'jktseven',
        '5.0': 'mpfive',
        '4.1': 'mpfourone',
        '3.3': 'mpthreethree',
        '2.2': 'mptwotwo',
        '1.4': 'mponefour',
        None: 'none'
    };

    let jakarta_mp_versions = [
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
    it('Test zip file is downloaded with gradle', () => {
        cy.exec(`rm -rf ${downloadsFolder}`);

        cy.goToOpenLibertyStarter();

        for (let i = 0; i < jakarta_mp_versions.length; i++) {
            const version = jakarta_mp_versions[i];
            cy.log(`jdk version ` + jdkVer);
            const jktVer = version.jakarta;
            cy.log(`jakarta version ` + jktVer);
            const mpVer = version.mp;
            cy.log(`mp version ` + mpVer);
       
            const appname = javase_appname[jdkVer]+'-g-'+convertNum2Str[jktVer]+'-'+convertNum2Str[mpVer];
            cy.log(`appname ` + appname);

            cy.downloadAndUnZipFileGradle(appname, jdkVer, jktVer, mpVer);
        }
    });

    // Jakarta 9.1, MP 5.0
    it('Test Open Liberty Starter - JDK' + jdkVer + ' Jakarta 9.1, MP 5.0', () => {
        const appname = javase_appname[jdkVer]+'-g-'+convertNum2Str["9.1"]+'-'+convertNum2Str["5.0"];
        const javahome = javase_javahome[jdkVer];
        cy.log('appname ' + appname);
        cy.log('javahome ' + javahome);

        cy.runGradlewLibertyDev(appname, javahome);
    });

    // Note: for this gradle test Jakarta 9.1 & MP 5.0, separate calls to check local splash page & run gradlew libertyStop
    // to prevent the re-run of runGradlewLibertyDev twice - idk why cypress does this
    it('Check local Splashpage - JDK' + jdkVer + ' Jakarta 9.1, MP 5.0', () => {
        cy.checkLocalSplashPage();
    });

    it('Run gradlew libertyStop - JDK' + jdkVer + ' Jakarta 9.1, MP 5.0', () => {
        const appname = javase_appname[jdkVer]+'-g-'+convertNum2Str["9.1"]+'-'+convertNum2Str["5.0"];
        const javahome = javase_javahome[jdkVer];

        cy.runGradlewLibertyStop(appname, javahome);
    });
   
    // Jakarta 9.1, MP None
    it('Test Open Liberty Starter - JDK' + jdkVer + ' Jakarta 9.1, MP None', () => {
        const appname = javase_appname[jdkVer]+'-g-'+convertNum2Str["9.1"]+'-'+convertNum2Str["None"];
        cy.log('appname ' + appname);
        const javahome = javase_javahome[jdkVer];

        cy.runGradlewLibertyDev(appname, javahome);
        cy.checkLocalSplashPage();
        cy.runGradlewLibertyStop(appname, javahome);
    });

    // Jakarta 8.0, MP 4.1
    it('Test Open Liberty Starter - JDK' + jdkVer + ' Jakarta 8.0, MP 4.1 ', () => {
        const appname = javase_appname[jdkVer]+'-g-'+convertNum2Str["8.0"]+'-'+convertNum2Str["4.1"];
        const javahome = javase_javahome[jdkVer];

        cy.runGradlewLibertyDev(appname, javahome);
        cy.checkLocalSplashPage();
        cy.runGradlewLibertyStop(appname, javahome);
    });

    // Jakarta 8.0, MP 3.3
    it('Test Open Liberty Starter - JDK' + jdkVer + ' Jakarta 8.0, MP 3.3', () => {
        const appname = javase_appname[jdkVer]+'-g-'+convertNum2Str["8.0"]+'-'+convertNum2Str["3.3"];
        const javahome = javase_javahome[jdkVer];

        cy.runGradlewLibertyDev(appname, javahome);
        cy.checkLocalSplashPage();
        cy.runGradlewLibertyStop(appname, javahome);
    });

    // Jakarta 8.0, MP 2.2
    it('Test Open Liberty Starter - JDK' + jdkVer + ' Jakarta 8.0, MP 2.2', () => {
        const appname = javase_appname[jdkVer]+'-g-'+convertNum2Str["8.0"]+'-'+convertNum2Str["2.2"];
        const javahome = javase_javahome[jdkVer];

        cy.runGradlewLibertyDev(appname, javahome);
        cy.checkLocalSplashPage();
        cy.runGradlewLibertyStop(appname, javahome);
    });

    // Jakarta 8.0, MP None
    it('Test Open Liberty Starter - JDK' + jdkVer + ' Jakarta 8.0, MP None', () => {
        const appname = javase_appname[jdkVer]+'-g-'+convertNum2Str["8.0"]+'-'+convertNum2Str["None"];
        cy.log('appname ' + appname);
        const javahome = javase_javahome[jdkVer];

        cy.runGradlewLibertyDev(appname, javahome);
        cy.checkLocalSplashPage();
        cy.runGradlewLibertyStop(appname, javahome);
    });

    // Jakarta 7.0, MP 1.4
    it('Test Open Liberty Starter - JDK' + jdkVer + ' Jakarta 7.0, MP 1.4', () => {
        const appname = javase_appname[jdkVer]+'-g-'+convertNum2Str["7.0"]+'-'+convertNum2Str["1.4"];
        const javahome = javase_javahome[jdkVer];

        cy.runGradlewLibertyDev(appname, javahome);
        cy.checkLocalSplashPage();
        cy.runGradlewLibertyStop(appname, javahome);
    });

    // Jakarta 7.0, MP None
    it('Test Open Liberty Starter - JDK' + jdkVer + ' Jakarta 7.0, MP None', () => {
        const appname = javase_appname[jdkVer]+'-g-'+convertNum2Str["7.0"]+'-'+convertNum2Str["None"];
        cy.log('appname ' + appname);
        const javahome = javase_javahome[jdkVer];

        cy.runGradlewLibertyDev(appname, javahome);
        cy.checkLocalSplashPage();
        cy.runGradlewLibertyStop(appname, javahome);
    });

    // Jakarta None, MP 5.0
    it('Test Open Liberty Starter - JDK' + jdkVer + ' Jakarta None, MP 5.0', () => {
        const appname = javase_appname[jdkVer]+'-g-'+convertNum2Str["None"]+'-'+convertNum2Str["5.0"];
        const javahome = javase_javahome[jdkVer];

        cy.runGradlewLibertyDev(appname, javahome);
        cy.checkLocalSplashPage();
        cy.runGradlewLibertyStop(appname, javahome);
    });

    // Jakarta None, MP 4.1
    it('Test Open Liberty Starter - JDK' + jdkVer + ' Jakarta None, MP 4.1', () => {
        const appname = javase_appname[jdkVer]+'-g-'+convertNum2Str["None"]+'-'+convertNum2Str["4.1"];
        const javahome = javase_javahome[jdkVer];

        cy.runGradlewLibertyDev(appname, javahome);
        cy.checkLocalSplashPage();
        cy.runGradlewLibertyStop(appname, javahome);
    });

    // Jakarta None, MP 3.3
    it('Test Open Liberty Starter - JDK' + jdkVer + ' Jakarta None, MP 3.3', () => {
        const appname = javase_appname[jdkVer]+'-g-'+convertNum2Str["None"]+'-'+convertNum2Str["3.3"];
        const javahome = javase_javahome[jdkVer];

        cy.runGradlewLibertyDev(appname, javahome);
        cy.checkLocalSplashPage();
        cy.runGradlewLibertyStop(appname, javahome);
    });

    // Jakarta None, MP 2.2
    it('Test Open Liberty Starter - JDK' + jdkVer + ' Jakarta None, MP 2.2', () => {
        const appname = javase_appname[jdkVer]+'-g-'+convertNum2Str["None"]+'-'+convertNum2Str["2.2"];
        const javahome = javase_javahome[jdkVer];

        cy.runGradlewLibertyDev(appname, javahome);
        cy.checkLocalSplashPage();
        cy.runGradlewLibertyStop(appname, javahome);
    });

    // Jakarta None, MP 1.4
    it('Test Open Liberty Starter - JDK' + jdkVer + ' Jakarta None, MP 1.4', () => {
        const appname = javase_appname[jdkVer]+'-g-'+convertNum2Str["None"]+'-'+convertNum2Str["1.4"];
        const javahome = javase_javahome[jdkVer];

        cy.runGradlewLibertyDev(appname, javahome);
        cy.checkLocalSplashPage();
        cy.runGradlewLibertyStop(appname, javahome);
    });

});