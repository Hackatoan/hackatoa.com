import urllib.request

urls_to_test = [
    "https://www.youtube.com/embed/videoseries?list=PLZG0CvngYU9ihzPO2JTRe17DQDUI0Z6vC&index=41",
    "https://www.youtube.com/embed/videoseries?list=PLZG0CvngYU9ihzPO2JTRe17DQDUI0Z6vC&index=71",
    "https://www.youtube.com/embed/videoseries?list=PLZG0CvngYU9ihzPO2JTRe17DQDUI0Z6vC&index=325"
]

for url in urls_to_test:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        if "Video unavailable" in html:
            print(f"Unavailable: {url}")
        else:
            print(f"Available: {url}")
    except Exception as e:
        print(f"Error {url}: {e}")
