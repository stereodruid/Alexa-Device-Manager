from PIL import Image
import os

base_path = r'D:\SoftwareDEV\AlexaDeviceManager\assets'

def make_store_screenshot(input_name, output_name):
    in_path = os.path.join(base_path, input_name)
    out_path = os.path.join(base_path, output_name)
    
    with Image.open(in_path) as img:
        # Create a new 1280x800 image with a dark background matching the UI
        bg_color = (23, 31, 41) # Dark blue/grey from the popup UI
        new_img = Image.new('RGB', (1280, 800), bg_color)
        
        # Calculate aspect ratio
        img_ratio = img.width / img.height
        target_ratio = 1280 / 800
        
        if img_ratio > target_ratio:
            # Image is wider, fit width
            new_w = 1200 # Leave some margin
            new_h = int(new_w / img_ratio)
        else:
            # Image is taller, fit height
            new_h = 720 # Leave some margin
            new_w = int(new_h * img_ratio)
            
        resized_img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Paste into center
        offset_x = (1280 - new_w) // 2
        offset_y = (800 - new_h) // 2
        new_img.paste(resized_img, (offset_x, offset_y))
        
        new_img.save(out_path, 'PNG')
        print(f"Created {output_name} at 1280x800")

make_store_screenshot('preview_main.png', 'store_screenshot_1.png')
make_store_screenshot('preview_popup.png', 'store_screenshot_2.png')
