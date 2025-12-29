
$ftpUrl = "ftp://ftp.eightytwenty.nl/"
$username = "u205202p195969"
$password = "Mosjes123!"

$request = [System.Net.WebRequest]::Create($ftpUrl)
$request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectoryDetails
$request.Credentials = New-Object System.Net.NetworkCredential($username, $password)

try {
    $response = $request.GetResponse()
    $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
    Write-Host $reader.ReadToEnd()
    $reader.Close()
    $response.Close()
} catch {
    Write-Host "Error: $_"
}
