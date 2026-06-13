(function() {
  var currentTab = 'prewedding';
  var currentFilters = {
    location: 'all',
    maxPrice: 110000000,
    media: 'all',
    mua: false,
    drone: false,
    album: false,
    raw: false,
    hideFlags: false,
    minPhotos: 0
  };
  var currentSort = 'price-asc';
  var allPackages = [];

  function refresh() {
    var packages = AppData.getPackages(currentTab, currentFilters, currentSort);
    TableRenderer.render(packages, currentTab);
    TrayManager.setPackages(allPackages);

    var count = document.getElementById('resultCount');
    count.textContent = packages.length + ' package' + (packages.length !== 1 ? 's' : '') + ' shown';

    // Re-apply added state
    document.querySelectorAll('.btn-add').forEach(function(btn) {
      btn.classList.remove('added');
      btn.textContent = '+ Add';
    });
    // Highlight if already in tray
    var addedIds = {};
    TrayManager.getCombos().forEach(function(c) {
      if (c.prewed) addedIds[c.prewed.id] = true;
      if (c.wedding) addedIds[c.wedding.id] = true;
      if (c.bundle) addedIds[c.bundle.id] = true;
    });
    document.querySelectorAll('.btn-add').forEach(function(btn) {
      var id = btn.getAttribute('data-id');
      if (addedIds[id]) {
        btn.classList.add('added');
        btn.textContent = '✓ Added';
      }
    });
  }

  function bindEvents() {
    // Tabs
    document.querySelectorAll('.tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        currentTab = tab.getAttribute('data-tab');
        refresh();
      });
    });

    // Location chips
    document.querySelectorAll('#locationChips .chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        document.querySelectorAll('#locationChips .chip').forEach(function(c) { c.classList.remove('active'); });
        chip.classList.add('active');
        currentFilters.location = chip.getAttribute('data-location');
        refresh();
      });
    });

    // Media chips
    document.querySelectorAll('#mediaChips .chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        document.querySelectorAll('#mediaChips .chip').forEach(function(c) { c.classList.remove('active'); });
        chip.classList.add('active');
        currentFilters.media = chip.getAttribute('data-media');
        refresh();
      });
    });

    // Price range
    var priceRange = document.getElementById('priceRange');
    var priceDisplay = document.getElementById('priceDisplay');
    priceRange.addEventListener('input', function() {
      var val = parseInt(this.value);
      currentFilters.maxPrice = val;
      priceDisplay.textContent = val >= 110000000 ? 'Any' : AppData.formatPrice(val);
      refresh();
    });

    // Toggles
    document.getElementById('filterMUA').addEventListener('change', function() { currentFilters.mua = this.checked; refresh(); });
    document.getElementById('filterDrone').addEventListener('change', function() { currentFilters.drone = this.checked; refresh(); });
    document.getElementById('filterAlbum').addEventListener('change', function() { currentFilters.album = this.checked; refresh(); });
    document.getElementById('filterRaw').addEventListener('change', function() { currentFilters.raw = this.checked; refresh(); });
    document.getElementById('filterHideFlags').addEventListener('change', function() { currentFilters.hideFlags = this.checked; refresh(); });

    // Min photos
    document.getElementById('minPhotos').addEventListener('input', function() {
      currentFilters.minPhotos = parseInt(this.value) || 0;
      refresh();
    });

    // Sort
    document.getElementById('sortBy').addEventListener('change', function() {
      currentSort = this.value;
      refresh();
    });

    // Clear filters
    document.getElementById('clearFilters').addEventListener('click', function() {
      currentFilters = { location: 'all', maxPrice: 110000000, media: 'all', mua: false, drone: false, album: false, raw: false, hideFlags: false, minPhotos: 0 };
      currentSort = 'price-asc';
      document.getElementById('priceRange').value = 110000000;
      document.getElementById('priceDisplay').textContent = 'Any';
      document.getElementById('minPhotos').value = '';
      document.getElementById('sortBy').value = 'price-asc';
      document.querySelectorAll('#locationChips .chip').forEach(function(c, i) { c.classList.toggle('active', i === 0); });
      document.querySelectorAll('#mediaChips .chip').forEach(function(c, i) { c.classList.toggle('active', i === 0); });
      ['filterMUA','filterDrone','filterAlbum','filterRaw','filterHideFlags'].forEach(function(id) { document.getElementById(id).checked = false; });
      refresh();
    });

    // Tray buttons
    document.getElementById('addComboBtn').addEventListener('click', function() {
      TrayManager.addCombo();
    });
    document.getElementById('clearTrayBtn').addEventListener('click', function() {
      TrayManager.clearAll();
      refresh();
    });
    document.getElementById('compareNowBtn').addEventListener('click', function() {
      CompareModal.open(TrayManager.getCombos());
    });

    // Modal close
    document.getElementById('modalClose').addEventListener('click', CompareModal.close);
    document.getElementById('modalOverlay').addEventListener('click', function(e) {
      if (e.target === this) CompareModal.close();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') CompareModal.close();
    });
  }

  // Init
  document.addEventListener('DOMContentLoaded', function() {
    AppData.load().then(function() {
      allPackages = AppData.getPackages('prewedding', {}, 'price-asc')
        .concat(AppData.getPackages('wedding', {}, 'price-asc'))
        .concat(AppData.getPackages('bundle', {}, 'price-asc'));
      TrayManager.init(allPackages);
      refresh();
      bindEvents();
    }).catch(function(err) {
      document.getElementById('tableBody').innerHTML =
        '<tr><td colspan="16" style="text-align:center;padding:32px;color:#ef4444">Failed to load vendor data: ' + err.message + '</td></tr>';
    });
  });
})();
