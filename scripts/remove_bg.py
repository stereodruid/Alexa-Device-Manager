from rembg import remove
from PIL import Image

input_path = r'C:\Users\jangi\.gemini\antigravity\brain\a8c7292b-ec00-4981-bdf4-e18d832bba37\alexa_speaker_isolated_1788773928372.jpg'
output_path = r'D:\SoftwareDEV\AlexaDeviceManager\chrome-extension\transparent_icon.png'

print('Removing background...')
with open(input_path, 'rb') as i:
    input_data = i.read()
    output_data = remove(input_data)
    with open(output_path, 'wb') as o:
        o.write(output_data)
print('Background removed.')
