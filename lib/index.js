const Promise = require('bluebird');
const _ = require('underscore');
const url = require('url');
const request = require('request');
const JSONStream = require('JSONStream');

const rdesk = function rdesk(options) {
	options = options || {};

	const defaults = {
		rootUrl: 'https://contacts.realestatedigital.com',
		version: 'v2'
	};

	options = _.defaults(options, defaults);

	this.rootUrl = options.rootUrl;
	this.username = options.username;
	this.password = options.password;
	this.apiKey = options.apiKey;
	this.version = options.version;
	this.jar = request.jar();
};

rdesk.prototype.isLoggedIn = function isLoggedIn(uri) {
	uri = uri || url.resolve(this.rootUrl, '/' + this.version);
	return this.jar.getCookies(uri).length > 0;
}

rdesk.prototype.sendStreamRequest = function(options, callback) {
	const results = [];

	options = _.defaults(options, { jar: this.jar });
	const parser = JSONStream.parse('*')

	try {
		const req = request(options);
		req.pipe(parser);
		callback && callback(undefined, parser)
		return Promise.resolve(parser);
	} catch (err) {
		callback && callback(err);
		return Promise.reject(err);
	}
}

rdesk.prototype.sendRequest = function sendRequest(options, callback) {
	if (options.stream) {
		return this.sendStreamRequest(_.omit(options, 'stream'), callback);
	}

	const deferred = new Promise.pending();
	const self = this;

	options = _.defaults(options, { jar: this.jar });
	
	request(options, function(err, response, body) {
		if (err) {
			callback && callback(err);
			return deferred.reject(err);
		}

		if ((response.statusCode < 200 || response.statusCode >= 300) && body) {
			callback && callback(body);
			return deferred.reject(body);
		}

		try {
			if (_.isString(body)) {
				body = JSON.parse(body);
			}

			callback && callback(undefined, body);
			deferred.resolve(body);
		} catch (err) {
			callback && callback(err);
			deferred.reject(err);
		}
	});

	return deferred.promise;
};

rdesk.prototype.buildTokenHeader = function buildTokenHeader() {
	if (!this.apiKey) {
		throw new Error('No apiKey provided. Authentication will fail.');
	}

	return { 'X-RED-ApiKey': this.apiKey };
};

rdesk.prototype.buildUrl = function buildUrl(path, params) {
	params = params || {};
	path = path.indexOf('/') === 0 ? path.substring(1) : path;
	path = ['/', this.version, '/', path].join('');
	const reqUri = url.resolve(this.rootUrl, path);
	return url.format(_.extend(url.parse(reqUri), { query: params }));
};

rdesk.prototype.login = function login(callback) {
	if (this.isLoggedIn()) {
		callback && callback();
		return Promise.resolve();
	}

	const options = {
		url: this.buildUrl('login'),
		method: 'POST',
		json: true,
		headers: this.buildTokenHeader(),
		body: {
			userLoginId: this.username,
			password: this.password
		}
	}

	return this.sendRequest(options, callback);
};

rdesk.prototype.logout = function logout() {
	this.jar = request.jar();
	return Promise.resolve();
};

rdesk.prototype.getContacts = function getContacts(params, callback) {
	const self = this;

	if (_.isFunction(params) && !callback) {
		callback = params;
		params = {};
	}

	if (_.isEmpty(_.omit(params, 'stream'))) {
		console.warn('/Contacts: No parameters. Will return all contacts, which can take a while.')
	}

	const options = {
		url: this.buildUrl('contacts', _.omit(params, 'stream')),
		method: 'GET',
		json: true,
		headers: this.buildTokenHeader(),
		stream: params.stream
	}


	return this.login().then(function() {
		return self.sendRequest(options, callback);
	});
};

rdesk.prototype.getContact = function getContact(contactKey, callback) {
	const self = this;

	const options = {
		url: this.buildUrl(`contacts/${contactKey}`),
		method: 'GET',
		json: true,
		headers: this.buildTokenHeader()
	}


	return this.login().then(function() {
		return self.sendRequest(options, callback);
	});
};

rdesk.prototype.getContactAddresses = function getContactAddresses(contactKey, params, callback) {
	const self = this;

	if (_.isFunction(params) && !callback) {
		callback = params;
		params = {};
	}

	const options = {
		url: this.buildUrl(`contacts/${contactKey}/addresses`, params),
		method: 'GET',
		json: true,
		headers: this.buildTokenHeader()
	}

	return this.login().then(function() {
		return self.sendRequest(options, callback);
	});
};

rdesk.prototype.getContactAssignments = function getContactAssignments(contactKey, params, callback) {
	const self = this;

	if (_.isFunction(params) && !callback) {
		callback = params;
		params = {};
	}

	const options = {
		url: this.buildUrl(`contacts/${contactKey}/assignments`, params),
		method: 'GET',
		json: true,
		headers: this.buildTokenHeader()
	}

	return this.login().then(function() {
		return self.sendRequest(options, callback);
	});
};

rdesk.prototype.getContactEmailAddresses = function getContactEmailAddresses(contactKey, params, callback) {
	const self = this;

	if (_.isFunction(params) && !callback) {
		callback = params;
		params = {};
	}

	const options = {
		url: this.buildUrl(`contacts/${contactKey}/emailaddresses`, params),
		method: 'GET',
		json: true,
		headers: this.buildTokenHeader()
	}

	return this.login().then(function() {
		return self.sendRequest(options, callback);
	});
};

rdesk.prototype.getContactGroups = function getContactGroups(contactKey, params, callback) {
	const self = this;

	if (_.isFunction(params) && !callback) {
		callback = params;
		params = {};
	}

	const options = {
		url: this.buildUrl(`contacts/${contactKey}/groups`, params),
		method: 'GET',
		json: true,
		headers: this.buildTokenHeader()
	}

	return this.login().then(function() {
		return self.sendRequest(options, callback);
	});
};

rdesk.prototype.getContactHistoryEvents = function getContactHistoryEvents(contactKey, callback) {
	const self = this;

	const options = {
		url: this.buildUrl(`contacts/${contactKey}/historyevents`),
		method: 'GET',
		json: true,
		headers: this.buildTokenHeader()
	}

	return this.login().then(function() {
		return self.sendRequest(options, callback);
	});
};

rdesk.prototype.getContactLeadSources = function getContactLeadSources(contactKey, params, callback) {
	const self = this;

	if (_.isFunction(params) && !callback) {
		callback = params;
		params = {};
	}

	const options = {
		url: this.buildUrl(`contacts/${contactKey}/leadsources`, params),
		method: 'GET',
		json: true,
		headers: this.buildTokenHeader()
	}

	return this.login().then(function() {
		return self.sendRequest(options, callback);
	});
};

rdesk.prototype.getContactNotes = function getContactNotes(contactKey, params, callback) {
	const self = this;

	if (_.isFunction(params) && !callback) {
		callback = params;
		params = {};
	}

	const options = {
		url: this.buildUrl(`contacts/${contactKey}/notes`, params),
		method: 'GET',
		json: true,
		headers: this.buildTokenHeader()
	}

	return this.login().then(function() {
		return self.sendRequest(options, callback);
	});
};

rdesk.prototype.getContactPhoneNumbers = function getContactPhoneNumbers(contactKey, params, callback) {
	const self = this;

	if (_.isFunction(params) && !callback) {
		callback = params;
		params = {};
	}

	const options = {
		url: this.buildUrl(`contacts/${contactKey}/phonenumbers`, params),
		method: 'GET',
		json: true,
		headers: this.buildTokenHeader()
	}

	return this.login().then(function() {
		return self.sendRequest(options, callback);
	});
};

rdesk.prototype.getMembers = function getMembers(params, callback) {
	if (_.isFunction(params) && !callback) {
		callback = params;
		params = {};
	}

	params = params || {};
	const self = this;

	const options = {
		url: this.buildUrl(`members`),
		method: 'GET',
		json: true,
		headers: this.buildTokenHeader(),
		stream: params.stream
	}

	return this.login().then(function() {
		return self.sendRequest(options, callback);
	});
};

rdesk.prototype.getMember = function getMember(memberKey, callback) {
	const self = this;

	const options = {
		url: this.buildUrl(`members/${memberKey}`),
		method: 'GET',
		json: true,
		headers: this.buildTokenHeader()
	}

	return this.login().then(function() {
		return self.sendRequest(options, callback);
	});
};

rdesk.prototype.getOffices = function getOffices(params, callback) {
	if (_.isFunction(params) && !callback) {
		callback = params;
		params = {};
	}

	params = params || {};
	const self = this;

	const options = {
		url: this.buildUrl(`offices`),
		method: 'GET',
		json: true,
		headers: this.buildTokenHeader(),
		stream: params.stream
	}

	return this.login().then(function() {
		return self.sendRequest(options, callback);
	});
};


rdesk.prototype.getOffice = function getOffice(officeKey, callback) {
	const self = this;

	const options = {
		url: this.buildUrl(`offices/${officeKey}`),
		method: 'GET',
		json: true,
		headers: this.buildTokenHeader()
	}

	return this.login().then(function() {
		return self.sendRequest(options, callback);
	});
};

module.exports = rdesk;
