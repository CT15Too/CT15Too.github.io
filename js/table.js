var TableRenderer = (function() {

  var PREWED_COLS = [
    { key: 'vendor',       label: 'Vendor' },
    { key: 'package',      label: 'Package' },
    { key: 'locations',    label: 'Location' },
    { key: 'price',        label: 'Price' },
    { key: 'duration_hrs', label: 'Duration' },
    { key: 'photographers',label: 'Photo' },
    { key: 'videographers',label: 'Video' },
    { key: 'edited_photos',label: 'Edited Photos' },
    { key: 'raw_files',    label: 'Raw Files' },
    { key: 'video_notes',  label: 'Video Deliverables' },
    { key: 'drone',        label: 'Drone' },
    { key: 'mua',          label: 'MUA' },
    { key: 'stylist',      label: 'Stylist' },
    { key: 'crew',         label: 'Crew Costs' },
    { key: 'flags',        label: '⚠️' },
    { key: 'add',          label: '' }
  ];

  var WEDDING_COLS = [
    { key: 'vendor',       label: 'Vendor' },
    { key: 'package',      label: 'Package' },
    { key: 'locations',    label: 'Location' },
    { key: 'price',        label: 'Price' },
    { key: 'duration_hrs', label: 'Duration' },
    { key: 'photographers',label: 'Photo' },
    { key: 'videographers',label: 'Video' },
    { key: 'edited_photos',label: 'Edited Photos' },
    { key: 'raw_files',    label: 'Raw Files' },
    { key: 'video_notes',  label: 'Video Deliverables' },
    { key: 'video_sde',    label: 'SDE' },
    { key: 'drone',        label: 'Drone' },
    { key: 'album',        label: 'Album' },
    { key: 'crew',         label: 'Crew Costs' },
    { key: 'flags',        label: '⚠️' },
    { key: 'add',          label: '' }
  ];

  var BUNDLE_COLS = [
    { key: 'vendor',        label: 'Vendor' },
    { key: 'package',       label: 'Package' },
    { key: 'locations',     label: 'Location' },
    { key: 'price',         label: 'Total Price' },
    { key: 'savings',       label: 'Savings' },
    { key: 'pw_duration',   label: 'Prewed Hrs' },
    { key: 'wd_duration',   label: 'Wedding Hrs' },
    { key: 'total_photos',  label: 'Total Photos' },
    { key: 'pw_video',      label: 'Prewed Video' },
    { key: 'wd_video',      label: 'Wedding Video' },
    { key: 'mua',           label: 'MUA' },
    { key: 'drone',         label: 'Drone' },
    { key: 'album',         label: 'Album' },
    { key: 'flags',         label: '⚠️' },
    { key: 'add',           label: '' }
  ];

  function yes() { return '<span class="cell-check-yes" title="Included">✓</span>'; }
  function no() { return '<span class="cell-check-no" title="Not included">✗</span>'; }
  function bool(val) { return val ? yes() : no(); }

  function locationChips(locs) {
    if (!locs || locs.length === 0) return '<span class="cell-text-muted">—</span>';
    return '<div class="cell-location">' + locs.map(function(l) {
      return '<span class="loc-chip">' + l + '</span>';
    }).join('') + '</div>';
  }

  function crewCosts(pkg) {
    var parts = [];
    if (pkg.crew_transport_included) parts.push('Transport ✓');
    else parts.push('Transport ✗');
    if (pkg.crew_accommodation_included) parts.push('Accom ✓');
    else parts.push('Accom ✗');
    return '<span style="font-size:11px;color:#6b7280">' + parts.join(' · ') + '</span>';
  }

  function flagCell(flags) {
    if (!flags || flags.length === 0) return '';
    return flags.map(function(f) {
      return '<span class="flag-icon" title="' + AppData.flagTooltip(f) + '">⚠️</span>';
    }).join(' ');
  }

  function renderCell(col, pkg, type) {
    switch(col.key) {
      case 'vendor':
        return '<td class="cell-vendor">' + pkg.vendor + '</td>';
      case 'package':
        return '<td class="cell-package">' + pkg.package + '</td>';
      case 'locations':
        return '<td>' + locationChips(pkg.locations) + '</td>';
      case 'price':
        return '<td class="cell-price">' + AppData.formatPrice(pkg.price) + '</td>';
      case 'savings':
        return '<td class="cell-savings">' + (pkg.savings ? 'Save ' + AppData.formatPrice(pkg.savings) : '—') + '</td>';
      case 'duration_hrs':
        return '<td>' + (pkg.duration_hrs ? pkg.duration_hrs + ' hrs' : '—') + '</td>';
      case 'photographers':
        return '<td>' + (pkg.photographers != null ? pkg.photographers : '—') + '</td>';
      case 'videographers':
        return '<td>' + (pkg.videographers != null ? pkg.videographers : '—') + '</td>';
      case 'edited_photos':
        return '<td>' + (pkg.edited_photos != null ? pkg.edited_photos : '—') + '</td>';
      case 'raw_files':
        return '<td>' + bool(pkg.raw_files) + '</td>';
      case 'video_notes':
        return '<td style="font-size:12px;max-width:180px">' + (pkg.video_notes || '—') + '</td>';
      case 'video_sde':
        return '<td>' + bool(pkg.video_sde) + '</td>';
      case 'drone':
        return '<td>' + bool(pkg.drone) + '</td>';
      case 'mua':
        return '<td>' + bool(pkg.mua) + '</td>';
      case 'stylist':
        return '<td>' + bool(pkg.stylist) + '</td>';
      case 'album':
        return '<td style="font-size:12px">' + (pkg.album || no()) + '</td>';
      case 'crew':
        return '<td>' + crewCosts(pkg) + '</td>';
      case 'flags':
        return '<td>' + flagCell(pkg.attention_flags) + '</td>';
      // Bundle-specific
      case 'pw_duration':
        return '<td>' + (pkg.prewedding && pkg.prewedding.duration_hrs ? pkg.prewedding.duration_hrs + ' hrs' : '—') + '</td>';
      case 'wd_duration':
        return '<td>' + (pkg.wedding && pkg.wedding.duration_hrs ? pkg.wedding.duration_hrs + ' hrs' : '—') + '</td>';
      case 'total_photos':
        var tp = ((pkg.prewedding && pkg.prewedding.edited_photos) || 0) + ((pkg.wedding && pkg.wedding.edited_photos) || 0);
        return '<td>' + (tp || '—') + '</td>';
      case 'pw_video':
        return '<td style="font-size:12px">' + (pkg.prewedding && pkg.prewedding.video_notes ? pkg.prewedding.video_notes : '—') + '</td>';
      case 'wd_video':
        return '<td style="font-size:12px">' + (pkg.wedding && pkg.wedding.video_notes ? pkg.wedding.video_notes : '—') + '</td>';
      case 'add':
        var slot = type === 'bundle' ? 'bundle' : type;
        return '<td><button class="btn-add" data-id="' + pkg.id + '" data-slot="' + slot + '" onclick="TrayManager.handleAdd(this)">+ Add</button></td>';
      default:
        return '<td>—</td>';
    }
  }

  function renderBundleMUA(pkg) {
    var v = (pkg.prewedding && pkg.prewedding.mua) || (pkg.wedding && pkg.wedding.mua);
    return '<td>' + bool(v) + '</td>';
  }
  function renderBundleDrone(pkg) {
    var v = (pkg.prewedding && pkg.prewedding.drone) || (pkg.wedding && pkg.wedding.drone);
    return '<td>' + bool(v) + '</td>';
  }
  function renderBundleAlbum(pkg) {
    var v = (pkg.wedding && pkg.wedding.album) || (pkg.prewedding && pkg.prewedding.album);
    return '<td style="font-size:12px">' + (v || no()) + '</td>';
  }

  function render(packages, type) {
    var cols = type === 'prewedding' ? PREWED_COLS : type === 'wedding' ? WEDDING_COLS : BUNDLE_COLS;
    var thead = document.getElementById('tableHead');
    var tbody = document.getElementById('tableBody');

    thead.innerHTML = '<tr>' + cols.map(function(c) {
      return '<th>' + c.label + '</th>';
    }).join('') + '</tr>';

    if (packages.length === 0) {
      tbody.innerHTML = '<tr><td colspan="' + cols.length + '" style="text-align:center;padding:32px;color:#6b7280">No packages match your filters.</td></tr>';
      return;
    }

    tbody.innerHTML = packages.map(function(pkg) {
      return '<tr>' + cols.map(function(col) {
        if (col.key === 'mua' && type === 'bundle') return renderBundleMUA(pkg);
        if (col.key === 'drone' && type === 'bundle') return renderBundleDrone(pkg);
        if (col.key === 'album' && type === 'bundle') return renderBundleAlbum(pkg);
        return renderCell(col, pkg, type);
      }).join('') + '</tr>';
    }).join('');
  }

  return { render: render };
})();
