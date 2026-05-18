[![npm version](https://badge.fury.io/js/kisi-client.svg)](https://badge.fury.io/js/kisi-client)

# kisi-inc/client-js

A very simple JavaScript client for the Kisi API.

# Installation

```sh
pnpm add kisi-client
```

# Usage

```javascript
import Kisi from 'kisi-client';

const kisi = new Kisi();

await kisi.signIn({ domain: 'organization-domain', email: 'email', password: 'password' });

const places = await kisi.get('places');
const place = await kisi.get('places/1');
const result = await kisi.post('locks/1/unlock');
```

# Documentation

<https://api.kisi.io/docs>

# Support

- File issues on Github
