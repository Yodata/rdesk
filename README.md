# rDesk

A client for the Real Estate Digital rDesk API.

## Authentication

Every API call will check to make sure the authentication cookie has been set. If the authentication cookie is missing, the `login` endpoint will automatically be called. To reduce the number of login actions, you should create a global instance of `rdesk` and reuse it, instead of creating a new instance for each API call. For the `login` endpoint to return a valid authentication cookie, you'll need to include the correct `apiKey`, `username`, and `password` options when instantiating a new instance of `rdesk`.

## Constructor

Required parameters are `apiKey`, `username`, and `password`. The `rootUrl` parameter will default to the production domain name. If you want to connect to staging, use `https://contacts.stage.realestatedigital.com` for the `rootUrl` value.

```javascript
const client = new rdesk({
    rootUrl: 'https://contacts.realestatedigital.com',
    apiKey: '119DCFA925FE43A5BB0AFC67CC550B39',
    username: 'test',
    password: '3b3sk34jsh'
});
```

## Promises

All of the methods listed below return promises. If you would prefer not to use callback, you could use promises. We use the `bluebird` promise library.

```javascript
const params = {
	createdAfter: new Date(Date.now().valueOf() - (24 * 60 * 60 * 1000)).toISOString(), //24 hours ago
	embed: 'Addresses,Assignment,Assignments,EmailAddresses,LeadSources,PhoneNumbers,Notes'
};

client.getContacts(params)
.then(function(res) {
	console.log(JSON.stringify(res, null, 4));
})
.catch(function(err) {
	console.error(err);
});
```

## Methods

#### login(callback)

The Login action is to authenticate a user for subsequent requests to a restricted resource. A restricted resource is one that requires acting on behalf of a user. Examples would be getting a specific contact profile, or posting a new email address for a specific contact.

A Login request must be a POST, and include two parameters, `userLoginId` and `password`, both are required. If either parameter is missing a 400 Bad Request response will be returned. If a user is not found with the provided credentials a 401 Not Authorized response will be returned.

A successful Login response will include a cookie in the headers named `.contactsapiauth`. This cookie must be included in requests to restricted resources. It will also include a response body object with a “message” property that includes the location to the contact resource that corresponds to the login credentials posted.

```javascript
client.login(function(err) {
	if (err) {
		return console.error(err);
    }

    console.log('Logged in!!');
});
```

#### logout()

Resets the cookies collection for the current `rdesk` instance, deleleting the `.contactsapiauth` cookie in the process.

#### getContacts(*[params]*, callback)

Retrieves the list of contacts associated with the currently authenticated user. You may limit the results by using either the `createdAfter` or `modifiedAfter` parameter. You may automatically incude sub-resources by using the `embed` parameter.

**Excluding all parameters will return all contacts for the currently authenticatd user, which could be a *lot* of data, so be careful.**

```javascript
const params = {
	createdAfter: new Date(Date.now().valueOf() - (24 * 60 * 60 * 1000)).toISOString(), //24 hours ago
	embed: 'Addresses,Assignment,Assignments,EmailAddresses,LeadSources,PhoneNumbers,Notes'
};

client.getContacts(params, function(err, res) {
	if (err) {
		return console.error(err);
    }

	console.log(JSON.stringify(res, null, 4));
});
```

#### getContact(contactKey, callback)

Retrieves a single contact, using the specified `contactKey`.

```javascript
client.getContact(contactKey, function(err, res) {
	if (err) {
		return console.error(err);
    }

	console.log(JSON.stringify(res, null, 4));
});
```

#### getContactAddresses(contactKey, *[params]*, callback)

Retrieves the list of addresses for a specific contact. You may limit the results by using either the `createdAfter` or `modifiedAfter` parameter.

```javascript
client.getContactAddresses(contactKey, function(err, res) {
	if (err) {
		return console.error(err);
    }

	console.log(JSON.stringify(res, null, 4));
});
```

#### getContactAssignments(contactKey, *[params]*, callback)

Retrieves the list of assignments for a specific contact. You may limit the results by using the `createdAfter` parameter.

```javascript
client.getContactAssignments(contactKey, function(err, res) {
	if (err) {
		return console.error(err);
    }

	console.log(JSON.stringify(res, null, 4));
});
```

#### getContactEmailAddresses(contactKey, *[params]*, callback)

Retrieves the list of email addresses for a specific contact. You may limit the results by using either the `createdAfter` or `modifiedAfter` parameter.

```javascript
client.getContactEmailAddresses(contactKey, function(err, res) {
	if (err) {
		return console.error(err);
    }

	console.log(JSON.stringify(res, null, 4));
});
```

#### getContactGroups(contactKey, *[params]*, callback)

Retrieves the list of groups for a specific contact. You may limit the results by using the `createdAfter` parameter.

```javascript
client.getContactGroups(contactKey, function(err, res) {
	if (err) {
		return console.error(err);
    }

	console.log(JSON.stringify(res, null, 4));
});
```

#### getContactHistoryEvents(contactKey, callback)

Retrieves the list of history events for a specific contact. 

```javascript
client.getContactHistoryEvents(contactKey, function(err, res) {
	if (err) {
		return console.error(err);
    }

	console.log(JSON.stringify(res, null, 4));
});
```

#### getContactLeadSources(contactKey, *[params]*, callback)

Retrieves the list of lead sources for a specific contact. You may limit the results by using the `createdAfter` parameter.

```javascript
client.getContactLeadSources(contactKey, function(err, res) {
	if (err) {
		return console.error(err);
    }

	console.log(JSON.stringify(res, null, 4));
});
```

#### getContactNotes(contactKey, *[params]*, callback)

Retrieves the list of notes for a specific contact. You may limit the results by using the `createdAfter` parameter.

```javascript
client.getContactNotes(contactKey, function(err, res) {
	if (err) {
		return console.error(err);
    }

	console.log(JSON.stringify(res, null, 4));
});
```

#### getContactPhoneNumbers(contactKey, *[params]*, callback)

Retrieves the list of phone numbers for a specific contact. You may limit the results by using either the `createdAfter` or `modifiedAfter` parameter.

```javascript
client.getContactPhoneNumbers(contactKey, function(err, res) {
	if (err) {
		return console.error(err);
    }

	console.log(JSON.stringify(res, null, 4));
});
```

#### getMembers(callback)

Retrieves the list of all members the currenty authenticated user has access to view. 

```javascript
client.getMembers(function(err, res) {
	if (err) {
		return console.error(err);
    }

	console.log(JSON.stringify(res, null, 4));
});
```

#### getOffices(callback)

Retrieves the list of all offices the currenty authenticated user has access to view.

```javascript
client.getOffices(function(err, res) {
	if (err) {
		return console.error(err);
    }

	console.log(JSON.stringify(res, null, 4));
});
```

## Testing

To run all of the tests for this package use the following commad, replacing the `{{apiKey}}`, `{{username}}`, and `{{password}}` placeholders with your correct values.

```cli
RDESK_USERNAME={{username}} RDESK_PASSWORD={{password}} RDESK_API_KEY={{apiKey}} npm test
```