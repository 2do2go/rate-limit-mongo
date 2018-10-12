'use strict';

var expect = require('expect.js');
var Steppy = require('twostep').Steppy;
var rewire = require('rewire');
var _ = require('underscore');
var testUtils = require('./utils');

var MongoStore = rewire('../../lib/mongoStore');

var describeTitle = 'MongoClient.prototype._createCollection ' +
	'with user and password';
describe(describeTitle, function() {
	var testData = testUtils.getTestData();
	testData.mongoStoreContext.dbOptions.user = 'testUser';
	testData.mongoStoreContext.dbOptions.password = 'testPassword';

	var mocks = testUtils.getMocks(testData);

	var revertMocks;

	before(function() {
		revertMocks = MongoStore.__set__(
			_(mocks).omit('_dynamic')
		);
	});

	it('should set collection to mongoStore context', function(done) {
		Steppy(
			function() {
				MongoStore.prototype._createCollection.call(
					testData.mongoStoreContext,
					this.slot()
				);
			},
			function() {
				expect(testData.mongoStoreContext).keys('collection');
				expect(
					testData.mongoStoreContext.collection
				).eql(testData.db.collectionResult);

				this.pass(null);
			},
			done
		);
	});

	it('MongoClient.connect should be called with uri and auth info', function() {
		expect(mocks.MongoClient.connect.callCount).eql(1);

		var MongoClientConnectArgs = mocks.MongoClient.connect.args[0];

		expect(
			_(MongoClientConnectArgs).initial()
		).eql([
			testData.mongoStoreContext.dbOptions.uri,
			{
				authSource: 'testDbName',
				auth: {
					user: testData.mongoStoreContext.dbOptions.user,
					password: testData.mongoStoreContext.dbOptions.password
				}
			}
		]);

		expect(
			_(MongoClientConnectArgs).last()
		).a('function');
	});

	it('db.collection should be called with collection name', function() {
		expect(mocks._dynamic.db.collection.callCount).eql(1);

		var dbCollectionArgs = mocks._dynamic.db.collection.args[0];

		expect(dbCollectionArgs).eql([
			testData.mongoStoreContext.dbOptions.collectionName
		]);
	});

	after(function() {
		revertMocks();
	});
});
