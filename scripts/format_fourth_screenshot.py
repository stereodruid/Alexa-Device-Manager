from PIL import Image
import os

input_file = r'C:\Users\jangi\.gemini\antigravity\brain\a8c7292b-ec00-4981-bdf4-e18d832bba37\.user_uploaded\media_1788776870236.png'
out_path = r'D:\SoftwareDEV\AlexaDeviceManager\assets\store_screenshot_4.jpg'

with Image.open(input_file) as img:
    rgb_img = img.convert('RGB')
    
    bg_color = (23, 31, 41)
    new_img = Image.new('RGB', (1280, 800), bg_color)
    
    # Scale image to fit within 1200x720 (leaving a margin)
    target_max_w = 1240
    target_max_h = 760
    
    scale_w = target_max_w / rgb_img.width
    scale_h = target_max_h / rgb_img.height
    scale = min(scale_w, scale_h)
    
    target_w = int(rgb_img.width * scale)
    target_h = int(rgb_img.height * scale)
    
    resized = rgb_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    offset_x = (1280 - target_w) // 2
    offset_y = (800 - target_h) // 2
    new_img.paste(resized, (offset_x, offset_y))
    
    new_img.save(out_path, 'JPEG', quality=95)
    print("Created store_screenshot_4.jpg at exactly 1280x800.")
