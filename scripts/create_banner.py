from PIL import Image

input_path = r'C:\Users\jangi\.gemini\antigravity\brain\a8c7292b-ec00-4981-bdf4-e18d832bba37\chrome_store_banner_1788776051056.jpg'
output_path = r'D:\SoftwareDEV\AlexaDeviceManager\assets\chrome_store_promo_440x280.png'

print('Creating perfectly sized promo banner...')
with Image.open(input_path) as img:
    # Target size
    target_w, target_h = 440, 280
    
    # Calculate crop box to center the image and match aspect ratio
    img_ratio = img.width / img.height
    target_ratio = target_w / target_h
    
    if img_ratio > target_ratio:
        # Image is wider than needed, crop width
        new_w = int(img.height * target_ratio)
        offset = (img.width - new_w) // 2
        img = img.crop((offset, 0, offset + new_w, img.height))
    else:
        # Image is taller than needed, crop height
        new_h = int(img.width / target_ratio)
        offset = (img.height - new_h) // 2
        img = img.crop((0, offset, img.width, offset + new_h))
        
    # Resize to exact target dimensions
    resized = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    resized.save(output_path, 'PNG')
    print('Saved to', output_path)
