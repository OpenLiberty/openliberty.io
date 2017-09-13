package com.ibm.openliberty;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.FilterChain;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

public class StickyRouting implements Filter {
   public void destroy() {}
   public void init(FilterConfig cfg) {}

   public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) throws IOException, ServletException {

     if (req instanceof HttpServletRequest) {
       ((HttpServletRequest)req).getSession();
     }

     chain.doFilter(req, resp);
   }
}
