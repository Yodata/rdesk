const rdesk = require('../lib');
const assert = require('chai').assert;

describe('rdesk constructor', function() {
	it('verify new rdesk command works', function(done) {
		const rd = new rdesk();
		assert.ok(rd);
		assert.instanceOf(rd, rdesk);
		assert.ok(rd.rootUrl);
		assert.equal(rd.rootUrl, 'https://contacts.realestatedigital.com');
		assert.ok(rd.version);
		assert.equal(rd.version, 'v2');
		assert.isFunction(rd.getContacts);
		done();
	});
});
