'use strict';

var expect = require('expect.js');
var getCallbackFromArgs = require('../../../lib/utils/getCallbackFromArgs');

var describeTitle = 'lib/utils/getCallbackFromArgs with args with one item';
describe(describeTitle, function() {
	var args = [
		function() {}
	];

	it('should return undefined', function() {
		var callback = getCallbackFromArgs(args);

		expect(callback).eql(undefined);
	});
});
