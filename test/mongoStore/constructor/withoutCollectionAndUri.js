'use strict';

var expect = require('expect.js');
var MongoStore = require('../../../lib/mongoStore');

describe('MongoStore without collection and collectionName', function() {

	it('should throw error', function() {
		expect(function() {
			new MongoStore({});
		}).throwException(function(err) {
			expect(err.message).eql(
				'collection or collectionName and uri should be set'
			);
		});
	});
});
