'use strict';

var sinon = require('sinon');

exports.getMocks = function(testData) {
	testData = testData || {};

	return {
		setImmediate: sinon.stub().callsArgWithAsync(0),
		_dynamic: {
			mongoStoreContext: {
				getClient: sinon.stub().callsArgWithAsync(
					0,
					null,
					testData.getClientResult
				)
			}
		}
	};
};
