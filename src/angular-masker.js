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
        .directive('masker', function($interpolate, Masker) {
            return {
                require: 'ngModel',
                restrict: 'A',
                compile: function ($element, $attrs) {
                    return {
                        post: function (scope, element, attrs, ngModel) {
                            var patterns = $interpolate(attrs.masker)(scope).toString().split(""),
                                modelOpts = ngModel.$options || {},
                                valid = false;
                            ngModel.$validators.masker = function () {
                                return valid;
                            };
                            element.on('input', function () {
                                var value = ( element.val() || ngModel.$viewValue || ngModel.$modelValue || ''),
                                    maskedValue = '',
                                    i = 0;
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
                                        maskedValue += pattern;
                                    }
                                }
                                valid = (i == patterns.length); 
                                element.val(maskedValue);
                                if( ( modelOpts.updateOn  ) && valid || modelOpts.allowInvalid ) {
                                    if( modelOpts.updateOn ) {
                                        element.triggerHandler(modelOpts.updateOn);
                                    }
                                }
                            });
                        }
                    };
                }
            };
        })
})();
