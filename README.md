# kisi-inc/client-js
The official KISI REST API client for JavaScript.

## Example Usage

```javascript
var KisiClient = require('kisi-client');

var options = {},
    email = 'YOUR_EMAIL',
    password = 'YOUR_PASSWORD';

// instantiate a client
var kisiClient = new KisiClient(options);

// authenticate using email and password
kisiClient.authenticate(email, password).then(function() {
  // make some calls to the KISI API, e.g.:
  kisiClient.get('keys', { limit: 10 }).then(function(response) {
    console.log(response.body.items);
  });
});
```
## Options

Options is an optional object with possible properties:

- `camelize` (type: `boolean`) - changes response body properties from `snake_case` to `camelCase` (default: `true`)
- `timeout` (type: `Number`) - time in ms after which request is canceled (default: `0` - never)

## Issues, Bugs and Feedback

https://github.com/kisi-inc/client-js/issues
