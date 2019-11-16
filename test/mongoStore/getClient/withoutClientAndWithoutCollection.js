'use strict';

var expect = require('expect.js');
var Steppy = require('twostep').Steppy;
var _ = require('underscore');
var rewire = require('rewire');
var testUtils = require('./utils');

var MongoStore = rewire('../../../lib/mongoStore');

var describeTitle = (
	'MongoStore.prototype.getClient without client and without collection'
);

describe(describeTitle, function() {
	var testData = {
		getClientResult: {},
		mongoStoreContext: {
		}
	};

	var mocks = testUtils.getMocks(testData);

	var revertMocks;

	before(function() {
		revertMocks = MongoStore.__set__(
			_(mocks).omit('_dynamic')
		);
	});

	it('should return getClient call result', function(done) {
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
				expect(client).equal(testData.getClientResult);

				this.pass(null);
			},
			done
		);
	});

	it('setImmediate should be called', function() {
		expect(mocks.setImmediate.callCount).eql(1);

		var setImmediateArgs = mocks.setImmediate.args[0];

		expect(setImmediateArgs).length(1);
		expect(setImmediateArgs[0]).a('function');
	});

	it('getClient should be called', function() {
		expect(
			mocks._dynamic.mongoStoreContext.getClient.callCount
		).eql(1);

		var getCollectionArgs = mocks._dynamic.mongoStoreContext
			.getClient.args[0];

		expect(getCollectionArgs).length(1);
		expect(getCollectionArgs[0]).a('function');
	});

	after(function() {
		revertMocks();
	});
});
