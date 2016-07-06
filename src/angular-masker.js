module.exports = (function() {
    'use strict';
    angular.module('masker', [])
        .provider('Masker', function() {
            return {
                patterns: {
                    "9": /\d/,
                    "w": /[\w\W]/
                },
                $get: function () {
                    return this;
                }
            };
        })
        .directive('input', function($interpolate, $timeout, Masker, $q) {
            return {
                require: ['?ngModel'],
                restrict: 'E',
                link: {
                    post: function (scope, element, attrs, ctrls) {
                        var ngModel = ctrls[0];
                        if(!attrs.mask || !ngModel || element[0].tagName.toLowerCase() != 'input' || attrs.type.toLowerCase() != 'text') {
                            return;
                        }
                        if(!ngModel.$options) {
                            ngModel.$options = {};
                        }
                        var patterns = $interpolate(attrs.mask)(scope),
                            patterns = angular.isDefined(patterns) ? patterns.toString().split("") : '',
                            modelOpts = ngModel.$options || {},
                            placeholder = attrs.includePlaceholder ? ( attrs.placeholder || '' ) : '',
                            cursorPos = placeholder.length,
                            valid = true;
                        if(!patterns) {
                            return;
                        }
                        element.on('input', function($event) {
                            var value = ngModel.$isEmpty(ngModel.$viewValue) ? '' : ngModel.$viewValue,
                                maskedValue = '',
                                i = 0,
                                charsAdded = 0,
                                charsAfter = value.length - element[0].selectionEnd;
                            if(value.length < placeholder.length) {
                                value = placeholder;
                            }
                            for( i; i < patterns.length; ++i ) {
                                var pattern = patterns[i],
                                    regexPattern = Masker.patterns[pattern];
                                if( angular.isObject(regexPattern) && ( regexPattern instanceof RegExp ) ) {
                                    var match = value.match(regexPattern);
                                    if( !match || match.index > 0 ) {
                                        break;
                                    }
                                    maskedValue += match[0];
                                    value = value.substring(match[0].length);
                                }
                                else if(value.length) {
                                    if( value.substring(0, pattern.length) == pattern ) {
                                        value = value.substring(pattern.length);
                                    }
                                    else {
                                        charsAdded ++;
                                    }
                                    maskedValue += pattern;
                                }
                            }
                            valid = (i == patterns.length); 
                            cursorPos = Math.max(element[0].selectionStart + charsAdded, placeholder.length);
                            ngModel.$setViewValue(maskedValue, $event);
                            ngModel.$render();
                            if(ngModel.$dirty || valid) {
                                ngModel.$commitViewValue();
                            }
                        });
                        element.on('blur', function () {
                            ngModel.$commitViewValue();
                        });
                        element.on('change', function () {
                            ngModel.$commitViewValue();
                        });
                        ngModel.$render = function () {
                            var value = ngModel.$isEmpty(ngModel.$viewValue) ? '' : ngModel.$viewValue;
                            if(element.val() !== value) {
                                element.val(value);
                                element[0].selectionStart = cursorPos;
                                element[0].selectionEnd = cursorPos;
                            }
                        };
                        var validate = function (resolve, reject) {
                            if(!valid) {
                                reject();
                            }
                            else {
                                resolve();
                            }
                        };
                        ngModel.$asyncValidators.masker = function(modelValue, viewValue) {
                            if(modelValue == viewValue) {
                                return $q(validate);
                            }
                            else {
                                return $q(function(resolve, reject) {
                                   element.one('blur', angular.bind(this, validate, resolve, reject));
                                });
                            }
                        };
                    }
                }
            };
        })
})();
