module.exports.register = function ({ config }) {
    this.on('documentsConverted', ({playbook, siteAsciiDocConfig, siteCatalog, uiCatalog, contentCatalog }) => {
          console.log("kin2");
          console.log(JSON.stringify(contentCatalog.getComponents()));
      })
  }
