
$ftpUrl = "ftp://eightytwenty.nl/domains/eightytwenty.nl/public_html/cardgame/"
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
        if ($_.Exception.Response) {
            Write-Host "Status: $($_.Exception.Response.StatusCode)"
        }
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

# Ensure base directory exists (it should, but good practice)
Create-Directory $ftpUrl

# Upload files
$files = @(
    "docs\script.js",
    "docs\advanced_logic.js",
    "docs\index.html",
    "docs\mosjes_local.html",
    "docs\style_v3.css",
    "docs\mosjes_card_database.txt",
    "docs\mosjes_implementation_brief.txt",
    "docs\mosjes_starter_decks.txt",
    "docs\README_RUN.txt"
)

# Upload Visuals folder content if needed, but let's start with core files
# Create Visuals directory
$visualsUrl = $ftpUrl + "Visuals/"
Create-Directory $visualsUrl

# Upload Visuals files
$visualFiles = Get-ChildItem "docs\Visuals"
foreach ($vFile in $visualFiles) {
    $localPath = $vFile.FullName
    $fileName = $vFile.Name
    $targetUrl = $visualsUrl + $fileName
    Upload-File $localPath $targetUrl
}

foreach ($file in $files) {
    $localPath = Join-Path "d:\Mosjes card game\Mosjes-card-game" $file
    $fileName = Split-Path $file -Leaf
    $targetUrl = $ftpUrl + $fileName
    Upload-File $localPath $targetUrl
}

Write-Host "Deployment to Main complete!"
