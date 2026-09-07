from PIL import Image
import os

input_path = r'C:\Users\jangi\.gemini\antigravity\brain\a8c7292b-ec00-4981-bdf4-e18d832bba37\large_promo_banner_1788776622370.jpg'
output_path = r'D:\SoftwareDEV\AlexaDeviceManager\assets\chrome_store_promo_1400x560.jpg'

with Image.open(input_path) as img:
    rgb_img = img.convert('RGB')
    
    target_w, target_h = 1400, 560
    img_ratio = rgb_img.width / rgb_img.height
    target_ratio = target_w / target_h
    
    if img_ratio > target_ratio:
        new_w = int(rgb_img.height * target_ratio)
        offset = (rgb_img.width - new_w) // 2
        rgb_img = rgb_img.crop((offset, 0, offset + new_w, rgb_img.height))
    else:
        new_h = int(rgb_img.width / target_ratio)
        offset = (rgb_img.height - new_h) // 2
        rgb_img = rgb_img.crop((0, offset, rgb_img.width, offset + new_h))
        
    rgb_img = rgb_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    rgb_img.save(output_path, 'JPEG', quality=95)
    print(f"Saved {output_path} without alpha channel.")
