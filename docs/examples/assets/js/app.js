'use strict';

angular.module('exampleApp', ['ngt', 'ui.directives']);

function CodeMirrorCtrl($scope) {
    $scope.codeMirrorModel = "var helloWorld = 'Success!';";
}
function TestBoxCtrl($scope) {
    $scope.gap = "1em";
}