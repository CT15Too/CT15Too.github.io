var CompareModal = (function() {

  function open(combos) {
    var ready = combos.filter(function(c) {
      return c.bundle || c.prewed || c.wedding;
    });
    if (ready.length === 0) return;

    var body = document.getElementById('modalBody');
    body.innerHTML = renderGrid(ready);
    document.getElementById('modalOverlay').hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function close() {
    document.getElementById('modalOverlay').hidden = true;
    document.body.style.overflow = '';
  }

  function numericValues(combos, getter) {
    return combos.map(function(c) { return getter(c); });
  }

  function bestIdx(vals) {
    var max = Math.max.apply(null, vals.filter(function(v) { return v !== null && v !== undefined; }));
    return vals.indexOf(max);
  }
  function worstIdx(vals) {
    var min = Math.min.apply(null, vals.filter(function(v) { return v !== null && v !== undefined; }));
    return vals.indexOf(min);
  }

  function makeRow(label, combos, getter, isHigher, isPrice) {
    var vals = combos.map(getter);
    var numVals = vals.map(function(v) { return typeof v === 'number' ? v : null; });
    var hasNums = numVals.some(function(v) { return v !== null; });

    var best = -1, worst = -1;
    if (hasNums && combos.length > 1) {
      if (isHigher) {
        best = bestIdx(numVals);
        worst = worstIdx(numVals);
      } else {
        best = worstIdx(numVals); // lower is better (e.g. price)
        worst = bestIdx(numVals);
      }
    }

    var html = '<div class="grid-row-label">' + label + '</div>';
    combos.forEach(function(c, i) {
      var v = vals[i];
      var display = v === null || v === undefined ? '<span class="na">—</span>' : v;
      if (isPrice && typeof v === 'number') display = AppData.formatPrice(v);
      var cls = 'grid-cell';
      if (i === best && best !== worst) cls += ' best';
      else if (i === worst && best !== worst) cls += ' worst';
      html += '<div class="' + cls + '">' + display + '</div>';
    });
    return html;
  }

  function makeBoolRow(label, combos, getter) {
    var html = '<div class="grid-row-label">' + label + '</div>';
    combos.forEach(function(c) {
      var v = getter(c);
      html += '<div class="grid-cell">' + (v ? '<span style="color:#16a34a;font-size:18px">✓</span>' : '<span style="color:#d1d5db;font-size:18px">✗</span>') + '</div>';
    });
    return html;
  }

  function makeTextRow(label, combos, getter) {
    var html = '<div class="grid-row-label">' + label + '</div>';
    combos.forEach(function(c) {
      var v = getter(c);
      html += '<div class="grid-cell" style="font-size:12px;text-align:left">' + (v || '—') + '</div>';
    });
    return html;
  }

  function sectionHeader(label, span) {
    var html = '<div class="grid-section-label" style="grid-column:1">' + label + '</div>';
    for (var i = 0; i < span; i++) html += '<div class="grid-section-label"></div>';
    return html;
  }

  function vendorLabel(combo) {
    if (combo.bundle) return combo.bundle.vendor;
    var parts = [];
    if (combo.prewed) parts.push(combo.prewed.vendor + ' (prewed)');
    if (combo.wedding) parts.push(combo.wedding.vendor + ' (wedding)');
    return parts.join(' + ') || '—';
  }

  function renderGrid(combos) {
    var count = combos.length;
    var html = '<div class="comparison-grid" data-combos="' + count + '">';

    // Header row
    html += '<div class="grid-header-blank"></div>';
    combos.forEach(function(c, i) {
      var total = TrayManager.getTotalPrice(c);
      html += '<div class="grid-combo-header">';
      html += '<div class="combo-title">Combo ' + (i + 1) + '</div>';
      html += '<div class="combo-vendors">' + vendorLabel(c) + '</div>';
      if (total) html += '<div class="combo-price-total">' + AppData.formatPrice(total) + '</div>';
      html += '</div>';
    });

    // === PRICING ===
    html += sectionHeader('Pricing', count);
    html += makeRow('Total Price', combos, function(c) { return TrayManager.getTotalPrice(c); }, false, true);
    html += makeRow('Prewed Price', combos, function(c) { return c.bundle ? null : (c.prewed ? c.prewed.price : null); }, false, true);
    html += makeRow('Wedding Price', combos, function(c) { return c.bundle ? null : (c.wedding ? c.wedding.price : null); }, false, true);
    html += makeRow('Savings (bundle)', combos, function(c) { return c.bundle && c.bundle.savings ? AppData.formatPrice(c.bundle.savings) : null; }, true, false);

    // === PREWEDDING ===
    html += sectionHeader('Prewedding', count);
    html += makeTextRow('Vendor', combos, function(c) { return c.bundle ? c.bundle.vendor + ' (bundle)' : (c.prewed ? c.prewed.vendor : '—'); });
    html += makeTextRow('Package', combos, function(c) { return c.bundle ? c.bundle.package : (c.prewed ? c.prewed.package : '—'); });
    html += makeRow('Duration', combos, function(c) {
      var p = c.bundle ? c.bundle.prewedding : c.prewed;
      return p && p.duration_hrs ? p.duration_hrs : null;
    }, true, false);
    html += makeRow('Photographers', combos, function(c) {
      var p = c.bundle ? c.bundle.prewedding : c.prewed;
      return p ? p.photographers : null;
    }, true, false);
    html += makeRow('Videographers', combos, function(c) {
      var p = c.bundle ? c.bundle.prewedding : c.prewed;
      return p ? p.videographers : null;
    }, true, false);
    html += makeRow('Edited Photos', combos, function(c) {
      var p = c.bundle ? c.bundle.prewedding : c.prewed;
      return p ? p.edited_photos : null;
    }, true, false);
    html += makeBoolRow('Raw Photos', combos, function(c) {
      var p = c.bundle ? c.bundle.prewedding : c.prewed;
      return p && p.raw_photos;
    });
    html += makeBoolRow('Raw Video', combos, function(c) {
      var p = c.bundle ? c.bundle.prewedding : c.prewed;
      return p && p.raw_video;
    });
    html += makeTextRow('Video', combos, function(c) {
      var p = c.bundle ? c.bundle.prewedding : c.prewed;
      return p ? p.video_notes : null;
    });
    html += makeBoolRow('Drone', combos, function(c) {
      var p = c.bundle ? c.bundle.prewedding : c.prewed;
      return p && p.drone;
    });
    html += makeBoolRow('MUA', combos, function(c) {
      var p = c.bundle ? c.bundle.prewedding : c.prewed;
      return p && p.mua;
    });

    // === WEDDING DAY ===
    html += sectionHeader('Wedding Day', count);
    html += makeTextRow('Vendor', combos, function(c) { return c.bundle ? c.bundle.vendor + ' (bundle)' : (c.wedding ? c.wedding.vendor : '—'); });
    html += makeTextRow('Package', combos, function(c) { return c.bundle ? c.bundle.package : (c.wedding ? c.wedding.package : '—'); });
    html += makeRow('Duration', combos, function(c) {
      var w = c.bundle ? c.bundle.wedding : c.wedding;
      return w && w.duration_hrs ? w.duration_hrs : null;
    }, true, false);
    html += makeRow('Photographers', combos, function(c) {
      var w = c.bundle ? c.bundle.wedding : c.wedding;
      return w ? w.photographers : null;
    }, true, false);
    html += makeRow('Videographers', combos, function(c) {
      var w = c.bundle ? c.bundle.wedding : c.wedding;
      return w ? w.videographers : null;
    }, true, false);
    html += makeRow('Edited Photos', combos, function(c) {
      var w = c.bundle ? c.bundle.wedding : c.wedding;
      return w ? w.edited_photos : null;
    }, true, false);
    html += makeBoolRow('Raw Photos', combos, function(c) {
      var w = c.bundle ? c.bundle.wedding : c.wedding;
      return w && w.raw_photos;
    });
    html += makeBoolRow('Raw Video', combos, function(c) {
      var w = c.bundle ? c.bundle.wedding : c.wedding;
      return w && w.raw_video;
    });
    html += makeTextRow('Video', combos, function(c) {
      var w = c.bundle ? c.bundle.wedding : c.wedding;
      return w ? w.video_notes : null;
    });
    html += makeBoolRow('SDE', combos, function(c) {
      var w = c.bundle ? c.bundle.wedding : c.wedding;
      return w && w.video_sde;
    });
    html += makeBoolRow('Drone', combos, function(c) {
      var w = c.bundle ? c.bundle.wedding : c.wedding;
      return w && w.drone;
    });
    html += makeTextRow('Album', combos, function(c) {
      var w = c.bundle ? c.bundle.wedding : c.wedding;
      return w ? w.album : null;
    });

    // === COMBINED TOTALS ===
    html += sectionHeader('Combined Totals', count);
    html += makeRow('Total Edited Photos', combos, function(c) {
      var pw = c.bundle ? (c.bundle.prewedding && c.bundle.prewedding.edited_photos || 0) : (c.prewed ? c.prewed.edited_photos || 0 : 0);
      var wd = c.bundle ? (c.bundle.wedding && c.bundle.wedding.edited_photos || 0) : (c.wedding ? c.wedding.edited_photos || 0 : 0);
      return pw + wd || null;
    }, true, false);

    // === LOGISTICS ===
    html += sectionHeader('Logistics', count);
    html += makeBoolRow('Crew Transport Incl.', combos, function(c) {
      if (c.bundle) return c.bundle.prewedding && c.bundle.prewedding.crew_transport_included;
      return (c.prewed && c.prewed.crew_transport_included) || (c.wedding && c.wedding.crew_transport_included);
    });
    html += makeBoolRow('Crew Accom. Incl.', combos, function(c) {
      if (c.bundle) return c.bundle.prewedding && c.bundle.prewedding.crew_accommodation_included;
      return (c.prewed && c.prewed.crew_accommodation_included) || (c.wedding && c.wedding.crew_accommodation_included);
    });

    // === FLAGS & NOTES ===
    html += sectionHeader('Flags & Notes', count);
    html += makeTextRow('⚠️ Attention', combos, function(c) {
      var flags = [];
      if (c.bundle && c.bundle.attention_flags) flags = flags.concat(c.bundle.attention_flags);
      if (c.prewed && c.prewed.attention_flags) flags = flags.concat(c.prewed.attention_flags);
      if (c.wedding && c.wedding.attention_flags) flags = flags.concat(c.wedding.attention_flags);
      return flags.length ? flags.map(AppData.flagTooltip).join('; ') : 'None';
    });
    html += makeTextRow('Notes', combos, function(c) {
      var parts = [];
      if (c.bundle && c.bundle.notes) parts.push(c.bundle.notes);
      if (c.prewed && c.prewed.notes) parts.push('[Prewed] ' + c.prewed.notes);
      if (c.wedding && c.wedding.notes) parts.push('[Wedding] ' + c.wedding.notes);
      return parts.join(' | ') || '—';
    });

    html += '</div>'; // end grid
    return html;
  }

  return { open: open, close: close };
})();
