import re

css_content = open('public/styles.css').read()
# Let's cleanly replace the properties in .music-card
css_content = re.sub(
    r'\.music-card \{[^}]+\}',
    '.music-card {\n    padding: 0.75rem 1.25rem 0.75rem 1.25rem;\n    border-radius: 999px;\n    background: radial-gradient(circle at 0% 0%, rgba(255, 150, 115, 0.2), rgba(5, 8, 20, 0.96));\n    border: 1px solid rgba(116, 124, 190, 0.7);\n    box-shadow: 0 16px 44px rgba(0, 0, 0, 0.9);\n    width: max-content;\n    max-width: calc(100vw - 2rem);\n    display: flex;\n    align-items: center;\n    gap: 1rem;\n}',
    css_content,
    count=1
)
open('public/styles.css', 'w').write(css_content)
print("Cleaned .music-card")
