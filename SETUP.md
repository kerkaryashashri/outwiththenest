# Restore Out With The Nest on another computer

This repository contains application code and a snapshot of the site's authored
content. It is not a backup of the complete AEM installation.

| Repository module | Restored AEM paths |
| --- | --- |
| `ui.apps`, `core`, `ui.config` | Components, compiled frontend, Java bundle and project OSGi configuration |
| `ui.content` | `/content/outwiththenest` |
| `ui.content` | `/conf/outwiththenest` (templates, template types and policies) |
| `ui.content` | `/content/experience-fragments/outwiththenest` (shared header/footer) |
| `ui.content` | `/content/dam/outwiththenest` (asset metadata, originals and renditions) |

Inline images stored below pages are included too. Two referenced images under
`/content/dam/wknd-shared/en/magazine` are also
included at their original paths; a separate WKND site installation is not needed
for those images. Asset binaries are ordinary Git
files in this snapshot; Git LFS is not required. Keep the repository private unless
you intend to publish all of the site content and assets.

## Fresh local author

1. Install Git, Maven 3.9.x and JDK 21 (also recorded in `.cloudmanager/java-version`).
   On Windows, enable long paths for Git (`git config --global core.longpaths true`)
   and prefer a short checkout path such as `C:\src\outwiththenest` because DAM
   rendition filenames can be long. Export scripts use Windows PowerShell, curl,
   tar and robocopy (included with current Windows installations).
2. Obtain the AEM as a Cloud Service SDK and license through your Adobe access.
   Use the SDK matching the `aem.sdk.api` version in `pom.xml` where possible.
   The AEM Quickstart, license, users, passwords and runtime repository are not in Git.
3. Clone this repository, or extract its source ZIP. Start a **fresh author** on port
   4502 and wait for startup to finish. Maven downloads its own Node/npm toolchain.
   Prefer Git clone for Dispatcher development: the enabled vhost/farm entries
   must remain symbolic links on Linux and in Cloud Manager.
4. In the project root, run:

   ```sh
   mvn clean install -PautoInstallSinglePackage
   ```

   Default local author credentials are `admin/admin`. Override Maven's
   `vault.user`/`vault.password` and `sling.user`/`sling.password` locally when needed;
   do not commit real passwords. First build needs internet access to download dependencies.

5. Open:
   - `http://localhost:4502/content/outwiththenest/gb/en/home.html?wcmmode=disabled`
   - `http://localhost:4502/libs/wcm/core/content/sites/templates.html/conf/outwiththenest`
   - `http://localhost:4502/assets.html/content/dam/outwiththenest`

Check the header, footer, hero images and Parks and Walks breadcrumb. All five
templates should be enabled. Header/footer and main wrapper policies are part of
the snapshot, so their CSS selectors continue to match.

The all-package is built at `all/target/outwiththenest.all-1.0-SNAPSHOT.zip`; it can
also be installed through Package Manager. Do not install a source ZIP in AEM.
Production deployment uses Adobe Cloud Manager's Full Stack Pipeline.

## Save future author changes before pushing

Editing AEM does not update Git automatically. On Windows with the local author
running, export it before committing:

```powershell
./scripts/Export-AemContent.ps1
./scripts/Test-ContentSnapshot.ps1
mvn clean install
git status
git add .
git commit -m "Save site code, configuration and authored content"
git push
```

The export prompts for local author credentials. It snapshots only the four
project-owned paths above plus the two referenced WKND assets, excludes repository ACLs, validates the export, and
backs up the old source under `.aem-backups/` before replacing it. This directory
is ignored by Git and survives `mvn clean`. Review changes before committing.
Export again whenever pages, DAM assets, templates, policies or fragments change.

`/conf` uses a merge filter to preserve author customizations on existing instances.
For an exact restore, use a fresh author. Installing onto an existing author will
not replace existing configuration properties; content/DAM package filters can
replace matching content. Export that author's changes first.

This preserves the current reconstructed templates, not the lost pre-corruption
configuration. External services and separately configured credentials still need
their own setup. A build checks packaging and unit tests; it does not start AEM or
run the separate functional/UI test suites.
