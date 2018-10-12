'use strict';

var expect = require('expect.js');
var Steppy = require('twostep').Steppy;
var rewire = require('rewire');
var _ = require('underscore');
var testUtils = require('./utils');

var MongoStore = rewire('../../lib/mongoStore');

var describeTitle = 'MongoStore.prototype._getCollection ' +
	'with "prepairing" collectionState';
describe(describeTitle, function() {
	var testData = {
		mongoStoreContext: {
			_collectionState: 'prepairing',
			options: {
				collection: 'testCollection'
			}
		}
	};

	var mocks = testUtils.getMocks();

	var revertMocks;

	before(function() {
		revertMocks = MongoStore.__set__(
			_(mocks).omit('_dynamic')
		);
	});

	it('should call setTimeout', function() {
		MongoStore.prototype._getCollection.call(
			_({}).extend(
				testData.mongoStoreContext,
				mocks._dynamic.mongoStoreContext
			),
			'callback'
		);
	});

	it('setTimeout should be called', function() {
		expect(mocks.setTimeout.callCount).eql(1);

		var setTimeoutArgs = mocks.setTimeout.args[0];

		expect(setTimeoutArgs).length(2);
		expect(setTimeoutArgs[0]).a('function');
		expect(setTimeoutArgs[1]).eql(50);
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
