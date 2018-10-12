'use strict';

var expect = require('expect.js');
var Steppy = require('twostep').Steppy;
var rewire = require('rewire');
var _ = require('underscore');
var testUtils = require('./utils');

var MongoStore = rewire('../../lib/mongoStore');

var describeTitle = 'MongoStore.prototype._getCollection ' +
	'with "notPrepared" collectionState and without collection';
describe(describeTitle, function() {
	var testData = {
		mongoStoreContext: {
			_collectionState: 'notPrepared'
		}
	};

	var mocks = testUtils.getMocks();

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
					mocks._dynamic.collection
				);

				this.pass(null);
			},
			done
		);
	});

	it('setTimeout should not be called', function() {
		expect(mocks.setTimeout.callCount).eql(0);
	});

	it('_createCollection should be called', function() {
		expect(
			mocks._dynamic.mongoStoreContext._createCollection.callCount
		).eql(1);

		var createCollectionArgs = mocks._dynamic.mongoStoreContext
			._createCollection.args[0];

		expect(createCollectionArgs).length(1);
		expect(createCollectionArgs[0]).a('function');
	});

	it(
		'collection.createIndex should be called for setting ttl index',
		function() {
			var collectionMock = mocks._dynamic.collection;

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
