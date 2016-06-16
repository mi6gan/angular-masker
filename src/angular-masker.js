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
        .directive('masker', function($interpolate, $timeout, Masker) {
            return {
                require: 'ngModel',
                restrict: 'A',
                compile: function ($element, $attrs) {
                    return {
                        post: function (scope, element, attrs, ngModel) {
                            var patterns = $interpolate(attrs.masker)(scope).toString().split(""),
                                modelOpts = ngModel.$options || {},
                                placeholder = attrs.placeholder,
                                valid = true;
                            ngModel.$validators.masker = function () {
                                return valid;
                            };
                            element.on('input', function () {
                                var value = element.val() || '',
                                    maskedValue = '',
                                    i = 0,
                                    charsAdded = 0,
                                    charsAfter = value.length - this.selectionEnd;
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
                                element.val(maskedValue);
                                if(charsAdded) {
                                    $timeout(function() {
                                        element[0].setSelectionRange(maskedValue.length - charsAfter, maskedValue.length - charsAfter);
                                    }, 0);
                                }
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
