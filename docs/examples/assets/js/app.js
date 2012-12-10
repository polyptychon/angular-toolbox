'use strict';

var exampleApp = angular.module('exampleApp', ['ngt', 'ui']);

function CodeMirrorCtrl($scope) {
    $scope.codeMirrorModel = "var helloWorld = 'Success!';";
}
function TestBoxCtrl($scope) {
    $scope.gap = "1em";
}
function TestEditorCtrl($scope) {

    $scope.ngtLabelTest = "test";
    $scope.editorValue = "test";
    $scope.checkValue = true;
    $scope.help3 = "test";

}