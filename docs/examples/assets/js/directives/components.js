'use strict';

angular.module('ngt', [])
    .directive('ngtAutoHeight', function($http, $parse, $compile) {
        return {
            restrict: 'A',

            compile: function compileFn(element, attrs) {

                $(window).bind('resize', function() {
                    setHeight();
                })

                function setHeight() {
                    var parent = element.parent()[0].tagName==="BODY"?$(window):$(element.parent()),
                        parentHeight = parent.height(),
                        elementExtraHeight = $(element).outerHeight(true)-$(element).height(),
                        parentChildrenHeight = 0;

                    $(element.parent()).children().each(function(index, child) {
                        if ($(child).css('display')!=="none" && $(child).width()>0 && $(child).height()>0) {
                            if ($(child).offset().left == $(element).offset().left) {
                                if ($(element).css('position')==="absolute") {
                                    if ($(child).css('position')==="absolute") {
                                        parentChildrenHeight += $(child).outerHeight(true);
                                    }
                                } else {
                                    parentChildrenHeight += $(child).outerHeight(true);
                                }
                            }
                        }
                    })
                    parentChildrenHeight = parentChildrenHeight - $(element).outerHeight(true);
                    parentChildrenHeight = parentChildrenHeight<0?0:parentChildrenHeight;
                    $(element).height(parentHeight-elementExtraHeight-parentChildrenHeight);
                }

                setHeight();
            }
        }
    })
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
                setVerticalGap(attrs.verticalGap, $(element).children());

                element.html('<div class="ngt-vbox">'+element.html()+'</div>');

                function setVerticalGap(value, children) {
                    if (_.isEmpty(value)) value = "0px";
                    var length = children.length;
                    angular.forEach(children,function(child) {
                        $(child).addClass('added-gap');
                        if ($(child).index()<length-1) {
                            $(child).css('margin-bottom', value);
                        }
                    });
                }

                return function linkFn(scope, element, attrs) {
                    scope.$watch('verticalGap', function(value) {
                        if (typeof value==="undefined") return;
                        scope.verticalGap = value;
                        setVerticalGap(value, $(element).children().children('.added-gap'));
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
                setHorizontalGap(attrs.horizontalGap, $(element).children());

                element.html('<div class="ngt-hbox" style="margin-left:-'+attrs.horizontalGap+'">'+element.html()+'</div>');

                function setHorizontalGap(value, children) {
                    if (_.isEmpty(value)) value = "0px";
                    children.parent().css('margin-left', "-"+value);
                    angular.forEach(children,function(child) {
                        $(child).css('margin-left', value);
                        $(child).addClass('added-gap');
                    });
                }
                return function linkFn(scope, element, attrs) {
                    scope.$watch('horizontalGap', function(value) {
                        if (typeof value==="undefined") return;
                        scope.horizontalGap = value;
                        setHorizontalGap(value, $(element).children().children('.added-gap'));
                    });

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