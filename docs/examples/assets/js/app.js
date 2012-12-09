'use strict';

angular.module('exampleApp', ['ngt', 'ui.directives']);

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

    $scope.errorText = function(value, label) {
        return _.isEmpty(value)?label:"";
    }
}