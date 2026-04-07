with open('public/background.js', 'r') as f:
    content = f.read()

content = content.replace("const bubbleColours = ['#946EB5','#4F4791', '#946EB5'];\n", "")
content = "/* global gsap */\n" + content

with open('public/background.js', 'w') as f:
    f.write(content)

print("Done")
