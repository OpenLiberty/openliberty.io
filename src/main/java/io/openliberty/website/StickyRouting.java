package io.openliberty.website;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.FilterChain;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

public class StickyRouting implements Filter {
    public void destroy() {
        System.err.println("destroy");
    }

    public void init(FilterConfig cfg) {
        System.err.println("init");
    }

    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain)
            throws IOException, ServletException {

        if (req instanceof HttpServletRequest) {
            System.err.println("Creating session");
            ((HttpServletRequest) req).getSession();
        }

        chain.doFilter(req, resp);
    }
}
