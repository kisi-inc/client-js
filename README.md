# kisi-inc/client-js
The official KISI REST API client for JavaScript.

## Example Usage

```javascript
var KisiClient = require('kisi-client-js');

// instantiate a client
var kisiClient = new KisiClient(options);

// authenticate using email and password
client.authenticate(email, password).then(function() {
  // make some calls to the KISI API, e.g.:
  client.get('keys', { limit: 10 }).then(function(response) {
    console.log(response.body.items);
  });
});
```
## Options

Options is an optional object with possible properties:

- `camelize` (type: `boolean`) - changes response body properties from `snake_case` to `camelCase` (default: `true`)

## Issues, Bugs and Feedback

https://github.com/kisi-inc/client-js/issues
