'use strict';

var sinon = require('sinon');

exports.getTestData = function() {
	return {
		mongoStoreContext: {
			dbOptions: {
				uri: 'testUri/testDbName',
				collectionName: 'testCollectionName'
			}
		},
		db: {
			collectionResult: 'testCollection'
		},
		mongoClientVersion: '2.x.x'
	};
};

exports.getMocks = function(testData) {
	var dbCollectionMock = sinon.stub().returns(
		testData.db.collectionResult
	);

	var clientDbMock = sinon.stub().returns({
		collection: dbCollectionMock
	});

	var mongoClientConnectResult;
	if (testData.mongoClientVersion === '2.x.x') {
		 mongoClientConnectResult = {
			collection: dbCollectionMock
		 };
	} else {
		mongoClientConnectResult = {
			db: clientDbMock
		};
	}

	return {
		MongoClient: {
			connect: sinon.stub().callsArgWithAsync(
				2, null, mongoClientConnectResult
			)
		},
		_dynamic: {
			db: {
				collection: dbCollectionMock
			},
			client: {
				db: clientDbMock
			}
		}
	};
};
