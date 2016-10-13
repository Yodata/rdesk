const Promise = require('bluebird');
const _ = require('underscore');
const url = require('url');

const rdesk = function rdesk(options) {
	options = options || {};

	const defaults = {
		rootUrl: 'https://contacts.realestatedigital.com',
		version: 'v2'
	};

	options = _.defaults(options, defaults);

	this.rootUrl = options.rootUrl;
	this.apiKey = options.apiKey;
	this.version = options.version;
}

rdesk.prototype.buildTokenHeader = function buildTokenHeader() {
	if (!this.apiKey) {
		throw new Error('No apiKey provided. Authentication will fail.');
	}

	return { 'X-RED-ApiKey': this.apiKey };
}

rdesk.prototype.buildUrl = function buildUrl(path, params) {
	const reqUri = url.parse(this.rootUrl);
	this.path = this.path.indexOf('/') === 0 ? this.path.substring(1) : this.path;
	reqUri.path = ['/', this.version, '/', this.path].join();
	return url.format(_.extend(reqUri, { query: params }));
};

rdesk.prototype.getContacts = function getContacts(params) {
	const self = this;
	options = options || {};

	return new Promise(function(resolve, reject) {
		const options = {
			url: self.buildUrl('contacts', params),
			method: 'GET',
			json: true,
			headers: this.buildTokenHeader()
		}
	});
};

module.exports = rdesk;
