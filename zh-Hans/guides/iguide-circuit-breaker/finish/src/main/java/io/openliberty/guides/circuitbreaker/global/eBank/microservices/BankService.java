/*******************************************************************************
 * Copyright (c) 2017,2021 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.guides.circuitbreaker.global.eBank.microservices;

import java.io.IOException;
import java.net.MalformedURLException;
import javax.enterprise.context.ApplicationScoped;

import org.eclipse.microprofile.faulttolerance.CircuitBreaker;
import org.eclipse.microprofile.faulttolerance.Fallback;
import org.eclipse.microprofile.faulttolerance.exceptions.CircuitBreakerOpenException;

import io.openliberty.guides.circuitbreaker.global.eBank.exceptions.ConnectException;

@ApplicationScoped
public class BankService {

    /*
     * The following variable, numberOfFailedRequestAttempts, represents the number
     * of "failures" that the sample app will simulate during execution.  For the
     * first <numberOfFailedRequestAttempts> service requests that are processed
     * (when the circuit is not in the open state) the service will throw a
     * ConnectException.  When the circuit is open, a CircuitBreakerOpenException
     * is immediately returned.
     */
    public static final int numberOfFailedRequestAttempts = 2;
    public static final int requestVolumeThresholdValue = 2;
    private int counterForInvokingCheckBalance = 0;

    /*
     * The Fallback policy is invoked whenever a request fails.  In our sample
     * application, the fallback method runs for both ConnectExceptions AND
     * CircuitBreakerOpenExceptions.  It wil display the 'Last known balance'
     * (a "cached" balance) for the user unless the circuit is closed. When the
     * circuit it closed it will display the 'Current balance'.
     *
     * However, you can update the @Fallback syntax to configure which exceptions
     * should cause the fallback method to run using the Fallback applyOn and
     * skipOn parameters.   For example,
     *     @Fallback(fallbackMethod="fallbackBalance", applyOn=ConnectException.class)
     * will run the Fallback method when a ConnectException occurs, however it
     * will not run when a CircuitBreakerOpenException is returned from the service.
     * Instead, the message 'The system is experiencing a problem' will display
     * (see ../servlets/CircuitBreakerServlet.java).
     *
     * Alternatively, as another example ...
     *     @Fallback(fallbackMethod="fallbackBalance", skipOn=IOException.class)
     * will run the Fallback method when the circuit is open and the service
     * request immediately fails with a CircuitBreakerOpenException.  However the
     * message 'The system is down' will display when any IOException or subclass
     * of IOException (our ConnectException is a subclass of IOException) is
     * returned (see ../servlets/CircuitBreakerServlet.java).
     */
    @Fallback(fallbackMethod="fallbackBalance", applyOn={ConnectException.class, CircuitBreakerOpenException.class})
    /*
     * The Circuit Breaker will not be engaged until the minimum number of requests
     * to the service, as set by requestVolumeThreshold value, are made.  Then, the
     * circuit is tripped when the failure threshold is met. The failure threshold is
     * determined by multiplying the reqestVolumeThreshold by the failureRatio value.
     * The failure threshold always applies to the latest <requestVolumeThreshold>
     * success or failed requests made to the service (the rolling window).
     *
     * For example, if the requestVolumeThreshold is 2 and the failureRatio is 0.50,
     * the Circuit Breaker will not be tripped until at least 2 (requestVolumneThreshold)
     * requests have been made AND at least one of them (2 X 0.5 = 1) failed.
     *
     * When the circuit trips it is considered opened. The circuit will remain in
     * the open state for 5 seconds (delay value) and then switch to half-open state.
     * During the half-open state, if a request fails, the circuit will switch back
     * to the open state. Otherwise, 2 successful requests (successThreshold) will
     * switch the circuit back to the closed state.
     *
     * This checkBalance service is set up to force a ConnectException to simulate
     * a failure for the first <numberOfFailedRequestAttempts> requests.
     * numberOfFailedRequestAttempts is a variable defined above.  To see the
     * Circuit Breaker in action, the numberOfFailedRequestAttempts should be greater
     * than the requestVolumeThreshold so that the circuit will indeed trip and move
     * to an open state.
     *
     * When the circuit is open, a CircuitBreakerOpenException is issued as the
     * request is immediately returned and not processed. If the Fallback policy is
     * enabled (syntax above) the fallbackBalance() (method below) runs and a
     * "cached" balance is shown the customer.  If the Fallback policy is commented
     * out, ../servlets/CircuitBreakerServlet.java will receive the failure and
     * print out either "The system is down" when a ConnectException is returned
     * or "The system is experiencing a problem" when a CircuitBreakerOpenException
     * is returned.  You can follow along by viewing the Server's console.log.
     *
     * After the specified delay for the Circuit Breaker has passed the circuit will
     * enter the half-open state.  A failure at this point will re-open the circuit;
     * a success will print the current balance!
     */
    @CircuitBreaker(requestVolumeThreshold=requestVolumeThresholdValue, failureRatio=0.50, delay=5000, successThreshold=2, failOn=ConnectException.class)
    public Service checkBalance() throws ConnectException, MalformedURLException, IOException {
        counterForInvokingCheckBalance++;
        return checkBalanceService();
    }

    public Service checkBalanceService() throws ConnectException, MalformedURLException, IOException {
        // Simulating failures to trip the circuit
        if (counterForInvokingCheckBalance <= numberOfFailedRequestAttempts) {
            try {
                Thread.sleep(2000);
            } catch (InterruptedException ie) {
                System.out.println("This counts as a request error.  Throw ConnectException.");
                throw new ConnectException("The system is down.");
            }
            // The exception will trigger fallback to be called.
            System.out.println("Simulate request error.  Throw ConnectException.");
            throw new ConnectException("The system is down.");
        }
        System.out.println("Number of simulated errors has been reached.  This request successfully returns balance.");
        return new BalanceService();

    }

    public Service fallbackBalance() throws ConnectException, MalformedURLException, IOException {
        System.out.println("Running through the fallback method");
        return new SnapshotBalanceService();
    }

}
