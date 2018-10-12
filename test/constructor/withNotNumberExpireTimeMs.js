'use strict';

var expect = require('expect.js');
var MongoStore = require('../../lib/mongoStore');

describe('MongoStore with not number expireTimeMs', function() {

	it('should throw error', function() {
		expect(function() {
			new MongoStore({
				expireTimeMs: null
			});
		}).throwException(function(err) {
			expect(err.message).eql(
				'expireTimeMs should beset and should be number'
			);
		});
	});
});
