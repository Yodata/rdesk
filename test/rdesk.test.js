const rdesk = require('../lib');
const assert = require('chai').assert;
const moment = require('moment');
const _ = require('underscore');

describe('rdesk', function() {
	this.timeout(30000);
	let firstMemberKey;
	let firstOfficeKey;

	const rdeskOptions = {
		apiKey: process.env.RDESK_API_KEY,
		username: process.env.RDESK_USERNAME,
		password: process.env.RDESK_PASSWORD
	}

	it('verify constructor', function(done) {
		const rd = new rdesk();
		assert.ok(rd);
		assert.instanceOf(rd, rdesk);
		assert.ok(rd.rootUrl);
		assert.equal(rd.rootUrl, 'https://contacts.realestatedigital.com');
		assert.ok(rd.version);
		assert.isUndefined(rd.apiKey);
		assert.isUndefined(rd.username);
		assert.isUndefined(rd.password);
		assert.equal(rd.version, 'v2');
		assert.isFunction(rd.getContacts);
		done();
	});

	it('login', function(done) {
		const rd = new rdesk(rdeskOptions);
		assert.ok(rd.apiKey);
		assert.ok(rd.username);
		assert.ok(rd.password);

		rd.login(function(err, res) {
			assert.isUndefined(err);
			assert.ok(rd.isLoggedIn());
			done();	
		});
	});

	it('logout', function(done) {
		const rd = new rdesk(rdeskOptions);
		assert.ok(rd.apiKey);

		rd.login(function(err, res) {
			assert.isUndefined(err);
			assert.ok(rd.isLoggedIn());
			rd.logout();
			assert.ok(!rd.isLoggedIn());
			done();	
		});
	});

	it('getContacts created in the last 30 days, using stream callback', function(done) {
		const rd = new rdesk(rdeskOptions);
		assert.ok(rd.apiKey);
		assert.ok(!rd.isLoggedIn());

		const createDate = moment().subtract(30, 'days').toISOString();

		rd.getContacts({createdAfter: createDate, stream: true}, function(err, stream) {
			assert.isUndefined(err);
			assert.ok(stream);

			var counter = 0;

			stream.on('data', function(contact) {
				counter++;
				//console.log(counter, contact);
			});

			stream.on('error', function(err) {
				stream.isUndefined(err);
				rd.logout();
				done();
			});

			stream.on('end', function() {
				//console.log('processed ' + counter + ' contacts');
				assert.notEqual(counter, 0);
				rd.logout();
				done();
			});
		});	
	});

	it('getContacts created in the last 30 days, using stream promise', function(done) {
		const rd = new rdesk(rdeskOptions);
		assert.ok(rd.apiKey);
		assert.ok(!rd.isLoggedIn());

		const createDate = moment().subtract(30, 'days').toISOString();

		rd.getContacts({createdAfter: createDate, stream: true})
		.then(function(stream) {
			assert.ok(stream);

			var counter = 0;

			stream.on('data', function(contact) {
				counter++;
				//console.log(counter, contact);
			});

			stream.on('error', function(err) {
				stream.isUndefined(err);
				rd.logout();
				done();
			});

			stream.on('end', function() {
				//console.log('processed ' + counter + ' contacts');
				assert.notEqual(counter, 0);
				rd.logout();
				done();
			});
		})
		.catch(done);	
	});

	it('getContacts created in the last 24 hours, using callback', function(done) {
		const rd = new rdesk(rdeskOptions);
		assert.ok(rd.apiKey);
		assert.ok(!rd.isLoggedIn());

		const createDate = moment().subtract(1, 'days').toISOString();

		rd.getContacts({createdAfter: createDate}, function(err, res) {
			assert.isUndefined(err);
			assert.ok(res);
			rd.logout();
			done();
		});	
	});

	it('getContacts created in the last 24 hours, using promise', function(done) {
		const rd = new rdesk(rdeskOptions);
		assert.ok(rd.apiKey);
		assert.ok(!rd.isLoggedIn());

		const createDate = moment().subtract(1, 'days').toISOString();

		rd.getContacts({createdAfter: createDate})
	    .then(function(res) {
	    	assert.ok(!_.isEmpty(res), 'no contacts returned, extend test period');

    		res.forEach(function(contact) {
				assert.ok(contact.contactKey);
				assert.ok(contact.timestampEntered);
    		});

			done();
	    })
	    .catch(done);	
	});

	it('getContact, using promise', function(done) {
		const rd = new rdesk(rdeskOptions);
		assert.ok(rd.apiKey);
		assert.ok(!rd.isLoggedIn());

		const createDate = moment().subtract(4, 'days').toISOString();

		rd.getContacts({createdAfter: createDate})
	    .then(function(res) {
	    	assert.ok(res);
	    	return _.map(res, function(contact) {
	    		return rd.getContact(contact.contactKey);
	    	});
	    })
	    .then(function(res) {
	    	assert.ok(res);
	    	assert.isArray(res);

	    	Promise.all(res)
	    	.then(function(list) {
	    		assert.ok(!_.isEmpty(list), 'no contacts returned, extend test period');

	    		list.forEach(function(contact) {
	    			assert.ok(contact.contactKey);
	    			assert.ok(contact.timestampEntered);
	    		});

	    		done();
	    	})
	    	.catch(done);
	    })
	    .catch(done);	
	});

	it('getContactAddresses, using promise', function(done) {
		const rd = new rdesk(rdeskOptions);
		assert.ok(rd.apiKey);
		assert.ok(!rd.isLoggedIn());

		const createDate = moment().subtract(4, 'days').toISOString();

		rd.getContacts({createdAfter: createDate})
	    .then(function(res) {
	    	assert.ok(res);
	    	return _.map(res, function(contact) {
	    		return rd.getContactAddresses(contact.contactKey);
	    	});
	    })
	    .then(function(res) {
	    	assert.ok(res);
	    	assert.isArray(res);

	    	Promise.all(res)
	    	.then(function(list) {
	    		assert.ok(!_.isEmpty(list), 'no addresses returned, extend test period');

	    		list.forEach(function(res) {
	    			if (!_.isEmpty(res)) {
	    				const a1 = res[0];
	    				assert.ok(a1.addressKey);
	    				assert.ok(a1.timestampEntered);
	    			}
	    		});

	    		done();
	    	})
	    	.catch(done);
	    })
	    .catch(done);	
	});

	it('getContactAssignments, using promise', function(done) {
		const rd = new rdesk(rdeskOptions);
		assert.ok(rd.apiKey);
		assert.ok(!rd.isLoggedIn());

		const createDate = moment().subtract(3, 'days').toISOString();

		rd.getContacts({createdAfter: createDate})
	    .then(function(res) {
	    	assert.ok(res);
	    	return _.map(res, function(contact) {
	    		return rd.getContactAssignments(contact.contactKey);
	    	});
	    })
	    .then(function(res) {
	    	assert.ok(res);
	    	assert.isArray(res);

	    	Promise.all(res)
	    	.then(function(list) {
	    		assert.ok(!_.isEmpty(list), 'no assignments returned, extend test period');

	    		list.forEach(function(res) {
	    			if (!_.isEmpty(res)) {
	    				const a1 = res[0];
	    				assert.ok(a1.ownerKey);
	    				assert.ok(a1.timestampEntered);
	    			}
	    		});

	    		done();
	    	})
	    	.catch(done);
	    })
	    .catch(done);	
	});

	it('getContactEmailAddresses, using promise', function(done) {
		const rd = new rdesk(rdeskOptions);
		assert.ok(rd.apiKey);
		assert.ok(!rd.isLoggedIn());

		const createDate = moment().subtract(3, 'days').toISOString();

		rd.getContacts({createdAfter: createDate})
	    .then(function(res) {
	    	assert.ok(res);
	    	return _.map(res, function(contact) {
	    		return rd.getContactEmailAddresses(contact.contactKey);
	    	});
	    })
	    .then(function(res) {
	    	assert.ok(res);
	    	assert.isArray(res);

	    	Promise.all(res)
	    	.then(function(list) {

	    		assert.ok(!_.isEmpty(list), 'no email addresses returned, extend test period');

	    		list.forEach(function(res) {
	    			if (!_.isEmpty(res)) {
	    				const a1 = res[0];
	    				assert.ok(a1.emailAddressKey);
	    				assert.ok(a1.emailAddress);
	    				assert.ok(a1.timestampEntered);
	    			}
	    		});

	    		done();
	    	})
	    	.catch(done);
	    })
	    .catch(done);	
	});

	it('getContactGroups, using promise', function(done) {
		const rd = new rdesk(rdeskOptions);
		assert.ok(rd.apiKey);
		assert.ok(!rd.isLoggedIn());

		const createDate = moment().subtract(3, 'days').toISOString();

		rd.getContacts({createdAfter: createDate})
	    .then(function(res) {
	    	assert.ok(res);
	    	return _.map(res, function(contact) {
	    		return rd.getContactGroups(contact.contactKey);
	    	});
	    })
	    .then(function(res) {
	    	assert.ok(res);
	    	assert.isArray(res);

	    	Promise.all(res)
	    	.then(function(list) {

	    		assert.ok(!_.isEmpty(list), 'no groups returned, extend test period');

	    		list.forEach(function(res) {
	    			if (!_.isEmpty(res)) {
	    				const a1 = res[0];
	    				assert.ok(a1.groupKey);
	    				assert.ok(a1.timestampEntered);
	    			}
	    		});

	    		done();
	    	})
	    	.catch(done);
	    })
	    .catch(done);	
	});

	it('getContactHistoryEvents, using promise', function(done) {
		const rd = new rdesk(rdeskOptions);
		assert.ok(rd.apiKey);
		assert.ok(!rd.isLoggedIn());

		const createDate = moment().subtract(3, 'days').toISOString();

		rd.getContacts({createdAfter: createDate})
	    .then(function(res) {
	    	assert.ok(res);
	    	return _.map(res, function(contact) {
	    		return rd.getContactHistoryEvents(contact.contactKey);
	    	});
	    })
	    .then(function(res) {
	    	assert.ok(res);
	    	assert.isArray(res);

	    	Promise.all(res)
	    	.then(function(list) {

	    		assert.ok(!_.isEmpty(list), 'no hisory events returned, extend test period');

	    		list.forEach(function(res) {
	    			if (!_.isEmpty(res)) {
	    				const a1 = res[0];
	    				assert.ok(a1.historyEventKey);
	    				assert.ok(a1.timestampEntered);
	    			}
	    		});

	    		done();
	    	})
	    	.catch(done);
	    })
	    .catch(done);	
	});

	it('getContactLeadSources, using promise', function(done) {
		const rd = new rdesk(rdeskOptions);
		assert.ok(rd.apiKey);
		assert.ok(!rd.isLoggedIn());

		const createDate = moment().subtract(3, 'days').toISOString();

		rd.getContacts({createdAfter: createDate})
	    .then(function(res) {
	    	assert.ok(res);
	    	return _.map(res, function(contact) {
	    		return rd.getContactLeadSources(contact.contactKey);
	    	});
	    })
	    .then(function(res) {
	    	assert.ok(res);
	    	assert.isArray(res);

	    	Promise.all(res)
	    	.then(function(list) {

	    		assert.ok(!_.isEmpty(list), 'no lead sources returned, extend test period');

	    		list.forEach(function(res) {
	    			if (!_.isEmpty(res)) {
	    				const a1 = res[0];
	    				assert.ok(a1.leadSource);
	    				assert.ok(a1.timestampEntered);
	    			}
	    		});

	    		done();
	    	})
	    	.catch(done);
	    })
	    .catch(done);	
	});

	it('getContactNotes, using promise', function(done) {
		const rd = new rdesk(rdeskOptions);
		assert.ok(rd.apiKey);
		assert.ok(!rd.isLoggedIn());

		const createDate = moment().subtract(3, 'days').toISOString();

		rd.getContacts({createdAfter: createDate})
	    .then(function(res) {
	    	assert.ok(res);
	    	return _.map(res, function(contact) {
	    		return rd.getContactNotes(contact.contactKey);
	    	});
	    })
	    .then(function(res) {
	    	assert.ok(res);
	    	assert.isArray(res);

	    	Promise.all(res)
	    	.then(function(list) {

	    		assert.ok(!_.isEmpty(list), 'no notes returned, extend test period');

	    		list.forEach(function(res) {
	    			if (!_.isEmpty(res)) {
	    				const a1 = res[0];
	    				assert.ok(a1.noteKey);
	    				assert.ok(a1.timestampEntered);
	    			}
	    		});

	    		done();
	    	})
	    	.catch(done);
	    })
	    .catch(done);	
	});

	it('getContactPhoneNumbers, using promise', function(done) {
		const rd = new rdesk(rdeskOptions);
		assert.ok(rd.apiKey);
		assert.ok(!rd.isLoggedIn());

		const createDate = moment().subtract(3, 'days').toISOString();

		rd.getContacts({createdAfter: createDate})
	    .then(function(res) {
	    	assert.ok(res);
	    	return _.map(res, function(contact) {
	    		return rd.getContactPhoneNumbers(contact.contactKey);
	    	});
	    })
	    .then(function(res) {
	    	assert.ok(res);
	    	assert.isArray(res);

	    	Promise.all(res)
	    	.then(function(list) {

	    		assert.ok(!_.isEmpty(list), 'no phone numbers returned, extend test period');

	    		list.forEach(function(res) {
	    			if (!_.isEmpty(res)) {
	    				const a1 = res[0];
	    				assert.ok(a1.phoneNumberKey);
	    				assert.ok(a1.timestampEntered);
	    			}
	    		});

	    		done();
	    	})
	    	.catch(done);
	    })
	    .catch(done);	
	});

	it('getMembers, all of them, using promise', function(done) {
		const rd = new rdesk(rdeskOptions);
		assert.ok(rd.apiKey);
		assert.ok(!rd.isLoggedIn());

		rd.getMembers()
	    .then(function(res) {
	    	assert.ok(!_.isEmpty(res), 'no members returned');

    		res.forEach(function(member) {
				assert.ok(member.memberKey);
				assert.ok(member.timestampEntered);

				if (!firstMemberKey) {
					firstMemberKey = member.memberKey;
				}
    		});

			done();
	    })
	    .catch(done);	
	});

	it('getMember, just one, using promise', function(done) {
		const rd = new rdesk(rdeskOptions);
		assert.ok(rd.apiKey);
		assert.ok(!rd.isLoggedIn());
		assert.ok(firstMemberKey);

		rd.getMember(firstMemberKey)
	    .then(function(member) {
	    	assert.ok(!_.isEmpty(member), 'no member returned');
			assert.ok(member.memberKey);
			assert.ok(member.timestampEntered);
			done();
	    })
	    .catch(done);	
	});

	it('getOffices, all of them, using promise', function(done) {
		const rd = new rdesk(rdeskOptions);
		assert.ok(rd.apiKey);
		assert.ok(!rd.isLoggedIn());


		rd.getOffices()
	    .then(function(res) {
	    	assert.ok(!_.isEmpty(res), 'no offices returned');

    		res.forEach(function(office) {
				assert.ok(office.officeKey);
				assert.ok(office.timestampEntered);

				if (!firstOfficeKey) {
					firstOfficeKey = office.officeKey;
				}
    		});

			done();
	    })
	    .catch(done);	
	});

	it('getOffice, just one, using promise', function(done) {
		const rd = new rdesk(rdeskOptions);
		assert.ok(rd.apiKey);
		assert.ok(!rd.isLoggedIn());
		assert.ok(firstOfficeKey);

		rd.getOffice(firstOfficeKey)
	    .then(function(office) {
	    	assert.ok(!_.isEmpty(office), 'no office returned');
			assert.ok(office.officeKey);
			assert.ok(office.timestampEntered);
			done();
	    })
	    .catch(done);	
	});
});
