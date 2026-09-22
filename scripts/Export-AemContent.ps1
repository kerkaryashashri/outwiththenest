param(
    [string]$AemUrl = 'http://localhost:4502',
    [PSCredential]$Credential = (Get-Credential -Message 'Local AEM author credentials')
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$workspace = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$work = Join-Path $workspace ".aem-backups/$stamp"
$source = Join-Path $workspace 'ui.content/src/main/content/jcr_root'
New-Item -ItemType Directory -Force $work | Out-Null
$roots = @('conf/outwiththenest', 'content/outwiththenest', 'content/experience-fragments/outwiththenest', 'content/dam/outwiththenest')
$roots += @(
    'content/dam/wknd-shared/en/magazine/western-australia/adobe-waadobe-wa-mg-3094.jpg',
    'content/dam/wknd-shared/en/magazine/alaska-adventure/camp-alaska.jpg'
)
$auth = $Credential.UserName + ':' + $Credential.GetNetworkCredential().Password
function Invoke-CurlJson([string[]]$Arguments) {
    $result = & curl.exe --silent --show-error --fail --max-time 600 --user $auth @Arguments
    if ($LASTEXITCODE -ne 0) { throw 'AEM package request failed.' }
    $json = ($result -join "`n") | ConvertFrom-Json
    if (-not $json.success) { throw "AEM package operation failed: $($json.msg)" }
    return $json
}
# Fail before changing source if the author is missing any required subtree.
foreach ($root in $roots) {
    $result = & curl.exe --silent --show-error --fail --max-time 30 --user $auth "$AemUrl/$root.json"
    if ($LASTEXITCODE -ne 0 -or -not (($result -join '') | ConvertFrom-Json).'jcr:primaryType') {
        throw "Required AEM subtree missing: /$root"
    }
}
$seed = Join-Path $work 'seed'
New-Item -ItemType Directory -Force (Join-Path $seed 'META-INF/vault') | Out-Null
New-Item -ItemType Directory -Force (Join-Path $seed 'jcr_root') | Out-Null
[IO.File]::WriteAllText((Join-Path $seed 'jcr_root/.content.xml'), '<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" jcr:primaryType="rep:root"/>')
$filters = ($roots | ForEach-Object { '<filter root="/' + $_ + '"><exclude pattern="/' + $_ + '/(.*/)?rep:policy(/.*)?"/></filter>' }) -join "`n"
[IO.File]::WriteAllText((Join-Path $seed 'META-INF/vault/filter.xml'), "<workspaceFilter version=`"1.0`">$filters</workspaceFilter>")
$properties = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd"><properties><entry key="group">com.outwiththenest</entry><entry key="name">source-export</entry><entry key="version">' + $stamp + '</entry><entry key="packageType">content</entry><entry key="acHandling">ignore</entry></properties>'
[IO.File]::WriteAllText((Join-Path $seed 'META-INF/vault/properties.xml'), $properties)
$seedZip = Join-Path $work 'seed.zip'
$archive = [IO.Compression.ZipFile]::Open($seedZip, [IO.Compression.ZipArchiveMode]::Create)
try {
    Get-ChildItem $seed -Recurse -File -Force | ForEach-Object {
        $name = $_.FullName.Substring($seed.Length + 1).Replace('\', '/')
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $name) | Out-Null
    }
} finally { $archive.Dispose() }
$uploaded = Invoke-CurlJson @('--form', "package=@$seedZip", "$AemUrl/crx/packmgr/service/.json/?cmd=upload")
$null = Invoke-CurlJson @('--request', 'POST', "$AemUrl/crx/packmgr/service/.json$($uploaded.path)?cmd=build")
$snapshot = Join-Path $work 'snapshot.zip'
& curl.exe --silent --show-error --fail --max-time 600 --user $auth --output $snapshot "$AemUrl$($uploaded.path)"
if ($LASTEXITCODE -ne 0) { throw 'Snapshot download failed.' }
$extracted = Join-Path $work 'extracted'
New-Item -ItemType Directory -Force $extracted | Out-Null
# Windows tar supports long DAM rendition paths that .NET Framework extraction rejects.
& tar.exe -xf $snapshot -C $extracted
if ($LASTEXITCODE -ne 0) { throw 'Snapshot extraction failed.' }
foreach ($root in $roots) {
    $exported = Join-Path $extracted "jcr_root/$root"
    if (-not (Test-Path -LiteralPath (Join-Path $exported '.content.xml'))) { throw "Incomplete export: $root" }
}
# Validate every XML document before replacing any source subtree.
Get-ChildItem (Join-Path $extracted 'jcr_root') -Recurse -File -Force -Filter '*.xml' | ForEach-Object {
    $null = [xml](Get-Content -LiteralPath $_.FullName -Raw)
}
foreach ($root in $roots) {
    $destination = [IO.Path]::GetFullPath((Join-Path $source $root))
    $backup = [IO.Path]::GetFullPath((Join-Path $work "previous-source/$root"))
    if (-not $destination.StartsWith($source + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase) -or
        -not $backup.StartsWith($work + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Refusing a move outside the intended source and backup directories.'
    }
    New-Item -ItemType Directory -Force (Split-Path $backup), (Split-Path $destination) | Out-Null
    if (Test-Path -LiteralPath $destination) { Move-Item -LiteralPath $destination -Destination $backup }
    Copy-Item -LiteralPath (Join-Path $extracted "jcr_root/$root") -Destination $destination -Recurse
    Write-Output "Exported /$root"
}
$files = Get-ChildItem $source -Recurse -File -Force
Write-Output "Export complete: $($files.Count) source files. Previous source and snapshot: $work"
Write-Output 'Run the full Maven build and review the Git diff before committing.'
