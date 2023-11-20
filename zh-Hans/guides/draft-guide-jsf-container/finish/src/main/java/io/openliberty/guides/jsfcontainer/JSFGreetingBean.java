/*******************************************************************************
 * Copyright (c) 2018 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.guides.jsfcontainer;

import java.io.Serializable;
import java.util.concurrent.ExecutorService;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import javax.enterprise.context.SessionScoped;
import javax.inject.Inject;
import javax.inject.Named;

@SuppressWarnings("serial")
@Named("JSFGreetingBean")
//@ManagedBean(name = "JSFGreetingBean")
@SessionScoped
public class JSFGreetingBean implements Serializable {

    private String greeting = "I'm a regular JSF Bean";

    @Resource
    ExecutorService exec;

    @Inject
    CDIBean cdiBean;

    @PostConstruct
    public void start() {
        System.out.println(getClass() + " postConstruct called");
        this.greeting = "I'm using lifecycle annotations";
        if (exec != null)
            greeting += " and I'm using resource injection!";
        if (cdiBean != null)
            greeting += " " + cdiBean.greet();
    }

    public void setGreeting(String newGreeting) {
        this.greeting += newGreeting;
    }

    public String getGreeting() {
        return this.greeting;
    }
}
