/* eslint-env browser */

export default async function decorate(block) {

  while (block.firstChild) {
    block.removeChild(block.firstChild);
  }

  const form = document.createElement('form');
  form.classList.add('feedback-form');
  form.setAttribute('method', 'post');
  form.setAttribute('enctype', 'multipart/form-data');
  form.setAttribute('novalidate', '');

  form.innerHTML = `
    <div class="field-group">
      <label for="issue-email">Your Adobe Email*</label>
      <input id="issue-email" name="email" type="text" inputmode="email" autocomplete="email" placeholder="ldap@adobe.com" required />
    </div>

    <div class="field-group">
      <label for="issue-type">Request Type*</label>
      <select id="issue-type" name="type" required>
        <option value="" disabled selected>Select request type</option>
        <option value="Bug">Bug</option>
        <option value="Enhancement">Enhancement</option>
        <option value="New Feature">New Feature</option>
        <option value="General Feedback">General Feedback/Request</option>
      </select>
    </div>

    <div class="field-group">
      <label for="issue-description">Description*</label>
      <textarea id="issue-description" name="description" rows="5" placeholder="Describe your request (add links, if needed)" required></textarea>
    </div>

    <div class="field-group">
      <label for="issue-attachment">Attachment (optional)</label>
      <div class="ff-dropzone" tabindex="0" role="button" aria-label="Upload attachments">
        <input id="issue-attachment" name="attachment" type="file" multiple accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*,text/plain" />
        <div class="ff-dropzone-inner">
          <span class="ff-dz-icon" aria-hidden="true"></span>
          <p class="ff-dz-title">Max 10MB; Allowed: pdf, doc, docx, txt, png, jpg</p>
          <p class="ff-dz-subtitle">Drag & drop the file here</p>
          <div class="ff-dz-list" aria-live="polite"></div>
          <div class="ff-dz-errors" aria-live="assertive"></div>
        </div>
      </div>
    </div>

    <div class="actions">
      <button type="submit" class="button primary">Submit</button>
    </div>
  `;

  block.append(form);

  // Create a minimal success modal (scoped to block)
  const modal = document.createElement('div');
  modal.className = 'ff-modal';
  modal.innerHTML = `
    <div class="ff-modal-content" role="dialog" aria-modal="true" aria-label="Submission status">
      <button type="button" class="ff-modal-close" aria-label="Close">✕</button>
      <p>Thank you! Your request has been submitted.</p>
    </div>
  `;
  block.append(modal);

  // Ensure clicking anywhere on dropzone opens the file picker
  const dropzone = form.querySelector('.ff-dropzone');
  const filePicker = form.querySelector('#issue-attachment');
  const emailInput = form.querySelector('#issue-email');
  const listEl = form.querySelector('.ff-dz-list');
  const errorEl = form.querySelector('.ff-dz-errors');
  const MAX_FILES = 1;
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const selected = [];

  const fileKey = (f) => `${f.name}_${f.size}_${f.lastModified}`;
  const human = (b) => {
    const u = ['B','KB','MB','GB'];
    let i = 0; let n = b;
    while (n >= 1024 && i < u.length - 1) { n /= 1024; i += 1; }
    return `${n.toFixed(1)} ${u[i]}`;
  };

  function renderList() {
    if (!listEl) return;
    listEl.innerHTML = '';
    selected.forEach((f, idx) => {
      const chip = document.createElement('div');
      chip.className = 'ff-dz-chip';
      const thumb = document.createElement('span');
      thumb.className = 'thumb';
      if (f.type && f.type.startsWith('image/')) {
        const url = URL.createObjectURL(f);
        thumb.style.backgroundImage = `url(${url})`;
        const img = new Image(); img.onload = () => URL.revokeObjectURL(url); img.src = url;
      }
      const meta = document.createElement('span');
      meta.className = 'meta';
      meta.textContent = `${f.name} • ${human(f.size)}`;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'ff-dz-remove';
      remove.setAttribute('aria-label', `Remove ${f.name}`);
      remove.textContent = '✕';
      remove.addEventListener('click', () => { selected.splice(idx, 1); renderList(); });
      chip.append(thumb, meta, remove);
      listEl.append(chip);
    });
  }

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    setTimeout(() => { if (errorEl.textContent === msg) errorEl.textContent = ''; }, 4000);
  }

  function acceptFile(f) {
    if (selected.length >= MAX_FILES) { showError(`You can upload up to ${MAX_FILES} files.`); return false; }
    if (f.size > MAX_SIZE) { showError(`${f.name} exceeds 7 MB.`); return false; }
    const key = fileKey(f);
    if (selected.some((x) => fileKey(x) === key)) { showError(`${f.name} is already added.`); return false; }
    return true;
  }

  function addFiles(files) {
    if (!files || !files.length) return;
    [...files].forEach((f) => { if (acceptFile(f)) selected.push(f); });
    renderList();
    if (filePicker) filePicker.value = '';
  }

  if (dropzone && filePicker) {
    dropzone.addEventListener('click', (e) => {
      // If clicking on remove buttons or chips, do not open picker
      const target = e.target;
      if (target && (target.classList.contains('ff-dz-remove') || target.closest('.ff-dz-chip'))) {
        return; // let chip controls handle the click
      }
      filePicker.click();
    });
    dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); filePicker.click(); }
    });
    ['dragenter','dragover'].forEach((ev) => dropzone.addEventListener(ev, (e) => {
      e.preventDefault(); e.stopPropagation(); dropzone.classList.add('dragover');
    }));
    ['dragleave','drop'].forEach((ev) => dropzone.addEventListener(ev, (e) => {
      e.preventDefault(); e.stopPropagation(); dropzone.classList.remove('dragover');
    }));
    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer; if (dt && dt.files) addFiles(dt.files);
    });
    filePicker.addEventListener('change', () => addFiles(filePicker.files));
  }

  // Clear custom validity while typing in email
  if (emailInput) {
    emailInput.addEventListener('input', () => {
      emailInput.setCustomValidity('');
      if (emailInput.value.trim()) {
        emailInput.required = true; // re-enable requirement when user starts typing
      }
    });
    emailInput.addEventListener('blur', () => {
      const val = emailInput.value.trim();
      // If empty, do not show any validation message on blur
      if (!val) { emailInput.setCustomValidity(''); emailInput.required = false; return; }
      const adobeEmailPattern = /^[A-Za-z0-9._%+-]+@adobe\.com$/i;
      if (!adobeEmailPattern.test(val)) {
        emailInput.setCustomValidity('Please enter a valid adobe email id.');
        emailInput.reportValidity();
      } else {
        emailInput.setCustomValidity('');
      }
    });
  }

  // Handle submission: save Issue Type and Description to a sheet via backend endpoint
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const issueType = form.querySelector('#issue-type').value;
    const email = form.querySelector('#issue-email').value.trim();
    if (emailInput) { emailInput.required = true; } // ensure required on submit
    // Respect constraint validation on submit without duplicating checks
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const description = form.querySelector('#issue-description').value.trim();

    let fileContentBase64 = null;
    let fileName = null;
    // Prefer files tracked in our selection model (because we clear the input value)
    const pickedFile = selected.length > 0 ? selected[0] : (filePicker && filePicker.files && filePicker.files[0]);
    if (pickedFile) {
      fileName = pickedFile.name;
      fileContentBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // Strip "*/*;base64,"
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(pickedFile);
      });
    }

    const payload = {
      email,
      issueType,
      description,
      attachment: fileContentBase64,
      fileName
    };
  
    try {
      const resp = await fetch('https://defaultfa7b1b5a7b34438794aed2c178dece.e1.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/bf438d4d4caf42a28af89d49caa25b4e/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=KPt5JHtt_5rfzSVnKx8_aacOHFBbbWqNGpEtYklBrNE', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        form.reset();
        selected.splice(0, selected.length);
        renderList();
        modal.classList.add('open');
      } else {
        // eslint-disable-next-line no-alert
        alert('Failed to submit request. Please write to: refdemo@adobe.com');
      }
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert('Unexpected error submitting request. Please write to: refdemo@adobe.com');
    }
  });
  

  // Modal close handlers
  const closeBtn = modal.querySelector('.ff-modal-close');
  closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.code === 'Escape') {
      modal.classList.remove('open');
    }
  });

  // Clear attachments on form reset
  form.addEventListener('reset', () => { selected.splice(0, selected.length); renderList(); if (filePicker) filePicker.value = ''; });
}


