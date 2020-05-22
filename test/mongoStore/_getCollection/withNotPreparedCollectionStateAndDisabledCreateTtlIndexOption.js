'use strict';

var expect = require('expect.js');
var Steppy = require('twostep').Steppy;
var rewire = require('rewire');
var _ = require('underscore');
var testUtils = require('./utils');

var MongoStore = rewire('../../../lib/mongoStore');

var describeTitle = 'MongoStore.prototype._getCollection ' +
	'with "notPrepared" collectionState and disabled create ttl index option';
describe(describeTitle, function() {
	var testData = {
		mongoStoreContext: {
			_collectionState: 'notPrepared',
			createTtlIndex: false
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
		'collection.createIndex should not be called',
		function() {
			expect(mocks._dynamic.collection.createIndex.callCount).eql(0);
		}
	);

	after(function() {
		revertMocks();
	});
});
