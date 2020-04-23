/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.website.dheclient.data;

import java.io.IOException;
import java.io.InputStream;
import java.lang.annotation.Annotation;
import java.lang.reflect.Type;

import javax.json.bind.JsonbBuilder;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.ext.MessageBodyReader;

import io.openliberty.website.data.BuildInfo;

/**
 * This class is used to convert the DHE response that requests information about a build into a JSON-B object. 
 * Normally this would be automatic, but DHE returns the file mine type as text/plain rather than
 * as a json payload so we need some code to do the conversion.
 */
public class BuildInfoMessageBodyReader implements MessageBodyReader<BuildInfo> {

    @Override
    public boolean isReadable(Class<?> type, Type genericType, Annotation[] annotations, MediaType mediaType) {
        return type == BuildInfo.class && MediaType.TEXT_PLAIN_TYPE.equals(mediaType);
    }

    @Override
    public BuildInfo readFrom(Class<BuildInfo> type, Type genericType, Annotation[] annotations, MediaType mediaType,
            MultivaluedMap<String, String> httpHeaders, InputStream entityStream) throws IOException, WebApplicationException {
        return JsonbBuilder.create().fromJson(entityStream, BuildInfo.class);
    }

}