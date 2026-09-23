# Local Setup for Out With The Nest

Follow these steps to run Out With The Nest on your computer using a local AEM author instance.

## What is included

The project includes the components, Java code, CSS and JavaScript used by the site. The pages, templates, header, footer and images are saved in `ui.content`, so they can be installed along with the code.

## Requirements

* Git, Maven 3.9.x and JDK 21. The Java version is recorded in `.cloudmanager/java-version`.
* AEM as a Cloud Service SDK and a license from Adobe. The SDK API version used by the project is listed as `aem.sdk.api` in `pom.xml`.
* Internet access for the first build to download dependencies.

Maven downloads the Node.js and npm versions used by the frontend build.
The AEM SDK, license, local users and passwords are not included in this repository.

On Windows, use a short checkout path such as `C:\src\outwiththenest` because
some asset filenames are long. Enable long paths for Git:

```sh
git config --global core.longpaths true
```

Clone the repository with Git to keep the Dispatcher configuration links intact. These need to be symbolic links on Linux and in Cloud Manager.

## Run the site locally

1. Clone the repository.
2. Start a fresh AEM author instance on port `4502` and wait for it to finish starting.
3. From the project root, build and install the site:

   ```sh
   mvn clean install -PautoInstallSinglePackage
   ```

The default local credentials are `admin/admin`. If yours are different, override
`vault.user` and `vault.password` for package installation, and `sling.user` and
`sling.password` for bundle installation. Keep your passwords out of Git.

After installation, open:

* Homepage: `http://localhost:4502/content/outwiththenest/gb/en/home.html?wcmmode=disabled`
* Templates: `http://localhost:4502/libs/wcm/core/content/sites/templates.html/conf/outwiththenest`
* Assets: `http://localhost:4502/assets.html/content/dam/outwiththenest`

Check that the homepage images, header and footer appear correctly. Open the Parks and Walks page and check its breadcrumb too. The Templates screen should show five enabled templates.

You can also install `all/target/outwiththenest.all-1.0-SNAPSHOT.zip` through AEM
Package Manager after building. Use this package, not the repository source ZIP.
For deployment to AEM as a Cloud Service, use a Full Stack Pipeline in Adobe Cloud Manager.

## Save changes made in AEM

Changes made in AEM are not saved to Git automatically. Export them whenever you
change pages, assets, templates, policies or Experience Fragments.
These scripts need Windows PowerShell, `curl.exe`, `tar.exe` and `robocopy.exe`.
Keep the local author running and run this from the project root:

```powershell
./scripts/Export-AemContent.ps1
```

The script asks for your local AEM username and password. It saves the site's pages, templates, policies, header, footer and images back into the project. The exact content paths are listed in `scripts/Export-AemContent.ps1`; access-control rules are left out.

Before replacing the saved content, the script checks the exported XML and puts a copy of the old content in `.aem-backups/`. This folder stays on your computer and is not committed to Git. Running `mvn clean` does not remove it.

After the export succeeds, check the saved content and build the project:

```powershell
./scripts/Test-ContentSnapshot.ps1
mvn clean install
```

If either check fails, fix the problem before committing. Once both pass, review
the changed files:

```sh
git status
git diff
```

Add the files you want to save, then check them before committing and pushing:

```sh
git add <file-or-folder>
git diff --cached
git commit -m "Update site content and configuration"
git push
```

Replace `<file-or-folder>` with the paths you reviewed. If you only edit documentation,
you do not need to export content from AEM.

## Installing on an existing author

A fresh AEM author is the easiest way to check the saved site. If you use an existing author, export any changes you want to keep first. Installing the package can replace site pages and assets. Existing template and policy properties under `/conf` are kept because that path uses a merge filter.

The place map's postcode lookup calls `api.postcodes.io`, so it needs internet access.

The Maven build checks the packages and runs unit tests. Start AEM separately to view the site. Integration and UI tests have their own steps in [README.md](README.md#testing).
