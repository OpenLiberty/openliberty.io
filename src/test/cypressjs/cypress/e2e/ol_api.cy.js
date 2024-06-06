describe('Openliberty API Accesibility Tests', () => {
    it.only('Overview', () => {
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/oauth-2.0.com.ibm.oauth.core.api.attributes.html?path=24.0.0.3/com.ibm.websphere.appserver.api.oauth_1.2-javadoc/index.html');
      cy.getCompliance("./OL_API/ol_api_overview1");
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/servlet-5.0.com.ibm.websphere.servlet.container.html?path=24.0.0.5/io.openliberty.servlet_1.1-javadoc/index.html');
      cy.getCompliance("./OL_API/ol_api_overview2");
    })
  
    it('Packages', () => {
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/distributedMap-1.0.com.ibm.wsspi.cache.html?path=24.0.0.3/com.ibm.websphere.appserver.api.distributedMap_2.0-javadoc/com/ibm/wsspi/cache/package-summary.html');
      cy.getCompliance("./OL_API/ol_api_package1");
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/j2eeManagement-1.1.com.ibm.websphere.management.j2ee.html?path=24.0.0.3/com.ibm.websphere.appserver.api.j2eemanagement_1.1-javadoc/com/ibm/websphere/management/j2ee/package-summary.html');
      cy.getCompliance("./OL_API/ol_api_package2");
    })
  
    it('Deprecated', () => {
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/distributedMap-1.0.com.ibm.wsspi.cache.html?path=24.0.0.3/com.ibm.websphere.appserver.api.distributedMap_2.0-javadoc/deprecated-list.html');
      cy.getCompliance("./OL_API/ol_api_deprecated1");
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/servlet-5.0.com.ibm.websphere.servlet.container.html?path=24.0.0.3/io.openliberty.servlet_1.1-javadoc/deprecated-list.html');
      cy.getCompliance("./OL_API/ol_api_deprecated2");
    })
  
    it('Help', () => {
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/distributedMap-1.0.com.ibm.wsspi.cache.html?path=24.0.0.3/com.ibm.websphere.appserver.api.distributedMap_2.0-javadoc/help-doc.html#package');
      cy.getCompliance("./OL_API/ol_api_help1");
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/appSecurity-2.0.com.ibm.wsspi.security.auth.callback.html?path=24.0.0.3/com.ibm.websphere.appserver.api.security_1.3-javadoc/help-doc.html#package');
      cy.getCompliance("./OL_API/ol_api_help2");
    })
  
    it('Tree', () => {
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/oauth-2.0.com.ibm.oauth.core.api.attributes.html?path=24.0.0.3/com.ibm.websphere.appserver.api.oauth_1.2-javadoc/overview-tree.html');
      cy.getCompliance("./OL_API/ol_api_tree1");
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/distributedMap-1.0.com.ibm.wsspi.cache.html?path=24.0.0.3/com.ibm.websphere.appserver.api.distributedMap_2.0-javadoc/com/ibm/wsspi/cache/package-tree.html');
      cy.getCompliance("./OL_API/ol_api_tree2");
    })
  
    it('Class', () => {
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/distributedMap-1.0.com.ibm.wsspi.cache.html?path=24.0.0.3/com.ibm.websphere.appserver.api.distributedMap_2.0-javadoc/com/ibm/wsspi/cache/Cache.html');
      cy.getCompliance("./OL_API/ol_api_class1");
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/j2eeManagement-1.1.com.ibm.websphere.management.j2ee.html?path=24.0.0.3/com.ibm.websphere.appserver.api.j2eemanagement_1.1-javadoc/com/ibm/websphere/management/j2ee/J2EEManagementObjectNameFactory.html');
      cy.getCompliance("./OL_API/ol_api_class2");
    })
  
    it('Interface', () => {
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/appSecurityClient-1.0.com.ibm.websphere.security.html?path=24.0.0.3/com.ibm.websphere.appserver.api.securityClient_1.1-javadoc/com/ibm/websphere/security/UserRegistry.html');
      cy.getCompliance("./OL_API/ol_api_interface1");
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/restConnector-2.0.com.ibm.websphere.jmx.connector.rest.html?path=24.0.0.3/com.ibm.websphere.appserver.api.restConnector_1.3-javadoc/com/ibm/websphere/jmx/connector/rest/ConnectorSettings.html');
      cy.getCompliance("./OL_API/ol_api_interface2");
    })
  
    it('Exception', () => {
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/appSecurityClient-1.0.com.ibm.websphere.security.html?path=24.0.0.3/com.ibm.websphere.appserver.api.securityClient_1.1-javadoc/com/ibm/websphere/security/WSSecurityException.html');
      cy.getCompliance("./OL_API/ol_api_exception1");
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/appSecurityClient-1.0.com.ibm.websphere.security.html?path=24.0.0.3/com.ibm.websphere.appserver.api.securityClient_1.1-javadoc/com/ibm/websphere/security/CertificateMapFailedException.html');
      cy.getCompliance("./OL_API/ol_api_exception2");
    })
  
    it('Annotation', () => {
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/grpc-1.0.io.openliberty.grpc.annotation.html?path=24.0.0.3/io.openliberty.grpc.1.0_1.0-javadoc/io/openliberty/grpc/annotation/GrpcService.html');
      cy.getCompliance("./OL_API/ol_api_annotation1");
    })
  
    it('Enum', () => {
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/j2eeManagement-1.1.com.ibm.websphere.management.j2ee.html?path=24.0.0.3/com.ibm.websphere.appserver.api.j2eemanagement_1.1-javadoc/com/ibm/websphere/management/j2ee/J2EEManagementObjectNameFactory.ResourceType.html');
      cy.getCompliance("./OL_API/ol_api_enum1");
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/distributedMap-1.0.com.ibm.wsspi.cache.html?path=24.0.0.3/com.ibm.websphere.appserver.api.distributedMap_2.0-javadoc/com/ibm/wsspi/cache/CacheConfig.EvictorAlgorithmType.html');
      cy.getCompliance("./OL_API/ol_api_enum2");
    })
  
    it('Use', () => {
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/distributedMap-1.0.com.ibm.wsspi.cache.html?path=24.0.0.3/com.ibm.websphere.appserver.api.distributedMap_2.0-javadoc/com/ibm/wsspi/cache/package-use.html');
      cy.getCompliance("./OL_API/ol_api_use1");
      cy.visit('https://openliberty.io/docs/latest/reference/javadoc/api/distributedMap-1.0.com.ibm.wsspi.cache.html?path=24.0.0.3/com.ibm.websphere.appserver.api.distributedMap_2.0-javadoc/com/ibm/wsspi/cache/class-use/CacheConfig.EvictorAlgorithmType.html');
      cy.getCompliance("./OL_API/ol_api_use2");
    })
  })