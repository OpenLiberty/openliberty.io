describe('Openliberty SPI Accesibility Tests', () => {
  it('Overview', () => {
    cy.visit('https://openliberty.io/docs/latest/reference/javadoc/spi/appClientSupport-1.0.com.ibm.ws.adaptable.module.structure.html?path=24.0.0.3/com.ibm.websphere.appserver.spi.artifact_1.2-javadoc/index.html');
    cy.getCompliance("./OL_SPI/ol_spi_overview1");
    cy.visit('https://openliberty.io/docs/latest/reference/javadoc/spi/ejbLite-3.2.com.ibm.ws.adaptable.module.structure.html?path=24.0.0.3/com.ibm.websphere.appserver.spi.artifact_1.2-javadoc/index.html');
    cy.getCompliance("./OL_SPI/ol_spi_overview2");
  })

  it('Packages', () => {
    cy.visit('https://openliberty.io/docs/latest/reference/javadoc/spi/appClientSupport-1.0.com.ibm.wsspi.adaptable.module.html?path=24.0.0.3/com.ibm.websphere.appserver.spi.artifact_1.2-javadoc/com/ibm/wsspi/adaptable/module/package-summary.html');
    cy.getCompliance("./OL_SPI/ol_spi_package1");
    cy.visit('https://openliberty.io/docs/latest/reference/javadoc/spi/ejbLite-3.2.com.ibm.wsspi.anno.classsource.html?path=24.0.0.3/com.ibm.websphere.appserver.spi.anno_1.1-javadoc/com/ibm/wsspi/anno/classsource/package-summary.html');
    cy.getCompliance("./OL_SPI/ol_spi_package2");
  })

  it('Deprecated', () => {
    cy.visit('https://openliberty.io/docs/latest/reference/javadoc/spi/appClientSupport-1.0.com.ibm.ws.adaptable.module.structure.html?path=24.0.0.3/com.ibm.websphere.appserver.spi.artifact_1.2-javadoc/deprecated-list.html');
    cy.getCompliance("./OL_SPI/ol_spi_deprecated1");
    cy.visit('https://openliberty.io/docs/latest/reference/javadoc/spi/ejbLite-3.2.com.ibm.ws.adaptable.module.structure.html?path=24.0.0.3/com.ibm.websphere.appserver.spi.artifact_1.2-javadoc/deprecated-list.html');
    cy.getCompliance("./OL_SPI/ol_spi_deprecated2");
  })

  it('Help', () => {
    cy.visit('https://openliberty.io/docs/latest/reference/javadoc/spi/appClientSupport-1.0.com.ibm.wsspi.adaptable.module.adapters.html?path=24.0.0.3/com.ibm.websphere.appserver.spi.artifact_1.2-javadoc/help-doc.html');
    cy.getCompliance("./OL_SPI/ol_spi_help1");
    cy.visit('https://openliberty.io/docs/latest/reference/javadoc/spi/ejbLite-3.2.com.ibm.ws.adaptable.module.structure.html?path=24.0.0.3/com.ibm.websphere.appserver.spi.artifact_1.2-javadoc/help-doc.html');
    cy.getCompliance("./OL_SPI/ol_spi_help2");
  })

  it('Tree', () => {
    cy.visit('https://openliberty.io/docs/latest/reference/javadoc/spi/appClientSupport-1.0.com.ibm.ws.adaptable.module.structure.html?path=24.0.0.3/com.ibm.websphere.appserver.spi.artifact_1.2-javadoc/overview-tree.html');
    cy.getCompliance("./OL_SPI/ol_spi_tree1");
    cy.visit('https://openliberty.io/docs/latest/reference/javadoc/spi/ejbLite-3.2.com.ibm.wsspi.anno.classsource.html?path=24.0.0.3/com.ibm.websphere.appserver.spi.anno_1.1-javadoc/com/ibm/wsspi/anno/classsource/package-tree.html');
    cy.getCompliance("./OL_SPI/ol_spi_tree2");
  })

  it('Class', () => {
    cy.visit('https://openliberty.io/docs/latest/reference/javadoc/spi/appClientSupport-1.0.com.ibm.wsspi.adaptable.module.html?path=24.0.0.5/com.ibm.websphere.appserver.spi.artifact_1.2-javadoc/com/ibm/wsspi/adaptable/module/DefaultNotification.html');
    cy.getCompliance("./OL_SPI/ol_spi_class1");
    cy.visit('https://openliberty.io/docs/latest/reference/javadoc/spi/ejbLite-3.2.com.ibm.wsspi.artifact.html?path=24.0.0.3/com.ibm.websphere.appserver.spi.artifact_1.2-javadoc/com/ibm/wsspi/artifact/DefaultArtifactNotification.html');
    cy.getCompliance("./OL_SPI/ol_spi_class2");
  })

  it('Interface', () => {
    cy.visit('https://openliberty.io/docs/latest/reference/javadoc/spi/appClientSupport-1.0.com.ibm.ws.anno.classsource.specification.html?path=24.0.0.3/com.ibm.websphere.appserver.spi.anno_1.1-javadoc/com/ibm/ws/anno/classsource/specification/ClassSource_Specification_Container.html');
    cy.getCompliance("./OL_SPI/ol_spi_interface1");
    cy.visit('https://openliberty.io/docs/latest/reference/javadoc/spi/ejbLite-3.2.com.ibm.wsspi.anno.classsource.html?path=24.0.0.3/com.ibm.websphere.appserver.spi.anno_1.1-javadoc/com/ibm/wsspi/anno/classsource/ClassSource.html');
    cy.getCompliance("./OL_SPI/ol_spi_interface2");
  })

  it('Exception', () => {
    cy.visit('https://openliberty.io/docs/latest/reference/javadoc/spi/appClientSupport-1.0.com.ibm.wsspi.anno.classsource.html?path=24.0.0.3/com.ibm.websphere.appserver.spi.anno_1.1-javadoc/com/ibm/wsspi/anno/classsource/ClassSource_Exception.html');
    cy.getCompliance("./OL_SPI/ol_spi_exception1");
    cy.visit('https://openliberty.io/docs/latest/reference/javadoc/spi/ejbLite-3.2.com.ibm.wsspi.anno.targets.html?path=24.0.0.3/com.ibm.websphere.appserver.spi.anno_1.1-javadoc/com/ibm/wsspi/anno/targets/AnnotationTargets_Exception.html');
    cy.getCompliance("./OL_SPI/ol_spi_exception2");
  })

  it('Enum', () => {
    cy.visit('https://openliberty.io/docs/latest/reference/javadoc/spi/appClientSupport-1.0.com.ibm.wsspi.anno.classsource.html?path=24.0.0.5/com.ibm.websphere.appserver.spi.anno_1.1-javadoc/com/ibm/wsspi/anno/classsource/ClassSource_ScanCounts.ResultField.html');
    cy.getCompliance("./OL_SPI/ol_spi_enum1");
    cy.visit('https://openliberty.io/docs/latest/reference/javadoc/spi/ejbLite-3.2.com.ibm.wsspi.anno.util.html?path=24.0.0.3/com.ibm.websphere.appserver.spi.anno_1.1-javadoc/com/ibm/wsspi/anno/util/Util_InternMap.ValueType.html');
    cy.getCompliance("./OL_SPI/ol_spi_enum2");
  })
})