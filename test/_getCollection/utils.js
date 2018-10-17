'use strict';

var sinon = require('sinon');

exports.getMocks = function(testData) {
	testData = testData || {};

	var collectionMock = {
		createIndex: sinon.stub().callsArgWithAsync(
			2, testData.collectionCreateIndexError
		)
	};

	return {
		setImmediate: sinon.stub().returns(),
		_dynamic: {
			mongoStoreContext: {
				_createCollection: sinon.stub().callsFake(function(callback){
					this.collection = collectionMock;
					callback();
				})
			},
			collection: collectionMock
		}
	};
};
