$skills = @('john-mcmahon', 'neil-rackham', 'keenan', 'dale-carnegie', 'joe-girard')
foreach ($s in $skills) {
    $src = "C:\Users\itzzz\.hermes\skills\experts\$s"
    $d1 = "$env:LOCALAPPDATA\hermes\skills\experts\$s"
    $d2 = "C:\Users\itzzz\.hermes\skills\$s"
    $d3 = "$env:LOCALAPPDATA\hermes\skills\$s"
    Copy-Item -Path $src -Destination $d1 -Recurse -Force
    Copy-Item -Path $src -Destination $d2 -Recurse -Force
    Copy-Item -Path $src -Destination $d3 -Recurse -Force
}
Copy-Item -Path "C:\Users\itzzz\.hermes\skills\experts\REGISTRY.md" -Destination "$env:LOCALAPPDATA\hermes\skills\experts\REGISTRY.md" -Force
Write-Output "ALL 5 NEW EXPERTS AND REGISTRY MIRRORED SUCCESSFULLY"
