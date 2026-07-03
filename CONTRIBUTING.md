# Contributing

Thanks for your interest in js-knx.

## Getting started

1. Fork and clone the repository
2. Install dependencies: `yarn install`
3. Build: `yarn build`
4. Run checks before opening a PR:

```bash
yarn format:ci
yarn lint:ci
yarn typecheck
yarn test
```

The publishable library lives in [`packages/js-knx`](packages/js-knx). KNX enums and datapoint types live in private workspace packages [`packages/knx-enums`](packages/knx-enums) and [`packages/knx-dpts`](packages/knx-dpts) — vendored into `js-knx` during build, not published separately. Examples are in [`apps/examples`](apps/examples).

## Pull requests

- Keep changes focused — one logical fix or feature per PR
- Add or update tests for behaviour changes
- Follow existing code style (Prettier + ESLint are enforced in CI)
- Update `README.md` or `CHANGELOG.md` when user-facing behaviour changes

## Commit messages

Use clear, imperative subject lines. Examples:

- `fix connection guard when connect() is called twice`
- `add tests for tunnel-request timeout`
- `document KnxLinkConstructorOptions in README`

## Reporting issues

Include:

- Node.js version
- Gateway model / firmware (if known)
- Minimal code sample or CLI command that reproduces the problem
- Expected vs actual behaviour

## License

By contributing, you agree that your contributions will be licensed under the [GPL-3.0](LICENSE.md) license.
