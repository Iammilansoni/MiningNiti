import os
import re

directory = r"m:\Projects\MiningNiti\frontend\src"

replacements = [
    (r"text-\[#947AFC\]", "text-purple-400"),
    (r"bg-\[#947AFC\]/10", "bg-purple-400/10"),
    (r"border-\[#947AFC\]/20", "border-purple-400/20"),
    (r"hover:bg-\[#947AFC\]", "hover:bg-purple-400"),
    (r"group-hover:text-\[#947AFC\]", "group-hover:text-purple-400"),
    (r"from-\[#947AFC\]/20", "from-purple-400/20"),
    (r"bg-\[#947AFC\]", "bg-purple-400"),
    
    (r"border-white/\[0\.08\]", "border-white/8"),
    (r"bg-white/\[0\.02\]", "bg-white/2"),
    (r"bg-white/\[0\.04\]", "bg-white/4"),
    (r"hover:bg-white/\[0\.04\]", "hover:bg-white/4"),
    (r"hover:bg-white/\[0\.03\]", "hover:bg-white/3"),
    (r"border-white/\[0\.04\]", "border-white/4"),
    (r"border-white/\[0\.06\]", "border-white/6"),
    (r"border-white/\[0\.02\]", "border-white/2"),
    
    (r"bg-gradient-to-tr", "bg-linear-to-tr"),
    (r"bg-gradient-to-br", "bg-linear-to-br"),
    (r"bg-gradient-to-t", "bg-linear-to-t"),
    
    (r"\bflex-shrink-0\b", "shrink-0"),
    (r"\bflex-grow\b", "grow"),
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
        
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

print("Done fixing Tailwind classes!")
