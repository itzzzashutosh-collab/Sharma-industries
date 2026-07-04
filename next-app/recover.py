import json
import re

with open(r'C:\Users\itzzz\.gemini\antigravity-ide\brain\4dbb7985-f552-49ac-8b4d-5e7d15b8b038\.system_generated\logs\transcript_full.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line.strip())
            content = data.get('content', '')
            if 'Total Lines: 2122' in content and 'InvoiceEngine.tsx' in content and '1: "use client";' in content:
                # Extract the numbered lines
                match = re.search(r'(1: "use client";.*)The above content', content, re.DOTALL)
                if match:
                    code_with_numbers = match.group(1)
                    # Remove line numbers
                    clean_code = re.sub(r'^[0-9]+: ', '', code_with_numbers, flags=re.MULTILINE)
                    with open(r'd:\Sharma Industries\next-app\recovered.txt', 'w', encoding='utf-8') as out:
                        out.write(clean_code)
                    print("Recovered!")
                    break
        except Exception as e:
            pass
