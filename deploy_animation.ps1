$ftpUrl = "ftp://eightytwenty.nl/domains/eightytwenty.nl/public_html/cardgame/animation/"
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

# Ensure base directory exists
Create-Directory $ftpUrl

# Upload files
$files = @(
    "docs\script.js",
    "docs\advanced_logic.js",
    "docs\index_animation.html",
    "docs\mosjes_local.html",
    "docs\style_animation.css",
    "docs\style_v3.css",
    "docs\mosjes_card_database.txt",
    "docs\mosjes_implementation_brief.txt",
    "docs\mosjes_starter_decks.txt",
    "docs\README_RUN.txt",
    "docs\mosje_style.css"
)

# ... (rest of script)

foreach ($file in $files) {
    $localPath = Join-Path "d:\Mosjes card game\Mosjes-card-game" $file
    $fileName = Split-Path $file -Leaf
    
    # Rename index_animation.html to index.html on upload
    if ($fileName -eq "index_animation.html") {
        $targetUrl = $ftpUrl + "index.html"
    } else {
        $targetUrl = $ftpUrl + $fileName
    }
    
    Upload-File $localPath $targetUrl
}

# Upload Visuals
$visualsUrl = $ftpUrl + "Visuals/"
Create-Directory $visualsUrl
$visuals = @(
    "docs\Visuals\dj.png",
    "docs\Visuals\azn-cless-the-wildcard.jpg",
    "docs\Visuals\coert-hawaiian-tech-savant.jpg",
    "docs\Visuals\binti-the-sharp-tongue.jpg"
)
foreach ($v in $visuals) {
    $localPath = Join-Path "d:\Mosjes card game\Mosjes-card-game" $v
    $fileName = Split-Path $v -Leaf
    $targetUrl = $visualsUrl + $fileName
    Upload-File $localPath $targetUrl
}

Write-Host "Deployment to Animation branch complete!"