/* global APP, properties */

(function () {
  'use strict';

  const OFFLINE_STORAGE_KEY = 'netitaProperties.admin.properties.v1';

  const Dom = {
    status: () => document.getElementById('adminStatus'),
    analytics: () => document.getElementById('adminAnalytics'),
    tbody: () => document.getElementById('propertiesTableBody'),
    form: () => document.getElementById('propertyForm'),
    formTitle: () => document.getElementById('propertyFormTitle'),
    propertyId: () => document.getElementById('propertyId'),

    address: () => document.getElementById('address'),
    location: () => document.getElementById('location'),
    listingType: () => document.getElementById('listingType'),
    type: () => document.getElementById('type'),
    image: () => document.getElementById('image'),
    mainImageUpload: () => document.getElementById('mainImageUpload'),
    mainImageUploadStatus: () => document.getElementById('mainImageUploadStatus'),

    price: () => document.getElementById('price'),
    bedrooms: () => document.getElementById('bedrooms'),
    bathrooms: () => document.getElementById('bathrooms'),
    sqft: () => document.getElementById('sqft'),
    yearBuilt: () => document.getElementById('yearBuilt'),

    images: () => document.getElementById('images'),
    galleryUpload: () => document.getElementById('galleryUpload'),
    galleryUploadStatus: () => document.getElementById('galleryUploadStatus'),
    description: () => document.getElementById('description'),

    saveButton: () => document.getElementById('saveButton'),
    resetButton: () => document.getElementById('resetButton'),

    globalError: () => document.getElementById('formGlobalError'),
    success: () => document.getElementById('formSuccess'),
    successText: () => document.getElementById('formSuccessText'),

    fieldError: (id) => document.getElementById(id)
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatCurrency(value) {
    if (APP && APP.Utilities && typeof APP.Utilities.formatCurrency === 'function') {
      return APP.Utilities.formatCurrency(value);
    }

    const number = Number(value);
    if (!Number.isFinite(number)) return String(value);
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(number);
  }

  function formatNumber(value, { maximumFractionDigits = 0 } = {}) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    return new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(n);
  }

  function median(values) {
    if (!Array.isArray(values) || values.length === 0) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 1) return sorted[mid];
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  function average(values) {
    if (!Array.isArray(values) || values.length === 0) return null;
    const sum = values.reduce((acc, n) => acc + n, 0);
    return sum / values.length;
  }

  function finiteNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function normalizeListingType(value) {
    const v = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (v === 'sale' || v === 'rent' || v === 'rent_per_day') return v;
    return 'sale';
  }

  function computeStats(list) {
    const prices = [];
    const sqfts = [];
    const pricePerSqft = [];

    (Array.isArray(list) ? list : []).forEach((p) => {
      const price = finiteNumber(p && p.price);
      const sqft = finiteNumber(p && p.sqft);

      if (price !== null) prices.push(price);
      if (sqft !== null) sqfts.push(sqft);
      if (price !== null && sqft !== null && sqft > 0) pricePerSqft.push(price / sqft);
    });

    return {
      count: Array.isArray(list) ? list.length : 0,
      avgPrice: average(prices),
      medianPrice: median(prices),
      avgSqft: average(sqfts),
      avgPricePerSqft: average(pricePerSqft)
    };
  }

  function computePropertiesAnalytics(list) {
    const properties = Array.isArray(list) ? list : [];
    const sale = [];
    const rent = [];
    const rentPerDay = [];

    properties.forEach((p) => {
      const t = normalizeListingType(p && p.listingType);
      if (t === 'rent') rent.push(p);
      else if (t === 'rent_per_day') rentPerDay.push(p);
      else sale.push(p);
    });

    return {
      byListingType: {
        sale: computeStats(sale),
        rent: computeStats(rent),
        rent_per_day: computeStats(rentPerDay)
      }
    };
  }

  function renderAnalytics(analytics) {
    const root = Dom.analytics();
    if (!root) return;

    const a = analytics && analytics.byListingType ? analytics.byListingType : null;
    const empty = { count: 0, avgPrice: null, medianPrice: null, avgSqft: null, avgPricePerSqft: null };

    const blocks = [
      { key: 'sale', title: 'For Sale' },
      { key: 'rent', title: 'For Rent' },
      { key: 'rent_per_day', title: 'Rent per Day' }
    ]
      .map(({ key, title }) => {
        const s = a && a[key] ? a[key] : empty;
        return `
<div class="admin-analytics-card">
  <div class="admin-analytics-card__title">${escapeHtml(title)}</div>

  <div class="admin-analytics-metric">
    <div class="admin-analytics-metric__label">Total Properties</div>
    <div class="admin-analytics-metric__value">${escapeHtml(formatNumber(s.count))}</div>
  </div>

  <div class="admin-analytics-metric">
    <div class="admin-analytics-metric__label">Average Price</div>
    <div class="admin-analytics-metric__value">${escapeHtml(s.avgPrice === null ? '—' : formatCurrency(s.avgPrice))}</div>
  </div>

  <div class="admin-analytics-metric">
    <div class="admin-analytics-metric__label">Median Price</div>
    <div class="admin-analytics-metric__value">${escapeHtml(s.medianPrice === null ? '—' : formatCurrency(s.medianPrice))}</div>
  </div>

  <div class="admin-analytics-metric">
    <div class="admin-analytics-metric__label">Average Sqft</div>
    <div class="admin-analytics-metric__value">${escapeHtml(formatNumber(s.avgSqft, { maximumFractionDigits: 0 }))}</div>
  </div>

  <div class="admin-analytics-metric">
    <div class="admin-analytics-metric__label">Average Price / Sqft</div>
    <div class="admin-analytics-metric__value">${escapeHtml(s.avgPricePerSqft === null ? '—' : formatCurrency(s.avgPricePerSqft))}</div>
  </div>
</div>`;
      })
      .join('');

    root.innerHTML = blocks;
  }

  function normalizeNumber(value, { allowFloat = false } = {}) {
    if (value === null || value === undefined || value === '') return null;
    const n = allowFloat ? Number(value) : parseInt(value, 10);
    if (!Number.isFinite(n)) return null;
    return n;
  }

  function splitLines(value) {
    return String(value || '')
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean);
  }

  function setStatus(message) {
    const el = Dom.status();
    if (!el) return;
    el.textContent = message;
  }

  function setGalleryUploadStatus(message) {
    const el = Dom.galleryUploadStatus();
    if (!el) return;
    el.textContent = message || '';
  }

  function setMainImageUploadStatus(message) {
    const el = Dom.mainImageUploadStatus();
    if (!el) return;
    el.textContent = message || '';
  }

  async function uploadGalleryImages(files) {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));

    const res = await fetch('/api/uploads/images', {
      method: 'POST',
      body: form
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

    if (!res.ok) {
      const message = (payload && payload.error && payload.error.message) || res.statusText || 'Upload failed';
      const err = new Error(message);
      err.status = res.status;
      err.payload = payload;
      throw err;
    }

    const uploaded = payload && Array.isArray(payload.files) ? payload.files : [];
    return uploaded
      .map((x) => (x && typeof x.path === 'string' ? x.path.trim() : ''))
      .filter(Boolean);
  }

  async function uploadMainImage(file, { deletePath } = {}) {
    const form = new FormData();
    form.append('files', file);
    if (deletePath) form.append('deletePath', deletePath);

    const res = await fetch('/api/uploads/images', {
      method: 'POST',
      body: form
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

    if (!res.ok) {
      const message = (payload && payload.error && payload.error.message) || res.statusText || 'Upload failed';
      const err = new Error(message);
      err.status = res.status;
      err.payload = payload;
      throw err;
    }

    const uploaded = payload && Array.isArray(payload.files) ? payload.files : [];
    const uploadedPath = uploaded[0] && typeof uploaded[0].path === 'string' ? uploaded[0].path.trim() : '';
    const deleted = payload && Array.isArray(payload.deleted) ? payload.deleted : [];
    return { uploadedPath, deleted };
  }

  function clearInlineErrors() {
    const errorIds = [
      'addressError',
      'locationError',
      'listingTypeError',
      'typeError',
      'imageError',
      'priceError',
      'bedroomsError',
      'bathroomsError',
      'sqftError',
      'yearBuiltError',
      'imagesError',
      'descriptionError'
    ];

    errorIds.forEach((id) => {
      const errorEl = Dom.fieldError(id);
      if (errorEl) errorEl.textContent = '';
    });

    const fields = [
      Dom.address(),
      Dom.location(),
      Dom.listingType(),
      Dom.type(),
      Dom.image(),
      Dom.price(),
      Dom.bedrooms(),
      Dom.bathrooms(),
      Dom.sqft(),
      Dom.yearBuilt(),
      Dom.images(),
      Dom.description()
    ];

    fields.forEach((field) => {
      if (!field) return;
      field.setAttribute('aria-invalid', 'false');
    });

    const globalError = Dom.globalError();
    if (globalError) globalError.textContent = '';

    const success = Dom.success();
    if (success) success.hidden = true;
  }

  function setFieldError(inputEl, errorEl, message) {
    if (inputEl) inputEl.setAttribute('aria-invalid', 'true');
    if (errorEl) errorEl.textContent = message;
  }

  function validateForm() {
    clearInlineErrors();

    const address = Dom.address().value.trim();
    const location = Dom.location().value.trim();
    const image = Dom.image().value.trim();

    const price = normalizeNumber(Dom.price().value, { allowFloat: true });
    const bedrooms = normalizeNumber(Dom.bedrooms().value, { allowFloat: false });
    const bathrooms = normalizeNumber(Dom.bathrooms().value, { allowFloat: true });
    const sqft = normalizeNumber(Dom.sqft().value, { allowFloat: true });
    const yearBuilt = normalizeNumber(Dom.yearBuilt()?.value, { allowFloat: false });

    let ok = true;

    const listingType = Dom.listingType()?.value || 'sale';
    const allowedListingTypes = new Set(['sale', 'rent', 'rent_per_day']);
    if (!allowedListingTypes.has(listingType)) {
      setFieldError(Dom.listingType(), Dom.fieldError('listingTypeError'), 'Listing type must be For Sale, For Rent, or Rent per Day');
      ok = false;
    }

    if (!address) {
      setFieldError(Dom.address(), Dom.fieldError('addressError'), 'Address is required');
      ok = false;
    }

    if (!location) {
      setFieldError(Dom.location(), Dom.fieldError('locationError'), 'Location is required');
      ok = false;
    }

    if (!image) {
      setFieldError(Dom.image(), Dom.fieldError('imageError'), 'Main image is required');
      ok = false;
    }

    if (price === null) {
      setFieldError(Dom.price(), Dom.fieldError('priceError'), 'Price must be a number');
      ok = false;
    }

    if (bedrooms === null) {
      setFieldError(Dom.bedrooms(), Dom.fieldError('bedroomsError'), 'Bedrooms must be a number');
      ok = false;
    }

    if (bathrooms === null) {
      setFieldError(Dom.bathrooms(), Dom.fieldError('bathroomsError'), 'Bathrooms must be a number');
      ok = false;
    }

    if (sqft === null) {
      setFieldError(Dom.sqft(), Dom.fieldError('sqftError'), 'Sqft must be a number');
      ok = false;
    }

    if (!ok) {
      const globalError = Dom.globalError();
      if (globalError) globalError.textContent = 'Please fix the highlighted fields.';
      return { ok: false };
    }

    const type = Dom.type().value.trim();
    const images = splitLines(Dom.images().value);
    const description = Dom.description().value.trim();

    return {
      ok: true,
      value: {
        address,
        location,
        listingType,
        type,
        image,
        price,
        bedrooms,
        bathrooms,
        sqft,
        yearBuilt,
        images,
        description
      }
    };
  }

  function showSuccess(message) {
    const success = Dom.success();
    const text = Dom.successText();
    if (!success || !text) return;

    text.textContent = message;
    success.hidden = false;
  }

  function setFormMode({ mode, property } = {}) {
    const title = Dom.formTitle();

    if (mode === 'edit' && property) {
      if (title) title.textContent = `Edit Property #${property.id}`;
      Dom.propertyId().value = String(property.id);

      Dom.address().value = property.address || '';
      Dom.location().value = property.location || '';
      if (Dom.listingType()) Dom.listingType().value = property.listingType || 'sale';
      Dom.type().value = property.type || '';
      Dom.image().value = property.image || '';

      Dom.price().value = property.price ?? '';
      Dom.bedrooms().value = property.bedrooms ?? '';
      Dom.bathrooms().value = property.bathrooms ?? '';
      Dom.sqft().value = property.sqft ?? '';
      if (Dom.yearBuilt()) Dom.yearBuilt().value = property.yearBuilt ?? '';

      Dom.images().value = Array.isArray(property.images) ? property.images.join('\n') : '';
      Dom.description().value = property.description || '';

      clearInlineErrors();
      return;
    }

    if (title) title.textContent = 'Create Property';
    Dom.propertyId().value = '';
    Dom.form().reset();
    if (Dom.listingType()) Dom.listingType().value = 'sale';
    clearInlineErrors();
  }

  function renderTable(list) {
    const tbody = Dom.tbody();
    if (!tbody) return;

    if (!Array.isArray(list) || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">No properties found.</td></tr>';
      return;
    }

    const rows = list
      .slice()
      .sort((a, b) => Number(a.id) - Number(b.id))
      .map((p) => {
        const id = Number(p.id);
        const listing = String(p.listingType || '').trim() || 'sale';
        return `
<tr data-id="${escapeHtml(id)}">
  <td>${escapeHtml(id)}</td>
  <td>${escapeHtml(p.address || '')}</td>
  <td>${escapeHtml(p.location || '')}</td>
  <td>${escapeHtml(formatCurrency(p.price))}</td>
  <td>${escapeHtml(p.type || '')}</td>
  <td>${escapeHtml(listing)}</td>
  <td>
    <div class="admin-actions">
      <button type="button" class="button button--small button--outline" data-action="edit">Edit</button>
      <button type="button" class="button button--small button--danger" data-action="delete">Delete</button>
    </div>
  </td>
</tr>`;
      })
      .join('');

    tbody.innerHTML = rows;
  }

  function createOfflineStore() {
    function read() {
      const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (!raw) return null;
      try {
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : null;
      } catch (e) {
        return null;
      }
    }

    function write(list) {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(list, null, 2));
    }

    function ensureSeeded() {
      const existing = read();
      if (existing) return;

      const seed = Array.isArray(window.properties) ? window.properties : Array.isArray(properties) ? properties : [];
      write(seed);
    }

    function nextId(list) {
      const max = (list || []).reduce((acc, item) => {
        const id = Number(item && item.id);
        return Number.isFinite(id) && id > acc ? id : acc;
      }, 0);
      return max + 1;
    }

    function normalizePayload(payload) {
      return {
        address: String(payload.address || '').trim(),
        location: String(payload.location || '').trim(),
        listingType: String(payload.listingType || '').trim(),
        type: String(payload.type || '').trim(),
        image: String(payload.image || '').trim(),
        price: normalizeNumber(payload.price, { allowFloat: true }),
        bedrooms: normalizeNumber(payload.bedrooms, { allowFloat: false }),
        bathrooms: normalizeNumber(payload.bathrooms, { allowFloat: true }),
        sqft: normalizeNumber(payload.sqft, { allowFloat: true }),
        yearBuilt: normalizeNumber(payload.yearBuilt, { allowFloat: false }),
        images: Array.isArray(payload.images) ? payload.images.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()) : [],
        description: String(payload.description || '').trim()
      };
    }

    return {
      modeLabel: 'Offline (localStorage)',

      async getAll() {
        ensureSeeded();
        return read() || [];
      },

      async create(payload) {
        ensureSeeded();
        const list = read() || [];
        const created = { id: nextId(list), ...normalizePayload(payload) };
        list.push(created);
        write(list);
        return created;
      },

      async update(id, payload) {
        ensureSeeded();
        const list = read() || [];
        const numericId = Number(id);
        const index = list.findIndex((x) => Number(x.id) === numericId);
        if (index === -1) {
          const err = new Error('Property not found');
          err.status = 404;
          throw err;
        }

        const patch = normalizePayload(payload);
        const existing = list[index];
        const updated = { ...existing, ...patch, id: existing.id };
        list[index] = updated;
        write(list);
        return updated;
      },

      async remove(id) {
        ensureSeeded();
        const list = read() || [];
        const numericId = Number(id);
        const index = list.findIndex((x) => Number(x.id) === numericId);
        if (index === -1) {
          const err = new Error('Property not found');
          err.status = 404;
          throw err;
        }
        const deleted = list.splice(index, 1)[0];
        write(list);
        return deleted;
      }
    };
  }

  function createApiStore() {
    async function request(url, { method = 'GET', body } = {}) {
      const res = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });

      const contentType = res.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

      if (!res.ok) {
        const message = (payload && payload.error && payload.error.message) || res.statusText || 'Request failed';
        const err = new Error(message);
        err.status = res.status;
        err.payload = payload;
        throw err;
      }

      return payload;
    }

    return {
      modeLabel: 'Online (API)',

      async getAll() {
        return request('/api/properties');
      },

      async create(payload) {
        return request('/api/properties', { method: 'POST', body: payload });
      },

      async update(id, payload) {
        return request(`/api/properties/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload });
      },

      async remove(id) {
        return request(`/api/properties/${encodeURIComponent(id)}`, { method: 'DELETE' });
      }
    };
  }

  async function chooseStore() {
    if (window.location && window.location.protocol === 'file:') {
      return createOfflineStore();
    }

    const api = createApiStore();
    try {
      await api.getAll();
      return api;
    } catch (e) {
      return createOfflineStore();
    }
  }

  const AdminPropertiesHandler = {
    store: null,
    properties: [],

    async init() {
      this.store = await chooseStore();
      setStatus(`Mode: ${this.store.modeLabel}`);

      const uploadInput = Dom.galleryUpload();
      if (uploadInput) {
        const offline = String(this.store.modeLabel || '').toLowerCase().includes('offline');
        uploadInput.disabled = offline;
        setGalleryUploadStatus(offline ? 'Uploads require the local server (online mode).' : '');
      }

      const mainUpload = Dom.mainImageUpload();
      if (mainUpload) {
        const offline = String(this.store.modeLabel || '').toLowerCase().includes('offline');
        mainUpload.disabled = offline;
        setMainImageUploadStatus(offline ? 'Uploads require the local server (online mode).' : '');
      }

      await this.refresh();
      this.bindEvents();
      setFormMode({ mode: 'create' });
    },

    bindEvents() {
      const mainImageUpload = Dom.mainImageUpload();
      if (mainImageUpload) {
        mainImageUpload.addEventListener('change', async () => {
          const input = Dom.mainImageUpload();
          const imageField = Dom.image();
          if (!input || !imageField) return;

          const file = input.files && input.files[0] ? input.files[0] : null;
          if (!file) return;

          const oldPath = String(imageField.value || '').trim();
          setMainImageUploadStatus('Uploading 1 file...');
          try {
            const result = await uploadMainImage(file, { deletePath: oldPath });
            if (!result.uploadedPath) {
              setMainImageUploadStatus('Upload failed: no path returned.');
              return;
            }
            imageField.value = result.uploadedPath;
            const deletedNote = result.deleted && result.deleted.length ? ' (replaced previous upload)' : '';
            setMainImageUploadStatus(`Uploaded.${deletedNote}`);
          } catch (e) {
            setMainImageUploadStatus(e.message || 'Upload failed.');
          } finally {
            input.value = '';
          }
        });
      }

      const galleryUpload = Dom.galleryUpload();
      if (galleryUpload) {
        galleryUpload.addEventListener('change', async () => {
          const input = Dom.galleryUpload();
          const textarea = Dom.images();
          if (!input || !textarea) return;

          const files = Array.from(input.files || []);
          if (files.length === 0) return;

          setGalleryUploadStatus(`Uploading ${files.length} file(s)...`);
          try {
            const paths = await uploadGalleryImages(files);
            if (paths.length === 0) {
              setGalleryUploadStatus('No files uploaded.');
              return;
            }

            const existing = String(textarea.value || '');
            const prefix = existing && !existing.endsWith('\n') ? existing + '\n' : existing;
            textarea.value = prefix + paths.join('\n');
            setGalleryUploadStatus(`Uploaded ${paths.length} file(s).`);
          } catch (e) {
            setGalleryUploadStatus(e.message || 'Upload failed.');
          } finally {
            input.value = '';
          }
        });
      }

      const tbody = Dom.tbody();
      if (tbody) {
        tbody.addEventListener('click', async (event) => {
          const btn = event.target && event.target.closest ? event.target.closest('button[data-action]') : null;
          if (!btn) return;

          const tr = btn.closest('tr[data-id]');
          if (!tr) return;
          const id = Number(tr.getAttribute('data-id'));
          if (!Number.isFinite(id)) return;

          const action = btn.getAttribute('data-action');
          if (action === 'edit') {
            const property = this.properties.find((x) => Number(x.id) === id);
            if (property) setFormMode({ mode: 'edit', property });
            return;
          }

          if (action === 'delete') {
            const ok = window.confirm(`Delete property #${id}? This cannot be undone.`);
            if (!ok) return;

            try {
              await this.store.remove(id);
              await this.refresh();
              showSuccess(`Deleted property #${id}.`);
              const currentId = Dom.propertyId().value;
              if (currentId && Number(currentId) === id) setFormMode({ mode: 'create' });
            } catch (e) {
              const globalError = Dom.globalError();
              if (globalError) globalError.textContent = e.message || 'Failed to delete property.';
            }
          }
        });
      }

      const form = Dom.form();
      if (form) {
        form.addEventListener('submit', async (event) => {
          event.preventDefault();

          const validation = validateForm();
          if (!validation.ok) return;

          const saveButton = Dom.saveButton();
          if (saveButton) saveButton.disabled = true;

          try {
            const idRaw = Dom.propertyId().value;
            const isEdit = Boolean(idRaw);

            if (isEdit) {
              const id = Number(idRaw);
              await this.store.update(id, validation.value);
              showSuccess(`Updated property #${id}.`);
            } else {
              const created = await this.store.create(validation.value);
              showSuccess(`Created property #${created.id}.`);
            }

            await this.refresh();
            setFormMode({ mode: 'create' });
          } catch (e) {
            const globalError = Dom.globalError();
            if (globalError) {
              const detail = e && e.payload && e.payload.error && e.payload.error.message ? ` ${e.payload.error.message}` : '';
              globalError.textContent = (e.message || 'Save failed.') + detail;
            }
          } finally {
            if (saveButton) saveButton.disabled = false;
          }
        });
      }

      const reset = Dom.resetButton();
      if (reset) {
        reset.addEventListener('click', () => {
          setFormMode({ mode: 'create' });
        });
      }
    },

    async refresh() {
      try {
        this.properties = await this.store.getAll();
        renderTable(this.properties);
        renderAnalytics(computePropertiesAnalytics(this.properties));
        setStatus(`Mode: ${this.store.modeLabel} — ${this.properties.length} properties`);
      } catch (e) {
        setStatus(`Mode: ${this.store.modeLabel} — failed to load properties`);
        const tbody = Dom.tbody();
        if (tbody) {
          tbody.innerHTML = '<tr><td colspan="7">Failed to load properties.</td></tr>';
        }

        renderAnalytics(null);
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    AdminPropertiesHandler.init();
  });
})();
