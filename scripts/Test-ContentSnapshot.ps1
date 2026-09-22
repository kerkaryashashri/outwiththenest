$ErrorActionPreference = 'Stop'
$root = Join-Path $PSScriptRoot '../ui.content/src/main/content/jcr_root'
$referenceNames = @('fileReference', 'featuredImage', 'logo', 'cq:template', 'cq:conf', 'sling:configRef', 'fragmentVariationPath')
$missing = [Collections.Generic.HashSet[string]]::new()
$count = 0
Get-ChildItem $root -Recurse -Force -File -Filter '.content.xml' | ForEach-Object {
    $snapshotXml = [xml](Get-Content -LiteralPath $_.FullName -Raw)
    foreach ($node in $snapshotXml.SelectNodes('//*')) {
        foreach ($attribute in $node.Attributes) {
            if ($attribute.Name -in $referenceNames -and $attribute.Value -match '^/(content|conf)/') {
                $path = $attribute.Value
                if (-not (Test-Path -LiteralPath (Join-Path $root ($path.TrimStart('/'))))) {
                    $null = $missing.Add($path)
                }
                $count++
            }
        }
    }
}
foreach ($asset in Get-ChildItem (Join-Path $root 'content/dam/outwiththenest') -Directory) {
    if (-not (Test-Path -LiteralPath (Join-Path $asset.FullName '.content.xml'))) { continue }
    $snapshotXml = [xml](Get-Content -LiteralPath (Join-Path $asset.FullName '.content.xml') -Raw)
    if ($snapshotXml.DocumentElement.GetAttribute('primaryType', 'http://www.jcp.org/jcr/1.0') -eq 'dam:Asset') {
        $original = Join-Path $asset.FullName '_jcr_content/renditions/original'
        if (-not (Test-Path -LiteralPath $original) -or (Get-Item -LiteralPath $original).Length -eq 0) {
            $null = $missing.Add("Missing asset binary: $($asset.Name)")
        }
    }
}
if ($missing.Count) { throw ("Snapshot has missing dependencies:`n" + ($missing -join "`n")) }
Write-Output "Content snapshot check passed: $count content/configuration/asset references resolved."
