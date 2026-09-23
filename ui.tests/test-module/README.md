# Run the Cypress Tests

These are basic AEM tests included with the project setup. They do not yet test the custom Out With The Nest pages or components.

## What the tests check

* `login.cy.js` checks the author login page and signing in.
* `basic.cy.js` checks that the author Solutions panel opens.
* `console_error.cy.js` checks for browser console errors at the publish URL.
* `assets.cy.js` contains an asset upload example. It is skipped by default.

## Local setup

Install Node.js and npm, then start AEM author on port `4502` and publish on port `4503`.

From the repository root, open PowerShell and run:

```powershell
cd ui.tests/test-module
npm install
```

The default URLs are `http://localhost:4502` and `http://localhost:4503`. Both use `admin/admin` by default.

If your setup is different, set the values in the same PowerShell window before running the tests. For example:

```powershell
$env:AEM_AUTHOR_URL = "http://localhost:4502"
$env:AEM_PUBLISH_URL = "http://localhost:4503"
$env:AEM_AUTHOR_USERNAME = "admin"
$env:AEM_AUTHOR_PASSWORD = "admin"
$env:AEM_PUBLISH_USERNAME = "admin"
$env:AEM_PUBLISH_PASSWORD = "admin"
```

Use your own local credentials if they differ. Keep passwords out of committed files.

## Run tests

From `ui.tests/test-module`, run:

```sh
npm test
```

This runs the tests in Electron. To use an installed Chrome or Firefox browser, run `npm run test-chrome` or `npm run test-firefox`.

To open Cypress and select a test interactively:

```sh
npx cypress open
```

## Results

Results appear in the terminal. JUnit XML reports are saved as `output.[hash].xml` in `cypress/results`. The hash gives each report a separate filename.

Screenshots are saved under the reports folder in `screenshots`. A video folder is configured, but recording is not explicitly enabled in this project.

To use a different reports folder, set `$env:REPORTS_PATH` before running the tests. The settings are in [cypress.config.js](cypress.config.js) and [reporter.config.js](reporter.config.js).
