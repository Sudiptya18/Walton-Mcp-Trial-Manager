/**
 * Syncs legacy Trial Sheet with MySQL (trial_records):
 * - Saves on form submit
 * - Loads DB trials into Recent Files (localStorage MCP_RecentTrials)
 */
(function () {
  const RECENT_KEY = 'MCP_RecentTrials';
  const MAX_RECENT = 100;

  function getToken() {
    try {
      return localStorage.getItem('token') || window.parent?.localStorage?.getItem('token');
    } catch {
      return localStorage.getItem('token');
    }
  }

  function authHeaders() {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    const csrf = sessionStorage.getItem('csrfToken');
    if (csrf) headers['X-CSRF-Token'] = csrf;
    return headers;
  }

  function trialRowToRecentInfo(row) {
    const form =
      typeof row.form_data === 'string' ? JSON.parse(row.form_data) : row.form_data || {};
    const savedAt = row.saved_at ? new Date(row.saved_at).toISOString() : '';
    return {
      filename: row.filename,
      productName: row.product_name || form.productNameInput || '',
      trialName: row.trial_name || form.trialNameInput || '',
      date: row.trial_date || '',
      requiredBy: row.required_by || '',
      trialType: row.trial_type || form.trialTypeSelect || '',
      materialType: row.material_type || form.materialTypeSelect || '',
      docNum: row.doc_num || form.docNumInput || '',
      purpose: row.purpose || form.trialDescInput || '',
      savedAt,
      data: form,
      dbId: row.id,
    };
  }

  function mergeIntoRecentStorage(dbItems) {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch {
      list = [];
    }
    const valid = dbItems.filter((f) => f.filename && f.data);
    const byFilename = new Map(list.map((f) => [f.filename, f]));
    for (const info of valid) byFilename.set(info.filename, info);
    list = Array.from(byFilename.values());
    list.sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
    if (list.length > MAX_RECENT) list = list.slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    return list.length;
  }

  async function refreshRecentFromDb() {
    const token = getToken();
    if (!token) return 0;

    try {
      const res = await fetch('/api/trials', {
        headers: authHeaders(),
        credentials: 'include',
      });
      if (!res.ok) return 0;
      const body = await res.json();
      const items = (body.trials || []).map(trialRowToRecentInfo).filter((f) => f.data);
      return mergeIntoRecentStorage(items);
    } catch (e) {
      console.warn('[MCP DB bridge] recent sync skipped:', e);
      return 0;
    }
  }

  window.refreshRecentFromDb = refreshRecentFromDb;

  function hookSave() {
    if (typeof window.saveTrialData !== 'function' || window.__mcpDbBridgeHooked) return;
    const original = window.saveTrialData;
    window.saveTrialData = async function mcpSaveWithDb() {
      await original.apply(this, arguments);
      try {
        const data = typeof collectFormData === 'function' ? collectFormData() : null;
        if (!data) return;
        const prodName = document.getElementById('productNameInput')?.value?.trim() || 'Product';
        const trialType = document.getElementById('trialTypeSelect')?.value || 'TrialType';
        const displayDate =
          typeof getFormattedDate === 'function' ? getFormattedDate() : '';
        const requiredBy =
          typeof getRequiredByFromForm === 'function' ? getRequiredByFromForm() : '';
        const filename =
          typeof buildTrialFilename === 'function'
            ? buildTrialFilename(prodName, displayDate, trialType, requiredBy)
            : `TrialSheet_${prodName}_${displayDate}_${trialType}.trial`;

        if (!getToken()) return;

        await fetch('/api/trials', {
          method: 'POST',
          headers: authHeaders(),
          credentials: 'include',
          body: JSON.stringify({
            filename,
            productName: document.getElementById('productNameInput')?.value?.trim(),
            trialName: document.getElementById('trialNameInput')?.value?.trim(),
            date: displayDate,
            requiredBy,
            trialType,
            materialType: document.getElementById('materialTypeSelect')?.value,
            docNum: document.getElementById('docNumInput')?.value?.trim(),
            purpose: document.getElementById('trialDescInput')?.value?.trim(),
            formData: data,
            savedAt: new Date().toISOString(),
          }),
        });
        await refreshRecentFromDb();
      } catch (e) {
        console.warn('[MCP DB bridge] save sync skipped:', e);
      }
    };
    window.__mcpDbBridgeHooked = true;
  }

  function init() {
    hookSave();
    setTimeout(() => {
      refreshRecentFromDb().then((n) => {
        if (n > 0 && typeof updateRecentBadge === 'function') updateRecentBadge();
        if (n > 0 && document.getElementById('recentTab')?.classList.contains('active')) {
          if (typeof searchRecent === 'function') searchRecent();
        }
      });
    }, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 300));
  } else {
    setTimeout(init, 300);
  }
})();
