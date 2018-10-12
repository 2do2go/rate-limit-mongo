'use strict';

var sinon = require('sinon');

exports.getMocks = function() {
	var collectionMock = {
		createIndex: sinon.stub().callsArgWithAsync(2)
	};

	return {
		setTimeout: sinon.stub().returns(),
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
