# kisi-inc/client-js
The official KISI REST API client for JavaScript.

## Example Usage

```javascript
var KisiClient = require('kisi-client-js');

// instantiate a client
var kisiClient = new KisiClient();

// authenticate using email and password
client.authenticate(email, password).then(function() {
  // make some calls to the KISI API, e.g.:
  client.get('keys', { limit: 10 }).then(function(response) {
    console.log(response.body.items);
  });
});
```

## Issues, Bugs and Feedback

https://github.com/kisi-inc/client-js/issues
