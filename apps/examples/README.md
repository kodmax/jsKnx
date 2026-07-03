# Examples

Sample code that is **not** part of the published library build.

Run the live demo after building the package:

```bash
yarn build
yarn dev
```

Edit the gateway IP in [`src/demo.ts`](src/demo.ts) before connecting to your KNX/IP interface.

[`src/home.knx-schema.ts`](src/home.knx-schema.ts) shows how to organise group addresses and DPT types for a real installation.

Examples import from the `js-knx` workspace package. Run `yarn build` from the repo root first so TypeScript can resolve types from the built package.
