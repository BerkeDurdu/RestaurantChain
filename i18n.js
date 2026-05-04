// ===== i18n: TR / EN =====
(function () {
  const DICT = {
    tr: {
      // <head>
      'page.title.app': 'ChainOps — Restoran Zinciri Operasyon İzleme',
      'page.title.login': 'ChainOps — Giriş',

      // Brand / topbar
      'brand.subtitle': 'Restoran Zinciri Operasyon İzleme Merkezi',
      'topbar.systemOnline': 'Sistem Çevrimiçi',
      'topbar.apiConnected': 'API Bağlı',
      'topbar.apiOffline': 'API Bağlantısı Yok',
      'topbar.logout': 'Çıkış',
      'lang.toggle.tr': 'TR',
      'lang.toggle.en': 'EN',

      // Tabs
      'tab.overview': 'Genel Bakış',
      'tab.branches': 'Şubeler',
      'tab.stock': 'Stok',
      'tab.alerts': 'Uyarılar',
      'tab.reports': 'Raporlar',

      // KPIs
      'kpi.todayOrders': 'Bugünkü Sipariş',
      'kpi.avgOrderTime': 'Ort. Sipariş Süresi',
      'kpi.busiestBranch': 'En Yoğun Şube',
      'kpi.posUptime': 'POS Uptime (Ortalama)',
      'kpi.activeAlerts': 'Aktif Uyarı',
      'kpi.trendVsYesterday': '+12% düne göre',
      'kpi.activeOrdersSuffix': 'aktif sipariş',
      'kpi.aboveTarget': '⚠ hedefin üzerinde',
      'kpi.withinTarget': '✓ hedef içinde',
      'kpi.stable': '✓ stabil',
      'kpi.watching': '⚠ izleniyor',
      'kpi.urgentResponse': 'acil müdahale',

      // Units
      'unit.min': 'dk',
      'unit.percent': '%',
      'unit.currency': '₺',

      // Cards
      'card.hourlyOrders': 'Saatlik Sipariş Yoğunluğu',
      'card.branchDistribution': 'Şube Bazlı Sipariş Dağılımı',
      'card.branchStatusLive': 'Şube Durumu (Canlı)',
      'card.branchesAll': 'Tüm Şubeler — Detaylı Görünüm',
      'card.stockLevels': 'Stok Seviyeleri (Şube Bazlı)',
      'card.stockLevelsHint': 'Kırmızı çubuklar kritik seviyenin altında olan stokları gösterir.',
      'card.criticalStock': 'Kritik Stok Listesi',
      'card.dateRange': 'Tarih Aralığı',
      'card.orderTrend': 'Sipariş Trendi',
      'card.branchCompare': 'Şube Karşılaştırma (Sipariş)',
      'card.branchDetails': 'Şube Detayları',
      'card.alertFeed': 'Canlı Uyarı Akışı',
      'card.alertFeedHint': 'Yeni uyarılar otomatik olarak en üste eklenir.',

      // Buttons
      'btn.addBranch': '+ Yeni Şube Ekle',
      'btn.addProduct': '+ Yeni Ürün Ekle',
      'btn.apply': 'Uygula',
      'btn.saveBranch': 'Şubeyi Kaydet',
      'btn.saveProduct': 'Ürünü Kaydet',

      // Range
      'range.today': 'Bugün',
      'range.week': 'Son 7 Gün',
      'range.month': 'Son 30 Gün',
      'range.year': 'Son 1 Yıl',
      'range.aggregation': 'bazlı toplulaştırma',

      // Reports
      'rep.totalOrders': 'Toplam Sipariş',
      'rep.totalRevenue': 'Toplam Ciro',
      'rep.avgOrderTime': 'Ort. Sipariş Süresi',
      'rep.avgTicket': 'Ort. Sipariş Tutarı',

      // Tables
      'th.branch': 'Şube',
      'th.status': 'Durum',
      'th.activeOrders': 'Aktif Sipariş',
      'th.avgTime': 'Ort. Süre',
      'th.kitchenDelay': 'Mutfak Gecikmesi',
      'th.posUptime': 'POS Uptime',
      'th.item': 'Ürün',
      'th.current': 'Mevcut',
      'th.threshold': 'Kritik Eşik',
      'th.city': 'Şehir',
      'th.orders': 'Sipariş',
      'th.revenue': 'Ciro',
      'th.share': 'Pay',

      // Branch card metrics
      'metric.activeOrders': 'Aktif Sipariş',
      'metric.avgTime': 'Ort. Süre',
      'metric.kitchenDelay': 'Mutfak Gecikme',
      'metric.posUptime': 'POS Uptime',
      'metric.todayOrders': 'Bugünkü Sipariş',
      'metric.lowStock': 'Düşük Stok',

      // Status tags
      'status.normal': 'Normal',
      'status.slowdown': 'Yavaşlama',
      'status.problem': 'Sorunlu',
      'status.critical': 'Kritik',

      // Empty states
      'empty.noCriticalStock': 'Kritik seviye altında stok yok ✓',
      'empty.noAlerts': 'Aktif uyarı yok ✓',
      'fallback.headquarters': 'Merkez',

      // Modals
      'modal.newBranch': 'Yeni Şube Ekle',
      'modal.newProduct': 'Yeni Ürün Ekle',
      'modal.branchName': 'Şube Adı',
      'modal.branchCity': 'Şehir',
      'modal.branchNamePh': 'Örn: Beşiktaş Şubesi',
      'modal.branchCityPh': 'Örn: İstanbul',
      'modal.selectBranch': 'Şube Seçin',
      'modal.productName': 'Ürün Adı',
      'modal.productNamePh': 'Örn: Kola',
      'modal.currentStock': 'Mevcut Stok',
      'modal.criticalThreshold': 'Kritik Eşik',
      'modal.addBranchFirst': 'Önce şube ekleyin',

      // Alerts / dialogs
      'alert.fillAll': 'Lütfen tüm alanları doldurun',
      'alert.invalidValues': 'Lütfen geçerli değerler girin',
      'alert.error': 'Bir hata oluştu',
      'alert.selectDateRange': 'Lütfen tarih aralığı seçin',

      // Footer
      'footer.text': 'ChainOps Demo · Software Project Management & Technical Monitoring',

      // Login
      'login.signIn': 'Giriş Yap',
      'login.signUp': 'Kayıt Ol',
      'login.username': 'Kullanıcı Adı',
      'login.password': 'Şifre',
      'login.passwordHint': '(en az 6 karakter)',
      'login.fullName': 'Ad Soyad',
      'login.firstUseTitle': 'İlk kullanım:',
      'login.firstUseText': 'Kayıt olup yeni bir hesap oluşturun.',
      'login.loading': 'Lütfen bekleyin...',
      'login.genericError': 'Bir hata oluştu',

      // Chart
      'chart.orders': 'Sipariş',
    },

    en: {
      'page.title.app': 'ChainOps — Restaurant Chain Operations Monitoring',
      'page.title.login': 'ChainOps — Sign In',

      'brand.subtitle': 'Restaurant Chain Operations Monitoring Center',
      'topbar.systemOnline': 'System Online',
      'topbar.apiConnected': 'API Connected',
      'topbar.apiOffline': 'API Offline',
      'topbar.logout': 'Logout',
      'lang.toggle.tr': 'TR',
      'lang.toggle.en': 'EN',

      'tab.overview': 'Overview',
      'tab.branches': 'Branches',
      'tab.stock': 'Stock',
      'tab.alerts': 'Alerts',
      'tab.reports': 'Reports',

      'kpi.todayOrders': "Today's Orders",
      'kpi.avgOrderTime': 'Avg. Order Time',
      'kpi.busiestBranch': 'Busiest Branch',
      'kpi.posUptime': 'POS Uptime (Average)',
      'kpi.activeAlerts': 'Active Alerts',
      'kpi.trendVsYesterday': '+12% vs yesterday',
      'kpi.activeOrdersSuffix': 'active orders',
      'kpi.aboveTarget': '⚠ above target',
      'kpi.withinTarget': '✓ within target',
      'kpi.stable': '✓ stable',
      'kpi.watching': '⚠ watching',
      'kpi.urgentResponse': 'urgent response',

      'unit.min': 'min',
      'unit.percent': '%',
      'unit.currency': '$',

      'card.hourlyOrders': 'Hourly Order Volume',
      'card.branchDistribution': 'Order Distribution by Branch',
      'card.branchStatusLive': 'Branch Status (Live)',
      'card.branchesAll': 'All Branches — Detailed View',
      'card.stockLevels': 'Stock Levels (per Branch)',
      'card.stockLevelsHint': 'Red bars indicate stock below the critical threshold.',
      'card.criticalStock': 'Critical Stock List',
      'card.dateRange': 'Date Range',
      'card.orderTrend': 'Order Trend',
      'card.branchCompare': 'Branch Comparison (Orders)',
      'card.branchDetails': 'Branch Details',
      'card.alertFeed': 'Live Alert Feed',
      'card.alertFeedHint': 'New alerts are automatically added at the top.',

      'btn.addBranch': '+ Add Branch',
      'btn.addProduct': '+ Add Product',
      'btn.apply': 'Apply',
      'btn.saveBranch': 'Save Branch',
      'btn.saveProduct': 'Save Product',

      'range.today': 'Today',
      'range.week': 'Last 7 Days',
      'range.month': 'Last 30 Days',
      'range.year': 'Last 1 Year',
      'range.aggregation': 'aggregation',

      'rep.totalOrders': 'Total Orders',
      'rep.totalRevenue': 'Total Revenue',
      'rep.avgOrderTime': 'Avg. Order Time',
      'rep.avgTicket': 'Avg. Ticket',

      'th.branch': 'Branch',
      'th.status': 'Status',
      'th.activeOrders': 'Active Orders',
      'th.avgTime': 'Avg. Time',
      'th.kitchenDelay': 'Kitchen Delay',
      'th.posUptime': 'POS Uptime',
      'th.item': 'Item',
      'th.current': 'Current',
      'th.threshold': 'Threshold',
      'th.city': 'City',
      'th.orders': 'Orders',
      'th.revenue': 'Revenue',
      'th.share': 'Share',

      'metric.activeOrders': 'Active Orders',
      'metric.avgTime': 'Avg. Time',
      'metric.kitchenDelay': 'Kitchen Delay',
      'metric.posUptime': 'POS Uptime',
      'metric.todayOrders': "Today's Orders",
      'metric.lowStock': 'Low Stock',

      'status.normal': 'Normal',
      'status.slowdown': 'Slowdown',
      'status.problem': 'Problem',
      'status.critical': 'Critical',

      'empty.noCriticalStock': 'No stock below critical level ✓',
      'empty.noAlerts': 'No active alerts ✓',
      'fallback.headquarters': 'Headquarters',

      'modal.newBranch': 'Add New Branch',
      'modal.newProduct': 'Add New Product',
      'modal.branchName': 'Branch Name',
      'modal.branchCity': 'City',
      'modal.branchNamePh': 'e.g. Beşiktaş Branch',
      'modal.branchCityPh': 'e.g. Istanbul',
      'modal.selectBranch': 'Select Branch',
      'modal.productName': 'Product Name',
      'modal.productNamePh': 'e.g. Cola',
      'modal.currentStock': 'Current Stock',
      'modal.criticalThreshold': 'Critical Threshold',
      'modal.addBranchFirst': 'Add a branch first',

      'alert.fillAll': 'Please fill in all fields',
      'alert.invalidValues': 'Please enter valid values',
      'alert.error': 'An error occurred',
      'alert.selectDateRange': 'Please select a date range',

      'footer.text': 'ChainOps Demo · Software Project Management & Technical Monitoring',

      'login.signIn': 'Sign In',
      'login.signUp': 'Sign Up',
      'login.username': 'Username',
      'login.password': 'Password',
      'login.passwordHint': '(at least 6 characters)',
      'login.fullName': 'Full Name',
      'login.firstUseTitle': 'First time?',
      'login.firstUseText': 'Register to create a new account.',
      'login.loading': 'Please wait...',
      'login.genericError': 'An error occurred',

      'chart.orders': 'Orders',
    },
  };

  const STORAGE_KEY = 'chainops_lang';
  const listeners = [];

  const i18n = {
    lang: localStorage.getItem(STORAGE_KEY) || 'tr',

    t(key) {
      const table = DICT[this.lang] || DICT.tr;
      return table[key] !== undefined ? table[key] : (DICT.tr[key] !== undefined ? DICT.tr[key] : key);
    },

    locale() {
      return this.lang === 'tr' ? 'tr-TR' : 'en-US';
    },

    setLang(lang) {
      if (!DICT[lang]) return;
      this.lang = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      this.apply();
      listeners.forEach(fn => { try { fn(lang); } catch (e) { console.error(e); } });
    },

    onChange(fn) {
      listeners.push(fn);
    },

    apply(root) {
      const scope = root || document;

      // Update <title> if a key is set on <html>
      const titleKey = document.documentElement.dataset.titleKey;
      if (titleKey) document.title = this.t(titleKey);

      scope.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = this.t(el.getAttribute('data-i18n'));
      });
      scope.querySelectorAll('[data-i18n-html]').forEach(el => {
        el.innerHTML = this.t(el.getAttribute('data-i18n-html'));
      });
      scope.querySelectorAll('[data-i18n-ph]').forEach(el => {
        el.setAttribute('placeholder', this.t(el.getAttribute('data-i18n-ph')));
      });
      scope.querySelectorAll('[data-i18n-title]').forEach(el => {
        el.setAttribute('title', this.t(el.getAttribute('data-i18n-title')));
      });

      // Update language toggle button visuals
      scope.querySelectorAll('[data-lang-btn]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.langBtn === this.lang);
      });
      document.documentElement.lang = this.lang;
    },

    initToggle(container) {
      if (!container) return;
      container.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-lang-btn]');
        if (!btn) return;
        this.setLang(btn.dataset.langBtn);
      });
    },
  };

  window.i18n = i18n;

  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.lang = i18n.lang;
    i18n.apply();
    document.querySelectorAll('.lang-switch').forEach(el => i18n.initToggle(el));
  });
})();
