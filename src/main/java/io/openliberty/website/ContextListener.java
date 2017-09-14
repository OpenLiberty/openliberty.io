package io.openliberty.website;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

public class ContextListener implements ServletContextListener {

	@Override
	public void contextInitialized(ServletContextEvent servletContextEvent) {
		BuildsManager.getInstance().updateBuilds();
	}

	@Override
	public void contextDestroyed(ServletContextEvent servletContextEvent) {
	}

}
