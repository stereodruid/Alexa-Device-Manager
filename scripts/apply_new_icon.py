from PIL import Image, ImageDraw
import os

input_path = r'C:\Users\jangi\.gemini\antigravity\brain\a8c7292b-ec00-4981-bdf4-e18d832bba37\new_store_icon_1788776558700.jpg'
out_dir = r'D:\SoftwareDEV\AlexaDeviceManager\chrome-extension'

# Load the image
img = Image.open(input_path).convert('RGBA')

# The generated image has some margins. Let's crop it to the center square shape.
# Let's say we crop 5% from all sides to remove the outer dark blur.
crop_margin = int(img.width * 0.05)
cropped = img.crop((crop_margin, crop_margin, img.width - crop_margin, img.height - crop_margin))

# Create a rounded corner mask
def create_rounded_mask(size, radius):
    mask = Image.new('L', size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask

# Apply the mask
mask = create_rounded_mask(cropped.size, radius=int(cropped.width * 0.2))
cropped.putalpha(mask)

# Save different sizes
sizes = [16, 32, 48, 128]
for size in sizes:
    resized = cropped.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(os.path.join(out_dir, f'icon{size}.png'), 'PNG')

# Also save a generic one for popup
cropped.resize((128, 128), Image.Resampling.LANCZOS).save(os.path.join(out_dir, 'icon.png'), 'PNG')
print('New icons generated successfully.')
