'use strict';

var expect = require('expect.js');
var getCallbackFromArgs = require('../../../lib/utils/getCallbackFromArgs');

var describeTitle = 'lib/utils/getCallbackFromArgs ' +
	'with args with last item function';
describe(describeTitle, function() {
	var args = [
		'randomString1',
		function() {}
	];

	it('should return function', function() {
		var callback = getCallbackFromArgs(args);

		expect(callback).eql(args[1]);
	});
});
