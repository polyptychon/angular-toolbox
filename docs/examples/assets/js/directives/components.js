'use strict';

angular.module('ngt', [])
    .directive('ngtTitle', function($http, $parse, $compile) {
        return {
            restrict: 'A',
            transclude: true,
            templateUrl: "assets/partials/ngt/ngt-title.html",
            scope: {
                ngtTitle: "@",
                ngtSubtitle: "@"
            }
        }
    })
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
                        $(child).css('margin-left', attrs.horizontalGap);
                        $(child).addClass('added-gap');
                    }
                });

                element.html('<div class="ngt-hbox">'+element.html()+'</div>');

                return function linkFn(scope, element, attrs) {
                    $(window).bind('resize', function() {
                        setHorizontalGap();
                    });
                    scope.$watch('horizontalGap', function(value) {
                        if (typeof value==="undefined") return;
                        scope.horizontalGap = value;
                        setHorizontalGap(value);

                    });
                    function setHorizontalGap(value) {
                        if (typeof value==="undefined") value = attrs.horizontalGap;
                        if (value=="0px") return;
                        angular.forEach($(element).find('.added-gap'),function(child) {
                            $(child).css('margin-left', value);
                            $(child).css('clear', 'none');
                        });
                        angular.forEach($(element).find('.added-gap'),function(child) {
                            if ($(child).index()>0 && $(child).offset().top==$(child).prev().offset().top) {
                                $(child).css('margin-left', value);
                            } else {
                                $(child).css('clear', 'left');
                                $(child).css('margin-left', "0px");
                            }
                        });
                    }
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
    .directive('inputTextfieldBlock', function($http, $parse, $compile) {
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