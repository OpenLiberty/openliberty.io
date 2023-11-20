// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2019 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
 // end::copyright[]
package io.openliberty.guides.todolistSample.models;

import java.util.Optional;

public class TodoModel {
    private String title;
    private boolean isCompleted;
    private Optional<Integer> id;

    public TodoModel() {
        this.id = Optional.empty();
    }

    public TodoModel(String title, boolean completed) {
        this.title = title;
        this.isCompleted = completed;
        this.id = Optional.empty();
    }

    public TodoModel withId(int id) {
        TodoModel tm = new TodoModel(title, isCompleted);
        tm.setId(id);
        return tm;
    }

    public String getTitle() {
        return title;
    }

    public boolean getCompleted() {
        return isCompleted;
    }

    public Integer getId() {
        return id.orElse(null);
    }

    public boolean hasId() {
        return id.isPresent();
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setCompleted(boolean isCompleted) {
        this.isCompleted = isCompleted;
    }

    public void setId(Integer id) {
        this.id = Optional.of(id);
    }
}
