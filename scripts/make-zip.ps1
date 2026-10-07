$dest = "C:\Users\user\Documents\anacake-projeto.zip"
if (Test-Path $dest) { Remove-Item $dest -Force }

$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ([System.Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $tempDir | Out-Null

$exclude = @('node_modules', '.next', '.git', '.vercel', 'anacake-projeto.zip', 'anacake.zip')

Get-ChildItem -Path . -Force | Where-Object { 
    $_.Name -notin $exclude
} | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $tempDir -Recurse -Force
}

Compress-Archive -Path (Join-Path $tempDir "*") -DestinationPath $dest -Force
Remove-Item -Path $tempDir -Recurse -Force

Get-Item $dest | Select-Object Name, Length, LastWriteTime | Format-List
