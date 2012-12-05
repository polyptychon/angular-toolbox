'use strict';

angular.module('ngt', [])
    .directive('hbox', function($http, $parse, $compile) {
        return {
            restrict: 'E',
            scope: {
                horizontalGap: "@"
            },
            compile: function(element, attrs) {

                if (typeof attrs.horizontalGap==="undefined") attrs.horizontalGap = "20px";
                angular.forEach($(element).children(),function(child) {
                    if (typeof attrs.horizontalGap!=='undefined' && $(child).index()>0) {
                        $(child).css('padding-left', attrs.horizontalGap);
                    }
                });
                element.html('<div class="ngt-hbox">'+element.html()+'</div>');

                return function linkFn(scope, element, attrs) {
                    scope.$watch('horizontalGap', function(value) {
                        if (typeof value==="undefined") return;
                        scope.horizontalGap = value;
                        angular.forEach($(element).children(),function(child) {
                            if (typeof attrs.horizontalGap!=='undefined' && $(child).index()>0) {
                                $(child).css('padding-left', value);
                            }
                        });
                    });
                }
            }
        }
    })
    .directive('inputBlock', function($http, $parse, $compile) {
        return {
            restrict: 'E',
            templateUrl: "assets/partials/ngt/input-box.html",
            scope: {
                title: "@",
                ngtId: "@",
                name: "@"
            }
        }
    })
    .directive('inputEmailBlock', function($http, $parse, $compile) {
        return {
            restrict: 'E',
            templateUrl: "assets/partials/ngt/input-email-box.html",
            scope: {
                title: "@",
                ngtId: "@",
                name: "@"
            }
        }
    })