from PIL import Image
import os

base_path = r'D:\SoftwareDEV\AlexaDeviceManager\chrome-extension'
input_path = os.path.join(base_path, 'transparent_icon.png')

print('Resizing transparent icons...')
with Image.open(input_path) as img:
    # Save the popup image
    img.resize((128, 128), Image.Resampling.LANCZOS).save(os.path.join(base_path, 'icon.png'))
    
    # Save the extension sizes
    sizes = [16, 32, 48, 128]
    for size in sizes:
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(os.path.join(base_path, f'icon{size}.png'))

print('Resizing complete.')
