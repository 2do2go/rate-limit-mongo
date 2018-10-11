'use strict';

var _ = require('underscore');
var Steppy = require('twostep').Steppy;
var MongoClient = require('mongodb').MongoClient;

var MongoStore = function(options) {
	this.options = _({}).defaults(
		options,
		{
			collectionName: 'expressRateRecords',
			expireTimeMs: 6000,
			resetExpireDateOnChange: false,
			errorHandler: _.noop
		}
	);

	if (typeof this.options.expireTimeMs !== 'number') {
		throw new Error('expireTimeMs should beset and should be number');
	}

	if (
		!this.options.collection &&
		(
			!this.options.collectionName ||
			!this.options.uri
		)
	) {
		throw new Error('collection or collectionName and uri should be set');
	}

	this._mongoCollectionState = 'notPrepared';
};

MongoStore.prototype._initCollection = function(callback) {
	var self = this;
	Steppy(
		function() {
			MongoClient.connect(self.options.uri, this.slot());
		},
		function(err, dbOrClient) {
			var db;

			if (dbOrClient.collection) {
				db = dbOrClient;
			} else {
				db = dbOrClient.db();
			}

			self.options.collection = db.collection(self.options.collectionName);

			this.pass(null);
		},
		callback
	);
};

MongoStore.prototype._getCollection = function(callback) {
	var self = this;

	if (this._mongoCollectionState === 'notPrepared') {
		this._mongoCollectionState = 'preparing';
	} else if (this._mongoCollectionState === 'prepared') {
		return callback(null, this.options.collection);
	} else {
		return setTimeout(
			function() {
				self._getCollection(callback);
			},
			50
		);
	}

	Steppy(
		function() {
			if (self.options.collection) {
				this.pass(null);
			} else {
				self._initCollection(this.slot());
			}
		},
		function() {
			self.options.collection.createIndex(
				{expireDate: 1},
				{expireAfterSeconds: 0},
				this.slot()
			);
		},
		function(err) {
			self._mongoCollectionState = 'prepared';

			callback(err, self.options.collection);
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
			var expireDate = new Date(
				Date.now() + self.options.expireTimeMs
			);

			if (self.options.resetExpireDateOnChange) {
				modifier.$set = {expireDate: expireDate};
			} else {
				modifier.$setOnInsert = {expireDate: expireDate};
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

			this.pass(expressRateRecord.counter, expressRateRecord.expireDate);
		},
		function(err, counter, expireDate) {
			if (err) {
				self.options.errorHandler(err);
			}

			callback(err, counter, expireDate);
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
			var expireDate = new Date(
				Date.now() + self.options.expireTimeMs
			);

			if (self.options.resetExpireDateOnChange) {
				modifier.$set = {expireDate: expireDate};
			} else {
				modifier.$setOnInsert = {expireDate: expireDate};
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
				self.options.errorHandler(err);
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
				self.options.errorHandler(err);
			}
		}
	);
};

module.exports = MongoStore;
