from PIL import Image
import os

input_file = r'C:\Users\jangi\.gemini\antigravity\brain\a8c7292b-ec00-4981-bdf4-e18d832bba37\.user_uploaded\media_1788776690199.png'
out_path = r'D:\SoftwareDEV\AlexaDeviceManager\assets\store_screenshot_3.jpg'

with Image.open(input_file) as img:
    # Convert to RGB to strip alpha
    rgb_img = img.convert('RGB')
    
    # Create 1280x800 dark background
    bg_color = (23, 31, 41)
    new_img = Image.new('RGB', (1280, 800), bg_color)
    
    # Scale image up nicely, but keep it centered
    # Let's make it fill about 80% of the height for a nice presentation
    target_h = 640
    scale = target_h / rgb_img.height
    target_w = int(rgb_img.width * scale)
    
    resized = rgb_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Center it
    offset_x = (1280 - target_w) // 2
    offset_y = (800 - target_h) // 2
    new_img.paste(resized, (offset_x, offset_y))
    
    new_img.save(out_path, 'JPEG', quality=95)
    print("Created store_screenshot_3.jpg at exactly 1280x800.")
