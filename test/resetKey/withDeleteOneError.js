'use strict';

var expect = require('expect.js');
var rewire = require('rewire');
var _ = require('underscore');
var testUtils = require('./utils');

var MongoStore = rewire('../../lib/mongoStore');

var describeTitle = 'MongoStore.prototype.resetKey ' +
	'with deleteOne error';
describe(describeTitle, function() {
	var testData = testUtils.getTestData();
	testData.deleteOneError = new Error();

	var mocks = testUtils.getMocks(testData);

	it('should be ok', function(done) {
		MongoStore.prototype.resetKey.call(
			_({}).extend(
				testData.mongoStoreContext,
				mocks._dynamic.mongoStoreContext
			),
			testData.key
		);

		setTimeout(function() {
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

	it(
		'collection.deleteOne should be called for deleting record',
		function() {
			expect(
				mocks._dynamic.collection.deleteOne.callCount
			).eql(1);

			var deleteOneArgs = mocks._dynamic.collection.deleteOne.args[0];

			expect(
				_(deleteOneArgs).initial()
			).eql([
				{_id: testData.key}
			]);

			expect(
				_(deleteOneArgs).last()
			).a('function');
		}
	);

	it('errorHandler should be called with error', function() {
		expect(
			mocks._dynamic.mongoStoreContext.errorHandler.callCount
		).eql(1);

		var errorHandlerArgs = mocks._dynamic.mongoStoreContext.errorHandler
			.args[0];

		expect(errorHandlerArgs).eql([
			testData.deleteOneError
		]);
	});
});
