(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('handlebars'));
    } else if (typeof define === 'function' && define.amd) {
        define(['handlebars'], factory);
    } else {
        root.HandlebarsHelpersRegistry = factory(root.Handlebars);
    }
}(this, function (Handlebars) {

    var isArray = function (value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    }

    var ExpressionRegistry = function () {
        this.expressions = [];
    };

    ExpressionRegistry.prototype.add = function (operator, method) {
        this.expressions[operator] = method;
    };



    ExpressionRegistry.prototype.call = function (operator, left, right) {
        if (!this.expressions.hasOwnProperty(operator)) {
            throw new Error('Unknown operator "' + operator + '"');
        }

        /*
        올바른 비교를 위하여, 1차항과 2차항에 null값이나 undefined값이 있으면 emptyString으로 교체.
         */
        if(left === null || left === undefined) {
            left = "";
        }

        if(right === null  || right === undefined) {
            right = "";
        }

        return this.expressions[operator](left, right);
    };

    var eR = new ExpressionRegistry;
    eR.add('not', function (left, right) {
        return left != right;
    });
    eR.add('>', function (left, right) {
        return left > right;
    });
    eR.add('<', function (left, right) {
        return left < right;
    });
    eR.add('>=', function (left, right) {
        return left >= right;
    });
    eR.add('<=', function (left, right) {
        return left <= right;
    });
    eR.add('===', function (left, right) {
        return left === right;
    });
    eR.add('!==', function (left, right) {
        return left !== right;
    });
    eR.add('in', function (left, right) {
        if (!isArray(right)) {
            right = right.split(',');
        }
        return right.indexOf(left) !== -1;
    });
    eR.add('&&', function (left, right) {
        if(left && right) {
            return true;
        } else {
            false;
        }
    });
    eR.add('||', function (left, right) {
        if(left || right) {
            return true;
        } else {
            false;
        }
    });
    eR.add('true', function (left, right) {
        if(left == true) {
            return true;
        } else {
            return false;
        }
    });
    eR.add('false', function (left, right) {
        if(left == false) {
            return true;
        } else {
            return false;
        }
    });

    var isHelper = function () {
        var args = arguments
            , left = args[0]
            , operator = args[1]
            , right = args[2]
            , options = args[3]
            ;

        if (args.length == 2) {
            options = args[1];
            if (left) return options.fn(this);
            return options.inverse(this);
        }

        if (args.length == 3) {
            if(args[1] == "true" || args[1] == "false") {
                options = args[2];
                if (eR.call(args[1], left, undefined)) {
                    return options.fn(this);
                }
                return options.inverse(this);
            } else {
                right = args[1];
                options = args[2];
                if (left == right) return options.fn(this);
                return options.inverse(this);
            }
        }

        if (eR.call(operator, left, right)) {
            return options.fn(this);
        }
        return options.inverse(this);
    };

    Handlebars.registerHelper('is', isHelper);

    Handlebars.registerHelper('nl2br', function (text) {
        var nl2br = (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
        return new Handlebars.SafeString(nl2br);
    });

    Handlebars.registerHelper('log', function () {
        console.log(['Values:'].concat(
            Array.prototype.slice.call(arguments, 0, -1)
        ));
    });

    Handlebars.registerHelper('debug', function () {
        console.log('Context:', this);
        console.log(['Values:'].concat(
            Array.prototype.slice.call(arguments, 0, -1)
        ));
    });

    Handlebars.registerHelper('length', function (text) {
        return text.length.toFixed(0);
    });

    Handlebars.registerHelper('add', function (target, increment) {
        return (Number(target) + Number(increment)).toFixed(0);
    });

    Handlebars.registerHelper('substring', function (text, start, length) {
        return text.substr(start, length);
    });

    Handlebars.registerHelper('formatNumber', function (number) {
        //TODO : Int를 초과하는 범위는 지원 못함.
        if (number == undefined) {
            return '';
        }
        return String(number).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    });

    Handlebars.registerHelper('eq', function (lText, rText) {

        if(lText === null || lText === undefined) {
            lText = "";
        }

        if(rText === null || rText === undefined) {
            rText = "";
        }

        if(lText == rText) {
            return true;
        } else {
            return false;
        }
    });

    Handlebars.registerHelper('neq', function (lText, rText) {

        if(lText === null || lText === undefined) {
            lText = "";
        }

        if(rText === null || rText === undefined) {
            rText = "";
        }

        if(lText != rText) {
            return true;
        } else {
            return false;
        }
    });

    Handlebars.registerHelper('gt', function (lText, rText) {

        if(lText === null || lText === undefined) {
            lText = "";
        }

        if(rText === null || rText === undefined) {
            rText = "";
        }

        if(lText > rText) {
            return true;
        } else {
            return false;
        }
    });

    Handlebars.registerHelper('lt', function (lText, rText) {

        if(lText === null || lText === undefined) {
            lText = "";
        }

        if(rText === null || rText === undefined) {
            rText = "";
        }

        if(lText < rText) {
            return true;
        } else {
            return false;
        }
    });

    Handlebars.registerHelper('gteq', function (lText, rText) {

        if(lText === null || lText === undefined) {
            lText = "";
        }

        if(rText === null || rText === undefined) {
            rText = "";
        }

        if(lText >= rText) {
            return true;
        } else {
            return false;
        }
    });

    Handlebars.registerHelper('lteq', function (lText, rText) {

        if(lText === null || lText === undefined) {
            lText = "";
        }

        if(rText === null || rText === undefined) {
            rText = "";
        }

        if(lText <= rText) {
            return true;
        } else {
            return false;
        }
    });

    Handlebars.registerHelper('size', function (collections) {
        return collections instanceof Array ? collections.length : 0;
    });

    Handlebars.registerHelper('replace', function (text, targetChar, replacementChar) {
        if (text == null || text == undefined) {
            return "";
        }
        return text.split(targetChar).join(replacementChar);
    });

    Handlebars.registerHelper('isTrue', function (lText) {

        if(lText === null || lText === undefined) {
            lText = "";
        }

        if(lText == true) {
            return true;
        } else {
            return false;
        }
    });

    Handlebars.registerHelper('isFalse', function (lText) {

        if(lText === null || lText === undefined) {
            lText = "";
        }

        if(lText == false) {
            return true;
        } else {
            return false;
        }
    });

    Handlebars.registerHelper('times', function(n, block) {
        var accum = '';
        for(var i = 0; i < n; ++i)
            accum += block.fn(i);
        return accum;
    });

    return eR;

}));
