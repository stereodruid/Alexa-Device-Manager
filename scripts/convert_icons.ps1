Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("D:\SoftwareDEV\AlexaDeviceManager\chrome-extension\icon.jpg")

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
$img.Dispose()
