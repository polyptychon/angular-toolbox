angular.module('ngt.config', []).value('ngt.config', {});
angular.module('ngt.directives', ['ngt.config']);
angular.module('ngt', ['ngt.directives', 'ngt.config']);

angular.module('ngt.directives')
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
    .directive('ngtLabel', function($http, $parse, $compile) {
        var templateURL = "assets/partials/ngt/ngt-label.html";
        return {
            restrict: 'A',
            scope: true,
            compile: function(element, attrs) {
                return function(scope, element, attrs) {
                    if (!$(element).parent().hasClass('control-block')) {
                        $(element).wrap($('<div class="control-block"></div>'));
                    }
                    scope.ngtLabel = "";
                    $http.get(templateURL).success(function(data) {
                        $(element).before($compile(data)(scope));
                    });
                    scope.$watch(
                        function(scope) {
                            return attrs.ngtLabel;
                        },
                        function(value) {
                            scope.ngtLabel = value;
                        }
                    );
                    scope.$watch(
                        function(scope) {
                            return attrs.id;
                        },
                        function(value) {
                            scope.id = value;
                        }
                    );
                    ngModelInputBind(scope, element, attrs, $parse);
                }
            }
        }
    })
    .directive('ngtHelperText', function($http, $parse, $compile) {
        var popoverTemplate = '<div class="popover"><div class="arrow"></div><div class="popover-inner"><div class="popover-content"><p></p></div></div></div>';
        return {
            restrict: 'A',
            scope: true,
            compile: function(element, attrs) {
                return function(scope, element, attrs) {
                    scope.$watch(
                        function(scope) {
                            return attrs.ngtHelperText;
                        },
                        function(value) {
                            var helperText = angular.isUndefined(value)?"":value;
                            $(element).popover('destroy');
                            $(element).popover({content:helperText, trigger: "focus", template:popoverTemplate});
                        }
                    );
                    ngModelInputBind(scope, element, attrs, $parse);
                }
            }
        }
    })
    .directive('ngtTooltip', function($http, $parse, $compile) {
        return {
            restrict: 'A',
            scope: true,
            compile: function(element, attrs) {
                return function(scope, element, attrs) {
                    scope.$watch(
                        function(scope) {
                            return attrs.ngtTooltip;
                        },
                        function(value) {
                            var title = angular.isUndefined(value)?"test":value;
                            $(element).tooltip({title:title});
                        }
                    );
                    ngModelInputBind(scope, element, attrs, $parse);
                }
            }
        }
    })
    .directive('ngtVd', ['$http','$parse','$compile','ngt.config', function($http, $parse, $compile, ngtConfig) {

        ngtConfig.vd = ngtConfig.vd || {};
        ngtConfig.vd.error = ngtConfig.vd.error || {};

        var error = {
            type: "",
            isInvalid: false,
            default: "",
            required: "Το πεδίο είναι απαραίτητο",
            email: "Πληκτρολογήστε μία σωστή διεύθυνση email",
            number: "Πληκτρολογήστε έναν αριθμό",
            date: "Πληκτρολογήστε μία σωστή ημερομηνία (dd/mm/yyyy)",
            time: "Πληκτρολογήστε μία σωστή ώρα (HH:MM:SS)",
            pattern: ""
        };

        var templateURL = "assets/partials/ngt/ngt-error.html";
        return {
            restrict: 'A',
            scope: true,
            compile: function(element, attrs) {
                return function(scope, element, attrs, ngModel) {

                    scope.vd = angular.extend({}, ngtConfig.vd);
                    scope.vd.error = angular.extend({}, error, ngtConfig.vd.error);

                    if (!$(element).parent().hasClass('control-block')) {
                        $(element).wrap($('<div class="control-block"></div>'));
                    }

                    $http.get(templateURL).success(function(data) {
                        $(element).after($compile(data)(scope));
                    });
                    scope.$watch(function(scope) { return attrs.ngtVdErrorRequired; }, function(value) { if (angular.isDefined(value)) scope.vd.error.required = value; });
                    scope.$watch(function(scope) { return attrs.ngtVdErrorEmail; }, function(value) { if (angular.isDefined(value)) scope.vd.error.email = value; });
                    scope.$watch(function(scope) { return attrs.ngtVdErrorPattern; }, function(value) { if (angular.isDefined(value)) scope.vd.error.pattern = value; });
                    scope.$watch(function(scope) { return attrs.ngtVdPattern; }, function(value) { if (angular.isDefined(value)) scope.vd.pattern = value; });

                    scope.$watch(
                        function(scope) {
                            return scope.$parent.$eval(attrs.ngModel);
                        },
                        function(value) {
                            if (typeof value==="undefined" || scope.ngModel===value) return;
                            scope.ngModel = value;
                            $(element).val(value);
                            scope.validate();
                        }
                    );
                    element.bind('blur keyup change', function(event) {
                        if (scope.ngModel===$(element).val()) return;
                        //if (event.type=="blur" || scope.vd.error.isInvalid) {
                            scope.validate();
                        //}
                        if (angular.isDefined(attrs.ngModel)) {
                            $parse(attrs.ngModel).assign(scope.$parent, $(element).val());
                            scope.$parent.$apply();
                        } else {
                            scope.$apply();
                        }
                    });

                    scope.validate = function() {
                        var required = element.attr('required'),
                            type = element.attr('type'),
                            elementValue = $(element).val(),
                            emailReg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
                            isIntegerReg = /^\s*(\+|-)?\d+\s*$/,
                            isNumberReg = /^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/,
                            isDateReg = /^(((0[1-9]|[12][0-9]|3[01])[- /.](0[13578]|1[02])|(0[1-9]|[12][0-9]|30)[- /.](0[469]|11)|(0[1-9]|1\d|2[0-8])[- /.]02)[- /.]\d{4}|29[- /.]02[- /.](\d{2}(0[48]|[2468][048]|[13579][26])|([02468][048]|[1359][26])00))$/,
                            isTimeReg = /^(([0-1]?[0-9])|([2][0-3])):([0-5]?[0-9])(:([0-5]?[0-9]))?$/;

                        scope.vd.error.type = "";
                        scope.vd.error.isInvalid = true;

                        if ((angular.isDefined(required) && required!=="false") && _.isEmpty(elementValue)) {
                            scope.vd.error.type = "required";
                        } else if (angular.isDefined(type) && type==="email" && !emailReg.test(elementValue)) {
                            scope.vd.error.type = "email";
                        } else if (angular.isDefined(type) && type==="number" && !isNumberReg.test(elementValue)) {
                            scope.vd.error.type = "number";
                        } else if (angular.isDefined(type) && type==="date" && !isDateReg.test(elementValue)) {
                            scope.vd.error.type = "date";
                        } else if (angular.isDefined(type) && type==="time" && !isTimeReg.test(elementValue)) {
                            scope.vd.error.type = "time";
                        } else if (angular.isDefined(scope.vd.pattern) && !new RegExp(scope.vd.pattern).test(elementValue)) {
                            scope.vd.error.type = "pattern";
                        } else {
                            scope.vd.error.isInvalid = false;
                        }
                    }

                }
            }
        }
    }])
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
                    children.parent().css('margin-top', "-"+value);
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
    .directive('inputPasswordBlock', function($http, $parse, $compile) {
        return {
            restrict: 'E',
            templateUrl: "assets/partials/ngt/input-password-block.html",
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
        if (typeof value==="undefined" || typeof attrs.ngModel==="undefined") return;
        $parse(attrs.ngModel).assign(scope.$parent, value);
    });
}
function ngModelInputBind(scope, element, attrs, $parse) {
    scope.$watch(
        function(scope) {
            return scope.$parent.$eval(attrs.ngModel);
        },
        function(value) {
            if (typeof value==="undefined" || scope.ngModel===value) return;
            scope.ngModel = value;
            $(element).val(value);
        }
    );
    element.bind('blur keyup change', function() {
        if (scope.ngModel===$(element).val()) return;
        if (angular.isDefined(attrs.ngModel)) {
            $parse(attrs.ngModel).assign(scope.$parent, $(element).val());
            scope.$parent.$apply();
        }
    });
}