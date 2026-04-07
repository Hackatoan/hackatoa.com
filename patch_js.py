js_content = """document.addEventListener('DOMContentLoaded', () => {
    // Make sure gsap is defined
    if (typeof gsap !== 'undefined') {
        const bubbleColours = ['#946EB5','#4F4791', '#946EB5'];

        gsap.fromTo('#bubbleGroup > *',
          {
            x: 'random(-100,100)',
            y: 0,
            scale: 'random(0.1, 2)',
            transformOrigin: "50% 50%"
          }, {
            y: -1200,
            stagger: {
              repeatRefresh: true,
              each: 0.2,
              repeat: -1
            },
            transformOrigin: "50% 50%",
            duration: 'random(8,20)',
            ease: 'power1.out',
            x: 'random(-250, 200)'
        }).seek(1000);

        gsap.to('#clouds > *', {
          x: 'random(-200, 200)',
          duration: 'random(10, 20)',
          ease: 'none',
          repeat: -1,
          yoyo: true,
          stagger: {
            each: 0.5,
            repeatRefresh: true
          }
        }).seek(500);
    }
});
"""

with open('public/background.js', 'w') as f:
    f.write(js_content)

print("Done")
