'use strict';

var expect = require('expect.js');
var Steppy = require('twostep').Steppy;
var rewire = require('rewire');
var _ = require('underscore');
var testUtils = require('./utils');

var MongoStore = rewire('../../lib/mongoStore');

var describeTitle = 'MongoStore.prototype._getCollection ' +
	'with "prepared" collectionState';
describe(describeTitle, function() {
	var testData = {
		mongoStoreContext: {
			_collectionState: 'prepared',
			collection: 'testCollection'
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
					testData.mongoStoreContext.collection
				);

				this.pass(null);
			},
			done
		);
	});

	it('setTimeout should not be called', function() {
		expect(mocks.setTimeout.callCount).eql(0);
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
