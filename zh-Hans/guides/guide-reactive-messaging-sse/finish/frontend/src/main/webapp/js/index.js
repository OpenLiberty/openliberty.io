// tag::initSSE[]
function initSSE() {
    // tag::eventSource[]
    var source = new EventSource('http://localhost:9084/bff/sse', { withCredentials: true });
    // end::eventSource[]
    // tag::eventListener[]
    source.addEventListener(
        // tag::systemLoad[]
        'systemLoad',
        // end::systemLoad[]
        // tag::setHandler[]
        systemLoadHandler
        // end::setHandler[]
    );
    // end::eventListener[]
}
// end::initSSE[]

// tag::systemLoadHandler[]
function systemLoadHandler(event) {
    // tag::parse[]
    var system = JSON.parse(event.data);
    // end::parse[]
    if (document.getElementById(system.hostname)) {
        document.getElementById(system.hostname).cells[1].innerHTML =
                                        system.loadAverage.toFixed(2);
    } else {
        var tableRow = document.createElement('tr');
        tableRow.id = system.hostname;
        tableRow.innerHTML = '<td>' + system.hostname + '</td><td>'
                             + system.loadAverage.toFixed(2) + '</td>';
        document.getElementById('sysPropertiesTableBody').appendChild(tableRow);
    }
}
// end::systemLoadHandler[]


