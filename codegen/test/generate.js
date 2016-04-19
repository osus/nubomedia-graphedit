var assert = require('chai').assert;
var sut = require('../gtor.js')

describe('generate', function() {
    describe('generateTemplate', function() {
        it('should pass', function () {
            var tpl ="{{name}}, {{name}}!";
            var model1 = {
                name: "Alice"
            };
            var model2 = {
                name: "Sandra"
            };
            assert.equal("Alice, Alice!", sut.generateTemplate(tpl, model1));
            assert.equal("Sandra, Sandra!", sut.generateTemplate(tpl, model2));
        });
    });
});