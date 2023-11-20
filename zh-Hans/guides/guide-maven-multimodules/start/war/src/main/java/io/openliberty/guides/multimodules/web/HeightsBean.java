// tag::comment[]
/*******************************************************************************
 * Copyright (c) 2017 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
// end::comment[]
package io.openliberty.guides.multimodules.web;

public class HeightsBean implements java.io.Serializable {
    private String heightCm = null;
    private String heightFeet = null;
    private String heightInches = null;
    private int cm = 0;
    private int feet = 0;
    private int inches = 0;

    public HeightsBean() {
    }

    // Capitalize the first letter of the name i.e. first letter after get
    // If first letter is not capitalized, it must match the property name in
    // index.jsp
    public String getHeightCm() {
        return heightCm;
    }

    public String getHeightFeet() {
        return heightFeet;
    }

    public String getHeightInches() {
        return heightInches;
    }

    public void setHeightCm(String heightcm) {
        this.heightCm = heightcm;
    }

    // Need an input as placeholder, you can choose not to use the input
    public void setHeightFeet(String heightfeet) {
        this.cm = Integer.valueOf(heightCm);
        // tag::dependency-code1[]
        // TO-DO: ADD THE getFeet CODE SNIPPET HERE
        // end::dependency-code1[]
        String result = String.valueOf(feet);
        this.heightFeet = result;
    }

    public void setHeightInches(String heightinches) {
        this.cm = Integer.valueOf(heightCm);
        // tag::dependency-code2[]
        // TO-DO: ADD THE getInches CODE SNIPPET HERE
        // end::dependency-code2[]
        String result = String.valueOf(inches);
        this.heightInches = result;
    }

}
