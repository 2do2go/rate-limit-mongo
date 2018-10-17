'use strict';

var expect = require('expect.js');
var Steppy = require('twostep').Steppy;
var rewire = require('rewire');
var _ = require('underscore');
var testUtils = require('./utils');

var MongoStore = rewire('../../../lib/mongoStore');

var describeTitle = 'MongoStore.prototype.resetKey with suitable params';
describe(describeTitle, function() {
	var testData = testUtils.getTestData();

	var mocks = testUtils.getMocks(testData);

	it('should be ok', function(done) {
		Steppy(
			function() {
				MongoStore.prototype.resetKey.call(
					_({}).extend(
						testData.mongoStoreContext,
						mocks._dynamic.mongoStoreContext
					),
					testData.key,
					this.slot()
				);
			},
			done
		);
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

	it('errorHandler should not be called', function() {
		expect(
			mocks._dynamic.mongoStoreContext.errorHandler.callCount
		).eql(0);
	});
});
