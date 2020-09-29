'use strict';

var sinon = require('sinon');

exports.getTestData = function() {
	return {
		mongoStoreContext: {
			dbOptions: {
				uri: 'testUri/testDbName',
				collectionName: 'testCollectionName'
			},
			connectionOptions: {}
		},
		db: {
			collectionResult: 'testCollection'
		}
	};
};

exports.getMocks = function(testData) {
	var dbCollectionMock = sinon.stub().returns(
		testData.db.collectionResult
	);

	var clientDbMock = sinon.stub().returns({
		collection: dbCollectionMock
	});

	var mongoClientConnectResult = {
		db: clientDbMock
	};

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
