import os
from PIL import Image, ImageDraw

def main():
    # 1. Create a 1200x630 canvas with a clean white background
    width, height = 1200, 630
    og_img = Image.new("RGBA", (width, height), (255, 255, 255, 255))
    
    # 2. Open LongLogo.png
    logo_path = "LongLogo.png"
    if not os.path.exists(logo_path):
        logo_path = "public/LongLogo.png"
        
    print(f"Loading logo from: {logo_path}")
    logo = Image.open(logo_path)
    
    # Calculate dimensions to fit nicely inside 1200x630 with generous padding
    # Let's say we want the logo to be 850px wide
    target_width = 850
    w_percent = target_width / float(logo.size[0])
    target_height = int(float(logo.size[1]) * float(w_percent))
    
    print(f"Resizing logo from {logo.size} to {(target_width, target_height)}")
    logo_resized = logo.resize((target_width, target_height), Image.Resampling.LANCZOS)
    
    # Center the logo on the canvas
    x_offset = (width - target_width) // 2
    y_offset = (height - target_height) // 2
    
    # Paste logo (it's RGB or RGBA, if RGB we just paste without mask)
    if logo_resized.mode == "RGBA":
        og_img.paste(logo_resized, (x_offset, y_offset), logo_resized)
    else:
        og_img.paste(logo_resized, (x_offset, y_offset))
        
    # Save the optimized image
    output_path = "public/og-image.png"
    og_img_rgb = og_img.convert("RGB") # Convert to RGB for standard social previews
    og_img_rgb.save(output_path, "PNG", optimize=True, quality=85)
    print(f"Successfully generated optimized OG image at {output_path}. Size: {os.path.getsize(output_path)} bytes")

if __name__ == "__main__":
    main()
