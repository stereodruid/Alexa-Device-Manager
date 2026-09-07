from PIL import Image
import os

base_path = r'D:\SoftwareDEV\AlexaDeviceManager\assets'

def convert_to_no_alpha_jpeg(filename, target_size=None):
    in_path = os.path.join(base_path, filename)
    out_path = os.path.join(base_path, filename.replace('.png', '.jpg'))
    
    with Image.open(in_path) as img:
        # Convert to RGB (strips alpha channel)
        rgb_img = img.convert('RGB')
        
        if target_size:
            # Crop to fit target size exactly
            target_w, target_h = target_size
            img_ratio = rgb_img.width / rgb_img.height
            target_ratio = target_w / target_h
            
            if img_ratio > target_ratio:
                # Image is wider, crop width
                new_w = int(rgb_img.height * target_ratio)
                offset = (rgb_img.width - new_w) // 2
                rgb_img = rgb_img.crop((offset, 0, offset + new_w, rgb_img.height))
            else:
                # Image is taller, crop height
                new_h = int(rgb_img.width / target_ratio)
                offset = (rgb_img.height - new_h) // 2
                rgb_img = rgb_img.crop((0, offset, rgb_img.width, offset + new_h))
                
            rgb_img = rgb_img.resize(target_size, Image.Resampling.LANCZOS)
            
        rgb_img.save(out_path, 'JPEG', quality=95)
        print(f"Saved {out_path} without alpha channel.")
        
        # Remove the old PNG version to avoid confusion
        if in_path.endswith('.png') and os.path.exists(in_path):
            os.remove(in_path)

# 1. Fix screenshots (already 1280x800, just strip alpha)
convert_to_no_alpha_jpeg('store_screenshot_1.png')
convert_to_no_alpha_jpeg('store_screenshot_2.png')

# 2. Fix small marquee (already 440x280, just strip alpha)
convert_to_no_alpha_jpeg('chrome_store_promo_440x280.png')

