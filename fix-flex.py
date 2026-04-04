import re
css = open('public/styles.css').read()
css = re.sub(r'\.music-meta \{([^}]+)\}', r'.music-meta {\1\n    flex: 1 1 100px;', css, count=1)
# Clean up duplicate flex-shrinks just in case
css = re.sub(r'\n\s*flex-shrink: 0;\n\s*flex-shrink: 0;', '\n    flex-shrink: 0;', css)
open('public/styles.css', 'w').write(css)
print("Done flex shrink")
