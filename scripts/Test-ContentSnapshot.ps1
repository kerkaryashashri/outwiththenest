$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../ui.content/src/main/content/jcr_root'))
if ($env:OS -eq 'Windows_NT') { $root = '\\?\' + $root }
$referenceNames = @('fileReference', 'featuredImage', 'logo', 'cq:template', 'cq:conf', 'sling:configRef', 'fragmentVariationPath')
$missing = [Collections.Generic.HashSet[string]]::new()
$count = 0
Get-ChildItem -LiteralPath $root -Recurse -Force -File -Filter '.content.xml' | ForEach-Object {
    $snapshotXml = [xml][IO.File]::ReadAllText($_.FullName)
    foreach ($node in $snapshotXml.SelectNodes('//*')) {
        foreach ($attribute in $node.Attributes) {
            if ($attribute.Name -in $referenceNames -and $attribute.Value -match '^/(content|conf)/') {
                $path = $attribute.Value
                if (-not (Test-Path -LiteralPath ([IO.Path]::Combine($root, $path.TrimStart('/'))))) {
                    $null = $missing.Add($path)
                }
                $count++
            }
        }
    }
}
foreach ($asset in Get-ChildItem -LiteralPath ([IO.Path]::Combine($root, 'content/dam')) -Recurse -Directory) {
    if (-not (Test-Path -LiteralPath ([IO.Path]::Combine($asset.FullName, '.content.xml')))) { continue }
    $snapshotXml = [xml][IO.File]::ReadAllText(([IO.Path]::Combine($asset.FullName, '.content.xml')))
    if ($snapshotXml.DocumentElement.GetAttribute('primaryType', 'http://www.jcp.org/jcr/1.0') -eq 'dam:Asset') {
        $original = [IO.Path]::Combine($asset.FullName, '_jcr_content/renditions/original')
        if (-not (Test-Path -LiteralPath $original) -or (Get-Item -LiteralPath $original).Length -eq 0) {
            $null = $missing.Add("Missing asset binary: $($asset.Name)")
        }
    }
}
if ($missing.Count) { throw ("Snapshot has missing dependencies:`n" + ($missing -join "`n")) }
Write-Output "Content snapshot check passed: $count content/configuration/asset references resolved."
