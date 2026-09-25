// html2pdf.bundle.min.js is ~900KB — only needed once the visitor actually
// asks for a PDF, so it's fetched on demand instead of blocking every page
// load. Cached after the first load so repeat clicks don't re-fetch it.
let html2pdfLoadPromise = null;
function loadHtml2Pdf() {
  if (window.html2pdf) return Promise.resolve();
  if (!html2pdfLoadPromise) {
    html2pdfLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/assets/html2pdf.bundle.min.js';
      script.onload = () => resolve();
      script.onerror = () => {
        html2pdfLoadPromise = null;
        reject(new Error('Failed to load html2pdf'));
      };
      document.head.appendChild(script);
    });
  }
  return html2pdfLoadPromise;
}

document.addEventListener('DOMContentLoaded', function () {
  // Auto-insert today's date
  const dateEl = document.getElementById('letter-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  const btn = document.getElementById('dl-btn');
  if (!btn) return;

  btn.addEventListener('click', async function () {
    btn.disabled = true;
    btn.textContent = 'Generating…';

    try {
      await loadHtml2Pdf();
    } catch (err) {
      console.error(err);
      btn.disabled = false;
      btn.textContent = '⬇ Download PDF';
      return;
    }

    const el = document.getElementById('pdf-content');

    const style = document.createElement('style');
    style.id = '__pdf-override';
    style.textContent = `
      #pdf-content, #pdf-content * {
        background: #fff !important;
        background-color: #fff !important;
        color: #111 !important;
        border-color: #ddd !important;
        box-shadow: none !important;
        border-radius: 0 !important;
      }
      #pdf-content .letter-sender-name,
      #pdf-content .letter-salutation,
      #pdf-content .letter-sig { color: #000 !important; }
      #pdf-content .letter-contact,
      #pdf-content .letter-date,
      #pdf-content .letter-body p,
      #pdf-content .letter-closing-word { color: #333 !important; }
      #pdf-content .letter-contact a,
      #pdf-content .letter-body a { color: #2a2aaa !important; }
      #pdf-content .letter-divider { background: #ddd !important; }
    `;
    document.head.appendChild(style);

    const opt = {
      margin:      [15, 18, 15, 18],
      filename:    'Preston_Cover_Letter.pdf',
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(el).save().then(() => {
      document.getElementById('__pdf-override')?.remove();
      btn.disabled = false;
      btn.textContent = '⬇ Download PDF';
    });
  });
});
