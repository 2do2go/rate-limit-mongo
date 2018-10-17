'use strict';

var expect = require('expect.js');
var _ = require('underscore');
var MongoStore = require('../../lib/mongoStore');

describe('MongoStore with suitable params', function() {

	it('should return MongoStore instance', function() {
		var mongoStore = new MongoStore({
			uri: 'testUri',
			user: 'testUser',
			password: 'testPassword'
		});

		expect(mongoStore.dbOptions).eql({
			uri: 'testUri',
			collectionName: 'expressRateRecords',
			user: 'testUser',
			password: 'testPassword'
		});

		expect(mongoStore.expireTimeMs).eql(60000);
		expect(mongoStore.resetExpireDateOnChange).eql(false);
		expect(mongoStore.errorHandler).eql(_.noop);
	});
});
