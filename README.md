<div align="center">
  <img src="https://fridgecms.com/Fridge-dark.svg" width="32" />
  <h1>Fridge API Client</h1>
  Official JavaScript client for interacting with the [Fridge API](https://fridgecms.com/docs/api).
</div>

## Usage

### Add Fridge to your project

Add `fridge` to your `package.json`.

```
$ npm install fridge@beta
```

[Still using the `v1` API?](#v1-api)


### Init client with your API token

```js
import Fridge from 'fridge'

const fridge = Fridge.client({token: 'xxxxxxxxxxxx'})
```

Refer to the [Fridge API Documentation](https://fridgecms.com/docs/api) for a complete API reference and usage examples.

## Usage in browser

```html
<script src="https://unpkg.com/fridge/dist/fridge.min.js"></script>
```

## V1 API

If you are still running on the v1 Fridge API

```
$ npm install fridge@1.0.1
```

Please refer to the [`v1.0.1` README](https://github.com/fridge-cms/fridge_api.js/blob/v1.0.1/README.md<Paste>) for details.
