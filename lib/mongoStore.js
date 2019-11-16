'use strict';

var _ = require('underscore');
var Steppy = require('twostep').Steppy;
var MongoClient = require('mongodb').MongoClient;
var utils = require('./utils');
var util = require('util');

var MongoStore = function(options) {
	var allOptions = _({}).defaults(
		options,
		{
			collectionName: 'expressRateRecords',
			expireTimeMs: 60000,
			resetExpireDateOnChange: false,
			errorHandler: _.noop
		}
	);

	if (
		!allOptions.collection &&
		(
			!allOptions.collectionName ||
			!allOptions.uri
		)
	) {
		throw new Error('collection or collectionName and uri should be set');
	}

	this.dbOptions = _(allOptions).pick(
		'uri', 'user', 'password', 'authSource', 'collectionName'
	);

	_(this).extend(
		_(allOptions).pick(
			'collection', 'expireTimeMs', 'resetExpireDateOnChange', 'errorHandler'
		)
	);

	this._collectionState = 'notPrepared';
};

MongoStore.prototype._createCollection = function(callback) {
	var self = this;
	Steppy(
		function() {
			var connectOptions = {
				useNewUrlParser: true,
				useUnifiedTopology: true
			};

			if (self.dbOptions.user && self.dbOptions.password) {
				var dbName = _(self.dbOptions.uri.split('/')).last();

				connectOptions.authSource = self.dbOptions.authSource || dbName;
				connectOptions.auth = {
					user: self.dbOptions.user,
					password: self.dbOptions.password
				};
			}

			MongoClient.connect(
				self.dbOptions.uri,
				connectOptions,
				this.slot()
			);
		},
		function(err, client) {
			self.client = client;
			var db = self.client.db();

			self.collection = db.collection(self.dbOptions.collectionName);

			this.pass(null);
		},
		callback
	);
};

MongoStore.prototype._getCollection = function(callback) {
	var self = this;

	if (this._collectionState === 'notPrepared') {
		this._collectionState = 'preparing';
	} else if (this._collectionState === 'prepared') {
		return callback(null, this.collection);
	} else {
		return setImmediate(function() {
			self._getCollection(callback);
		});
	}

	Steppy(
		function() {
			if (self.collection) {
				this.pass(null);
			} else {
				self._createCollection(this.slot());
			}
		},
		function() {
			self.collection.createIndex(
				{expirationDate: 1},
				{expireAfterSeconds: 0},
				this.slot()
			);
		},
		function(err) {
			self._collectionState = err ? 'notPrepared' : 'prepared';

			callback(err, self.collection);
		}
	);
};

MongoStore.prototype.incr = function(key, callback) {
	var self = this;
	Steppy(
		function() {
			self._getCollection(this.slot());
		},
		function(err, collection) {
			var modifier = {
				$inc: {counter: 1}
			};
			var expirationDate = new Date(
				Date.now() + self.expireTimeMs
			);

			if (self.resetExpireDateOnChange) {
				modifier.$set = {expirationDate: expirationDate};
			} else {
				modifier.$setOnInsert = {expirationDate: expirationDate};
			}

			collection.findOneAndUpdate(
				{_id: key},
				modifier,
				{
					upsert: true,
					returnOriginal: false
				},
				this.slot()
			);
		},
		function(err, result) {
			var expressRateRecord = result.value;

			this.pass(expressRateRecord.counter, expressRateRecord.expirationDate);
		},
		function(err, counter, expirationDate) {
			// call function again in case of duplicate key error
			if (err && err.code === 11000) {
				return self.incr(key, callback);
			}

			if (err) {
				self.errorHandler(err);
			}

			callback(err, counter, expirationDate);
		}
	);
};

MongoStore.prototype.decrement = function(key) {
	var self = this;
	var callback = utils.getCallbackFromArgs(
		_(arguments).toArray()
	);

	Steppy(
		function() {
			self._getCollection(this.slot());
		},
		function(err, collection) {
			var modifier = {
				$inc: {counter: -1}
			};
			var expirationDate = new Date(
				Date.now() + self.expireTimeMs
			);

			if (self.resetExpireDateOnChange) {
				modifier.$set = {expirationDate: expirationDate};
			} else {
				modifier.$setOnInsert = {expirationDate: expirationDate};
			}

			collection.findOneAndUpdate(
				{_id: key},
				modifier,
				{
					upsert: true,
					returnOriginal: false
				},
				this.slot()
			);
		},
		function(err) {
			if (err) {
				self.errorHandler(err);
			}

			if (callback) {
				callback(err);
			}
		}
	);
};

MongoStore.prototype.resetKey = function(key) {
	var self = this;
	var callback = utils.getCallbackFromArgs(
		_(arguments).toArray()
	);

	Steppy(
		function() {
			self._getCollection(this.slot());
		},
		function(err, collection) {
			collection.deleteOne(
				{_id: key},
				this.slot()
			);
		},
		function(err) {
			if (err) {
				self.errorHandler(err);
			}

			if (callback) {
				callback(err);
			}
		}
	);
};

MongoStore.prototype.getClient = function(callback) {
	var self = this;

	if (self.client) {
		callback(null, self.client);
	} else {
		// if no client but there is collection then it's an external collection
		if (self.collection) {
			callback(null, null);
		} else {
		// if no client and no collection then wait for client appear
			setImmediate(function() {
				self.getClient(callback);
			});
		}
	}
};

// should remove this condition when support of nodejs < 8 will be dropped
// istanbul ignore else
if (util.promisify) {
	MongoStore.prototype.getClient = util.promisify(
		MongoStore.prototype.getClient
	);
}

module.exports = MongoStore;
