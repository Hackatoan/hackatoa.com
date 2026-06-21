document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('dl-btn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    btn.disabled = true;
    btn.textContent = 'Generating…';

    const el = document.getElementById('pdf-content');

    // Inject a temporary stylesheet that forces a clean light theme
    const style = document.createElement('style');
    style.id = '__pdf-override';
    style.textContent = `
      #pdf-content, #pdf-content * {
        background: #fff !important;
        background-color: #fff !important;
        color: #111 !important;
        border-color: #ddd !important;
        box-shadow: none !important;
      }
      #pdf-content .section-title { color: #2a2aaa !important; }
      #pdf-content .section-title::after { background: #ccc !important; }
      #pdf-content .resume-contact,
      #pdf-content .summary-text,
      #pdf-content .project-desc,
      #pdf-content .job-meta,
      #pdf-content .job-bullets li,
      #pdf-content .edu-school,
      #pdf-content .edu-dates,
      #pdf-content .skills-group-label,
      #pdf-content .meta-item strong { color: #444 !important; }
      #pdf-content a,
      #pdf-content .resume-contact a,
      #pdf-content .project-name a,
      #pdf-content .project-desc code { color: #2a2aaa !important; }
      #pdf-content .tag {
        background: #eee !important;
        border-color: #ccc !important;
        color: #333 !important;
      }
    `;
    document.head.appendChild(style);

    const opt = {
      margin:      [12, 14, 12, 14],
      filename:    'Jacob_Harris_Resume.pdf',
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
