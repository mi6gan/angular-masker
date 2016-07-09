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
                        var patterns = $interpolate(attrs.mask)(scope),
                            patterns = angular.isDefined(patterns) ? patterns.toString().split("") : '',
                            placeholder = attrs.includePlaceholder ? ( attrs.placeholder || '' ) : '';
                        if(!patterns) {
                            return;
                        }
                        ngModel.$validators.masker = function () {
                            var value = ngModel.$isEmpty(ngModel.$viewValue) ? '' : ngModel.$viewValue,
                                valid = true,
                                maskedValue = '',
                                i = 0;
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
                                    maskedValue += pattern;
                                }
                            }
                            valid = (i == patterns.length); 
                            if(value != maskedValue) {
                                ngModel.$setViewValue(maskedValue);
                                ngModel.$render();
                            }
                            return valid;
                        };
                    }
                }
            };
        })
})();
