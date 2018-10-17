'use strict';

var expect = require('expect.js');
var Steppy = require('twostep').Steppy;
var rewire = require('rewire');
var _ = require('underscore');
var testUtils = require('./utils');

var MongoStore = rewire('../../lib/mongoStore');

var describeTitle = 'MongoStore.prototype._getCollection ' +
	'with "notPrepared" collectionState and collection';
describe(describeTitle, function() {
	var testData = {
		mongoStoreContext: {
			_collectionState: 'notPrepared'
		}
	};

	var mocks = testUtils.getMocks();
	mocks._dynamic.mongoStoreContext.collection = mocks._dynamic.collection;

	var revertMocks;

	before(function() {
		revertMocks = MongoStore.__set__(
			_(mocks).omit('_dynamic')
		);
	});

	it('should return collection', function(done) {
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
			function(err, collection) {
				expect(collection).eql(
					mocks._dynamic.mongoStoreContext.collection
				);

				this.pass(null);
			},
			done
		);
	});

	it('setImmediate should not be called', function() {
		expect(mocks.setImmediate.callCount).eql(0);
	});

	it('self._getCollection should not be called', function() {
		expect(
			mocks._dynamic.mongoStoreContext._getCollection.callCount
		).eql(0);
	});

	it('_createCollection should not be called', function() {
		expect(
			mocks._dynamic.mongoStoreContext._createCollection.callCount
		).eql(0);
	});

	it(
		'collection.createIndex should be called for setting ttl index',
		function() {
			var collectionMock = mocks._dynamic.mongoStoreContext.collection;

			expect(collectionMock.createIndex.callCount).eql(1);

			var collectionCreateIndexArgs = collectionMock.createIndex.args[0];

			expect(
				_(collectionCreateIndexArgs).initial()
			).eql([
				{expirationDate: 1},
				{expireAfterSeconds: 0}
			]);

			expect(
				_(collectionCreateIndexArgs).last()
			).a('function');
		}
	);

	after(function() {
		revertMocks();
	});
});
