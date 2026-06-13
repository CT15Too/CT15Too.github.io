var TrayManager = (function() {
  var MAX_COMBOS = 3;
  // Each combo: { prewed: pkg|null, wedding: pkg|null, bundle: pkg|null }
  var combos = [{ prewed: null, wedding: null, bundle: null }];
  var activeComboIndex = 0;
  var _packages = [];

  function init(packages) {
    _packages = packages;
    render();
  }

  function setPackages(packages) {
    _packages = packages;
  }

  function findPkg(id) {
    return _packages.find(function(p) { return p.id === id; });
  }

  function handleAdd(btn) {
    var id = btn.getAttribute('data-id');
    var slot = btn.getAttribute('data-slot'); // 'prewedding' | 'wedding' | 'bundle'
    var pkg = findPkg(id);
    if (!pkg) return;

    var combo = combos[activeComboIndex];
    if (slot === 'bundle') {
      combo.bundle = pkg;
      combo.prewed = null;
      combo.wedding = null;
    } else if (slot === 'prewedding') {
      combo.prewed = pkg;
      combo.bundle = null;
    } else if (slot === 'wedding') {
      combo.wedding = pkg;
      combo.bundle = null;
    }
    render();
    updateAddButtons();
  }

  function removeFromCombo(comboIdx, slot) {
    var combo = combos[comboIdx];
    if (!combo) return;
    combo[slot] = null;
    render();
    updateAddButtons();
  }

  function removeCombo(comboIdx) {
    combos.splice(comboIdx, 1);
    if (combos.length === 0) combos = [{ prewed: null, wedding: null, bundle: null }];
    if (activeComboIndex >= combos.length) activeComboIndex = combos.length - 1;
    render();
    updateAddButtons();
  }

  function addCombo() {
    if (combos.length >= MAX_COMBOS) return;
    combos.push({ prewed: null, wedding: null, bundle: null });
    activeComboIndex = combos.length - 1;
    render();
  }

  function clearAll() {
    combos = [{ prewed: null, wedding: null, bundle: null }];
    activeComboIndex = 0;
    render();
    updateAddButtons();
  }

  function getTotalPrice(combo) {
    if (combo.bundle) return combo.bundle.price;
    var p = (combo.prewed ? combo.prewed.price : 0) + (combo.wedding ? combo.wedding.price : 0);
    return p;
  }

  function isComboReady(combo) {
    return combo.bundle || (combo.prewed && combo.wedding) || combo.prewed || combo.wedding;
  }

  function hasAnyReadyCombo() {
    return combos.some(isComboReady);
  }

  function pkgSummary(pkg, role) {
    if (!pkg) return '<span class="combo-empty">No ' + role + ' selected</span>';
    return '<div class="combo-pkg"><span class="combo-pkg-vendor">' + pkg.vendor + '</span><span class="combo-pkg-name">' + pkg.package + '</span></div>';
  }

  function render() {
    var container = document.getElementById('trayCombos');
    var compareBtn = document.getElementById('compareNowBtn');
    var addBtn = document.getElementById('addComboBtn');

    container.innerHTML = combos.map(function(combo, i) {
      var isActive = i === activeComboIndex;
      var total = getTotalPrice(combo);
      var html = '<div class="combo-slot' + (isActive ? ' active' : '') + '" onclick="TrayManager.setActive(' + i + ')">';
      html += '<div style="display:flex;flex-direction:column;gap:6px;flex:1">';
      html += '<span class="combo-slot-label">Combo ' + (i + 1) + (isActive ? ' (active)' : '') + '</span>';

      if (combo.bundle) {
        html += pkgSummary(combo.bundle, 'bundle') + '<span style="font-size:11px;color:#16a34a">Bundle ✓</span>';
      } else {
        html += '<div style="display:flex;gap:8px;align-items:center">';
        html += pkgSummary(combo.prewed, 'prewedding');
        html += '<span class="combo-divider">+</span>';
        html += pkgSummary(combo.wedding, 'wedding day');
        html += '</div>';
      }

      html += '</div>';
      if (total > 0) html += '<span class="combo-total">' + AppData.formatPrice(total) + '</span>';
      if (combos.length > 1) html += '<button class="combo-remove" onclick="event.stopPropagation();TrayManager.removeCombo(' + i + ')">✕</button>';
      html += '</div>';
      return html;
    }).join('');

    compareBtn.disabled = !hasAnyReadyCombo();
    addBtn.disabled = combos.length >= MAX_COMBOS;
  }

  function setActive(i) {
    activeComboIndex = i;
    render();
  }

  function updateAddButtons() {
    // Visual feedback: mark buttons as "added" if pkg is in tray
    var addedIds = {};
    combos.forEach(function(c) {
      if (c.prewed) addedIds[c.prewed.id] = true;
      if (c.wedding) addedIds[c.wedding.id] = true;
      if (c.bundle) addedIds[c.bundle.id] = true;
    });
    document.querySelectorAll('.btn-add').forEach(function(btn) {
      var id = btn.getAttribute('data-id');
      btn.classList.toggle('added', !!addedIds[id]);
      btn.textContent = addedIds[id] ? '✓ Added' : '+ Add';
    });
  }

  function getCombos() { return combos; }

  return {
    init: init,
    setPackages: setPackages,
    handleAdd: handleAdd,
    removeFromCombo: removeFromCombo,
    removeCombo: removeCombo,
    addCombo: addCombo,
    clearAll: clearAll,
    setActive: setActive,
    getCombos: getCombos,
    getTotalPrice: getTotalPrice
  };
})();
