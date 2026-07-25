document.addEventListener('DOMContentLoaded', () => {
  const backupList = document.getElementById('backup-list');
  const statusBanner = document.getElementById('status-banner');
  const btnCreate = document.getElementById('btn-create');
  const inputName = document.getElementById('backup-name');

  // --- Authentication State ---
  let authToken = localStorage.getItem('keystone_token');

  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    return headers;
  };

  const handleAuthError = (res) => {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('keystone_token');
      authToken = null;
      requestLogin();
      throw new Error('Authentication expired or missing.');
    }
    return res;
  };

  const requestLogin = async () => {
    const password = prompt('Access Restricted. Please enter the password:');
    if (!password) {
      showStatus('Authentication cancelled. Refresh to try again.', true);
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        const data = await res.json();
        authToken = data.token;
        localStorage.setItem('keystone_token', authToken);
        showStatus('Authentication successful.', false);
        fetchBackups(); // Load data now that we are authenticated
      } else {
        showStatus('Invalid password.', true);
        setTimeout(requestLogin, 1000); // Re-prompt on failure
      }
    } catch (error) {
      showStatus('Network error during authentication.', true);
    }
  };

  // --- Utilities ---
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const showStatus = (message, isError = false) => {
    statusBanner.textContent = message;
    statusBanner.style.color = isError ? 'var(--accent-red)' : 'var(--accent-green)';
    statusBanner.classList.remove('hidden');
    setTimeout(() => statusBanner.classList.add('hidden'), 5000);
  };

  // --- API Integrations ---
  const fetchBackups = async () => {
    if (!authToken) return; // Prevent fetch if not authenticated

    try {
      const res = await fetch('/api/backups', { headers: getHeaders() });
      handleAuthError(res);
      const data = await res.json();

      backupList.innerHTML = '';

      if (data.length === 0) {
        backupList.innerHTML = '<tr><td colspan="4">No backups found.</td></tr>';
        return;
      }

      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      data.forEach(file => {
        const tr = document.createElement('tr');
        const date = new Date(file.createdAt).toLocaleString();

        tr.innerHTML = `
                    <td>${file.name}</td>
                    <td>${formatBytes(file.sizeBytes)}</td>
                    <td>${date}</td>
                    <td class="actions">
                        <button class="btn-restore" onclick="restoreBackup('${file.name}')">Restore</button>
                        <button class="btn-danger" onclick="deleteBackup('${file.name}')">Delete</button>
                    </td>
                `;
        backupList.appendChild(tr);
      });
    } catch (error) {
      if(authToken) showStatus('Failed to load backups.', true);
    }
  };

  btnCreate.addEventListener('click', async () => {
    btnCreate.disabled = true;
    showStatus('Creating backup, please wait...', false);

    try {
      const payload = inputName.value.trim() ? { name: inputName.value.trim() } : {};
      const res = await fetch('/api/backups', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      handleAuthError(res);
      const data = await res.json();

      if (res.ok) {
        showStatus(data.message);
        inputName.value = '';
        fetchBackups();
      } else {
        showStatus(data.error || 'Backup failed', true);
      }
    } catch (error) {
      if(authToken) showStatus('Network error during backup.', true);
    } finally {
      btnCreate.disabled = false;
    }
  });

  window.restoreBackup = async (filename) => {
    if (!confirm(`WARNING: This will overwrite current server state with ${filename}. Proceed?`)) return;

    showStatus(`Restoring ${filename}...`, false);
    try {
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: filename })
      });
      handleAuthError(res);
      const data = await res.json();

      if (res.ok) showStatus(data.message);
      else showStatus(data.error || 'Restore failed', true);
    } catch (error) {
      if(authToken) showStatus('Network error during restore.', true);
    }
  };

  window.deleteBackup = async (filename) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      const res = await fetch(`/api/backups/${filename}`, { 
        method: 'DELETE',
        headers: getHeaders()
      });
      handleAuthError(res);

      if (res.ok) {
        showStatus(`Deleted ${filename}`);
        fetchBackups();
      } else {
        showStatus('Failed to delete backup', true);
      }
    } catch (error) {
      if(authToken) showStatus('Network error during deletion.', true);
    }
  };

  // --- Initial Load Logic ---
  if (!authToken) {
    requestLogin();
  } else {
    fetchBackups();
  }
});
