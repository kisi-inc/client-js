[![Build Status](https://travis-ci.org/kisi-inc/client-js.svg?branch=release-4.0.0)](https://travis-ci.org/kisi-inc/client-js) [![npm version](https://badge.fury.io/js/kisi-client.svg)](https://badge.fury.io/js/kisi-client)

# kisi-inc/client-js

A very simple JavaScript client for the Kisi API.

# Installation

Run `npm install kisi-client` or add `kisi-client` to your `package.json` by running `npm install --save kisi-client`.

# Usage

```javascript
import Kisi from "kisi-client"

const kisiClient = new Kisi()

kisiClient
    .signIn("email", "password")
    .then(() => {
        kisiClient
            .get("places")
            .then(places => console.log(places))

        kisiClient
            .get("places/1")
            .then(place => console.log(place))

        kisiClient
            .post("locks/1/unlock")
            .then(result => console.log(result))
    })

```

# Documentation

<https://api.kisi.io/docs>

# Support

- File issues on Github
- Or visit our Gitter dev channel (<https://gitter.im/kisi-inc/Lobby>).
