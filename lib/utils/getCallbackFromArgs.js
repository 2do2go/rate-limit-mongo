'use strict';

var _ = require('underscore');

module.exports = function(args) {
	var lastArg = _(args).last();
	var callback;

	if (args.length > 1 && _(lastArg).isFunction()) {
		callback = lastArg;
	}

	return callback;
};
