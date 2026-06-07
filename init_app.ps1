$env:PATH = "c:\Users\Sakshi102\Downloads\PORTFOLIO\.node;" + $env:PATH
Write-Host "Initializing Next.js app using create-next-app..."

npx create-next-app@latest temp-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes

if (Test-Path temp-app) {
    Write-Host "Moving files from temp-app to workspace root..."
    Get-ChildItem -Path temp-app -Force | ForEach-Object {
        $dest = Join-Path "c:\Users\Sakshi102\Downloads\PORTFOLIO" $_.Name
        if (-not (Test-Path $dest)) {
            Move-Item -Path $_.FullName -Destination $dest -Force
        } else {
            Write-Host "Skipped moving $_.Name because it already exists at the destination."
        }
    }
    Write-Host "Removing temp-app folder..."
    Remove-Item -Path temp-app -Recurse -Force
    Write-Host "Next.js initialization successful!"
} else {
    Write-Host "Failed to create Next.js app!"
}
