# UI Tests

This folder contains the Cypress test setup for Out With The Nest. The current tests are AEM starter tests. They check login, the author Solutions panel and browser console errors on publish. The asset upload test is skipped.

Tests for the site's homepage, activity pages and postcode map have not been added yet.

## Run locally

Start your local AEM author and publish instances. Follow the steps in [test-module/README.md](test-module/README.md) to run the tests with Node.js and npm.

The test files are in `test-module/cypress/e2e`. Connection settings are in `test-module/cypress.config.js`.
