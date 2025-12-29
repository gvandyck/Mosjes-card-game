
$ftpUrl = "ftp://eightytwenty.nl/domains/eightytwenty.nl/public_html/cardgame/v8/"
$username = "antiekes"
$password = "1k1ken1k"

function Upload-File($filePath, $targetUrl) {
    $webclient = New-Object System.Net.WebClient
    $webclient.Credentials = New-Object System.Net.NetworkCredential($username, $password)
    $uri = New-Object System.Uri($targetUrl)
    Write-Host "Uploading $filePath to $targetUrl..."
    try {
        $webclient.UploadFile($uri, $filePath)
        Write-Host "Success."
    } catch {
        Write-Host "Error uploading $filePath : $_"
    }
}

function Create-Directory($url) {
    $request = [System.Net.WebRequest]::Create($url)
    $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
    $request.Credentials = New-Object System.Net.NetworkCredential($username, $password)
    try {
        $response = $request.GetResponse()
        Write-Host "Created directory: $url"
    } catch {
        # Ignore if directory already exists
    }
}

# Ensure base directory exists
Create-Directory $ftpUrl

# Upload files

# Include all JS modules for deployment (from v5)
$files = @(
    "docs/v5/script.js",
    "docs/v5/advanced_logic.js",
    "docs/v5/index.html",
    "docs/v5/mosjes_local.html",
    "docs/v5/mosje_style.css",
    "docs/v5/style_v3.css",
    "docs/v5/style_animation.css"
)

# === BACKUP SECTION ===
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$backupDir = "backups/$timestamp"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
foreach ($file in $files) {
    $src = Join-Path "d:\Mosjes card game\Mosjes-card-game" $file
    $dst = Join-Path $backupDir ([System.IO.Path]::GetFileName($file))
    Copy-Item $src $dst -Force
}
# Backup Visuals
$backupVisualsDir = Join-Path $backupDir "Visuals"
New-Item -ItemType Directory -Force -Path $backupVisualsDir | Out-Null
$visualsDir = "d:\Mosjes card game\Mosjes-card-game\docs\v5\Visuals"
$visualFiles = Get-ChildItem $visualsDir
foreach ($file in $visualFiles) {
    Copy-Item $file.FullName (Join-Path $backupVisualsDir $file.Name) -Force
}
# === END BACKUP SECTION ===

foreach ($file in $files) {
    $localPath = Join-Path "d:\Mosjes card game\Mosjes-card-game" $file
    $fileName = Split-Path $file -Leaf
    $targetUrl = $ftpUrl + $fileName
    Upload-File $localPath $targetUrl
}

# === OPTIONAL: FTP BACKUP SECTION ===
# Upload backup folder to FTP (outside web root for safety)
$ftpBackupUrl = "ftp://eightytwenty.nl/domains/eightytwenty.nl/backups/cardgame/$timestamp/"
Create-Directory $ftpBackupUrl
foreach ($file in $files) {
    $localPath = Join-Path "d:\Mosjes card game\Mosjes-card-game" $file
    $fileName = Split-Path $file -Leaf
    $targetUrl = $ftpBackupUrl + $fileName
    Upload-File $localPath $targetUrl
}
# Upload Visuals backup
$ftpBackupVisualsUrl = $ftpBackupUrl + "Visuals/"
Create-Directory $ftpBackupVisualsUrl
foreach ($file in $visualFiles) {
    $localPath = $file.FullName
    $targetUrl = $ftpBackupVisualsUrl + $file.Name
    Upload-File $localPath $targetUrl
}

# Upload Visuals
$visualsUrl = $ftpUrl + "Visuals/"
Create-Directory $visualsUrl
$visualsDir = "d:\Mosjes card game\Mosjes-card-game\docs\v5\Visuals"
$visualFiles = Get-ChildItem $visualsDir
foreach ($file in $visualFiles) {
    $localPath = $file.FullName
    $targetUrl = $visualsUrl + $file.Name
    Upload-File $localPath $targetUrl
}

Write-Host "Deployment complete!"
