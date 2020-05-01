package io.openliberty.website;

import java.io.InputStream;
import java.io.IOException;
import java.util.EnumSet;
import java.util.Map;
import java.util.Properties;

import javax.servlet.DispatcherType;
import javax.servlet.Filter;
import javax.servlet.FilterConfig;
import javax.servlet.FilterChain;
import javax.servlet.FilterRegistration.Dynamic;
import javax.servlet.ServletException;
import javax.servlet.ServletContext;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletRequest;

/**
 * This Servlet Filter handles simple redirects based on the
 * content of the WEB-INF/redirects.properties. This file
 * takes the format from=to the urls are relative to the
 * context root. A * can be used at the end of the url and
 * this will redirect anything that starts with the text
 * preceeding the url.
 * 
 * <p>Each rule in redirects.properties ends up with a filter
 * being attached that only matches the from url. When the
 * filter is called it sends a redirect back to the client
 * instead of calling the filterchain.</p>
 */
public class RedirectFilter implements Filter {
    /** The url to redirect from */
    public String from;
    /** The url to redirect to */
    public String to;
    /** Whether this is a wildcard match or not */
    public boolean startsWithMatch;

    public RedirectFilter(String from, String to) {
        this.to = to;
        if (from.endsWith("*")) {
            this.from = from.substring(0, from.length() - 1);
            startsWithMatch = true;
        }
    }

    public void destroy() {
    }

    public void init(FilterConfig cfg) {
    }

    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) throws IOException, ServletException {
        String newURL = null;
        String sPort = getServerPort(req);

        // if it is a starts with match we need to take the request url and map it to the correct
        // url, it won't be a direct from and to.
        if (startsWithMatch) {
            String uri = ((HttpServletRequest)req).getRequestURI();
            newURL = uri.replaceAll(from, to);
            // It is possible that the filter intercepted, but the redirect rule does not apply
            // in that case we set newURL to null so no redirect is sent and the filter chain is called.
            if (newURL.equals(uri)) {
                newURL = null;
            }
        } else {
            newURL = to;
        }

        if (newURL != null) {
            // if there is a newURL send a redirect wiht that new url
            newURL = req.getScheme() + "://" + req.getServerName() + sPort + newURL;
            ((HttpServletResponse)resp).sendRedirect(newURL);
        } else {
            // if there was no new url just proceed with normal processing
            chain.doFilter(req, resp);
        }
    }

    /**
     * If we are running outside of production we still want the redirects to work
     * so we need to make sure that the server port is added to the redirect url.
     * this is mostly for non-production test scenarios.
     * 
     * @param req the http request
     * @return the port to redirect to or the empty string.
     */
    private String getServerPort(ServletRequest req) {
        String sPort = "";
        int serverPort = req.getServerPort();
        if ((serverPort == 80) || (serverPort == 443)) {
            // Do not add server port to the final new URL
        } else {
            sPort = ":" + serverPort;
        }
        return sPort;
    }

    /**
     * This method is called by ContainerInit to register the RedirectFilters
     * 
     * @param ctx The ServletContext to initialize
     * @throws IOException
     */
    public static void init(ServletContext ctx) throws IOException {
        InputStream in = ctx.getResourceAsStream("/WEB-INF/redirects.properties");
        if (in != null) {
            Properties props = new Properties();
            props.load(in);
            for (Map.Entry<?, ?> entry : props.entrySet()) {
                String key = (String) entry.getKey();
                String value = (String) entry.getValue();
                // create the new filter
                Dynamic reg = ctx.addFilter("redirect_" + entry.getKey(), new RedirectFilter(key, value));
                // add the url mapping to be as specific as possible.
                reg.addMappingForUrlPatterns(EnumSet.of(DispatcherType.REQUEST), true, toUrlPattern(key));
            }
        }
    }

    /**
     * This method works out what url pattern should be used to match it. The best
     * kind of match is a non-wildcarded one, or a /* match since we can use the key directly 
     * as the url pattern and the filter will only be called when a redirect is required. 
     * The most expensive is a * without a / since we need to attach a pattern to the parent folder
     * this means the filter doFilter method has to work out itself if it should apply or not and that
     * is on every request. In this case if you did a/b/c* then the filter would be a/b/*. It is never
     * ok to have a* because that would mean the filter attaches to every request.
     *
     * @param key the from url as expressed in redirect.properties
     * @return the url pattern to match this url.
     */
    public static String toUrlPattern(String key) {
        String urlPattern = key;
        if (key.endsWith("*") && !key.endsWith("/*")) {
            int index = key.lastIndexOf('/');
            if (index == -1) {
                urlPattern = "/*";
            } else {
                urlPattern = urlPattern.substring(0, index) + "/*";
            }
        }
        return urlPattern;
    }
}