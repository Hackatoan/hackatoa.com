document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('dl-btn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    btn.disabled = true;
    btn.textContent = 'Generating…';

    const el = document.getElementById('pdf-content');

    // Snapshot inline styles
    const prev = {
      bg:    el.style.background,
      color: el.style.color,
    };

    // Apply clean light theme for PDF
    el.style.background = '#ffffff';
    el.style.color = '#111111';

    document.querySelectorAll('.section-title').forEach(e => e.style.color = '#4a3fcf');
    document.querySelectorAll('.section-title').forEach(e => e.style.setProperty('--after-bg', '#ccc'));
    document.querySelectorAll('.resume-name').forEach(e => e.style.color = '#111');
    document.querySelectorAll('.resume-contact').forEach(e => e.style.color = '#444');
    document.querySelectorAll('.resume-contact a').forEach(e => e.style.color = '#4a3fcf');
    document.querySelectorAll('.summary-text').forEach(e => e.style.color = '#333');
    document.querySelectorAll('.project-card').forEach(e => {
      e.style.background = '#f8f8f8';
      e.style.borderColor = '#ddd';
    });
    document.querySelectorAll('.project-name').forEach(e => e.style.color = '#111');
    document.querySelectorAll('.project-name a').forEach(e => e.style.color = '#4a3fcf');
    document.querySelectorAll('.project-desc').forEach(e => e.style.color = '#333');
    document.querySelectorAll('.project-desc code').forEach(e => e.style.color = '#4a3fcf');
    document.querySelectorAll('.job').forEach(e => e.style.borderLeftColor = '#ccc');
    document.querySelectorAll('.job-title').forEach(e => e.style.color = '#111');
    document.querySelectorAll('.job-meta').forEach(e => e.style.color = '#555');
    document.querySelectorAll('.job-bullets li').forEach(e => e.style.color = '#333');
    document.querySelectorAll('.edu-degree').forEach(e => e.style.color = '#111');
    document.querySelectorAll('.edu-school, .edu-dates').forEach(e => e.style.color = '#555');
    document.querySelectorAll('.skills-group-label').forEach(e => e.style.color = '#555');
    document.querySelectorAll('.tag').forEach(e => {
      e.style.background = '#eeeeee';
      e.style.borderColor = '#cccccc';
      e.style.color = '#333';
    });
    document.querySelectorAll('.meta-item').forEach(e => e.style.color = '#333');
    document.querySelectorAll('.meta-item strong').forEach(e => e.style.color = '#555');

    const opt = {
      margin:      [12, 14, 12, 14],
      filename:    'Jacob_Harris_Resume.pdf',
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(el).save().then(() => {
      // Restore
      el.style.background = prev.bg;
      el.style.color = prev.color;
      document.querySelectorAll(
        '.section-title, .resume-name, .resume-contact, .resume-contact a, .summary-text,' +
        '.project-card, .project-name, .project-name a, .project-desc, .project-desc code,' +
        '.job, .job-title, .job-meta, .job-bullets li, .edu-degree, .edu-school, .edu-dates,' +
        '.skills-group-label, .tag, .meta-item, .meta-item strong'
      ).forEach(e => e.removeAttribute('style'));
      btn.disabled = false;
      btn.textContent = '⬇ Download PDF';
    });
  });
});
