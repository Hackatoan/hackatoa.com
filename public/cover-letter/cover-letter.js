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

  btn.addEventListener('click', function () {
    btn.disabled = true;
    btn.textContent = 'Generating…';

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
