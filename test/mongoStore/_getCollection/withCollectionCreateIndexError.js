'use strict';

var expect = require('expect.js');
var Steppy = require('twostep').Steppy;
var rewire = require('rewire');
var _ = require('underscore');
var testUtils = require('./utils');

var MongoStore = rewire('../../../lib/mongoStore');

var describeTitle = 'MongoStore.prototype._getCollection ' +
	'with collection.createIndex error';
describe(describeTitle, function() {
	var testData = {
		mongoStoreContext: {
			_collectionState: 'notPrepared',
			createTtlIndex: true
		},
		collectionCreateIndexError: new Error('test createIndex error')
	};

	var mocks = testUtils.getMocks(testData);

	var revertMocks;

	before(function() {
		revertMocks = MongoStore.__set__(
			_(mocks).omit('_dynamic')
		);
	});

	it('should throw error', function(done) {
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
			function(err) {
				expect(err).eql(
					testData.collectionCreateIndexError
				);

				done();
			}
		);
	});

	it('mongoStore._collectionState should be "notPrepared"', function() {
		expect(
			testData.mongoStoreContext._collectionState
		).eql('notPrepared');
	});

	it('setImmediate should not be called', function() {
		expect(mocks.setImmediate.callCount).eql(0);
	});

	it('self._getCollection should not be called', function() {
		expect(
			mocks._dynamic.mongoStoreContext._getCollection.callCount
		).eql(0);
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
