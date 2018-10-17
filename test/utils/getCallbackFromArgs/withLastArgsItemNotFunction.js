'use strict';

var expect = require('expect.js');
var getCallbackFromArgs = require('../../../lib/utils/getCallbackFromArgs');

var describeTitle = 'lib/utils/getCallbackFromArgs ' +
	'with args with last item not function';
describe(describeTitle, function() {
	var args = [
		'randomString1',
		'randomString2'
	];

	it('should return undefined', function() {
		var callback = getCallbackFromArgs(args);

		expect(callback).eql(undefined);
	});
});
