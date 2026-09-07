Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\jangi\.gemini\antigravity\brain\a8c7292b-ec00-4981-bdf4-e18d832bba37\alexa_icon_dark_1788773830360.jpg")

$sizes = @(16, 32, 48, 128)
foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.DrawImage($img, 0, 0, $size, $size)
    $path = "D:\SoftwareDEV\AlexaDeviceManager\chrome-extension\icon$size.png"
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $graph.Dispose()
    $bmp.Dispose()
}

$bmp128 = New-Object System.Drawing.Bitmap(128, 128)
$graph128 = [System.Drawing.Graphics]::FromImage($bmp128)
$graph128.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graph128.DrawImage($img, 0, 0, 128, 128)
$bmp128.Save("D:\SoftwareDEV\AlexaDeviceManager\chrome-extension\icon.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$graph128.Dispose()
$bmp128.Dispose()

$img.Dispose()
