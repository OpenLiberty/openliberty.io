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
package io.openliberty.guides.todolistSample.managers;

import io.openliberty.guides.todolistSample.models.*;
import java.util.List;
import java.util.Optional;

public interface TodoManager {
    public List<TodoModel> getTodos();
    public Optional<TodoModel> findTodo(Integer id);
    public TodoModel createTodo(TodoModel todo);
    public Optional<TodoModel> updateTodo(Integer id, TodoModel updated);
    public Optional<TodoModel> deleteTodo(Integer id);
}
