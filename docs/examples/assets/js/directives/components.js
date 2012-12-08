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
            transclude: true,
            template: '<div class="ngt-vbox" ng-transclude=""></div>',
            scope: {
                verticalGap: "@"
            },
            compile: function(element, attrs, transclude) {
                if (typeof attrs.verticalGap==="undefined") attrs.verticalGap = "0px";

                function setVerticalGap(value, children) {
                    if (_.isEmpty(value)) value = "0px";
                    var length = children.length;
                    angular.forEach(children,function(child) {
                        $(child).addClass('added-gap');
                        if ($(child).index()<length-2) {
                            $(child).css('margin-bottom', value);
                        }
                    });
                }

                return function linkFn(scope, element, attrs) {
                    scope.$watch('verticalGap', function(value) {
                        if (typeof value==="undefined") return;
                        scope.verticalGap = value;
                        setVerticalGap(value, $(element).children().children());
                    });
                }
            }
        }
    })
    .directive('hbox', function($http, $parse, $compile) {
        return {
            restrict: 'E',
            transclude: true,
            template: '<div class="ngt-hbox" ng-transclude=""></div>',
            scope: {
                horizontalGap: "@"
            },
            compile: function(element, attrs, transclude) {
                if (typeof attrs.horizontalGap==="undefined") attrs.horizontalGap = "10px";
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
                        setHorizontalGap(value, $(element).children().children());
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
                name: "@",
                ngModel: "="
            },
            link: function (scope, elm, attrs) {
                ngModelBinding(scope, elm, attrs, $parse);
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
                name: "@",
                ngModel: "="
            },
            link: function (scope, elm, attrs) {
                ngModelBinding(scope, elm, attrs, $parse);
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
                name: "@",
                ngModel: "="
            },
            link: function (scope, elm, attrs) {
                ngModelBinding(scope, elm, attrs, $parse);
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
                name: "@",
                ngModel: "="
            },
            link: function (scope, elm, attrs) {
                ngModelBinding(scope, elm, attrs, $parse);
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
                name: "@",
                ngModel: "="
            },
            link: function (scope, elm, attrs) {
                ngModelBinding(scope, elm, attrs, $parse);
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
                editorMarkupType: "@",
                ngModel: "="
            },
            link: function (scope, elm, attrs) {
                ngModelBinding(scope, elm, attrs, $parse);
            }
        }
    })

function ngModelBinding(scope, elm, attrs, $parse) {
    scope.$watch('ngModel', function(value) {
        if (typeof value==="undefined") return;
        scope.inputValue = value;
    });
    scope.$watch('inputValue', function(value) {
        console.log(value);
        if (typeof value==="undefined") return;
        if (typeof attrs.ngModel==="undefined") return;
        if (typeof $parse(attrs.ngModel).assign==="undefined") return;

        $parse(attrs.ngModel).assign(scope.$parent, value);
    });
}