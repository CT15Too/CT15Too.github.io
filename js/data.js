var AppData = (function() {
  var _packages = [];
  var _addons = {};

  function load() {
    return fetch('data/vendors.json')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        _packages = d.packages;
        _addons = d.addons || {};
      });
  }

  // Determine media type of a package
  function mediaType(pkg) {
    var hasCam = pkg.photographers > 0;
    var hasVid = pkg.videographers > 0;
    if (pkg.type === 'bundle') {
      hasCam = (pkg.prewedding && pkg.prewedding.photographers > 0) || (pkg.wedding && pkg.wedding.photographers > 0);
      hasVid = (pkg.prewedding && pkg.prewedding.videographers > 0) || (pkg.wedding && pkg.wedding.videographers > 0);
    }
    if (hasCam && hasVid) return 'combo';
    if (hasCam) return 'photo';
    if (hasVid) return 'video';
    return 'combo';
  }

  function hasLocation(pkg, loc) {
    if (!loc || loc === 'all') return true;
    if (!pkg.locations || pkg.locations.length === 0) return true;
    return pkg.locations.some(function(l) {
      return l.toLowerCase().indexOf(loc.toLowerCase()) !== -1;
    });
  }

  function getPackages(type, filters, sortBy) {
    var result = _packages.filter(function(pkg) {
      if (pkg.type !== type) return false;

      // Location
      if (filters.location && filters.location !== 'all') {
        if (!hasLocation(pkg, filters.location)) return false;
      }

      // Max price
      if (filters.maxPrice && pkg.price > filters.maxPrice) return false;

      // Media type
      if (filters.media && filters.media !== 'all') {
        if (mediaType(pkg) !== filters.media) return false;
      }

      // MUA
      if (filters.mua) {
        var mua = pkg.mua || (pkg.prewedding && pkg.prewedding.mua);
        if (!mua) return false;
      }

      // Drone
      if (filters.drone) {
        var drone = pkg.drone || (pkg.prewedding && pkg.prewedding.drone) || (pkg.wedding && pkg.wedding.drone);
        if (!drone) return false;
      }

      // Album
      if (filters.album) {
        var album = pkg.album || (pkg.wedding && pkg.wedding.album) || (pkg.prewedding && pkg.prewedding.album);
        if (!album) return false;
      }

      // Raw files
      if (filters.raw) {
        var raw = pkg.raw_photos || pkg.raw_video ||
          (pkg.prewedding && (pkg.prewedding.raw_photos || pkg.prewedding.raw_video)) ||
          (pkg.wedding && (pkg.wedding.raw_photos || pkg.wedding.raw_video));
        if (!raw) return false;
      }

      // Min photos
      if (filters.minPhotos && filters.minPhotos > 0) {
        var photos = pkg.edited_photos;
        if (pkg.type === 'bundle') {
          photos = ((pkg.prewedding && pkg.prewedding.edited_photos) || 0) + ((pkg.wedding && pkg.wedding.edited_photos) || 0);
        }
        if (!photos || photos < filters.minPhotos) return false;
      }

      // Hide flags
      if (filters.hideFlags && pkg.attention_flags && pkg.attention_flags.length > 0) return false;

      return true;
    });

    // Sort
    result.sort(function(a, b) {
      switch(sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'photos-desc':
          var pa = a.edited_photos || (a.prewedding ? (a.prewedding.edited_photos||0) : 0) + (a.wedding ? (a.wedding.edited_photos||0) : 0);
          var pb = b.edited_photos || (b.prewedding ? (b.prewedding.edited_photos||0) : 0) + (b.wedding ? (b.wedding.edited_photos||0) : 0);
          return pb - pa;
        case 'duration-desc':
          var da = a.duration_hrs || (a.prewedding ? (a.prewedding.duration_hrs||0) : 0) + (a.wedding ? (a.wedding.duration_hrs||0) : 0);
          var db = b.duration_hrs || (b.prewedding ? (b.prewedding.duration_hrs||0) : 0) + (b.wedding ? (b.wedding.duration_hrs||0) : 0);
          return db - da;
        case 'vendor-asc': return a.vendor.localeCompare(b.vendor);
        default: return a.price - b.price;
      }
    });

    return result;
  }

  function formatPrice(amount) {
    if (!amount) return '—';
    return 'IDR ' + amount.toLocaleString('id-ID');
  }

  function flagTooltip(flag) {
    var map = {
      'price_list_possibly_outdated': 'Price list may be outdated (2023/2025)',
      'promo_may_be_expired': 'Promotional price may have expired (Feb 2026)',
      'limited_offer': 'Limited-time offer — verify availability',
      'open_trip_dates_passed': 'Open trip dates have passed — check for new dates',
      'missing_wedding_package': 'Wedding day packages not shown — contact vendor',
      'wedding_only_verify_prewedding_price': 'Verify Bali/Jakarta pricing for this package'
    };
    return map[flag] || flag;
  }

  return {
    load: load,
    getPackages: getPackages,
    formatPrice: formatPrice,
    flagTooltip: flagTooltip,
    mediaType: mediaType
  };
})();
