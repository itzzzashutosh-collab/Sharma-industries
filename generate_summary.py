import os

# Jin folders aur files ko ignore karna hai (taaki file ka size chota rahe)
IGNORE_DIRS = {'node_modules', '.git', '.next', 'public', '__pycache__'}
IGNORE_EXTS = {'.png', '.jpg', '.jpeg', '.svg', '.ico', '.pdf', '.zip', '.exe'}
OUTPUT_FILE = 'codebase_summary.md'

def generate_summary():
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("# Sharma Industries - Codebase Summary\n\n")
        
        for root, dirs, files in os.walk('.'):
            # Faltu folders ko filter out karna
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                # Ignore list wali files aur khud is script ko skip karna
                if ext in IGNORE_EXTS or file == OUTPUT_FILE or file == 'generate_summary.py':
                    continue
                
                filepath = os.path.join(root, file)
                # Formatter ke liye extension nikalna
                lang = ext.replace('.', '') if ext else 'text'
                if lang == 'tsx' or lang == 'ts': lang = 'typescript'
                if lang == 'jsx' or lang == 'js': lang = 'javascript'
                
                try:
                    with open(filepath, 'r', encoding='utf-8') as infile:
                        content = infile.read()
                        
                        # File ka path aur code markdown format mein likhna
                        f.write(f"## File: `{filepath}`\n")
                        f.write(f"```{lang}\n")
                        f.write(content)
                        f.write("\n```\n\n")
                except Exception as e:
                    print(f"Skipped {filepath}: Unreadable text format.")

if __name__ == '__main__':
    print("Generating codebase summary...")
    generate_summary()
    print(f"Success! '{OUTPUT_FILE}' has been generated. Aap ise copy karke AI ko de sakte hain.")
