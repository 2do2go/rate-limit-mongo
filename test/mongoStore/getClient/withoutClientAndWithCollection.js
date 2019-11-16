'use strict';

var expect = require('expect.js');
var Steppy = require('twostep').Steppy;
var _ = require('underscore');
var rewire = require('rewire');
var testUtils = require('./utils');

var MongoStore = rewire('../../../lib/mongoStore');

var describeTitle = (
	'MongoStore.prototype.getClient without client and with collection'
);

describe(describeTitle, function() {
	var testData = {
		mongoStoreContext: {
			collection: {}
		}
	};

	var mocks = testUtils.getMocks();

	var revertMocks;

	before(function() {
		revertMocks = MongoStore.__set__(
			_(mocks).omit('_dynamic')
		);
	});

	it('should return null', function(done) {
		Steppy(
			function() {
				MongoStore.prototype.getClient.call(
					_({}).extend(
						testData.mongoStoreContext,
						mocks._dynamic.mongoStoreContext
					),
					this.slot()
				);
			},
			function(err, client) {
				expect(client).equal(null);

				this.pass(null);
			},
			done
		);
	});

	it('setImmediate should not be called', function() {
		expect(mocks.setImmediate.callCount).eql(0);
	});

	it('getClient should not be called', function() {
		expect(
			mocks._dynamic.mongoStoreContext.getClient.callCount
		).eql(0);
	});

	after(function() {
		revertMocks();
	});
});
