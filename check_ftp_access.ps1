
$ftpUrl = "ftp://eightytwenty.nl/domains/eightytwenty.nl/public_html/cardgame/"
$username = "u205202p195969"
$password = "Mosjes123!"

Write-Host "Attempting to connect to $ftpUrl with user $username..."

try {
    $request = [System.Net.WebRequest]::Create($ftpUrl)
    $request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $request.Credentials = New-Object System.Net.NetworkCredential($username, $password)
    
    # Set KeepAlive to false to avoid lingering connections
    $request.KeepAlive = $false
    $request.UsePassive = $true

    $response = $request.GetResponse()
    $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
    $listing = $reader.ReadToEnd()
    
    Write-Host "Connection Successful!"
    Write-Host "Directory Listing:"
    Write-Host $listing
    
    $reader.Close()
    $response.Close()
} catch {
    Write-Host "Connection Failed."
    Write-Host "Error: $_"
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
        Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    }
}
