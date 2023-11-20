// tag::consumeRestApp[]
var app = angular.module('consumeRestApp', ['ngResource']);
// end::consumeRestApp[]

// tag::Artists[]
// tag::resource-module[]
app.factory("artists", function($resource) {
// end::resource-module[]
    // tag::resource-call[]
    return $resource("http://localhost:9080/artists");
    // end::resource-call[]
});
// end::Artists[]

// tag::Controller[]
app.controller("ArtistsCtrl", function($scope, artists) {
    artists.query(function(data) {
        // tag::Scope[]
        $scope.artists = data;
        // end::Scope[]
    }, function(err) {
        console.error("Error occured: ", err);
    });
});
// end::Controller[]
