css_content = """/* CSS Background Art Variables - High Fidelity */
:root {
  --sky-night: #050813;
}

.video-bg {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  background: linear-gradient(to bottom, var(--sky-night) 0%, var(--sky-night) 100%);
  transition: background 2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
}

.video-bg svg {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
}
"""

with open('public/background.css', 'w') as f:
    f.write(css_content)

print("Done")
