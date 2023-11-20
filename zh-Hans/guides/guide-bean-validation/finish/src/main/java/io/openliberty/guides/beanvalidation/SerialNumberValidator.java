// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2018, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.beanvalidation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

// tag::SerialNumberValidator[]
public class SerialNumberValidator
    implements ConstraintValidator<SerialNumber, Object> {

    @Override
    // tag::isValid[]
    public boolean isValid(Object arg0, ConstraintValidatorContext arg1) {
        //Serial Numbers must start with Liberty followed by four numbers
        boolean isValid = false;
        if (arg0 == null) {
            return isValid;
        }
        String serialNumber = arg0.toString();
        // tag::Liberty[]
        isValid = serialNumber.length() == 11 && serialNumber.startsWith("Liberty");
        // end::Liberty[]
        try {
            Integer.parseInt(serialNumber.substring(7));
        } catch (Exception ex) {
            isValid = false;
        }
        return isValid;
    }
    // end::isValid[]
}
// end::SerialNumberValidator[]
