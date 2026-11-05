# Contributing to App Service Builder: React sample

This project welcomes contributions and suggestions.

## Contributor License Agreement

Most contributions require a Contributor License Agreement (CLA) declaring
that you have the right to grant us the rights to use your contribution.
See [Microsoft Contributor License Agreements](https://cla.opensource.microsoft.com/).
Follow any CLA instructions shown on your pull request.

## Code of Conduct

This project follows the
[Microsoft Open Source Code of Conduct](.github/CODE_OF_CONDUCT.md).

## Issues and feature requests

Search [existing issues](https://github.com/AzureAppService/app-service-builder-react/issues)
before opening a new one. Include reproduction steps, expected and actual
behavior, Node.js/npm versions, operating system, browser, and sanitized logs.
For larger changes, open an issue to discuss the proposal first.

Do not include credentials or private environment values. For security concerns,
follow [the security policy](SECURITY.md) instead of opening a public issue.

## Development and pull requests

1. Fork the repository and create a branch for your change.
2. Install locked dependencies with `npm ci --ignore-scripts`.
3. Keep the sample standalone, small, and free of external service dependencies.
4. Update tests and documentation when behavior changes.
5. Run the checks and describe the changes and results in your pull request.

```sh
npm run lint
npm run build
npm test
```

For UI or routing changes, also run the production preview and verify the
counter, direct deep links, refreshes, and unknown routes in a browser.
See [the README](README.md) for the HTTP verification script and expected behavior.

Keep all `VITE_*` values public. Preserve the deployment contract in
`builder.yaml` and the static health/version files. Local preview behavior
does not replace deployed SPA-fallback verification.
Do not commit installed dependencies, build output, environment files, or secrets.
