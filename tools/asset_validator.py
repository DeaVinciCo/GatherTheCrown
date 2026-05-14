#!/usr/bin/env python3
"""
Asset Validator Tool
Validates game assets against design specifications
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Tuple

class AssetValidator:
    """Validates game assets for GTC:CF"""
    
    def __init__(self, assets_dir: str = "assets"):
        self.assets_dir = Path(assets_dir)
        self.errors = []
        self.warnings = []
        
    def validate_all(self) -> Tuple[List[str], List[str]]:
        """Run all validation checks"""
        print("🔍 Starting asset validation...\n")
        
        self.check_directory_structure()
        self.check_sprite_dimensions()
        self.check_audio_formats()
        self.check_naming_conventions()
        
        return self.errors, self.warnings
    
    def check_directory_structure(self):
        """Verify required directories exist"""
        print("📁 Checking directory structure...")
        
        required_dirs = [
            "characters/riders",
            "characters/npcs",
            "characters/portraits",
            "creats/fire",
            "creats/water",
            "creats/earth",
            "creats/storm",
            "creats/light",
            "creats/shadow",
            "creats/arcane",
            "enemies/common",
            "enemies/bosses",
            "tilesets/greenwood",
            "tilesets/tideborn",
            "tilesets/highlands",
            "tilesets/sky_isles",
            "tilesets/scribes",
            "tilesets/shadowfolk",
            "tilesets/infernal",
            "ui/icons",
            "ui/panels",
            "ui/buttons",
            "weapons",
            "items",
            "fx/particles",
            "audio/music",
            "audio/sfx",
            "audio/ambience",
            "fonts"
        ]
        
        for dir_path in required_dirs:
            full_path = self.assets_dir / dir_path
            if not full_path.exists():
                self.warnings.append(f"Missing directory: {dir_path}")
            else:
                print(f"  ✓ {dir_path}")
        
        print()
    
    def check_sprite_dimensions(self):
        """Check sprite files for correct dimensions"""
        print("🖼️  Checking sprite dimensions...")
        
        sprite_specs = {
            "tilesets": [(64, 64), (128, 128)],
            "characters": [(96, 96), (128, 128)],
            "creats": [(64, 64), (96, 96), (128, 128), (192, 192)],
            "enemies/bosses": [(256, 256), (512, 512)],
            "ui/icons": [(24, 24), (32, 32), (64, 64)]
        }
        
        try:
            from PIL import Image
            
            for category, valid_sizes in sprite_specs.items():
                category_path = self.assets_dir / category
                if not category_path.exists():
                    continue
                
                for img_file in category_path.rglob("*.png"):
                    try:
                        with Image.open(img_file) as img:
                            if img.size not in valid_sizes:
                                self.warnings.append(
                                    f"{img_file.name}: {img.size} not in valid sizes {valid_sizes}"
                                )
                    except Exception as e:
                        self.errors.append(f"Cannot read {img_file.name}: {e}")
            
            print("  ✓ Sprite dimension check complete")
        except ImportError:
            self.warnings.append("PIL not installed - skipping image dimension checks")
            print("  ⚠ PIL not available, skipping dimension checks")
        
        print()
    
    def check_audio_formats(self):
        """Verify audio files are in correct format"""
        print("🔊 Checking audio formats...")
        
        audio_specs = {
            "music": [".ogg"],
            "sfx": [".ogg", ".wav"],
            "ambience": [".ogg"]
        }
        
        for category, valid_formats in audio_specs.items():
            category_path = self.assets_dir / "audio" / category
            if not category_path.exists():
                continue
            
            for audio_file in category_path.rglob("*"):
                if audio_file.is_file():
                    if audio_file.suffix.lower() not in valid_formats:
                        self.warnings.append(
                            f"{audio_file.name}: format {audio_file.suffix} not in {valid_formats}"
                        )
        
        print("  ✓ Audio format check complete")
        print()
    
    def check_naming_conventions(self):
        """Check file naming follows conventions"""
        print("📝 Checking naming conventions...")
        
        # Files should be lowercase with underscores
        for file_path in self.assets_dir.rglob("*"):
            if file_path.is_file():
                name = file_path.stem
                if not name.islower() or " " in name:
                    self.warnings.append(
                        f"{file_path.name}: should be lowercase with underscores"
                    )
        
        print("  ✓ Naming convention check complete")
        print()
    
    def generate_report(self):
        """Generate validation report"""
        print("\n" + "="*60)
        print("VALIDATION REPORT")
        print("="*60)
        
        if not self.errors and not self.warnings:
            print("✅ All checks passed!")
        else:
            if self.errors:
                print(f"\n❌ ERRORS ({len(self.errors)}):")
                for error in self.errors:
                    print(f"  • {error}")
            
            if self.warnings:
                print(f"\n⚠️  WARNINGS ({len(self.warnings)}):")
                for warning in self.warnings:
                    print(f"  • {warning}")
        
        print("\n" + "="*60)


def main():
    """Run asset validation"""
    validator = AssetValidator()
    validator.validate_all()
    validator.generate_report()


if __name__ == "__main__":
    main()
