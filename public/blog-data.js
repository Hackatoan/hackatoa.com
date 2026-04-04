// Simple data source for ramblings / blog-style entries.
// A separate tool or webapp can update this file and push to GitHub.
// Each entry can optionally include:
// - image: relative path under public/, e.g. "assets/your-image.jpg"
// - audio: relative path under public/, e.g. "assets/your-audio.ogg"
// - links: array of { label, href }

window.BLOG_ENTRIES = [
    {
        id: 'new-ui-pass',
        title: 'Revamping the slide chassis',
        meta: 'Log #004 · CSS & Architecture',
        body: 'Just pushed a bunch of flexbox reworks to the site chassis. Everything is starting to stretch and fill out naturally without relying on hard pixel constraints. Testing out the image pipeline below to see how it scales on mobile and sideways track layouts.',
        image: 'assets/me.png',
        links: [
            { label: 'GitHub Source', href: 'https://github.com/Hackatoan' }
        ]
    },
    {
        id: 'cyber-homelab',
        title: 'Late night proxy chains',
        meta: 'Log #003 · Security & Networking',
        body: 'Spent four hours tonight wrestling with a reverse proxy routing anomaly in the homelab. Turns out an old iptables rule from three months ago was blackholing half my intended traffic. Once it clicked, the entire pipeline lit up perfectly. Note to self: document your firewall rules next time before logging off at 3 AM.',
    },
    {
        id: 'fungi-plus-infra',
        title: 'Mycology meets systems',
        meta: 'Log #002 · Hardware & Fungal automated sensors',
        body: 'Designing an ESP32 micro-controller board that pipes temperature, humidity, and CO2 PPM data directly from my fruiting chambers to a local Grafana instance. Goal: trigger exhaust fans completely autonomously without me having to obsessively check the dials every three hours.',
        links: [
            { label: 'Hackatoa.com', href: 'https://hackatoa.com' }
        ]
    },
    {
        id: 'first-ember',
        title: 'First ember',
        meta: 'Log #001 · Initialization',
        body: 'The volcano starts rumbling. Moving away from standard bloated web portfolios to something that feels a bit more terminal, dark, and uniquely me. Decided on a horizontal scroll mechanic to mimic sliding through a deck or desktop panes.',
    }
];
