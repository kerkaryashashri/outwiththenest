# Out With The Nest

**Out With The Nest** is a family activity discovery platform designed to help parents easily find ideas for days out, activities, events, and experiences for children.

## Why I Built This

The idea for this project came from my own experience as a parent.

While speaking with other parents, I realised that we often search for the same types of information — places to visit with children, weekend activities, parks, museums, swimming, birthday venues, indoor and outdoor activities, and local events.

Sometimes families want to plan a special paid experience, while at other times they simply want to spend time together without spending any money.

I wanted to bring these ideas together into one simple and easy-to-use platform.

## Project Goals

The project is designed to:

* Help parents discover family-friendly activities easily
* Support both free and paid activity discovery
* Organise activities by categories such as indoor, outdoor, events, parks, swimming and birthday venues
* Provide reusable and scalable content structures
* Create a responsive and user-friendly experience
* Demonstrate practical Adobe Experience Manager architecture and development

## Technology Stack

* Adobe Experience Manager as a Cloud Service
* Apache Sling
* Sling Models
* HTL
* OSGi
* Java
* HTML
* SCSS / CSS
* JavaScript
* Maven
* Git / GitHub

## AEM Implementation

The application is being built using a reusable component-based architecture.

Current and planned implementation areas include:

* Custom Header and Navigation
* Hero / Teaser components
* Category pages
* Reusable activity cards
* Search and filtering
* Responsive layouts
* AEM Client Libraries
* Editable Templates
* Content-driven authoring
* Sling Models
* AEM best practices for maintainability and scalability

## Architecture Approach

The project follows a modular AEM architecture where presentation, content and backend logic are separated wherever possible.

The goal is to create components that can be reused across different sections of the website while keeping authoring simple for content editors.

More detailed architecture documentation can be found in the `/docs` directory.

## Current Status

The project is being developed incrementally.

The initial site structure, theme, page structure and core components are currently being implemented. Additional functionality and content will continue to be added as the project evolves.

## Future Enhancements

Planned features include:

* Location-based activity discovery
* Free vs paid filters
* Indoor vs outdoor filters
* Age-based activity filtering
* Weekend event listings
* Search functionality
* Activity detail pages
* Improved content modelling
* Personalised recommendations

## Purpose of This Repository

Along with building a useful platform for parents, this project is also a practical implementation of my experience with Adobe Experience Manager.

It allows me to explore solution architecture, reusable component development, content modelling, performance considerations and modern AEM development practices through a real-world use case.





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
