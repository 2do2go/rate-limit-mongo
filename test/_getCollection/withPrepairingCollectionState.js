'use strict';

var expect = require('expect.js');
var Steppy = require('twostep').Steppy;
var rewire = require('rewire');
var _ = require('underscore');
var testUtils = require('./utils');

var MongoStore = rewire('../../lib/mongoStore');

var describeTitle = 'MongoStore.prototype._getCollection ' +
	'with "prepairing" collectionState';
describe(describeTitle, function() {
	var testData = {
		mongoStoreContext: {
			_collectionState: 'prepairing',
			options: {
				collection: 'testCollection'
			}
		}
	};

	var mocks = testUtils.getMocks();

	var revertMocks;

	before(function() {
		revertMocks = MongoStore.__set__(
			_(mocks).omit('_dynamic')
		);
	});

	it('should be ok', function(done) {
		Steppy(
			function() {
				MongoStore.prototype._getCollection.call(
					_({}).extend(
						testData.mongoStoreContext,
						mocks._dynamic.mongoStoreContext
					),
					this.slot()
				);
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

	it('self._getCollection should be called', function() {
		expect(
			mocks._dynamic.mongoStoreContext._getCollection.callCount
		).eql(1);

		var getCollectionArgs = mocks._dynamic.mongoStoreContext
			._getCollection.args[0];

		expect(getCollectionArgs).length(1);
		expect(getCollectionArgs[0]).a('function');
	});

	it('_createCollection should not be called', function() {
		expect(
			mocks._dynamic.mongoStoreContext._createCollection.callCount
		).eql(0);
	});

	it('collection.createIndex should not be called', function() {
		expect(
			mocks._dynamic.collection.createIndex.callCount
		).eql(0);
	});

	after(function() {
		revertMocks();
	});
});
