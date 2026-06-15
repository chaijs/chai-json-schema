# Changelog

## [2.0.0] - 2026-06-16

### Breaking changes

- **Dropped support for chai < 5.** The peer dependency is now `chai >= 5`.
- **`chai.tv4` is no longer set.** The tv4 instance is now exposed on the plugin itself instead of on the chai object.

  **Why:** chai 5 and 6 are ES modules. The module namespace object exported by an ES module is sealed — new properties cannot be added to it. Setting `chai.tv4 = ...` from a plugin silently fails in these versions, making the tv4 configuration API completely broken for anyone on chai 5+.

  Migrate configuration calls:

  ```js
  // before
  const chai = require('chai');
  chai.use(require('chai-json-schema'));
  chai.tv4.addSchema('http://example.com/schema', schema);
  chai.tv4.cyclicCheck = true;

  // after
  const chaiJsonSchema = require('chai-json-schema');
  chai.use(chaiJsonSchema);
  chaiJsonSchema.tv4.addSchema('http://example.com/schema', schema);
  chaiJsonSchema.tv4.cyclicCheck = true;
  ```

  The `jsonSchema` and `notJsonSchema` assertion methods themselves are unchanged.

### Other changes

- Dropped Node 18 support (`engines` is now `>= 20`). Node 18 cannot `require()` ES modules, which chai 5+ are.
- Removed `serialize-javascript` override (mocha now ships a non-vulnerable version directly).

## [1.5.1] - 2024-01-01

- Maintenance release; replaced grunt-era toolchain with eslint/prettier/mocha.
