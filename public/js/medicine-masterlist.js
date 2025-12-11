console.log('medicine-masterlist.js loaded');

let allMedicines = [];
let currentSort = { field: null, asc: true };

function sortMedicines(field) {
  if (currentSort.field === field) {
    currentSort.asc = !currentSort.asc; 
  } else {
    currentSort.field = field;
    currentSort.asc = true;
  }

  const sorted = [...allMedicines].sort((a, b) => {
    let valA = a[field];
    let valB = b[field];

    if (!isNaN(valA) && !isNaN(valB)) {
      valA = Number(valA);
      valB = Number(valB);
      return currentSort.asc ? valA - valB : valB - valA;
    }

    return currentSort.asc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  renderMedicines(sorted);


  document.querySelectorAll('th[data-sort]').forEach(th => {
    const icon = th.querySelector('.sort-icon');
    if (!icon) return;
    if (th.getAttribute('data-sort') === field) {
      icon.textContent = currentSort.asc ? '▲' : '▼';
      console.log('Updated icon for', field, 'to', icon.textContent);
    } else {
      icon.textContent = '';
    }
  });
}

async function safeFetchJSON(url) {
  const u = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;
  const res = await fetch(u, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
  const text = await res.text();
  if (text.startsWith('<!DOCTYPE')) {
    window.location.href = '/login';
    return [];
  }
  return JSON.parse(text);
}

function renderMedicines(medicines) {
  const tbody = document.getElementById('medicineTbody');
  if (!tbody) {
    console.warn('No #medicineTbody found');
    return;
  }

  tbody.innerHTML = medicines.map(med => `
    <tr>
      <td>${med.id}</td>
      <td>${med.name}</td>
      <td>${med.brand}</td>
      <td>${med.category}</td>
      <td>${med.dosage}</td>
      <td>${med.form}</td>
      <td>${med.price}</td>
    </tr>
  `).join('');
}


async function loadMedicines() {
  try {
    const medicines = await safeFetchJSON('/api/medicines');
    console.log('Fetched medicines count:', Array.isArray(medicines) ? medicines.length : 'not an array', medicines);
    allMedicines = Array.isArray(medicines) ? medicines : [];
    renderMedicines(allMedicines);
  } catch (err) {
    console.error('Failed to load medicines:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput') || document.querySelector('.search-bar');
  const tbody = document.getElementById('medicineTbody');
  console.log('DOM ready. searchInput:', !!searchInput, 'tbody:', !!tbody);

  loadMedicines();

  if (!searchInput) {
    console.error('Search input not found. Ensure id="searchInput" is on the input.');
    return;
  }

  const onSearch = e => {
    const keyword = (e.target.value || '').toLowerCase().trim();
    console.log('Search triggered:', keyword);

    if (!Array.isArray(allMedicines) || allMedicines.length === 0) {
      console.warn('No medicines loaded yet; rendering empty list');
      renderMedicines([]);
      return;
    }

    const filtered = keyword
      ? allMedicines.filter(med => {
          const searchable = [
            med.id,
            med.name,
            med.brand,
            med.category,
            med.form,
            med.dosage,
            med.price 
          ].join(' ').toLowerCase();
          console.log('Searchable string:', searchable);

          return searchable.includes(keyword);
        })
      : allMedicines;

    renderMedicines(filtered);
  };

  searchInput.addEventListener('input', onSearch);
  searchInput.addEventListener('keyup', onSearch);

  // Sorting listeners
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => {
      const field = th.getAttribute('data-sort');
      console.log('Header clicked:', field); 
      sortMedicines(field);
    });
  });
});
