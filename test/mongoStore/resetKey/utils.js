'use strict';

var sinon = require('sinon');

exports.getTestData = function() {
	return {
		key: 'testKey'
	};
};

exports.getMocks = function(testData) {
	var collectionMock = {
		deleteOne: sinon.stub().callsArgWithAsync(
			1, testData.deleteOneError
		)
	};

	return {
		_dynamic: {
			mongoStoreContext: {
				_getCollection: sinon.stub().callsArgWithAsync(
					0, null, collectionMock
				),
				errorHandler: sinon.stub().returns()
			},
			collection: collectionMock
		}
	};
};
