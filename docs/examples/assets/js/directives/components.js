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
    .directive('vbox', function($http, $parse, $compile) {
        return {
            restrict: 'E',
            scope: {
                verticalGap: "@"
            },
            compile: function(element, attrs) {
                if (typeof attrs.verticalGap==="undefined") attrs.verticalGap = "0px";
                angular.forEach($(element).children(),function(child) {
                    if ($(child).index()!=$(element).children().length-1) {
                        $(child).addClass('added-gap');
                        $(child).css('margin-bottom', attrs.verticalGap);
                    }
                });
                element.html('<div class="ngt-vbox">'+element.html()+'</div>');

                return function linkFn(scope, element, attrs) {
                    scope.$watch('verticalGap', function(value) {
                        if (typeof value==="undefined") return;
                        scope.verticalGap = value;
                        var children = $(element).children().children('.added-gap');
                        angular.forEach(children,function(child) {
                            if ($(child).index()!=children.length-1) {
                                $(child).addClass('added-gap');
                                $(child).css('margin-bottom', value);
                            }
                        });
                    });
                }
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
                        var children = $(element).children().children('.added-gap');
                        angular.forEach(children,function(child) {
                            $(child).css('margin-left', value);
                            $(child).css('clear', 'none');
                        });
                        angular.forEach(children,function(child) {
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
            templateUrl: "assets/partials/ngt/input-block.html",
            scope: {
                style: "@",
                title: "@",
                ngtId: "@",
                name: "@"
            }
        }
    })
    .directive('inputEmailBlock', function($http, $parse, $compile) {
        return {
            restrict: 'E',
            templateUrl: "assets/partials/ngt/input-email-block.html",
            scope: {
                style: "@",
                title: "@",
                ngtId: "@",
                name: "@"
            }
        }
    })
    .directive('inputTextfieldBlock', function($http, $parse, $compile) {
        return {
            restrict: 'E',
            templateUrl: "assets/partials/ngt/input-email-block.html",
            scope: {
                style: "@",
                title: "@",
                ngtId: "@",
                name: "@"
            }
        }
    })
    .directive('inputIntegerBlock', function($http, $parse, $compile) {
        return {
            restrict: 'E',
            templateUrl: "assets/partials/ngt/input-integer-block.html",
            scope: {
                style: "@",
                title: "@",
                ngtId: "@",
                name: "@"
            }
        }
    })
    .directive('inputCheckboxBlock', function($http, $parse, $compile) {
        return {
            restrict: 'E',
            templateUrl: "assets/partials/ngt/input-checkbox-block.html",
            scope: {
                style: "@",
                title: "@",
                ngtId: "@",
                name: "@"
            }
        }
    })
    .directive('editorBlock', function($http, $parse, $compile) {
        return {
            restrict: 'E',
            templateUrl: "assets/partials/ngt/editor-block.html",
            scope: {
                style: "@",
                title: "@",
                ngtId: "@",
                name: "@",
                cols: "@",
                rows: "@",
                editorMarkupType: "@"
            }
        }
    })