'use strict';

var _ = require('underscore');
var Steppy = require('twostep').Steppy;
var MongoClient = require('mongodb').MongoClient;

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

	if (typeof allOptions.expireTimeMs !== 'number') {
		throw new Error('expireTimeMs should be set and should be number');
	}

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
			var connectOptions = {};

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
		function(err, dbOrClient) {
			var db;

			if (dbOrClient.collection) {
				db = dbOrClient;
			} else {
				db = dbOrClient.db();
			}

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
			if (err) {
				self.errorHandler(err);
			}

			callback(err, counter, expirationDate);
		}
	);
};

MongoStore.prototype.decrement = function(key) {
	var self = this;
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
		}
	);
};

MongoStore.prototype.resetKey = function(key) {
	var self = this;
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
		}
	);
};

module.exports = MongoStore;
