'use strict';

var expect = require('expect.js');
var rewire = require('rewire');
var _ = require('underscore');
var testUtils = require('./utils');

var MongoStore = rewire('../../lib/mongoStore');

var describeTitle = 'MongoStore.prototype.decrement ' +
	'with resetExpireDateOnChange';
describe(describeTitle, function() {
	var testData = testUtils.getTestData();
	testData.mongoStoreContext.resetExpireDateOnChange = true;

	var mocks = testUtils.getMocks(testData);

	var revertMocks;

	before(function() {
		revertMocks = MongoStore.__set__(
			_(mocks).omit('_dynamic')
		);
	});

	it('should be ok', function(done) {
		MongoStore.prototype.decrement.call(
			_({}).extend(
				testData.mongoStoreContext,
				mocks._dynamic.mongoStoreContext
			),
			testData.key
		);

		setTimeout(function() {
			revertMocks();
			done();
		}, 10);
	});

	it('_getCollection should be called', function() {
		expect(
			mocks._dynamic.mongoStoreContext._getCollection.callCount
		).eql(1);

		var getCollectionArgs = mocks._dynamic.mongoStoreContext
			._getCollection.args[0];

		expect(getCollectionArgs).length(1);
		expect(getCollectionArgs[0]).a('function');
	});

	it('Date.now should be called', function() {
		expect(mocks.Date.now.callCount).eql(1);
		expect(mocks.Date.now.args[0]).eql([]);
	});

	it('Date should be called to construct expirationDate', function() {
		expect(mocks.Date.callCount).eql(1);

		var dateArgs = mocks.Date.args[0];

		expect(dateArgs).eql([
			testData.mongoStoreContext.expireTimeMs + testData.Date.nowResult
		]);
	});

	it('Date should be called as constructor', function() {
		expect(mocks.Date.calledWithNew()).eql(true);
	});

	it(
		'collection.findOneAndUpdate should be called for decrementing counter',
		function() {
			expect(
				mocks._dynamic.collection.findOneAndUpdate.callCount
			).eql(1);

			var findOneAndUpdateArgs = mocks._dynamic.collection
				.findOneAndUpdate.args[0];

			expect(
				_(findOneAndUpdateArgs).initial()
			).eql([
				{_id: testData.key},
				{
					$inc: {counter: -1},
					$set: {
						expirationDate: testData.DateResult
					}
				},
				{
					upsert: true,
					returnOriginal: false
				}
			]);

			expect(
				_(findOneAndUpdateArgs).last()
			).a('function');
		}
	);

	it('errorHandler should not be called', function() {
		expect(
			mocks._dynamic.mongoStoreContext.errorHandler.callCount
		).eql(0);
	});

	after(function() {
		revertMocks();
	});
});
