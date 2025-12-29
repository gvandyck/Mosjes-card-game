
$ftpUrl = "ftp://eightytwenty.nl/domains/eightytwenty.nl/public_html/cardgame/v4/"
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
$files = @(
    "docs\script.js",
    "docs\advanced_logic.js",
    "docs\index.html",
    "docs\mosjes_local.html",
    "docs\style_v3.css",
    "docs\style_animation.css",
    "docs\mosje_style.css"
)

foreach ($file in $files) {
    $localPath = Join-Path "d:\Mosjes card game\Mosjes-card-game" $file
    $fileName = Split-Path $file -Leaf
    $targetUrl = $ftpUrl + $fileName
    Upload-File $localPath $targetUrl
}

# Upload Visuals
$visualsUrl = $ftpUrl + "Visuals/"
Create-Directory $visualsUrl

$visualsDir = "d:\Mosjes card game\Mosjes-card-game\docs\Visuals"
$visualFiles = Get-ChildItem $visualsDir

foreach ($file in $visualFiles) {
    $localPath = $file.FullName
    $targetUrl = $visualsUrl + $file.Name
    Upload-File $localPath $targetUrl
}

Write-Host "Deployment complete!"
