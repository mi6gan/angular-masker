module.exports = (function() {
    'use strict';
    angular.module('masker', [])
        .provider('masker', function() {
            this.$get = [function () {
                return require('vanilla-masker');
            }];
        })
        .directive('masker', ['masker', function(masker) {
            return {
                restrict: 'AE',
                require: 'ngModel',
                scope: {
                    'masker': '<',
                    'separator': '<maskerSeparator',
                    'helpText': '<'
                },
                compile: function() {
                    return {
                        post: function(scope, element, attrs, ngModel) {
                            scope.$watch('masker', function(opts) {
                                if(!angular.isDefined(opts)) {
                                    return;
                                }
                                var optsList,
                                    splitter = scope.separator,
                                    separator = angular.isString(scope.separator) ? scope.separator : '';
                                if(angular.isString(opts)) {
                                    optsList = [opts];
                                }
                                else if(angular.isArray(opts)) {
                                    optsList = opts;
                                }
                                else if(angular.isString(opts.pattern)) {
                                    optsList = [opts.pattern];
                                }
                                else if(angular.isArray(opts.pattern)) {
                                    optsList = opts.pattern;
                                }
                                optsList = optsList.map(function(pattern) {
                                    return angular.merge({}, angular.isArray(opts) ? {} : opts, {
                                        pattern: pattern
                                    });
                                });
                                // set up validators
                                ngModel.$parsers.push(function splitBySeparator(value) {
                                    if(angular.isString(value) ) {
                                        if( angular.equals(separator.toLowerCase(), 'space') ) {
                                            separator = ' ';
                                            splitter = /[\t\s]+/;
                                        }
                                        if(angular.isString(splitter) && splitter.length || angular.isObject(splitter)) {
                                            return value.split(splitter);
                                        }
                                        else {
                                            return [value];
                                        }
                                    }
                                    return value;
                                });
                                ngModel.$validators.mask = function(modelValue, viewValue) {
                                    var value = modelValue || viewValue,
                                        valid = false;
                                    if(angular.isArray(value)) {
                                        var cleaned = [];
                                        for(var i=0; i < Math.min(optsList.length, value.length); i++ ) { 
                                            cleaned.push(masker.toPattern(value[i], optsList[i]));
                                        }
                                        valid = (value.length <= optsList.length);
                                        if(valid || !ngModel.$options || !ngModel.$options.allowInvalid) {
                                            ngModel.$setViewValue(cleaned.join(separator));
                                            ngModel.$render();
                                        }
                                        if(!valid) {
                                            ngModel.helpText = 'help';
                                        }
                                    }
                                    return valid;
                                };
                            });
                        }
                    };
                }
            };
        }])
})();
