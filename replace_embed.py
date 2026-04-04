import re

html = open('public/index.html').read()
new_block = """<article class="card card-wide">
  <h3 class="card-title">Twitch · Live Stream</h3>
  <p class="card-body">
    Watch me code, play games, and ramble about cyber security and mycology.
  </p>
  <div class="embed-frame embed-16x9">
    <iframe
      src="https://player.twitch.tv/?channel=hackatoa&parent=hackatoa.com&parent=localhost"
      title="Hackatoa Twitch Stream"
      frameborder="0"
      allowfullscreen="true"
      scrolling="no"
      height="378"
      width="620"></iframe>
  </div>
</article>"""

html = re.sub(
    r'<article class="card card-wide">\s*<h3 class="card-title">YouTube.*?<\/article>',
    new_block,
    html,
    flags=re.DOTALL
)

open('public/index.html', 'w').write(html)
print("Twitch Embed Added!")
