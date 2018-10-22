'use strict';

var sinon = require('sinon');
var _ = require('underscore');

exports.getTestData = function() {
	return {
		key: 'testKey',
		DateResult: {
			someKey: _.random(1, 10)
		},
		Date: {
			nowResult: _.random(1, 10)
		},
		collection: {
			findOneAndUpdateResult: {
				value: {
					counter: _.random(1, 10),
					expirationDate: _.random(1, 10)
				}
			}
		},
		mongoStoreContext: {
			expireTimeMs: _.random(1, 10)
		}
	};
};

exports.getMocks = function(testData) {
	var dateMock = sinon.stub().callsFake(function() {
		_(this).extend(testData.DateResult);
	});
	dateMock.now = sinon.stub().returns(testData.Date.nowResult);

	var collectionFindOneAndUpdateMock = sinon.stub().callsArgWithAsync(
		3,
		testData.findOneAndUpdateError,
		testData.collection.findOneAndUpdateResult
	);
	var collectionMock = {
		findOneAndUpdate: collectionFindOneAndUpdateMock
	};

	return {
		Date: dateMock,
		_dynamic: {
			mongoStoreContext: {
				_getCollection: sinon.stub().callsArgWithAsync(
					0, null, collectionMock
				),
				errorHandler: sinon.stub().returns(),
				incr: sinon.stub().callsArgWithAsync(1)
			},
			collection: collectionMock
		}
	};
};
