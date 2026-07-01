# Examples

Sample code that is **not** part of the published library build.

Run the live demo after building the package:

```bash
yarn build
yarn dev
```

Edit the gateway IP in [`demo.ts`](demo.ts) before connecting to your KNX/IP interface.

[`home.knx-schema.ts`](home.knx-schema.ts) shows how to organise group addresses and DPT types for a real installation.

Examples import from `js-knx` (the built package). From the repo root, `yarn build` must succeed first so `dist/` exists and Node can resolve the package name via the local `package.json`.
