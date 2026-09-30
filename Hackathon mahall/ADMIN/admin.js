/**
 * NOORUL HUDA MAHALL - EXECUTIVE ADMINISTRATION PORTAL CONTROLLER
 * Full management suite for prayers, notices, census, certs, finance, madrasa, and settings.
 */

const AdminApp = {
  activeTab: 'dashboard',
  currentCertFilter: 'all',
  currentAnnFilter: 'all',
  activeEduSubtab: 'admissions',
  currentAdmFilter: 'all',

  init: function () {
    console.log('[AdminApp] Initializing Mahall Central Admin Console...');

    // 1. Check Authentication Guard
    this.checkAuth();

    // 2. Start Live Gregorian & Hijri Clock
    this.startLiveClock();

    // 3. Render Dashboard & Data Modules
    this.renderAll();

    // 4. Handle Deep Links (e.g. #madrasa or #madrasa-admissions or ?tab=madrasa)
    const handleRoute = () => {
      const rawHash = (window.location.hash || '').replace('#', '');
      const urlParams = new URLSearchParams(window.location.search);
      const queryTab = urlParams.get('tab') || rawHash;

      if (queryTab) {
        if (queryTab.startsWith('madrasa')) {
          this.switchTab('madrasa');
          if (queryTab.includes('-')) {
            const sub = queryTab.split('-')[1];
            if (sub) this.switchEduSubtab(sub);
          }
        } else if (document.getElementById(`tab-${queryTab}`)) {
          this.switchTab(queryTab);
        }
      }
    };
    handleRoute();
    window.addEventListener('hashchange', handleRoute);

    // 5. Listen for cross-window / reactive database updates
    window.addEventListener('mahalldb_updated', (e) => {
      this.renderAll();
      if (e && e.detail && (e.detail.event === 'mahall_inquiries' || e.detail.event === 'INQUIRIES' || (typeof MahallDB !== 'undefined' && e.detail.event === MahallDB.KEYS?.INQUIRIES))) {
        this.showToast('New user inquiry received in real time!', 'info');
      } else if (e && e.detail && (e.detail.event === 'mahall_education_scholarships' || e.detail.key === 'mahall_education_scholarships')) {
        this.showToast('New Madrasa scholarship / aid request received!', 'info');
      } else if (e && e.detail && (e.detail.event === 'mahall_event_rsvps' || e.detail.key === 'mahall_event_rsvps' || (typeof MahallDB !== 'undefined' && e.detail.event === MahallDB.KEYS?.EVENT_RSVPS))) {
        this.showToast('Event attendee pass list updated in real time!', 'info');
        if (this.currentViewingEventRsvpId) {
          this.viewEventRsvps(this.currentViewingEventRsvpId);
        }
      }
    });

    // 5B. Listen for automatic real-time Firebase sync events (Zero manual clicks needed)
    window.addEventListener('mahall_firebase_synced', (e) => {
      const detail = (e && e.detail) || {};
      const target = detail.collection ? `${detail.collection}${detail.docId ? '/' + detail.docId : ''}` : 'cloud database';
      if (typeof this.logFirebaseTerminal === 'function') {
        this.logFirebaseTerminal(`⚡ Real-Time Auto-Sync: Updated ${target} directly to Firebase Firestore in the background.`, 'success');
      }

      // Update top header indicator temporarily to show sync pulse
      const topText = document.getElementById('top-firebase-text');
      const topDot = document.getElementById('top-firebase-dot');
      if (topText && topDot) {
        topDot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-ping';
        const prevText = topText.textContent;
        topText.textContent = 'Auto-Synced ✓';
        setTimeout(() => {
          topDot.className = 'w-2 h-2 rounded-full bg-emerald-400';
          if (window.FirebaseEngine) {
            topText.textContent = `Firebase: ${window.FirebaseEngine.getStatus().projectId || 'Live'}`;
          } else {
            topText.textContent = 'Firebase: Live';
          }
        }, 2200);
      }
    });

    window.addEventListener('storage', (e) => {
      if (!e.key || e.key.startsWith('mahall_') || e.key.startsWith('nhm_')) {
        this.renderAll();
        if (e.key === 'mahall_inquiries') {
          this.showToast('New user inquiry synced from public portal!', 'info');
        } else if (e.key === 'mahall_education_scholarships') {
          this.showToast('New Madrasa scholarship / aid request synced from public portal!', 'info');
        } else if (e.key === 'mahall_event_rsvps') {
          this.showToast('New Event RSVP pass synced from public portal!', 'info');
          if (this.currentViewingEventRsvpId) {
            this.viewEventRsvps(this.currentViewingEventRsvpId);
          }
        } else if (e.key === 'mahall_mosque_notices') {
          this.showToast('Mosque notices updated from portal!', 'info');
        } else if (e.key === 'mahall_emergency_disaster') {
          this.showToast('Emergency & disaster notices updated!', 'info');
        }
      }
    });

    // 6. Initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // =========================================================================
  // 1. AUTHENTICATION & SECURITY
  // =========================================================================
  checkAuth: function () {
    const isAuthed = (typeof AuthService !== 'undefined') ? AuthService.isAuthenticated() : false;
    const isAdmin = (typeof AuthService !== 'undefined') ? AuthService.isAdmin() : (localStorage.getItem('nhm_role') === 'admin');
    const loginScreen = document.getElementById('admin-login-screen');

    // SECURITY BOUNDARY: If an ordinary user attempts to open admin console, redirect immediately to unauthorized.html
    if (isAuthed && !isAdmin) {
      window.location.replace('../unauthorized.html');
      return;
    }

    if (isAdmin) {
      if (loginScreen) {
        loginScreen.classList.add('hidden');
        loginScreen.classList.remove('flex');
        loginScreen.style.display = 'none';
      }
    } else {
      if (loginScreen) {
        loginScreen.classList.remove('hidden');
        loginScreen.classList.add('flex');
        loginScreen.style.display = 'flex';
      }
    }
  },

  handleLogin: async function (e) {
    if (e) e.preventDefault();
    const input = document.getElementById('admin-passkey-input');
    const errBox = document.getElementById('login-error-msg');
    const passkey = (input ? input.value : '').trim();

    try {
      if (typeof AuthService !== 'undefined') {
        await AuthService.login('admin@mahall.org', passkey || 'admin2026');
        if (!AuthService.isAdmin()) {
          throw new Error('Access Denied: Account lacks administrative privileges.');
        }
      } else {
        if (passkey !== 'admin2026' && passkey !== 'admin') throw new Error('Invalid passkey');
        localStorage.setItem('nhm_role', 'admin');
      }

      const loginScreen = document.getElementById('admin-login-screen');
      if (loginScreen) {
        loginScreen.classList.add('hidden');
        loginScreen.classList.remove('flex');
        loginScreen.style.display = 'none';
      }
      if (errBox) errBox.classList.add('hidden');
      this.showToast('Authentication successful. Welcome, General Secretary!', 'success');
      this.renderAll();
    } catch (err) {
      if (errBox) {
        errBox.textContent = err.message || 'Invalid administrative passkey.';
        errBox.classList.remove('hidden');
      }
      this.showToast(err.message || 'Invalid executive passkey!', 'error');
    }
  },

  handleLogout: async function () {
    if (confirm('Are you sure you want to log out from the Executive Administration Console?')) {
      if (typeof AuthService !== 'undefined' && AuthService.logout) {
        await AuthService.logout();
      } else {
        localStorage.removeItem('mahall_auth_session');
        localStorage.removeItem('nhm_role');
      }
      const loginScreen = document.getElementById('admin-login-screen');
      if (loginScreen) {
        loginScreen.classList.remove('hidden');
        loginScreen.classList.add('flex');
        loginScreen.style.display = 'flex';
        const input = document.getElementById('admin-passkey-input');
        if (input) input.value = '';
      }
      this.showToast('Session logged out successfully.', 'info');
      setTimeout(() => {
        window.location.href = '../login.html';
      }, 500);
    }
  },

  // =========================================================================
  // 2. LIVE CLOCK & HIJRI CALCULATOR
  // =========================================================================
  startLiveClock: function () {
    const toArabicDigits = (str) => {
      const arabicDigits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
      return String(str).replace(/[0-9]/g, d => arabicDigits[d]);
    };

    const arMonths = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
    const arDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    const updateTime = () => {
      const now = new Date();
      const gregElem = document.getElementById('live-gregorian-date');
      const hijriElem = document.getElementById('live-hijri-date');

      if (gregElem) {
        const enDate = now.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        const enTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        gregElem.textContent = `${enDate} • ${enTime}`;
      }

      if (hijriElem) {
        const hijriYear = 1447;
        const day = now.getDate();
        const monthIndex = Math.min(now.getMonth(), 11);
        const arMonth = arMonths[monthIndex];
        const arDay = toArabicDigits(day);
        const arYear = toArabicDigits(hijriYear);
        const arWeekday = arDays[now.getDay()];

        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'م' : 'ص';
        hours = hours % 12 || 12;
        const hoursStr = String(hours).padStart(2, '0');
        const arTime = `${toArabicDigits(hoursStr)}:${toArabicDigits(minutes)}:${toArabicDigits(seconds)} ${ampm}`;

        hijriElem.textContent = `${arWeekday}، ${arDay} ${arMonth} ${arYear} هـ • ${arTime}`;
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  },

  // =========================================================================
  // 3. TAB NAVIGATION
  // =========================================================================
  switchTab: function (tabId) {
    this.activeTab = tabId;

    // Toggle tab panels
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) targetTab.classList.add('active');

    // Toggle nav buttons
    document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
      btn.classList.remove('active', 'text-white', 'bg-emerald-900/60', 'border', 'border-emerald-700/50');
      btn.classList.add('text-slate-300', 'hover:text-white', 'hover:bg-slate-900/80');
    });
    const activeBtn = document.getElementById(`nav-btn-${tabId}`);
    if (activeBtn) {
      activeBtn.classList.remove('text-slate-300', 'hover:bg-slate-900/80');
      activeBtn.classList.add('active', 'text-white', 'bg-emerald-900/60', 'border', 'border-emerald-700/50');
    }

    // Close mobile sidebar if open
    const sidebar = document.getElementById('admin-sidebar');
    if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
      sidebar.classList.add('-translate-x-full');
    }

    // Refresh contents
    this.renderTabContent(tabId);
    if (window.lucide) window.lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  toggleSidebar: function () {
    const sidebar = document.getElementById('admin-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('-translate-x-full');
    }
  },

  // =========================================================================
  // 4. MASTER RENDER ROUTINE
  // =========================================================================
  renderAll: function () {
    this.renderKPIs();
    this.renderDashboardPrayers();
    this.renderActivityLogs();
    this.renderPrayerTab();
    this.renderAnnouncements();
    this.renderEvents();
    this.renderRegistrations();
    this.renderUsers();
    this.renderCensus();
    this.renderCertificates();
    this.renderMadrasa();
    this.renderFinance();
    this.renderSulhu();
    this.renderCommunity();
    this.renderGallery();
    this.renderInquiries();
    this.renderSettings();
    this.renderFirebaseStatusBadge();

    if (window.lucide) window.lucide.createIcons();
  },

  renderTabContent: function (tabId) {
    switch (tabId) {
      case 'dashboard':
        this.renderKPIs();
        this.renderDashboardPrayers();
        this.renderActivityLogs();
        break;
      case 'prayer':
        this.renderPrayerTab();
        break;
      case 'announcements':
        this.renderAnnouncements();
        break;
      case 'events':
        this.renderEvents();
        break;
      case 'registrations':
        this.renderRegistrations();
        break;
      case 'users':
        this.renderUsers();
        break;
      case 'census':
        this.renderCensus();
        break;
      case 'certificates':
        this.renderCertificates();
        break;
      case 'madrasa':
        this.renderMadrasa();
        break;
      case 'finance':
        this.renderFinance();
        break;
      case 'sulhu':
        this.renderSulhu();
        break;
      case 'community':
        this.renderCommunity();
        break;
      case 'gallery':
        this.renderGallery();
        break;
      case 'inquiries':
        this.renderInquiries();
        break;
      case 'settings':
        this.renderSettings();
        break;
      case 'firebase':
        this.renderFirebaseSettings();
        break;
    }
  },

  // =========================================================================
  // 5. DASHBOARD KPIs & QUICK WIDGETS
  // =========================================================================
  renderKPIs: function () {
    const families = MahallDB.getFamilies();
    const certs = MahallDB.getCertificates();
    const pendingCerts = certs.filter(c => c.status === 'PENDING');
    const anns = MahallDB.getAnnouncements();
    const mosqueNotices = MahallDB.getMosqueNotices ? MahallDB.getMosqueNotices() : [];
    const emergencyNotices = MahallDB.getEmergencyDisasterNotices ? MahallDB.getEmergencyDisasterNotices() : [];
    const totalAnnCount = anns.length + mosqueNotices.length + emergencyNotices.length;
    const donors = MahallDB.getBloodDonors ? MahallDB.getBloodDonors() : [];
    const inqs = MahallDB.getInquiries ? MahallDB.getInquiries() : [];
    const newInqs = inqs.filter(i => i.status === 'NEW');

    const kpiFam = document.getElementById('kpi-families-count');
    const kpiCert = document.getElementById('kpi-pending-certs');
    const kpiAnn = document.getElementById('kpi-announcements-count');
    const kpiDon = document.getElementById('kpi-donors-count');
    const kpiInq = document.getElementById('kpi-inquiries-count');

    if (kpiFam) kpiFam.textContent = families.length;
    if (kpiCert) kpiCert.textContent = pendingCerts.length;
    if (kpiAnn) kpiAnn.textContent = totalAnnCount;
    if (kpiDon) kpiDon.textContent = donors.length;
    if (kpiInq) kpiInq.textContent = inqs.length;

    // Badges in sidebar
    const badgeFam = document.getElementById('badge-families-count');
    const badgeCert = document.getElementById('badge-pending-certs');
    const badgeAnn = document.getElementById('badge-ann-count');
    const badgeInq = document.getElementById('badge-inquiries-count');
    if (badgeFam) badgeFam.textContent = families.length;
    if (badgeCert) badgeCert.textContent = pendingCerts.length;
    if (badgeAnn) badgeAnn.textContent = totalAnnCount;
    if (badgeInq) badgeInq.textContent = newInqs.length;
  },

  renderDashboardPrayers: function () {
    const schedule = MahallDB.getPrayerSchedule ? MahallDB.getPrayerSchedule() : {};
    const offsets = MahallDB.getPrayerOffsets ? MahallDB.getPrayerOffsets() : {};
    const container = document.getElementById('dash-prayers-grid');
    if (!container) return;

    const prayers = [
      { name: 'Fajr', ar: 'الفجر', adhan: schedule.fajrAdhan || '05:08 AM', iqamah: schedule.fajrIqamah || '05:30 AM', color: 'indigo' },
      { name: 'Sunrise', ar: 'الشروق', adhan: schedule.sunrise || '06:22 AM', iqamah: 'Ishraq', color: 'amber' },
      { name: 'Dhuhr', ar: 'الظهر', adhan: schedule.dhuhrAdhan || '12:28 PM', iqamah: schedule.dhuhrIqamah || '12:45 PM', color: 'emerald' },
      { name: 'Asr', ar: 'العصر', adhan: schedule.asrAdhan || '03:48 PM', iqamah: schedule.asrIqamah || '04:05 PM', color: 'orange' },
      { name: 'Maghrib', ar: 'المغرب', adhan: schedule.maghribAdhan || '06:33 PM', iqamah: schedule.maghribIqamah || '06:45 PM', color: 'rose' },
      { name: 'Isha', ar: 'العشاء', adhan: schedule.ishaAdhan || '07:44 PM', iqamah: schedule.ishaIqamah || '08:00 PM', color: 'purple' }
    ];

    container.innerHTML = prayers.map(p => `
      <div class="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
        <div class="text-[10px] uppercase font-semibold text-slate-400 mb-1">${p.name}</div>
        <div class="text-xs text-slate-300 font-mono">${p.adhan}</div>
        <div class="text-xs font-bold text-emerald-400 font-mono mt-0.5">${p.iqamah}</div>
      </div>
    `).join('');

    const jumuaKhutbah = document.getElementById('dash-jumua-khutbah');
    const jumuaKhatib = document.getElementById('dash-jumua-khatib');
    const khatibInfo = MahallDB.getKhatibDetails ? MahallDB.getKhatibDetails() : {};
    if (jumuaKhutbah) jumuaKhutbah.textContent = khatibInfo.khutbahTime || schedule.jumuaKhutbah || offsets.jumuaKhutbah || '12:45 PM';
    if (jumuaKhatib) jumuaKhatib.textContent = khatibInfo.khatib || schedule.jumuaKhatib || offsets.khatib || 'Usthad Maulana Abdul Rasheed Faizy';
  },

  renderActivityLogs: function () {
    const logs = MahallDB.getActivityLogs ? MahallDB.getActivityLogs() : [];
    const container = document.getElementById('dash-activity-logs');
    if (!container) return;

    if (!logs.length) {
      container.innerHTML = `<p class="text-xs text-slate-500 py-4 text-center">No recent activity recorded.</p>`;
      return;
    }

    container.innerHTML = logs.slice(0, 10).map(log => `
      <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs flex items-start gap-2.5">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
        <div class="flex-1 min-w-0">
          <p class="text-slate-200 font-medium leading-tight truncate">${log.message}</p>
          <div class="flex items-center justify-between text-[10px] text-slate-500 mt-1">
            <span>${log.user || 'Admin'}</span>
            <span class="font-mono">${log.timestamp || 'Today'}</span>
          </div>
        </div>
      </div>
    `).join('');
  },

  // =========================================================================
  // 6. PRAYER SCHEDULE & SCHOLARLY LEADERSHIP TAB
  // =========================================================================
  renderPrayerTab: function () {
    // 1. Get automated astronomical prayer & Ramadan timings
    const autoTimes = MahallDB.getAutomatedPrayerTimes ? MahallDB.getAutomatedPrayerTimes() : {};
    const imam = MahallDB.getImamDetails ? MahallDB.getImamDetails() : {};
    const khatib = MahallDB.getKhatibDetails ? MahallDB.getKhatibDetails() : {};

    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text || '--:-- --';
    };

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    // Render Live Read-Only Automated Daily Prayers
    setText('auto-card-fajr-adhan', autoTimes.fajrAdhan);
    setText('auto-card-fajr-iqamah', autoTimes.fajrIqamah);
    setText('auto-card-sunrise', autoTimes.sunrise);
    setText('auto-card-ishraq', autoTimes.ishraq);
    setText('auto-card-dhuhr-adhan', autoTimes.dhuhrAdhan);
    setText('auto-card-dhuhr-iqamah', autoTimes.dhuhrIqamah);
    setText('auto-card-asr-adhan', autoTimes.asrAdhan);
    setText('auto-card-asr-iqamah', autoTimes.asrIqamah);
    setText('auto-card-maghrib-adhan', autoTimes.maghribAdhan);
    setText('auto-card-maghrib-iqamah', autoTimes.maghribIqamah);
    setText('auto-card-isha-adhan', autoTimes.ishaAdhan);
    setText('auto-card-isha-iqamah', autoTimes.ishaIqamah);

    // Render Live Read-Only Automated Ramadan & Fasting Timings
    setText('auto-card-suhoor', autoTimes.suhoorEnds);
    setText('auto-card-iftar', autoTimes.iftar);
    setText('auto-card-taraweeh', autoTimes.taraweeh);

    const stampEl = document.getElementById('auto-prayer-calc-stamp');
    if (stampEl) {
      stampEl.textContent = `⚡ Live Synced • NOAA Solar Model (${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })})`;
    }

    // Populate Editable Chief Imam Form Fields
    setVal('imam-fullname', imam.name || 'Usthad Maulana Abdul Rasheed Faizy');
    setVal('imam-designation', imam.designation || 'Chief Imam & Qazi');
    setVal('imam-sanad', imam.sanad || 'Jamia Nooriya Al-Arabiyya & Al-Azhar Cairo');
    setVal('imam-phone', imam.phone || '+91 94472 11223');
    setVal('imam-hours', imam.officeHours || 'Post-Asr to Maghrib (Daily)');
    setVal('second-imam', imam.secondImam || 'Hafiz Salmanul Farisi');
    setVal('chief-muazzin', imam.muazzin || 'Bilal Koya');
    setVal('imam-bio', imam.bio || 'Graduate of Darul Huda Islamic University and Al-Azhar Cairo. Leading Friday sermons and spiritual arbitration for 16 years.');

    // Populate Editable Friday Jum'ah Khatheeb Form Fields
    setVal('khatib-name', khatib.khatib || 'Usthad Maulana Abdul Rasheed Faizy');
    setVal('khutbah-topic', khatib.topic || 'Compassion in Community Living & Mutual Respect');
    setVal('khutbah-topic-ml', khatib.topicMl || 'സാമൂഹിക ജീവിതത്തിലെ കാരുണ്യവും പരസ്പര ബഹുമാനവും');
    setVal('khutbah-lang', khatib.language || 'Malayalam & Arabic');
    setVal('khutbah-time', khatib.khutbahTime || '12:45 PM');
    setVal('khutbah-salah-time', khatib.salahTime || '01:15 PM');
    setVal('khutbah-notes', khatib.notes || 'Volunteers requested to arrive at 11:30 AM for parking assistance. Live audio streaming enabled on Mahall FM.');
  },

  saveImamAndKhatib: function () {
    const getVal = id => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    const imamName = getVal('imam-fullname');
    const khatibName = getVal('khatib-name');

    if (!imamName) {
      this.showToast('Please enter the Chief Imam Usthad full name', 'warning');
      return;
    }

    if (!khatibName) {
      this.showToast('Please enter the Friday Khatib name', 'warning');
      return;
    }

    const updatedImam = {
      name: imamName,
      designation: getVal('imam-designation') || 'Chief Imam & Qazi',
      sanad: getVal('imam-sanad') || 'Jamia Nooriya Al-Arabiyya',
      phone: getVal('imam-phone') || '+91 94472 11223',
      officeHours: getVal('imam-hours') || 'Post-Asr to Maghrib (Daily)',
      secondImam: getVal('second-imam') || 'Hafiz Salmanul Farisi',
      muazzin: getVal('chief-muazzin') || 'Bilal Koya',
      bio: getVal('imam-bio')
    };

    const updatedKhatib = {
      khatib: khatibName,
      topic: getVal('khutbah-topic') || 'Friday Spiritual Sermon',
      topicMl: getVal('khutbah-topic-ml') || 'ജുമുഅ ഖുതുബ',
      language: getVal('khutbah-lang') || 'Malayalam & Arabic',
      khutbahTime: getVal('khutbah-time') || '12:45 PM',
      salahTime: getVal('khutbah-salah-time') || '01:15 PM',
      notes: getVal('khutbah-notes')
    };

    MahallDB.updateImamDetails(updatedImam);
    MahallDB.updateKhatibDetails(updatedKhatib);

    // Sync with prayer offsets & schedule for universal compatibility
    MahallDB.updatePrayerOffsets({
      khatib: updatedKhatib.khatib,
      jumuaKhutbah: updatedKhatib.khutbahTime,
      jumuaPrayer: updatedKhatib.salahTime
    });

    this.showToast('Chief Imam and Friday Khatheeb profiles successfully saved and broadcasted!', 'success');
    this.renderDashboardPrayers();
    this.renderPrayerTab();
  },

  savePrayerSchedule: function () {
    // Alias to saveImamAndKhatib for any legacy triggers
    this.saveImamAndKhatib();
  },

  // =========================================================================
  // 7. ANNOUNCEMENTS STUDIO
  // =========================================================================
  renderAnnouncements: function () {
    this.renderEmergencyNoticesTable();
    this.renderMosqueNoticesTable();

    let list = MahallDB.getAnnouncements ? MahallDB.getAnnouncements() : [];
    if (this.currentAnnFilter !== 'all') {
      list = list.filter(a => a.category.toUpperCase() === this.currentAnnFilter.toUpperCase());
    }

    const tbody = document.getElementById('announcements-table-body');
    const totalEl = document.getElementById('ann-total-count');
    if (totalEl) totalEl.textContent = list.length;
    if (!tbody) return;

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-500">No notices found in this filter category.</td></tr>`;
      return;
    }

    const categoryBadge = cat => {
      switch (cat.toUpperCase()) {
        case 'JANAZAH': return '<span class="px-2 py-0.5 rounded-md bg-stone-900 text-stone-300 border border-stone-700 font-semibold">Janazah</span>';
        case 'EMERGENCY': return '<span class="px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-800 font-semibold">Emergency</span>';
        case 'EDUCATION': return '<span class="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold">Madrasa</span>';
        case 'GENERAL': return '<span class="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">General Body</span>';
        default: return `<span class="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold">${cat}</span>`;
      }
    };

    tbody.innerHTML = list.map(a => `
      <tr class="hover:bg-slate-950/40 transition">
        <td class="p-4 align-top">
          <div class="space-y-1">
            ${categoryBadge(a.category)}
            <div class="text-[10px] text-slate-400 font-mono">Priority: <strong class="${a.priority === 'CRITICAL' ? 'text-rose-400' : 'text-slate-300'}">${a.priority || 'NORMAL'}</strong></div>
          </div>
        </td>
        <td class="p-4 align-top max-w-md">
          <p class="font-bold text-white text-sm leading-snug">${a.title}</p>
          ${a.titleMl ? `<p class="text-xs text-emerald-400 font-malayalam mt-0.5">${a.titleMl}</p>` : ''}
          <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">${a.details || ''}</p>
          ${a.location ? `<p class="text-[11px] text-slate-500 mt-1 flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3"></i> ${a.location}</p>` : ''}
        </td>
        <td class="p-4 align-top whitespace-nowrap">
          <div class="text-slate-300 font-semibold">${a.date || 'Today'}</div>
          <div class="text-[11px] text-slate-500 font-mono">${a.time || 'Immediate'}</div>
        </td>
        <td class="p-4 align-top">
          <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">${a.actionType || 'General'}</span>
        </td>
        <td class="p-4 align-top text-right whitespace-nowrap space-x-1">
          <button onclick="AdminApp.editAnnouncement('${a.id}')" title="Edit notice" class="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
          <button onclick="AdminApp.deleteAnnouncement('${a.id}')" title="Delete notice" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  renderMosqueNoticesTable: function () {
    const list = MahallDB.getMosqueNotices ? MahallDB.getMosqueNotices() : [];
    const tbody = document.getElementById('mosque-notices-table-body');
    const badgeCount = document.getElementById('badge-mosque-notices-count');
    if (badgeCount) badgeCount.textContent = `${list.length} Active`;
    if (!tbody) return;

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-500">No mosque notices or circulars currently active. Click "Add New Notice" above to publish one.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(item => {
      const isPdf = item.badgeType === 'pdf';

      let colorBox = 'bg-emerald-950 text-emerald-400 border border-emerald-800/60';
      let tagPill = 'text-emerald-400 bg-emerald-950 border-emerald-800';
      if (item.badgeColor === 'amber') {
        colorBox = 'bg-amber-950 text-amber-400 border border-amber-800/60';
        tagPill = 'text-amber-400 bg-amber-950 border-amber-800';
      } else if (item.badgeColor === 'rose') {
        colorBox = 'bg-rose-950 text-rose-400 border border-rose-800/60';
        tagPill = 'text-rose-400 bg-rose-950 border-rose-800';
      } else if (item.badgeColor === 'sky') {
        colorBox = 'bg-sky-950 text-sky-400 border border-sky-800/60';
        tagPill = 'text-sky-400 bg-sky-950 border-sky-800';
      }

      const actionPreview = isPdf ? `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-900/80 text-emerald-200 border border-emerald-700/60 font-semibold text-[11px]">
          <i data-lucide="download" class="w-3 h-3"></i> ${this.escapeHTML(item.badgeText || 'Download PDF')}
        </span>
      ` : `
        <span class="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[10px]">
          ${this.escapeHTML(item.badgeText || 'Routine Service')}
        </span>
      `;

      return `
        <tr class="hover:bg-slate-950/40 transition">
          <td class="p-3.5 align-top">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${tagPill}">
              ${this.escapeHTML(item.refTag || 'CIRCULAR')}
            </span>
            <div class="text-[11px] text-slate-400 mt-1.5 leading-tight">
              ${this.escapeHTML(item.issuedBy || 'Chief Imam / Mahall Office')}
            </div>
            <div class="text-[10px] text-slate-500 font-mono mt-0.5">
              ${this.escapeHTML(item.date || 'Today')}
            </div>
          </td>
          <td class="p-3.5 align-top max-w-sm sm:max-w-md">
            <p class="font-bold text-white text-sm leading-snug">${this.escapeHTML(item.title)}</p>
            <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">${this.escapeHTML(item.details)}</p>
          </td>
          <td class="p-3.5 align-top whitespace-nowrap">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl ${colorBox} flex items-center justify-center font-bold">
                <i data-lucide="${item.icon || 'sun'}" class="w-4 h-4"></i>
              </div>
              <div>
                <span class="text-xs font-semibold text-slate-200 capitalize">${item.icon || 'sun'} Theme</span>
                <span class="text-[10px] text-slate-500 block capitalize">${item.badgeColor || 'emerald'}</span>
              </div>
            </div>
          </td>
          <td class="p-3.5 align-top whitespace-nowrap">
            ${actionPreview}
          </td>
          <td class="p-3.5 align-top text-right whitespace-nowrap space-x-1">
            <button onclick="AdminApp.openMosqueNoticeModal('${item.id}')" title="Edit notice" class="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button onclick="AdminApp.deleteMosqueNotice('${item.id}')" title="Delete notice" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  openMosqueNoticeModal: function (existingId = null) {
    let existing = null;
    if (existingId) {
      existing = (MahallDB.getMosqueNotices() || []).find(n => n.id === existingId);
    }

    const defaultRef = existing ? existing.refTag : `CIRCULAR #${Math.floor(95 + Math.random() * 20)}`;
    const defaultIssuer = existing ? existing.issuedBy : 'Chief Imam Usthad Abdul Rasheed Faizy';
    const defaultTitle = existing ? existing.title : '';
    const defaultDetails = existing ? existing.details : '';
    const defaultType = existing ? existing.badgeType : 'pdf';
    const defaultLabel = existing ? existing.badgeText : (defaultType === 'pdf' ? 'Download PDF' : 'Routine Service');
    const defaultColor = existing ? existing.badgeColor : 'emerald';
    const defaultIcon = existing ? existing.icon : 'sun';

    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800/60 font-mono">CONGREGATIONAL DIRECTIVES</span>
            <h3 class="text-base font-heading font-bold text-white flex items-center gap-2 mt-1">
              <i data-lucide="sun" class="w-5 h-5 text-emerald-400"></i>
              <span>${existing ? 'Edit Mosque Notice & Circular' : 'Publish New Notice in "Mosque Notices & Circulars"'}</span>
            </h3>
          </div>
          <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <p class="text-xs text-slate-400">
          This directive will be published live in the <strong>Mosque Notices & Circulars</strong> section of the public website.
        </p>

        <form onsubmit="AdminApp.saveMosqueNotice(event, '${existingId || ''}')" class="space-y-3.5 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1 font-semibold">Notice Tag / Reference No *</label>
              <input type="text" id="modal-mn-tag" required value="${this.escapeHTML(defaultRef)}" oninput="AdminApp.updateMosqueNoticePreview()" placeholder="e.g. CIRCULAR #94 or MAINTENANCE #12"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono uppercase focus:border-emerald-500 focus:outline-none" />
              <div class="flex items-center gap-1.5 mt-1.5">
                <span class="text-[10px] text-slate-500">Quick:</span>
                <button type="button" onclick="document.getElementById('modal-mn-tag').value='CIRCULAR #' + Math.floor(95 + Math.random()*30); document.getElementById('modal-mn-issuer').value='Chief Imam Usthad Abdul Rasheed Faizy'; document.getElementById('modal-mn-icon').value='sun'; document.getElementById('modal-mn-type').value='pdf'; document.getElementById('modal-mn-label').value='Download PDF'; document.getElementById('modal-mn-color').value='emerald'; AdminApp.updateMosqueNoticePreview();" class="text-[10px] bg-slate-800 text-emerald-400 hover:bg-slate-700 px-2 py-0.5 rounded font-mono">Circular</button>
                <button type="button" onclick="document.getElementById('modal-mn-tag').value='MAINTENANCE #' + Math.floor(13 + Math.random()*20); document.getElementById('modal-mn-issuer').value='Mosque Maintenance Desk'; document.getElementById('modal-mn-icon').value='zap'; document.getElementById('modal-mn-type').value='badge'; document.getElementById('modal-mn-label').value='Routine Service'; document.getElementById('modal-mn-color').value='amber'; AdminApp.updateMosqueNoticePreview();" class="text-[10px] bg-slate-800 text-amber-400 hover:bg-slate-700 px-2 py-0.5 rounded font-mono">Maintenance</button>
                <button type="button" onclick="document.getElementById('modal-mn-tag').value='DIRECTIVE #' + Math.floor(5 + Math.random()*20); document.getElementById('modal-mn-issuer').value='Executive Secretary Office'; document.getElementById('modal-mn-icon').value='bell'; document.getElementById('modal-mn-type').value='badge'; document.getElementById('modal-mn-label').value='Mandatory'; document.getElementById('modal-mn-color').value='rose'; AdminApp.updateMosqueNoticePreview();" class="text-[10px] bg-slate-800 text-rose-400 hover:bg-slate-700 px-2 py-0.5 rounded font-mono">Directive</button>
              </div>
            </div>

            <div>
              <label class="block text-slate-400 mb-1 font-semibold">Issued By Authority *</label>
              <input type="text" id="modal-mn-issuer" required value="${this.escapeHTML(defaultIssuer)}" oninput="AdminApp.updateMosqueNoticePreview()" placeholder="e.g. Issued by Chief Imam Usthad Abdul Rasheed Faizy"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1 font-semibold">Notice Title *</label>
            <input type="text" id="modal-mn-title" required value="${this.escapeHTML(defaultTitle)}" oninput="AdminApp.updateMosqueNoticePreview()" placeholder="e.g. Friday Jumu'ah Timing Schedule for Spring 2026"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-semibold focus:border-emerald-500 focus:outline-none" />
          </div>

          <div>
            <label class="block text-slate-400 mb-1 font-semibold">Full Directives & Timing Details *</label>
            <textarea id="modal-mn-details" required rows="3" oninput="AdminApp.updateMosqueNoticePreview()" placeholder="First Call (Adhan): 12:15 PM • Khutbah Sermon: 12:45 PM • Congregation Fard Prayer: 01:10 PM. Worshippers are requested to arrive with Wudhu to avoid congestion in ablution halls."
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white leading-relaxed focus:border-emerald-500 focus:outline-none">${this.escapeHTML(defaultDetails)}</textarea>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label class="block text-slate-400 mb-1 font-semibold">Action Style</label>
              <select id="modal-mn-type" onchange="AdminApp.handleMosqueNoticeTypeChange(); AdminApp.updateMosqueNoticePreview();" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white">
                <option value="pdf" ${defaultType === 'pdf' ? 'selected' : ''}>Download PDF Button</option>
                <option value="badge" ${defaultType === 'badge' ? 'selected' : ''}>Status Badge / Pill</option>
              </select>
            </div>

            <div>
              <label class="block text-slate-400 mb-1 font-semibold">Button / Pill Text</label>
              <input type="text" id="modal-mn-label" required value="${this.escapeHTML(defaultLabel)}" oninput="AdminApp.updateMosqueNoticePreview()" placeholder="Download PDF / Routine Service"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:border-emerald-500 focus:outline-none" />
            </div>

            <div>
              <label class="block text-slate-400 mb-1 font-semibold">Icon Theme</label>
              <select id="modal-mn-icon" onchange="AdminApp.updateMosqueNoticePreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white">
                <option value="sun" ${defaultIcon === 'sun' ? 'selected' : ''}>Sun (Prayer / Jumuah)</option>
                <option value="zap" ${defaultIcon === 'zap' ? 'selected' : ''}>Zap (Solar / Maintenance)</option>
                <option value="bell" ${defaultIcon === 'bell' ? 'selected' : ''}>Bell (Urgent Directive)</option>
                <option value="file-text" ${defaultIcon === 'file-text' ? 'selected' : ''}>File-Text (Circular / Resolutions)</option>
                <option value="clock" ${defaultIcon === 'clock' ? 'selected' : ''}>Clock (Schedule Adjustment)</option>
                <option value="shield-check" ${defaultIcon === 'shield-check' ? 'selected' : ''}>Shield (Administration)</option>
              </select>
            </div>

            <div>
              <label class="block text-slate-400 mb-1 font-semibold">Color Accent</label>
              <select id="modal-mn-color" onchange="AdminApp.updateMosqueNoticePreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white">
                <option value="emerald" ${defaultColor === 'emerald' ? 'selected' : ''}>Emerald (Green Theme)</option>
                <option value="amber" ${defaultColor === 'amber' ? 'selected' : ''}>Amber (Gold / Maintenance)</option>
                <option value="rose" ${defaultColor === 'rose' ? 'selected' : ''}>Rose (Urgent / Caution)</option>
                <option value="sky" ${defaultColor === 'sky' ? 'selected' : ''}>Sky (Informational)</option>
              </select>
            </div>
          </div>

          <!-- Live Visual Preview of Mosque Circular Card -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Live Public Website Card Preview:</span>
            <div id="preview-mn-card" class="rounded-2xl p-4 bg-slate-900 border border-emerald-500/40 shadow-xl space-y-2.5">
              <div class="flex items-center justify-between gap-2">
                <span id="preview-mn-tag" class="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 inline-block">
                  ${this.escapeHTML(defaultRef)}
                </span>
                <span id="preview-mn-issuer" class="text-[10px] text-slate-400 font-medium">
                  ${this.escapeHTML(defaultIssuer)}
                </span>
              </div>
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1 min-w-0">
                  <h4 id="preview-mn-title" class="text-sm font-bold text-white leading-tight">
                    ${this.escapeHTML(defaultTitle)}
                  </h4>
                  <p id="preview-mn-details" class="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    ${this.escapeHTML(defaultDetails)}
                  </p>
                </div>
                <div id="preview-mn-action" class="shrink-0 pt-0.5">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 bg-emerald-600/30 text-emerald-300 border border-emerald-500/50">
                    <i data-lucide="${defaultIcon}" class="w-3.5 h-3.5"></i>
                    <span>${this.escapeHTML(defaultLabel)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/40">
              ${existing ? 'Update Notice' : 'Publish Notice to Public Portal'}
            </button>
          </div>
        </form>
      </div>
    `;

    this.openModal(html);
  },

  updateMosqueNoticePreview: function () {
    const tag = document.getElementById('modal-mn-tag')?.value || 'CIRCULAR #94';
    const issuer = document.getElementById('modal-mn-issuer')?.value || 'Chief Imam Usthad Abdul Rasheed Faizy';
    const title = document.getElementById('modal-mn-title')?.value || "Friday Jumu'ah Timing Schedule";
    const details = document.getElementById('modal-mn-details')?.value || 'First Call (Adhan): 12:15 PM • Khutbah: 12:45 PM...';
    const type = document.getElementById('modal-mn-type')?.value || 'pdf';
    const label = document.getElementById('modal-mn-label')?.value || 'Download PDF';
    const icon = document.getElementById('modal-mn-icon')?.value || 'sun';
    const color = document.getElementById('modal-mn-color')?.value || 'emerald';

    const pTag = document.getElementById('preview-mn-tag');
    const pIssuer = document.getElementById('preview-mn-issuer');
    const pTitle = document.getElementById('preview-mn-title');
    const pDetails = document.getElementById('preview-mn-details');
    const pAction = document.getElementById('preview-mn-action');
    const pCard = document.getElementById('preview-mn-card');

    if (pTag) pTag.textContent = tag.toUpperCase();
    if (pIssuer) pIssuer.textContent = issuer;
    if (pTitle) pTitle.textContent = title;
    if (pDetails) pDetails.textContent = details;

    const colorClasses = {
      emerald: { border: 'border-emerald-500/40', badge: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50', tag: 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60' },
      amber: { border: 'border-amber-500/40', badge: 'bg-amber-600/30 text-amber-300 border-amber-500/50', tag: 'text-amber-400 bg-amber-950/80 border-amber-800/60' },
      rose: { border: 'border-rose-500/40', badge: 'bg-rose-600/30 text-rose-300 border-rose-500/50', tag: 'text-rose-400 bg-rose-950/80 border-rose-800/60' },
      sky: { border: 'border-sky-500/40', badge: 'bg-sky-600/30 text-sky-300 border-sky-500/50', tag: 'text-sky-400 bg-sky-950/80 border-sky-800/60' }
    }[color] || { border: 'border-emerald-500/40', badge: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50', tag: 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60' };

    if (pCard) {
      pCard.className = `rounded-2xl p-4 bg-slate-900 border ${colorClasses.border} shadow-xl space-y-2.5`;
    }
    if (pTag) {
      pTag.className = `text-[10px] font-mono font-bold uppercase tracking-wider ${colorClasses.tag} px-2 py-0.5 rounded border inline-block`;
    }

    if (pAction) {
      if (type === 'pdf') {
        pAction.innerHTML = `
          <button type="button" class="px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${colorClasses.badge} border">
            <i data-lucide="${icon}" class="w-3.5 h-3.5"></i>
            <span>${label}</span>
          </button>
        `;
      } else {
        pAction.innerHTML = `
          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold font-mono inline-flex items-center gap-1.5 ${colorClasses.badge} border">
            <i data-lucide="${icon}" class="w-3.5 h-3.5"></i>
            <span>${label}</span>
          </span>
        `;
      }
    }
    if (window.lucide) lucide.createIcons();
  },

  handleMosqueNoticeTypeChange: function () {
    const type = document.getElementById('modal-mn-type')?.value;
    const labelInput = document.getElementById('modal-mn-label');
    if (labelInput) {
      if (type === 'pdf') {
        labelInput.value = 'Download PDF';
      } else {
        labelInput.value = 'Routine Service';
      }
    }
  },

  saveMosqueNotice: function (e, existingId) {
    if (e) e.preventDefault();
    const refTag = document.getElementById('modal-mn-tag')?.value.trim();
    const issuedBy = document.getElementById('modal-mn-issuer')?.value.trim();
    const title = document.getElementById('modal-mn-title')?.value.trim();
    const details = document.getElementById('modal-mn-details')?.value.trim();
    const badgeType = document.getElementById('modal-mn-type')?.value;
    const badgeText = document.getElementById('modal-mn-label')?.value.trim();
    const icon = document.getElementById('modal-mn-icon')?.value;
    const badgeColor = document.getElementById('modal-mn-color')?.value;

    if (!refTag || !issuedBy || !title || !details) {
      this.showToast('Please fill out all required fields marked with *', 'warning');
      return;
    }

    const payload = {
      refTag,
      issuedBy,
      title,
      details,
      badgeType,
      badgeText,
      icon,
      badgeColor,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    if (existingId) {
      MahallDB.updateMosqueNotice(existingId, payload);
      this.showToast(`Updated notice ${refTag}!`, 'success');
    } else {
      MahallDB.createMosqueNotice(payload);
      this.showToast(`Published ${refTag} to Mosque Notices & Circulars!`, 'success');
    }

    this.closeModal();
    this.renderMosqueNoticesTable();
  },

  deleteMosqueNotice: function (id) {
    if (confirm('Are you sure you want to remove this notice from the public Mosque Notices & Circulars section?')) {
      MahallDB.deleteMosqueNotice(id);
      this.showToast('Mosque notice removed successfully.', 'info');
      this.renderMosqueNoticesTable();
    }
  },

  // =========================================================================
  // HIGH PRIORITY ALERTS: EMERGENCY & DISASTER NOTICES STUDIO
  // =========================================================================
  renderEmergencyNoticesTable: function () {
    const list = (typeof MahallDB !== 'undefined' && MahallDB.getEmergencyDisasterNotices) ? MahallDB.getEmergencyDisasterNotices() : [];
    const tbody = document.getElementById('emergency-notices-table-body');
    const badgeCount = document.getElementById('badge-emergency-notices-count');
    if (badgeCount) {
      const activeCount = list.filter(n => (n.status || 'ACTIVE').toUpperCase() === 'ACTIVE').length;
      badgeCount.textContent = `${activeCount} Active Alert${activeCount === 1 ? '' : 's'}`;
    }
    if (!tbody) return;

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-500">No emergency or disaster notices active. Click "+ Add New Notice in This Section" above to publish one.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(item => {
      const isActive = (item.status || 'ACTIVE').toUpperCase() === 'ACTIVE';
      const severityClass = item.severity === 'CRITICAL'
        ? 'bg-rose-950 text-rose-300 border-rose-800'
        : (item.severity === 'HIGH' ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-slate-800 text-slate-300 border-slate-700');

      return `
        <tr class="hover:bg-slate-950/40 transition">
          <td class="p-3.5 align-top">
            <span class="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 border border-rose-800 font-mono inline-block">
              ${this.escapeHTML(item.advisoryTag || 'EMERGENCY ADVISORY')}
            </span>
            <div class="flex items-center gap-1.5 mt-2">
              <span class="relative flex h-2 w-2">
                <span class="${isActive ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full ${isActive ? 'bg-emerald-400' : 'bg-slate-500'} opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 ${isActive ? 'bg-emerald-500' : 'bg-slate-500'}"></span>
              </span>
              <span class="text-[10px] font-bold font-mono ${isActive ? 'text-emerald-400' : 'text-slate-400'}">${isActive ? 'ACTIVE LIVE' : 'RESOLVED'}</span>
            </div>
            <div class="text-[10px] text-slate-500 font-mono mt-0.5">Ref: ${this.escapeHTML(item.id)}</div>
          </td>
          <td class="p-3.5 align-top max-w-sm sm:max-w-md">
            <p class="font-bold text-white text-sm leading-snug">${this.escapeHTML(item.title)}</p>
            <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">${this.escapeHTML(item.details)}</p>
          </td>
          <td class="p-3.5 align-top whitespace-nowrap">
            <div class="text-[10px] text-slate-400 uppercase font-medium tracking-wider">${this.escapeHTML(item.controlLabel || 'Emergency Rescue Control')}</div>
            <div class="text-sm font-mono font-black text-amber-400 mt-0.5">${this.escapeHTML(item.helpline || '+91 94470 12345')}</div>
          </td>
          <td class="p-3.5 align-top whitespace-nowrap">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${severityClass}">
              ${this.escapeHTML(item.severity || 'CRITICAL')}
            </span>
          </td>
          <td class="p-3.5 align-top text-right whitespace-nowrap space-x-1">
            <button onclick="AdminApp.openEmergencyNoticeModal('${item.id}')" title="Edit emergency notice" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button onclick="AdminApp.deleteEmergencyNotice('${item.id}')" title="Delete emergency notice" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  openEmergencyNoticeModal: function (existingId = null) {
    let existing = null;
    if (existingId && typeof MahallDB !== 'undefined' && MahallDB.getEmergencyDisasterNotices) {
      existing = MahallDB.getEmergencyDisasterNotices().find(n => n.id === existingId);
    }

    const defaultTag = existing ? existing.advisoryTag : 'Coastal Monsoon High Waves Advisory';
    const defaultTitle = existing ? existing.title : 'Kerala State Disaster Management Warning for Beach Wards';
    const defaultDetails = existing ? existing.details : 'High wave alert issued along Calicut beach coast for the next 48 hours. Fishermen residing in Ward 1, 6, and 8 are advised to secure country crafts. Noorul Huda Emergency Rescue Volunteer Brigade (NH-RVB) is on 24/7 standby.';
    const defaultControl = existing ? existing.controlLabel : 'Emergency Rescue Control';
    const defaultHelpline = existing ? existing.helpline : '+91 94470 12345';
    const defaultSeverity = existing ? existing.severity : 'CRITICAL';
    const defaultStatus = existing ? existing.status : 'ACTIVE';

    const html = `
      <div class="space-y-4 max-w-2xl mx-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800/60 font-mono">HIGH PRIORITY ALERTS</span>
              <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                Active Alert System
              </span>
            </div>
            <h3 class="text-base font-heading font-bold text-white flex items-center gap-2 mt-1">
              <i data-lucide="shield-alert" class="w-5 h-5 text-rose-400"></i>
              <span>${existing ? 'Edit Emergency & Disaster Notice' : 'Add New Notice to "Emergency & Disaster Notices"'}</span>
            </h3>
          </div>
          <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <p class="text-xs text-slate-400">
          This notice publishes directly into the <strong>High Priority Alerts: Emergency & Disaster Notices</strong> section on the public website with the prominent warning banner and direct rescue helpline.
        </p>

        <!-- Quick Presets -->
        <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1.5">
          <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Quick Calicut Coastal & Monsoon Presets:</span>
          <div class="flex flex-wrap gap-1.5">
            <button type="button" onclick="AdminApp.applyEmergencyPreset('coastal')" class="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[11px] text-rose-300 border border-rose-900/60 transition">
              🌊 Coastal Monsoon & High Waves
            </button>
            <button type="button" onclick="AdminApp.applyEmergencyPreset('flood')" class="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[11px] text-amber-300 border border-amber-900/60 transition">
              🌧️ Heavy Rainfall & Flash Flood
            </button>
            <button type="button" onclick="AdminApp.applyEmergencyPreset('wind')" class="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[11px] text-sky-300 border border-sky-900/60 transition">
              💨 Gale Wind & Cyclone Watch
            </button>
            <button type="button" onclick="AdminApp.applyEmergencyPreset('heat')" class="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[11px] text-orange-300 border border-orange-900/60 transition">
              ☀️ Heatwave & Sunstroke Advisory
            </button>
          </div>
        </div>

        <form onsubmit="AdminApp.saveEmergencyNotice(event, '${existingId || ''}')" class="space-y-3.5 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1 font-semibold">Advisory Tag / Kicker *</label>
              <input type="text" id="modal-ed-tag" required value="${this.escapeHTML(defaultTag)}" oninput="AdminApp.updateEmergencyNoticePreview()" placeholder="e.g. COASTAL MONSOON HIGH WAVES ADVISORY"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono uppercase focus:border-rose-500 focus:outline-none" />
            </div>

            <div>
              <label class="block text-slate-400 mb-1 font-semibold">Severity Priority Level</label>
              <select id="modal-ed-severity" onchange="AdminApp.updateEmergencyNoticePreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-rose-500 focus:outline-none">
                <option value="CRITICAL" ${defaultSeverity === 'CRITICAL' ? 'selected' : ''}>CRITICAL (Red Alert - Immediate Caution)</option>
                <option value="HIGH" ${defaultSeverity === 'HIGH' ? 'selected' : ''}>HIGH (Orange Alert - Active Standby)</option>
                <option value="MODERATE" ${defaultSeverity === 'MODERATE' ? 'selected' : ''}>MODERATE (Yellow Alert - Watch Advisory)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1 font-semibold">Warning Headline / Notice Title *</label>
            <input type="text" id="modal-ed-title" required value="${this.escapeHTML(defaultTitle)}" oninput="AdminApp.updateEmergencyNoticePreview()" placeholder="e.g. Kerala State Disaster Management Warning for Beach Wards"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold text-sm focus:border-rose-500 focus:outline-none" />
          </div>

          <div>
            <label class="block text-slate-400 mb-1 font-semibold">Advisory Details, Affected Wards & Precaution Directives *</label>
            <textarea id="modal-ed-details" required rows="3" oninput="AdminApp.updateEmergencyNoticePreview()" placeholder="Enter specific instructions for fishermen, ward residents, sandbag requirements, or volunteer standby details..."
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white leading-relaxed focus:border-rose-500 focus:outline-none">${this.escapeHTML(defaultDetails)}</textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-slate-400 mb-1 font-semibold">Control Desk Title</label>
              <input type="text" id="modal-ed-control" required value="${this.escapeHTML(defaultControl)}" oninput="AdminApp.updateEmergencyNoticePreview()" placeholder="Emergency Rescue Control"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-rose-500 focus:outline-none" />
            </div>

            <div>
              <label class="block text-slate-400 mb-1 font-semibold">Emergency Helpline Phone *</label>
              <input type="text" id="modal-ed-helpline" required value="${this.escapeHTML(defaultHelpline)}" oninput="AdminApp.updateEmergencyNoticePreview()" placeholder="+91 94470 12345"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-amber-400 font-mono font-bold focus:border-rose-500 focus:outline-none" />
            </div>

            <div>
              <label class="block text-slate-400 mb-1 font-semibold">Broadcast Status</label>
              <select id="modal-ed-status" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-rose-500 focus:outline-none">
                <option value="ACTIVE" ${defaultStatus === 'ACTIVE' ? 'selected' : ''}>ACTIVE (Broadcast Live on Website)</option>
                <option value="RESOLVED" ${defaultStatus === 'RESOLVED' ? 'selected' : ''}>RESOLVED / STANDBY (Archive)</option>
              </select>
            </div>
          </div>

          <!-- Live Visual Preview of Card -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Live Public Website Card Preview:</span>
            <div class="rounded-2xl p-4 bg-gradient-to-r from-red-950 via-rose-950 to-slate-950 text-white border border-red-500/40 shadow-xl space-y-2">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div class="space-y-1">
                  <span id="preview-ed-tag" class="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20 inline-block">
                    ${this.escapeHTML(defaultTag)}
                  </span>
                  <h4 id="preview-ed-title" class="text-sm font-bold text-white leading-tight">
                    ${this.escapeHTML(defaultTitle)}
                  </h4>
                  <p id="preview-ed-details" class="text-xs text-slate-300 max-w-xl line-clamp-2 leading-relaxed">
                    ${this.escapeHTML(defaultDetails)}
                  </p>
                </div>
                <div class="text-left sm:text-right shrink-0">
                  <div id="preview-ed-control" class="text-[9px] text-slate-400 uppercase font-medium">
                    ${this.escapeHTML(defaultControl)}
                  </div>
                  <div id="preview-ed-helpline" class="text-base font-mono font-black text-amber-400">
                    ${this.escapeHTML(defaultHelpline)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-rose-900/40 flex items-center gap-1.5">
              <i data-lucide="check" class="w-4 h-4"></i>
              <span>${existing ? 'Update Emergency Notice' : 'Broadcast to Public Section'}</span>
            </button>
          </div>
        </form>
      </div>
    `;

    this.openModal(html);
  },

  applyEmergencyPreset: function (type) {
    const tagEl = document.getElementById('modal-ed-tag');
    const titleEl = document.getElementById('modal-ed-title');
    const detailsEl = document.getElementById('modal-ed-details');
    const controlEl = document.getElementById('modal-ed-control');
    const helplineEl = document.getElementById('modal-ed-helpline');

    if (type === 'coastal') {
      if (tagEl) tagEl.value = 'Coastal Monsoon High Waves Advisory';
      if (titleEl) titleEl.value = 'Kerala State Disaster Management Warning for Beach Wards';
      if (detailsEl) detailsEl.value = 'High wave alert issued along Calicut beach coast for the next 48 hours. Fishermen residing in Ward 1, 6, and 8 are advised to secure country crafts. Noorul Huda Emergency Rescue Volunteer Brigade (NH-RVB) is on 24/7 standby.';
      if (controlEl) controlEl.value = 'Emergency Rescue Control';
      if (helplineEl) helplineEl.value = '+91 94470 12345';
    } else if (type === 'flood') {
      if (tagEl) tagEl.value = 'Heavy Rainfall & Flash Flood Red Alert';
      if (titleEl) titleEl.value = 'Red Warning: Severe Waterlogging in Low-Lying Mahall Wards';
      if (detailsEl) detailsEl.value = 'Continuous torrential rainfall recorded. Residents in riverbank sectors are alerted to prepare sandbags. Community evacuation center established at Mahall Madrasa Building 2.';
      if (controlEl) controlEl.value = 'Disaster Relief Volunteer Desk';
      if (helplineEl) helplineEl.value = '+91 94471 99880';
    } else if (type === 'wind') {
      if (tagEl) tagEl.value = 'Severe Gale Wind & Cyclone Alert';
      if (titleEl) titleEl.value = 'Squally Weather with Winds Reaching 55-65 km/h';
      if (detailsEl) detailsEl.value = 'Avoid traveling along beach promenade and under old trees. Residents are requested to secure rooftop sheets and tin sheds. Tree clearing quick squad is stationed at Central Mosque gate.';
      if (controlEl) controlEl.value = 'Mahall Safety Quick Desk';
      if (helplineEl) helplineEl.value = '+91 94470 12345';
    } else if (type === 'heat') {
      if (tagEl) tagEl.value = 'Extreme Heat & Sunstroke Public Health Alert';
      if (titleEl) titleEl.value = 'Day Temperature 4°C Above Normal - Avoid Direct Sunlight 11 AM - 3 PM';
      if (detailsEl) detailsEl.value = 'Elderly residents and children are strictly advised to stay hydrated. Free ORS electrolyte and cool drinking water kiosk operational at Mosque main portico.';
      if (controlEl) controlEl.value = 'Mahall Health Wing';
      if (helplineEl) helplineEl.value = '+91 94470 54321';
    }

    this.updateEmergencyNoticePreview();
  },

  updateEmergencyNoticePreview: function () {
    const tag = document.getElementById('modal-ed-tag')?.value || 'COASTAL MONSOON HIGH WAVES ADVISORY';
    const title = document.getElementById('modal-ed-title')?.value || 'Kerala State Disaster Management Warning';
    const details = document.getElementById('modal-ed-details')?.value || 'Emergency advisory details and directives...';
    const control = document.getElementById('modal-ed-control')?.value || 'Emergency Rescue Control';
    const helpline = document.getElementById('modal-ed-helpline')?.value || '+91 94470 12345';

    const pTag = document.getElementById('preview-ed-tag');
    const pTitle = document.getElementById('preview-ed-title');
    const pDetails = document.getElementById('preview-ed-details');
    const pControl = document.getElementById('preview-ed-control');
    const pHelpline = document.getElementById('preview-ed-helpline');

    if (pTag) pTag.textContent = tag;
    if (pTitle) pTitle.textContent = title;
    if (pDetails) pDetails.textContent = details;
    if (pControl) pControl.textContent = control;
    if (pHelpline) pHelpline.textContent = helpline;
  },

  saveEmergencyNotice: function (e, existingId) {
    if (e) e.preventDefault();
    const advisoryTag = document.getElementById('modal-ed-tag')?.value.trim();
    const title = document.getElementById('modal-ed-title')?.value.trim();
    const details = document.getElementById('modal-ed-details')?.value.trim();
    const controlLabel = document.getElementById('modal-ed-control')?.value.trim();
    const helpline = document.getElementById('modal-ed-helpline')?.value.trim();
    const severity = document.getElementById('modal-ed-severity')?.value;
    const status = document.getElementById('modal-ed-status')?.value;

    if (!advisoryTag || !title || !details || !helpline) {
      this.showToast('Please fill out all required fields marked with *', 'warning');
      return;
    }

    const payload = {
      advisoryTag,
      title,
      details,
      controlLabel: controlLabel || 'Emergency Rescue Control',
      helpline,
      severity: severity || 'CRITICAL',
      status: status || 'ACTIVE'
    };

    if (existingId) {
      MahallDB.updateEmergencyDisasterNotice(existingId, payload);
      this.showToast(`Updated emergency notice: ${title.slice(0, 30)}...`, 'success');
    } else {
      MahallDB.createEmergencyDisasterNotice(payload);
      this.showToast(`Published to Emergency & Disaster Notices section!`, 'success');
    }

    this.closeModal();
    this.renderEmergencyNoticesTable();
  },

  deleteEmergencyNotice: function (id) {
    if (confirm('Are you sure you want to remove this emergency notice from the public website?')) {
      MahallDB.deleteEmergencyDisasterNotice(id);
      this.showToast('Emergency notice removed.', 'info');
      this.renderEmergencyNoticesTable();
    }
  },

  filterAnnouncements: function (cat) {
    this.currentAnnFilter = cat;
    document.querySelectorAll('.ann-filter-btn').forEach(btn => {
      btn.classList.remove('bg-emerald-900', 'text-emerald-200', 'border-emerald-700');
      btn.classList.add('bg-slate-800', 'text-slate-300');
    });
    event.target.classList.add('bg-emerald-900', 'text-emerald-200', 'border-emerald-700');
    this.renderAnnouncements();
  },

  openAnnouncementModal: function (existingId = null) {
    let existing = null;
    if (existingId) {
      existing = (MahallDB.getAnnouncements() || []).find(a => a.id === existingId);
    }

    const defaultTitle = existing ? existing.title : 'Janazah Announcement: Marhum K. P. Alavi Haji';
    const defaultTitleMl = existing ? (existing.titleMl || '') : 'മയ്യത്ത് അറിയിപ്പ്: മർഹും കെ. പി. ആലവി ഹാജി';
    const defaultTitleAr = existing ? (existing.titleAr || '') : 'إعلان وفاة: المرحوم الحاج علوي';
    const defaultCat = existing ? existing.category : 'JANAZAH';
    const defaultPri = existing ? existing.priority : 'NORMAL';
    const defaultDetails = existing ? existing.details : 'Janazah prayer will be held at Noorul Huda Central Juma Masjid following Asr prayers today.';
    const defaultLoc = existing ? (existing.location || 'Noorul Huda Central Juma Masjid') : 'Noorul Huda Central Juma Masjid';
    const defaultContact = existing ? (existing.contact || '+91 94470 12345') : '+91 94470 12345';

    const catMap = {
      'JANAZAH': 'Janazah (Demise Notice)',
      'EMERGENCY': 'Emergency Notice',
      'GENERAL': 'General Body & Notice',
      'EDUCATION': 'Madrasa & Examination'
    };
    const priMap = {
      'NORMAL': 'Normal Bulletin',
      'HIGH': 'High Importance',
      'CRITICAL': 'Critical Urgent Notice'
    };

    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="megaphone" class="w-5 h-5 text-rose-400"></i>
            <span>${existing ? 'Edit Public Notice' : 'Broadcast New Community Notice'}</span>
          </h3>
          <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="AdminApp.handleSaveAnnouncement(event, '${existingId || ''}')" class="space-y-3 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Category</label>
              <select id="modal-ann-cat" onchange="AdminApp.updateAnnouncementPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="JANAZAH" ${defaultCat === 'JANAZAH' ? 'selected' : ''}>Janazah (Demise Notice)</option>
                <option value="EMERGENCY" ${defaultCat === 'EMERGENCY' ? 'selected' : ''}>Emergency (Blood / Disaster)</option>
                <option value="GENERAL" ${defaultCat === 'GENERAL' ? 'selected' : ''}>General Body & Mahall Notice</option>
                <option value="EDUCATION" ${defaultCat === 'EDUCATION' ? 'selected' : ''}>Madrasa & Examination</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Priority</label>
              <select id="modal-ann-pri" onchange="AdminApp.updateAnnouncementPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="NORMAL" ${defaultPri === 'NORMAL' ? 'selected' : ''}>Normal Bulletin</option>
                <option value="HIGH" ${defaultPri === 'HIGH' ? 'selected' : ''}>High Importance</option>
                <option value="CRITICAL" ${defaultPri === 'CRITICAL' ? 'selected' : ''}>Critical Urgent Notice</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Title (English) *</label>
            <input type="text" id="modal-ann-title" required value="${existing ? existing.title : ''}" oninput="AdminApp.updateAnnouncementPreview()" placeholder="e.g. Janazah Announcement: Marhum K. P. Alavi Haji"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Title (Malayalam)</label>
              <input type="text" id="modal-ann-title-ml" value="${existing ? existing.titleMl || '' : ''}" oninput="AdminApp.updateAnnouncementPreview()" placeholder="മയ്യത്ത് അറിയിപ്പ്..."
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-malayalam" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Title (Arabic)</label>
              <input type="text" id="modal-ann-title-ar" value="${existing ? existing.titleAr || '' : ''}" oninput="AdminApp.updateAnnouncementPreview()" placeholder="إعلان جنازة..."
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-amber-300 font-arabic text-right" />
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Full Announcement Details *</label>
            <textarea id="modal-ann-details" required rows="3" oninput="AdminApp.updateAnnouncementPreview()" placeholder="Enter full details, prayers time, burial ground, hospital name, or agenda points..."
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none">${existing ? existing.details || '' : ''}</textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Location / Venue</label>
              <input type="text" id="modal-ann-loc" value="${defaultLoc}" oninput="AdminApp.updateAnnouncementPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Contact Phone</label>
              <input type="text" id="modal-ann-contact" value="${defaultContact}" oninput="AdminApp.updateAnnouncementPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono" />
            </div>
          </div>

          <!-- Live Visual Preview of Announcement Card -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Live Public Website Card Preview:</span>
            <div id="preview-ann-card" class="rounded-2xl p-4 bg-slate-900 border border-emerald-500/40 shadow-xl space-y-2.5">
              <div class="flex items-center justify-between gap-2">
                <span id="preview-ann-cat" class="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 inline-block">
                  ${catMap[defaultCat] || 'NOTICE'}
                </span>
                <span id="preview-ann-pri" class="text-[10px] font-mono font-bold ${defaultPri === 'CRITICAL' ? 'text-rose-400 bg-rose-950/70 border-rose-800/50' : defaultPri === 'HIGH' ? 'text-amber-400 bg-amber-950/70 border-amber-800/50' : 'text-slate-300 bg-slate-800 border-slate-700'} px-2 py-0.5 rounded border">
                  ${priMap[defaultPri] || 'NORMAL'}
                </span>
              </div>
              <div>
                <h4 id="preview-ann-title" class="text-sm font-bold text-white leading-tight">
                  ${this.escapeHTML(defaultTitle)}
                </h4>
                <p id="preview-ann-title-ml" class="text-xs text-emerald-400 font-malayalam leading-tight mt-0.5 ${defaultTitleMl ? '' : 'hidden'}">
                  ${this.escapeHTML(defaultTitleMl)}
                </p>
                <p id="preview-ann-title-ar" class="text-xs text-amber-300 font-arabic text-right leading-tight mt-0.5 ${defaultTitleAr ? '' : 'hidden'}">
                  ${this.escapeHTML(defaultTitleAr)}
                </p>
                <p id="preview-ann-details" class="text-xs text-slate-300 max-w-xl line-clamp-2 leading-relaxed mt-1">
                  ${this.escapeHTML(defaultDetails)}
                </p>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <div class="flex items-center gap-1.5"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-emerald-400 shrink-0"></i><span id="preview-ann-loc" class="truncate">${this.escapeHTML(defaultLoc)}</span></div>
                <div class="flex items-center gap-1.5"><i data-lucide="phone" class="w-3.5 h-3.5 text-sky-400 shrink-0"></i><span id="preview-ann-contact" class="truncate font-mono">${this.escapeHTML(defaultContact)}</span></div>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/40">
              ${existing ? 'Update Notice' : 'Broadcast to Public'}
            </button>
          </div>
        </form>
      </div>
    `;
    this.openModal(html);
  },

  updateAnnouncementPreview: function () {
    const title = document.getElementById('modal-ann-title')?.value || 'Janazah Announcement: Marhum K. P. Alavi Haji';
    const titleMl = document.getElementById('modal-ann-title-ml')?.value || '';
    const titleAr = document.getElementById('modal-ann-title-ar')?.value || '';
    const catSelect = document.getElementById('modal-ann-cat');
    const catVal = catSelect ? catSelect.value : 'GENERAL';
    const catText = catSelect ? catSelect.options[catSelect.selectedIndex]?.text || 'General' : 'General';
    const priSelect = document.getElementById('modal-ann-pri');
    const priVal = priSelect ? priSelect.value : 'NORMAL';
    const priText = priSelect ? priSelect.options[priSelect.selectedIndex]?.text || 'Normal' : 'Normal';
    const details = document.getElementById('modal-ann-details')?.value || 'Enter full details, prayers time, burial ground, hospital name...';
    const loc = document.getElementById('modal-ann-loc')?.value || 'Noorul Huda Central Juma Masjid';
    const contact = document.getElementById('modal-ann-contact')?.value || '+91 94470 12345';

    const pCat = document.getElementById('preview-ann-cat');
    const pPri = document.getElementById('preview-ann-pri');
    const pTitle = document.getElementById('preview-ann-title');
    const pTitleMl = document.getElementById('preview-ann-title-ml');
    const pTitleAr = document.getElementById('preview-ann-title-ar');
    const pDetails = document.getElementById('preview-ann-details');
    const pLoc = document.getElementById('preview-ann-loc');
    const pContact = document.getElementById('preview-ann-contact');
    const pCard = document.getElementById('preview-ann-card');

    if (pCat) pCat.textContent = catText.toUpperCase();
    if (pPri) {
      pPri.textContent = priText.toUpperCase();
      pPri.className = `text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
        priVal === 'CRITICAL' ? 'text-rose-400 bg-rose-950/70 border-rose-800/50' :
        priVal === 'HIGH' ? 'text-amber-400 bg-amber-950/70 border-amber-800/50' :
        'text-slate-300 bg-slate-800 border-slate-700'
      }`;
    }
    if (pCard) {
      pCard.className = `rounded-2xl p-4 bg-slate-900 border ${
        catVal === 'JANAZAH' ? 'border-emerald-500/40' :
        catVal === 'EMERGENCY' ? 'border-rose-500/40' :
        catVal === 'EDUCATION' ? 'border-teal-500/40' :
        'border-sky-500/40'
      } shadow-xl space-y-2.5`;
    }
    if (pTitle) pTitle.textContent = title;
    if (pTitleMl) {
      pTitleMl.textContent = titleMl;
      pTitleMl.classList.toggle('hidden', !titleMl);
    }
    if (pTitleAr) {
      pTitleAr.textContent = titleAr;
      pTitleAr.classList.toggle('hidden', !titleAr);
    }
    if (pDetails) pDetails.textContent = details;
    if (pLoc) pLoc.textContent = loc;
    if (pContact) pContact.textContent = contact;
    if (window.lucide) lucide.createIcons();
  },

  editAnnouncement: function (id) {
    this.openAnnouncementModal(id);
  },

  handleSaveAnnouncement: function (e, existingId) {
    e.preventDefault();
    const cat = document.getElementById('modal-ann-cat').value;
    const pri = document.getElementById('modal-ann-pri').value;
    const title = document.getElementById('modal-ann-title').value.trim();
    const titleMl = document.getElementById('modal-ann-title-ml').value.trim();
    const titleAr = document.getElementById('modal-ann-title-ar').value.trim();
    const details = document.getElementById('modal-ann-details').value.trim();
    const loc = document.getElementById('modal-ann-loc').value.trim();
    const contact = document.getElementById('modal-ann-contact').value.trim();

    if (existingId) {
      MahallDB.updateAnnouncement(existingId, {
        category: cat,
        priority: pri,
        title: title,
        titleMl: titleMl || title,
        titleAr: titleAr || title,
        details: details,
        location: loc,
        contact: contact
      });
      this.showToast('Announcement updated successfully!', 'success');
    } else {
      MahallDB.createAnnouncement({
        category: cat,
        priority: pri,
        titleEn: title,
        titleMl: titleMl,
        titleAr: titleAr,
        details: details,
        location: loc,
        contact: contact
      });
      this.showToast('Notice broadcasted to public portal!', 'success');
    }

    this.closeModal();
    this.renderAnnouncements();
  },

  deleteAnnouncement: function (id) {
    if (confirm('Are you sure you want to remove this public notice?')) {
      MahallDB.deleteAnnouncement(id);
      this.showToast('Notice removed successfully.', 'info');
      this.renderAnnouncements();
    }
  },

  // =========================================================================
  // 8. EVENTS & CALENDAR MANAGER
  // =========================================================================
  renderEvents: function () {
    const list = MahallDB.getEvents ? MahallDB.getEvents() : [];
    const container = document.getElementById('events-cards-grid');
    if (!container) return;

    if (!list.length) {
      container.innerHTML = `<div class="col-span-3 p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">No upcoming community events scheduled.</div>`;
      return;
    }

    container.innerHTML = list.map(evt => {
      const rsvps = (typeof MahallDB !== 'undefined' && MahallDB.getEventRsvps) ? MahallDB.getEventRsvps(evt.id) : [];
      const totalRsvps = rsvps.reduce((acc, r) => acc + (r.seats || 1), 0);
      const seatsLeft = typeof evt.seatsLeft === 'number' ? evt.seatsLeft : 50;

      return `
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-sky-500/50 transition">
        <div class="space-y-2">
          <div class="flex items-center justify-between text-[11px]">
            <span class="px-2 py-0.5 rounded-md bg-sky-950 text-sky-300 border border-sky-800 font-semibold">${(evt.category || 'General').replace('_', ' ')}</span>
            <div class="flex items-center gap-1.5">
              <span class="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-mono font-bold">${totalRsvps} Registered</span>
              <span class="px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-400 border border-amber-800 font-mono">${seatsLeft} Seats Left</span>
            </div>
          </div>
          <h3 class="font-bold text-white text-base leading-snug">${evt.title}</h3>
          ${evt.titleMl ? `<p class="text-xs text-sky-400 font-malayalam">${evt.titleMl}</p>` : ''}
          <p class="text-xs text-slate-400 leading-relaxed line-clamp-3">${evt.description || ''}</p>

          <div class="pt-3 border-t border-slate-800/80 space-y-1 text-xs text-slate-300">
            <div class="flex items-center gap-2">
              <i data-lucide="calendar" class="w-3.5 h-3.5 text-sky-400"></i>
              <span>${evt.date} • ${evt.time}</span>
            </div>
            <div class="flex items-center gap-2">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 text-emerald-400"></i>
              <span>${evt.venue || 'Mahall Auditorium'}</span>
            </div>
            ${evt.speaker ? `
              <div class="flex items-center gap-2 text-amber-300">
                <i data-lucide="user" class="w-3.5 h-3.5"></i>
                <span>${evt.speaker}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
          <button onclick="AdminApp.viewEventRsvps('${evt.id}')" class="px-2.5 py-1.5 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/70 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition">
            <i data-lucide="ticket" class="w-3.5 h-3.5"></i>
            <span>Attendees (${rsvps.length})</span>
          </button>
          <div class="flex items-center gap-1.5">
            <button onclick="AdminApp.editEvent('${evt.id}')" class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              <span>Edit</span>
            </button>
            <button onclick="AdminApp.deleteEvent('${evt.id}')" class="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  openAddEventModal: function (existingId = null) {
    let existing = null;
    if (existingId) {
      existing = (MahallDB.getEvents() || []).find(e => e.id === existingId);
    }

    const defaultTitle = existing ? existing.title : 'Friday Spiritual Majlis & Tafseer Circle';
    const defaultTitleMl = existing ? (existing.titleMl || '') : 'വെള്ളിയാഴ്ച ആത്മീയ മജ്‌ലിസും തഫ്സീർ ക്ലാസും';
    const defaultCat = existing ? existing.category : 'QURAN_PROGRAM';
    const catMap = {
      'QURAN_PROGRAM': 'Quran Program & Majlis',
      'YOUTH_WING': 'Youth Wing & Career',
      'WOMEN_WING': 'Women Guidance Forum',
      'CHILDREN': "Children's Program & Fest",
      'GENERAL': 'Community Gathering'
    };
    const categoryLabel = catMap[defaultCat] || 'Quran Program & Majlis';
    const defaultDate = existing ? existing.date : 'Coming Friday';
    const defaultTime = existing ? existing.time : '07:00 PM - 08:30 PM';
    const defaultSeats = existing ? (typeof existing.seatsLeft === 'number' ? existing.seatsLeft : 50) : 50;
    const defaultVenue = existing ? (existing.venue || 'Main Prayer Hall, 1st Floor') : 'Main Prayer Hall, 1st Floor';
    const defaultSpeaker = existing ? (existing.speaker || 'Usthad Maulana Abdul Rasheed Faizy') : 'Usthad Maulana Abdul Rasheed Faizy';
    const defaultDesc = existing ? (existing.description || '') : 'Community spiritual gathering followed by collective Dua, Dhikr, and light refreshments.';

    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="calendar-plus" class="w-5 h-5 text-sky-400"></i>
            <span>${existing ? 'Edit Community Event' : 'Add New Community Event'}</span>
          </h3>
          <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="AdminApp.handleSaveEvent(event, '${existingId || ''}')" class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">Event Title *</label>
            <input type="text" id="modal-evt-title" required value="${existing ? existing.title : ''}" oninput="AdminApp.updateEventPreview()" placeholder="e.g. Friday Spiritual Majlis & Tafseer Circle"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Malayalam Title</label>
              <input type="text" id="modal-evt-title-ml" value="${existing ? existing.titleMl || '' : ''}" oninput="AdminApp.updateEventPreview()" placeholder="വെള്ളിയാഴ്ച ആത്മീയ മജ്‌ലിസ്..."
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-malayalam" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Category</label>
              <select id="modal-evt-cat" onchange="AdminApp.updateEventPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="QURAN_PROGRAM" ${existing && existing.category === 'QURAN_PROGRAM' ? 'selected' : ''}>Quran Program & Majlis</option>
                <option value="YOUTH_WING" ${existing && existing.category === 'YOUTH_WING' ? 'selected' : ''}>Youth Wing & Career</option>
                <option value="WOMEN_WING" ${existing && existing.category === 'WOMEN_WING' ? 'selected' : ''}>Women Guidance Forum</option>
                <option value="CHILDREN" ${existing && existing.category === 'CHILDREN' ? 'selected' : ''}>Children's Program & Fest</option>
                <option value="GENERAL" ${existing && existing.category === 'GENERAL' ? 'selected' : ''}>Community Gathering</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Date</label>
              <input type="text" id="modal-evt-date" required value="${existing ? existing.date : 'Coming Friday'}" oninput="AdminApp.updateEventPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Time</label>
              <input type="text" id="modal-evt-time" required value="${existing ? existing.time : '07:00 PM - 08:30 PM'}" oninput="AdminApp.updateEventPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Seats / Capacity</label>
              <input type="number" id="modal-evt-seats" min="1" max="1000" value="${existing ? (typeof existing.seatsLeft === 'number' ? existing.seatsLeft : 50) : 50}" oninput="AdminApp.updateEventPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Venue</label>
              <input type="text" id="modal-evt-venue" value="${existing ? existing.venue || '' : 'Main Prayer Hall, 1st Floor'}" oninput="AdminApp.updateEventPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Key Speaker / Usthad</label>
              <input type="text" id="modal-evt-speaker" value="${existing ? existing.speaker || '' : 'Usthad Maulana Abdul Rasheed Faizy'}" oninput="AdminApp.updateEventPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Description</label>
            <textarea id="modal-evt-desc" rows="2" oninput="AdminApp.updateEventPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">${existing ? existing.description || '' : ''}</textarea>
          </div>

          <!-- Live Visual Preview of Event Card -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Live Public Website Card Preview:</span>
            <div class="rounded-2xl p-4 bg-slate-900 border border-sky-500/40 shadow-xl space-y-2.5">
              <div class="flex items-center justify-between gap-2">
                <span id="preview-evt-cat" class="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/60 inline-block">
                  ${categoryLabel}
                </span>
                <span id="preview-evt-seats" class="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-800/50">
                  ${defaultSeats} Seats Left
                </span>
              </div>
              <div>
                <h4 id="preview-evt-title" class="text-sm font-bold text-white leading-tight">
                  ${this.escapeHTML(defaultTitle)}
                </h4>
                <p id="preview-evt-title-ml" class="text-xs text-emerald-400 font-malayalam leading-tight mt-0.5 ${defaultTitleMl ? '' : 'hidden'}">
                  ${this.escapeHTML(defaultTitleMl)}
                </p>
                <p id="preview-evt-desc" class="text-xs text-slate-300 max-w-xl line-clamp-2 leading-relaxed mt-1">
                  ${this.escapeHTML(defaultDesc)}
                </p>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <div class="flex items-center gap-1.5"><i data-lucide="calendar" class="w-3.5 h-3.5 text-sky-400 shrink-0"></i><span id="preview-evt-datetime" class="truncate">${this.escapeHTML(defaultDate)} (${this.escapeHTML(defaultTime)})</span></div>
                <div class="flex items-center gap-1.5"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-emerald-400 shrink-0"></i><span id="preview-evt-venue" class="truncate">${this.escapeHTML(defaultVenue)}</span></div>
                <div class="flex items-center gap-1.5"><i data-lucide="user" class="w-3.5 h-3.5 text-amber-400 shrink-0"></i><span id="preview-evt-speaker" class="truncate">${this.escapeHTML(defaultSpeaker)}</span></div>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/40">Save Event</button>
          </div>
        </form>
      </div>
    `;
    this.openModal(html);
  },

  updateEventPreview: function () {
    const title = document.getElementById('modal-evt-title')?.value || 'e.g. Friday Spiritual Majlis & Tafseer Circle';
    const titleMl = document.getElementById('modal-evt-title-ml')?.value || '';
    const catSelect = document.getElementById('modal-evt-cat');
    const catText = catSelect ? catSelect.options[catSelect.selectedIndex]?.text || 'General' : 'General';
    const date = document.getElementById('modal-evt-date')?.value || 'Coming Friday';
    const time = document.getElementById('modal-evt-time')?.value || '07:00 PM - 08:30 PM';
    const seats = document.getElementById('modal-evt-seats')?.value || '50';
    const venue = document.getElementById('modal-evt-venue')?.value || 'Main Prayer Hall, 1st Floor';
    const speaker = document.getElementById('modal-evt-speaker')?.value || 'Usthad Maulana Abdul Rasheed Faizy';
    const desc = document.getElementById('modal-evt-desc')?.value || 'Community spiritual gathering followed by collective Dua, Dhikr, and light refreshments.';

    const pCat = document.getElementById('preview-evt-cat');
    const pSeats = document.getElementById('preview-evt-seats');
    const pTitle = document.getElementById('preview-evt-title');
    const pTitleMl = document.getElementById('preview-evt-title-ml');
    const pDesc = document.getElementById('preview-evt-desc');
    const pDatetime = document.getElementById('preview-evt-datetime');
    const pVenue = document.getElementById('preview-evt-venue');
    const pSpeaker = document.getElementById('preview-evt-speaker');

    if (pCat) pCat.textContent = catText.toUpperCase();
    if (pSeats) pSeats.textContent = parseInt(seats) <= 0 ? 'Housefull' : `${seats} Seats Left`;
    if (pTitle) pTitle.textContent = title;
    if (pTitleMl) {
      pTitleMl.textContent = titleMl;
      pTitleMl.classList.toggle('hidden', !titleMl);
    }
    if (pDesc) pDesc.textContent = desc;
    if (pDatetime) pDatetime.textContent = `${date} (${time})`;
    if (pVenue) pVenue.textContent = venue;
    if (pSpeaker) pSpeaker.textContent = speaker;
    if (window.lucide) lucide.createIcons();
  },

  editEvent: function (id) {
    this.openAddEventModal(id);
  },

  handleSaveEvent: function (e, existingId) {
    e.preventDefault();
    const title = document.getElementById('modal-evt-title').value.trim();
    const titleMl = document.getElementById('modal-evt-title-ml').value.trim();
    const cat = document.getElementById('modal-evt-cat').value;
    const date = document.getElementById('modal-evt-date').value.trim();
    const time = document.getElementById('modal-evt-time').value.trim();
    const seats = parseInt(document.getElementById('modal-evt-seats').value, 10) || 50;
    const venue = document.getElementById('modal-evt-venue').value.trim();
    const speaker = document.getElementById('modal-evt-speaker').value.trim();
    const desc = document.getElementById('modal-evt-desc').value.trim();

    const data = {
      title: title,
      titleMl: titleMl || title,
      category: cat,
      date: date,
      time: time,
      venue: venue,
      speaker: speaker,
      description: desc,
      seatsLeft: seats
    };

    if (existingId) {
      MahallDB.updateEvent(existingId, data);
      this.showToast('Event updated successfully!', 'success');
    } else {
      MahallDB.addEvent(data);
      this.showToast('New event scheduled on community calendar!', 'success');
    }

    this.closeModal();
    this.renderEvents();
  },

  deleteEvent: function (id) {
    if (confirm('Delete this community event?')) {
      MahallDB.deleteEvent(id);
      this.showToast('Event deleted.', 'info');
      this.renderEvents();
    }
  },

  viewEventRsvps: function (eventId) {
    this.currentViewingEventRsvpId = eventId;
    const events = MahallDB.getEvents ? MahallDB.getEvents() : [];
    const evt = events.find(e => e.id === eventId);
    if (!evt) return;

    const rsvps = (typeof MahallDB !== 'undefined' && MahallDB.getEventRsvps) ? MahallDB.getEventRsvps(eventId) : [];
    const totalSeats = rsvps.reduce((acc, r) => acc + (r.seats || 1), 0);

    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
              <i data-lucide="ticket" class="w-5 h-5 text-emerald-400"></i>
              <span>Registered Attendees: ${evt.title}</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">${rsvps.length} Pass(es) Issued • ${totalSeats} seats booked • ${evt.seatsLeft || 0} seats remaining</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="AdminApp.openManualRsvpModal('${eventId}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow">
              <i data-lucide="user-plus" class="w-3.5 h-3.5"></i>
              <span>+ Issue Pass</span>
            </button>
            <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
        </div>

        <div class="max-h-[380px] overflow-y-auto">
          ${rsvps.length === 0 ? `
            <div class="p-8 text-center text-slate-500 text-xs">No community members registered for this event yet.</div>
          ` : `
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th class="p-3">Attendee</th>
                  <th class="p-3">Pass ID</th>
                  <th class="p-3">Phone</th>
                  <th class="p-3">Family ID</th>
                  <th class="p-3 text-center">Seats</th>
                  <th class="p-3">Registered At</th>
                  <th class="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/80">
                ${rsvps.map(r => `
                  <tr class="hover:bg-slate-950/40 transition">
                    <td class="p-3">
                      <div class="font-bold text-white">${r.name}</div>
                      ${r.notes ? `<div class="text-[10px] text-slate-400 italic">"${r.notes}"</div>` : ''}
                    </td>
                    <td class="p-3 font-mono font-bold text-amber-300 text-[11px]">${r.rsvpId}</td>
                    <td class="p-3 font-mono text-slate-300">${r.phone}</td>
                    <td class="p-3 text-slate-400">${r.familyId || 'Guest'}</td>
                    <td class="p-3 text-center">
                      <span class="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800 font-mono">${r.seats}</span>
                    </td>
                    <td class="p-3 text-slate-400 text-[11px]">${r.registeredAt || 'Recent'}</td>
                    <td class="p-3 text-right">
                      <button onclick="AdminApp.deleteRsvpAttendee('${r.rsvpId}', '${eventId}')" title="Cancel & Release Seat" class="p-1 text-rose-400 hover:bg-rose-950/60 rounded transition">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>

        <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button onclick="window.print()" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition">
            <i data-lucide="printer" class="w-3.5 h-3.5"></i> Print Roster
          </button>
          <button onclick="AdminApp.closeModal()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold">
            Done
          </button>
        </div>
      </div>
    `;

    this.openModal(html);
  },

  openManualRsvpModal: function (eventId) {
    const events = MahallDB.getEvents ? MahallDB.getEvents() : [];
    const evt = events.find(e => e.id === eventId);
    if (!evt) return;

    const modalHtml = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <i data-lucide="ticket" class="w-5 h-5"></i>
            </span>
            <div>
              <h3 class="text-base font-heading font-bold text-white">Issue Official Event Pass</h3>
              <p class="text-xs text-slate-400">${evt.title} • ${evt.seatsLeft || 0} seats left</p>
            </div>
          </div>
          <button onclick="AdminApp.viewEventRsvps('${eventId}')" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <form id="admin-manual-rsvp-form" onsubmit="event.preventDefault(); AdminApp.saveManualRsvp('${eventId}');" class="space-y-3 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Attendee Name *</label>
              <input type="text" id="admin-rsvp-name" required placeholder="Full Name" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Phone / WhatsApp *</label>
              <input type="tel" id="admin-rsvp-phone" required placeholder="+91 94470 12345" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Seats to Allocate</label>
              <select id="admin-rsvp-seats" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500">
                <option value="1">1 Seat</option>
                <option value="2">2 Seats</option>
                <option value="3">3 Seats</option>
                <option value="4">4 Seats</option>
                <option value="5">5 Seats</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Mahall Family ID / Ward</label>
              <input type="text" id="admin-rsvp-family" placeholder="e.g. W02-F005 or Guest" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Special Notes / Seating (Optional)</label>
            <input type="text" id="admin-rsvp-notes" placeholder="e.g. VIP seating / Guest of Honor" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500" />
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button type="button" onclick="AdminApp.viewEventRsvps('${eventId}')" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium">Back to Roster</button>
            <button type="submit" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/30 flex items-center gap-1.5">
              <i data-lucide="check" class="w-3.5 h-3.5"></i> Confirm & Issue Pass
            </button>
          </div>
        </form>
      </div>
    `;

    this.openModal(modalHtml);
  },

  saveManualRsvp: function (eventId) {
    const name = document.getElementById('admin-rsvp-name')?.value?.trim();
    const phone = document.getElementById('admin-rsvp-phone')?.value?.trim();
    const seats = parseInt(document.getElementById('admin-rsvp-seats')?.value || 1, 10);
    const familyId = document.getElementById('admin-rsvp-family')?.value?.trim();
    const notes = document.getElementById('admin-rsvp-notes')?.value?.trim();

    if (!name || !phone) {
      this.showToast('Please provide attendee name and phone.', 'warning');
      return;
    }

    try {
      const pass = MahallDB.registerEventRsvp({ eventId, name, phone, familyId, seats, notes });
      this.showToast(`Pass #${pass.rsvpId} issued for ${pass.name}!`, 'success');
      this.renderEvents();
      this.viewEventRsvps(eventId);
    } catch (err) {
      this.showToast(err.message || 'Error creating pass', 'error');
    }
  },

  deleteRsvpAttendee: function (rsvpId, eventId) {
    if (confirm('Cancel this attendee registration and restore their seats?')) {
      MahallDB.cancelEventRsvp(rsvpId);
      this.showToast('Attendee cancelled and seat restored.', 'info');
      this.renderEvents();
      this.viewEventRsvps(eventId);
    }
  },

  // =========================================================================
  // 9. CENSUS & FAMILY DIRECTORY
  // =========================================================================
  renderCensus: function () {
    let list = MahallDB.getFamilies ? MahallDB.getFamilies() : [];
    const search = (document.getElementById('census-search-input') ? document.getElementById('census-search-input').value : '').toLowerCase().trim();
    const wardFilter = document.getElementById('census-ward-select') ? document.getElementById('census-ward-select').value : 'all';

    if (wardFilter !== 'all') {
      list = list.filter(f => (f.ward || '').includes(wardFilter));
    }

    if (search) {
      list = list.filter(f =>
        (f.familyId || '').toLowerCase().includes(search) ||
        (f.head || '').toLowerCase().includes(search) ||
        (f.houseName || '').toLowerCase().includes(search) ||
        (f.phone || '').includes(search)
      );
    }

    const tbody = document.getElementById('census-table-body');
    if (!tbody) return;

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-slate-500">No census families found matching your criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(f => `
      <tr class="hover:bg-slate-950/40 transition">
        <td class="p-4 align-top whitespace-nowrap">
          <div class="flex flex-col gap-1">
            <span class="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded-lg border border-emerald-800/60">${f.familyId}</span>
            <span class="font-mono text-[10px] text-cyan-300 bg-cyan-950/60 border border-cyan-800/50 px-1.5 py-0.5 rounded flex items-center gap-1 w-fit" title="User Portal Login ID">
              <i data-lucide="key" class="w-3 h-3 text-cyan-400"></i> ${f.userId || f.familyId}
            </span>
          </div>
        </td>
        <td class="p-4 align-top">
          <p class="font-bold text-white text-sm">${f.head}</p>
          <p class="text-[11px] text-slate-400">${f.occupation || 'Resident'}</p>
        </td>
        <td class="p-4 align-top">
          <div class="text-slate-300">${f.houseName || 'House'} (${f.houseNo || '-'})</div>
          <div class="text-[11px] text-slate-500">${f.ward || 'Ward 02'}</div>
        </td>
        <td class="p-4 align-top whitespace-nowrap">
          <span class="font-mono text-slate-300">${f.phone || '-'}</span>
        </td>
        <td class="p-4 align-top text-center whitespace-nowrap">
          <span class="px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 font-semibold">${f.membersCount || (f.members ? f.members.length : 1)}</span>
        </td>
        <td class="p-4 align-top whitespace-nowrap">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${f.monthlyStatus === 'PAID' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}">
            ${f.monthlyStatus || 'PENDING'}
          </span>
        </td>
        <td class="p-4 align-top text-right whitespace-nowrap space-x-1">
          <button onclick="AdminApp.copyFamilyCredentials('${f.familyId}')" title="Copy Resident Portal Credentials" class="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition">
            <i data-lucide="key" class="w-4 h-4"></i>
          </button>
          <button onclick="AdminApp.viewFamilyCard('${f.familyId}')" title="View Full Family Tree & Credentials" class="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition">
            <i data-lucide="eye" class="w-4 h-4"></i>
          </button>
          <button onclick="AdminApp.openAddFamilyModal('${f.familyId}')" title="Edit Family Record" class="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
          <button onclick="AdminApp.deleteFamily('${f.familyId}')" title="Delete Family Record" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  filterCensus: function () {
    this.renderCensus();
  },

  openAddFamilyModal: function (existingId = null) {
    let existing = null;
    if (existingId) {
      existing = (MahallDB.getFamilies() || []).find(f => f.familyId.toUpperCase() === existingId.toUpperCase());
    }

    const defaultFamId = existing ? existing.familyId : `W02-F0${Math.floor(20 + Math.random() * 80)}`;
    const defaultUserId = existing ? (existing.userId || existing.familyId) : defaultFamId;
    const defaultPassword = existing ? (existing.password || existing.pin || '1968') : ('NHM@' + Math.floor(1000 + Math.random() * 9000));
    const defaultWard = existing && existing.ward ? existing.ward : 'Ward 02 (Masjid Central)';
    const defaultHead = existing ? existing.head : '';
    const defaultOcc = existing ? (existing.occupation || '') : '';
    const defaultHouseNo = existing ? (existing.houseNo || '') : '';
    const defaultHouseName = existing ? (existing.houseName || '') : '';
    const defaultPhone = existing ? (existing.phone || '+91 ') : '+91 ';
    const defaultBlood = existing ? (existing.bloodGroup || 'O+') : 'O+';

    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="user-plus" class="w-5 h-5 text-emerald-400"></i>
            <span>${existing ? 'Edit Family Census Dossier' : 'Register New Mahall Family'}</span>
          </h3>
          <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="AdminApp.handleSaveFamily(event, '${existingId || ''}')" class="space-y-3.5 text-xs">
          <!-- FAMILY ID & WARD -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Family ID *</label>
              <input type="text" id="modal-fam-id" required value="${defaultFamId}" oninput="AdminApp.handleFamilyIdInput()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-emerald-400 font-mono font-bold" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Ward Selection *</label>
              <select id="modal-fam-ward" onchange="AdminApp.updateFamilyPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="Ward 01 (East Bazar)" ${defaultWard.includes('01') ? 'selected' : ''}>Ward 01 (East Bazar)</option>
                <option value="Ward 02 (Masjid Central)" ${defaultWard.includes('02') ? 'selected' : ''}>Ward 02 (Masjid Central)</option>
                <option value="Ward 03 (River View)" ${defaultWard.includes('03') ? 'selected' : ''}>Ward 03 (River View)</option>
                <option value="Ward 04 (Hill Valley)" ${defaultWard.includes('04') ? 'selected' : ''}>Ward 04 (Hill Valley)</option>
                <option value="Ward 05 (Town West)" ${defaultWard.includes('05') ? 'selected' : ''}>Ward 05 (Town West)</option>
              </select>
            </div>
          </div>

          <!-- RESIDENT PORTAL ACCESS CREDENTIALS -->
          <div class="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/40 border border-cyan-500/40 space-y-2.5">
            <div class="flex items-center justify-between border-b border-cyan-800/40 pb-2">
              <span class="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <i data-lucide="shield-check" class="w-4 h-4 text-cyan-400"></i>
                Resident Portal Security Credentials
              </span>
              <span class="text-[10px] text-slate-400 font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">Main Portal Login</span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-slate-300 font-medium">User ID (Login ID) *</label>
                  <button type="button" onclick="AdminApp.syncUserIdWithFamilyId()" class="text-[10px] text-cyan-400 hover:underline">Use Family ID</button>
                </div>
                <input type="text" id="modal-fam-userid" required value="${defaultUserId}" oninput="AdminApp.updateFamilyPreview()"
                  placeholder="e.g. W02-F005 or username"
                  class="w-full bg-slate-950 border border-cyan-500/50 rounded-xl p-2.5 text-cyan-300 font-mono font-bold focus:border-cyan-400 focus:outline-none" />
                <p class="text-[10px] text-slate-400 mt-1">User ID typed by family in the main portal Security Section.</p>
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-slate-300 font-medium">Password *</label>
                  <button type="button" onclick="AdminApp.generateRandomPassword()" class="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5">
                    <i data-lucide="sparkles" class="w-3 h-3"></i> Auto-Generate
                  </button>
                </div>
                <div class="relative">
                  <input type="text" id="modal-fam-password" required value="${defaultPassword}" oninput="AdminApp.updateFamilyPreview()"
                    placeholder="Enter security password or PIN"
                    class="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-2.5 text-amber-300 font-mono font-bold pr-10 focus:border-amber-400 focus:outline-none" />
                  <button type="button" onclick="AdminApp.toggleModalPasswordVisibility()" class="absolute right-2.5 top-2.5 text-slate-400 hover:text-white" title="Toggle visibility">
                    <i id="modal-pass-toggle-icon" data-lucide="eye" class="w-4 h-4"></i>
                  </button>
                </div>
                <p class="text-[10px] text-slate-400 mt-1">Secret password/PIN for resident portal login.</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Head of Family *</label>
              <input type="text" id="modal-fam-head" required value="${existing ? existing.head : ''}" oninput="AdminApp.updateFamilyPreview()" placeholder="Full Legal Name"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Occupation / Trade</label>
              <input type="text" id="modal-fam-occ" value="${existing ? existing.occupation || '' : ''}" oninput="AdminApp.updateFamilyPreview()" placeholder="e.g. Senior Accountant"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">House Number</label>
              <input type="text" id="modal-fam-houseno" value="${existing ? existing.houseNo || '' : ''}" oninput="AdminApp.updateFamilyPreview()" placeholder="e.g. 22/115"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">House / Villa Name</label>
              <input type="text" id="modal-fam-housename" value="${existing ? existing.houseName || '' : ''}" oninput="AdminApp.updateFamilyPreview()" placeholder="e.g. Al-Falah Villa"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Primary Phone *</label>
              <input type="text" id="modal-fam-phone" required value="${existing ? existing.phone : '+91 '}" oninput="AdminApp.updateFamilyPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Blood Group (Head)</label>
              <select id="modal-fam-blood" onchange="AdminApp.updateFamilyPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="O+" ${defaultBlood === 'O+' ? 'selected' : ''}>O+ (Positive)</option>
                <option value="A+" ${defaultBlood === 'A+' ? 'selected' : ''}>A+ (Positive)</option>
                <option value="B+" ${defaultBlood === 'B+' ? 'selected' : ''}>B+ (Positive)</option>
                <option value="AB+" ${defaultBlood === 'AB+' ? 'selected' : ''}>AB+ (Positive)</option>
                <option value="O-" ${defaultBlood === 'O-' ? 'selected' : ''}>O- (Negative)</option>
                <option value="A-" ${defaultBlood === 'A-' ? 'selected' : ''}>A- (Negative)</option>
                <option value="B-" ${defaultBlood === 'B-' ? 'selected' : ''}>B- (Negative)</option>
                <option value="AB-" ${defaultBlood === 'AB-' ? 'selected' : ''}>AB- (Negative)</option>
              </select>
            </div>
          </div>

          <!-- Live Visual Preview of Family Census Card -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Live Resident Family Census Smart Card Preview:</span>
            <div class="rounded-2xl p-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl space-y-2 relative">
              <div class="flex items-center justify-between border-b border-emerald-800/40 pb-2">
                <div class="flex items-center gap-2">
                  <span id="preview-fam-id" class="text-xs font-mono font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700/60">
                    ${defaultFamId}
                  </span>
                  <span id="preview-fam-ward" class="text-[10px] font-semibold text-slate-300">
                    ${defaultWard}
                  </span>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono text-[9px] font-bold">CENSUS REGISTERED</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span class="text-[10px] text-slate-400 block">Head of Family:</span>
                  <strong id="preview-fam-head" class="text-white text-xs font-semibold">${this.escapeHTML(defaultHead || 'Head Name')}</strong>
                  <span id="preview-fam-occ" class="text-[10px] text-slate-400 block">${this.escapeHTML(defaultOcc || 'Resident')}</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 block">Residence:</span>
                  <strong id="preview-fam-house" class="text-slate-200 text-xs font-medium block">${this.escapeHTML(defaultHouseName || 'House')} (${this.escapeHTML(defaultHouseNo || '-')})</strong>
                  <span id="preview-fam-phone" class="text-[10px] font-mono text-emerald-400 block">${this.escapeHTML(defaultPhone)}</span>
                </div>
              </div>
              <!-- Credentials preview pill -->
              <div class="bg-slate-950/80 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-[10px] font-mono">
                <span class="text-cyan-400">Portal User ID: <strong id="preview-fam-userid" class="text-white font-bold">${defaultUserId}</strong></span>
                <span class="text-amber-400">Password: <strong id="preview-fam-password" class="text-white font-bold">${defaultPassword}</strong></span>
              </div>
              <div class="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span class="text-slate-400 flex items-center gap-1.5"><i data-lucide="droplet" class="w-3.5 h-3.5 text-rose-400"></i> Head Blood Group: <strong id="preview-fam-blood" class="text-rose-400 font-mono">${defaultBlood}</strong></span>
                <span class="text-emerald-400 font-bold flex items-center gap-1"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Active Citizen Dossier</span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold">
              ${existing ? 'Update Family Dossier' : 'Save & Register Family'}
            </button>
          </div>
        </form>
      </div>
    `;
    this.openModal(html);
  },

  handleFamilyIdInput: function () {
    const famIdInput = document.getElementById('modal-fam-id');
    const userIdInput = document.getElementById('modal-fam-userid');
    if (famIdInput && userIdInput && (!userIdInput.dataset.manuallyEdited || userIdInput.dataset.manuallyEdited === 'false')) {
      userIdInput.value = famIdInput.value.trim().toUpperCase();
    }
    this.updateFamilyPreview();
  },

  syncUserIdWithFamilyId: function () {
    const famIdInput = document.getElementById('modal-fam-id');
    const userIdInput = document.getElementById('modal-fam-userid');
    if (famIdInput && userIdInput) {
      userIdInput.value = famIdInput.value.trim().toUpperCase();
      userIdInput.dataset.manuallyEdited = 'false';
      this.updateFamilyPreview();
      this.showToast('User ID synchronized with Family ID', 'info');
    }
  },

  generateRandomPassword: function () {
    const passInput = document.getElementById('modal-fam-password');
    if (passInput) {
      const generated = 'NHM@' + Math.floor(1000 + Math.random() * 9000);
      passInput.value = generated;
      this.updateFamilyPreview();
      this.showToast(`Auto-generated secure password: ${generated}`, 'success');
    }
  },

  toggleModalPasswordVisibility: function () {
    const passInput = document.getElementById('modal-fam-password');
    const icon = document.getElementById('modal-pass-toggle-icon');
    if (passInput) {
      if (passInput.type === 'password') {
        passInput.type = 'text';
        if (icon) icon.setAttribute('data-lucide', 'eye-off');
      } else {
        passInput.type = 'password';
        if (icon) icon.setAttribute('data-lucide', 'eye');
      }
      if (window.lucide) lucide.createIcons();
    }
  },

  updateFamilyPreview: function () {
    const famId = document.getElementById('modal-fam-id')?.value || 'W02-F001';
    const userId = document.getElementById('modal-fam-userid')?.value || famId;
    const password = document.getElementById('modal-fam-password')?.value || '••••';
    const wardSelect = document.getElementById('modal-fam-ward');
    const ward = wardSelect ? wardSelect.value : 'Ward 02 (Masjid Central)';
    const head = document.getElementById('modal-fam-head')?.value || 'Head Name';
    const occ = document.getElementById('modal-fam-occ')?.value || 'Resident';
    const houseNo = document.getElementById('modal-fam-houseno')?.value || '-';
    const houseName = document.getElementById('modal-fam-housename')?.value || 'House';
    const phone = document.getElementById('modal-fam-phone')?.value || '+91 94470 12345';
    const bloodSelect = document.getElementById('modal-fam-blood');
    const blood = bloodSelect ? bloodSelect.value : 'O+';

    const pFamId = document.getElementById('preview-fam-id');
    const pUserId = document.getElementById('preview-fam-userid');
    const pPassword = document.getElementById('preview-fam-password');
    const pWard = document.getElementById('preview-fam-ward');
    const pHead = document.getElementById('preview-fam-head');
    const pOcc = document.getElementById('preview-fam-occ');
    const pHouse = document.getElementById('preview-fam-house');
    const pPhone = document.getElementById('preview-fam-phone');
    const pBlood = document.getElementById('preview-fam-blood');

    if (pFamId) pFamId.textContent = famId.toUpperCase();
    if (pUserId) pUserId.textContent = userId;
    if (pPassword) pPassword.textContent = password;
    if (pWard) pWard.textContent = ward;
    if (pHead) pHead.textContent = head;
    if (pOcc) pOcc.textContent = occ;
    if (pHouse) pHouse.textContent = `${houseName} (${houseNo})`;
    if (pPhone) pPhone.textContent = phone;
    if (pBlood) pBlood.textContent = blood;
    if (window.lucide) lucide.createIcons();
  },

  handleSaveFamily: function (e, existingId) {
    e.preventDefault();
    const famId = document.getElementById('modal-fam-id').value.trim();
    const userId = (document.getElementById('modal-fam-userid')?.value || famId).trim();
    const password = (document.getElementById('modal-fam-password')?.value || '1968').trim();
    const ward = document.getElementById('modal-fam-ward').value;
    const head = document.getElementById('modal-fam-head').value.trim();
    const occ = document.getElementById('modal-fam-occ').value.trim();
    const houseNo = document.getElementById('modal-fam-houseno').value.trim();
    const houseName = document.getElementById('modal-fam-housename').value.trim();
    const phone = document.getElementById('modal-fam-phone').value.trim();
    const blood = document.getElementById('modal-fam-blood').value;

    const data = {
      familyId: famId,
      userId: userId,
      password: password,
      pin: password,
      ward: ward,
      head: head,
      occupation: occ,
      houseNo: houseNo,
      houseName: houseName,
      phone: phone,
      bloodGroup: blood,
      monthlyStatus: 'PENDING',
      membersCount: 1,
      members: [
        { name: head, relation: 'Head of Family', age: 45, blood: blood, occ: occ }
      ]
    };

    if (existingId) {
      MahallDB.updateFamily(existingId, data);
      this.showToast(`Updated records for family ${famId} (User ID: ${userId})`, 'success');
    } else {
      MahallDB.addFamily(data);
      this.showToast(`Family ${famId} registered! User ID: ${userId} • Password: ${password}`, 'success');
    }

    this.closeModal();
    this.renderCensus();
    this.renderUsers();
    this.renderKPIs();
  },

  deleteFamily: function (familyId) {
    if (confirm(`Are you sure you want to permanently delete family record ${familyId}?`)) {
      MahallDB.deleteFamily(familyId);
      this.showToast(`Family ${familyId} deleted from census and user registry.`, 'info');
      this.renderCensus();
      this.renderUsers();
      this.renderKPIs();
    }
  },

  viewFamilyCard: function (familyId) {
    const f = (MahallDB.getFamilies() || []).find(fam => fam.familyId.toUpperCase() === familyId.toUpperCase() || (fam.userId && fam.userId.toUpperCase() === familyId.toUpperCase()));
    if (!f) return;

    const members = f.members || [{ name: f.head, relation: 'Head', age: 50, blood: f.bloodGroup || 'O+', occ: f.occupation || '-' }];

    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">${f.familyId}</span>
              <span class="text-xs font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 flex items-center gap-1">
                <i data-lucide="key" class="w-3 h-3 text-cyan-400"></i> User: ${f.userId || f.familyId}
              </span>
            </div>
            <h3 class="text-lg font-heading font-bold text-white mt-1.5">${f.head}</h3>
            <p class="text-xs text-slate-400">${f.houseName} (${f.houseNo}), ${f.ward}</p>
          </div>
          <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- RESIDENT PORTAL ACCESS CREDENTIALS BOX -->
        <div class="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/40 border border-cyan-500/40 space-y-2">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <i data-lucide="shield-check" class="w-4 h-4"></i>
              </div>
              <div>
                <h5 class="text-xs font-bold text-white">Resident Portal Security Credentials</h5>
                <span class="text-[10px] text-slate-400">Typed in the Start-up Security Section of the Main Portal</span>
              </div>
            </div>
            <button onclick="AdminApp.copyFamilyCredentials('${f.familyId}')" class="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              <span>Copy Credentials</span>
            </button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div>
              <span class="text-slate-400 text-[10px] block">Portal User ID:</span>
              <strong class="text-cyan-400 font-mono text-sm">${f.userId || f.familyId}</strong>
            </div>
            <div>
              <span class="text-slate-400 text-[10px] block">Portal Password:</span>
              <strong class="text-amber-400 font-mono text-sm">${f.password || f.pin || '1968'}</strong>
            </div>
            <div>
              <span class="text-slate-400 text-[10px] block">Resident Portal:</span>
              <a href="../my-mahall.html" target="_blank" class="text-emerald-400 hover:underline flex items-center gap-1 font-semibold text-xs mt-0.5">
                <span>Direct Access</span> <i data-lucide="external-link" class="w-3 h-3"></i>
              </a>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div><span class="text-slate-500 block">Phone</span><strong class="text-slate-200 font-mono">${f.phone || '-'}</strong></div>
          <div><span class="text-slate-500 block">Blood Group</span><strong class="text-rose-400">${f.bloodGroup || 'O+'}</strong></div>
          <div><span class="text-slate-500 block">Total Members</span><strong class="text-white">${members.length}</strong></div>
          <div><span class="text-slate-500 block">Monthly Dues</span><strong class="${f.monthlyStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}">${f.monthlyStatus || 'PENDING'}</strong></div>
        </div>

        <div>
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Registered Household Members</h4>
          <div class="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th class="p-2.5">Name</th>
                  <th class="p-2.5">Relation</th>
                  <th class="p-2.5">Age</th>
                  <th class="p-2.5">Blood</th>
                  <th class="p-2.5">Occupation</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                ${members.map(m => `
                  <tr>
                    <td class="p-2.5 text-white font-semibold">${m.name}</td>
                    <td class="p-2.5 text-slate-400">${m.relation || 'Member'}</td>
                    <td class="p-2.5 text-slate-300">${m.age || '-'}</td>
                    <td class="p-2.5 text-rose-400 font-mono">${m.blood || '-'}</td>
                    <td class="p-2.5 text-slate-400">${m.occ || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-800 flex justify-between items-center">
          <button onclick="AdminApp.copyFamilyCredentials('${f.familyId}')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
            <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
            <span>Share Credentials Slip</span>
          </button>
          <button onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold">Close Dossier</button>
        </div>
      </div>
    `;
    this.openModal(html);
  },

  copyFamilyCredentials: function (familyId) {
    const f = (MahallDB.getFamilies() || []).find(fam => fam.familyId.toUpperCase() === familyId.toUpperCase() || (fam.userId && fam.userId.toUpperCase() === familyId.toUpperCase()));
    if (!f) return;
    const text = `NOORUL HUDA MAHALL JAMA'ATH - RESIDENT PORTAL LOGIN CREDENTIALS\\n` +
      `--------------------------------------------------\\n` +
      `Family Head : ${f.head}\\n` +
      `Family ID   : ${f.familyId}\\n` +
      `User ID     : ${f.userId || f.familyId}\\n` +
      `Password    : ${f.password || f.pin || '1968'}\\n` +
      `Ward        : ${f.ward}\\n` +
      `Residence   : ${f.houseName} (${f.houseNo})\\n` +
      `Security Section: https://noorulhudamahall.org/index.html\\n` +
      `Resident Page   : https://noorulhudamahall.org/my-mahall.html\\n` +
      `--------------------------------------------------\\n` +
      `Type your User ID & Password in the Start-up Security Section to log in.`;
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('Resident login credentials copied to clipboard!', 'success');
    }).catch(() => {
      this.showToast(`User ID: ${f.userId || f.familyId} | Password: ${f.password || f.pin || '1968'}`, 'info');
    });
  },

  exportCensusCSV: function () {
    const list = MahallDB.getFamilies ? MahallDB.getFamilies() : [];
    let csv = 'Family ID,Head of Family,House Name,House No,Ward,Phone,Occupation,Blood Group,Members Count,Dues Status\n';
    list.forEach(f => {
      csv += `"${f.familyId}","${f.head}","${f.houseName || ''}","${f.houseNo || ''}","${f.ward || ''}","${f.phone || ''}","${f.occupation || ''}","${f.bloodGroup || ''}",${f.membersCount || 1},"${f.monthlyStatus || 'PENDING'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Noorul_Huda_Mahall_Census_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('Census CSV downloaded successfully.', 'success');
  },

  // =========================================================================
  // 10. CERTIFICATES & VERIFICATION DESK
  // =========================================================================
  renderCertificates: function () {
    let list = MahallDB.getCertificates ? MahallDB.getCertificates() : [];
    if (this.currentCertFilter !== 'all') {
      list = list.filter(c => (c.status || '').toUpperCase() === this.currentCertFilter.toUpperCase());
    }

    const tbody = document.getElementById('certificates-table-body');
    const badge = document.getElementById('tab-pending-cert-badge');
    const pendingCount = (MahallDB.getCertificates() || []).filter(c => c.status === 'PENDING').length;
    if (badge) badge.textContent = pendingCount;
    if (!tbody) return;

    // Reset select-all checkbox and bulk delete button
    const selectAllHeader = document.getElementById('cert-select-all-header');
    if (selectAllHeader) {
      selectAllHeader.checked = false;
      selectAllHeader.indeterminate = false;
    }
    const btnDeleteSelected = document.getElementById('btn-delete-selected-certs');
    if (btnDeleteSelected) btnDeleteSelected.classList.add('hidden');

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-slate-500">No certificate requests found under this filter.</td></tr>`;
      return;
    }

    const getCertBadge = (type) => {
      const t = (type || '').toLowerCase();
      if (t.includes('family') || t.includes('extract')) {
        return `<span class="px-2.5 py-1 rounded-lg bg-blue-950/80 text-blue-300 border border-blue-800 text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"><i data-lucide="users" class="w-3.5 h-3.5 text-blue-400"></i> Family Register Extract</span>`;
      } else if (t.includes('madrasa') || t.includes('transfer') || t.includes('tc')) {
        return `<span class="px-2.5 py-1 rounded-lg bg-purple-950/80 text-purple-300 border border-purple-800 text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"><i data-lucide="graduation-cap" class="w-3.5 h-3.5 text-purple-400"></i> Madrasa TC</span>`;
      } else if (t.includes('cemetery') || t.includes('burial') || t.includes('janazah')) {
        return `<span class="px-2.5 py-1 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800 text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"><i data-lucide="cross" class="w-3.5 h-3.5 text-amber-400"></i> Cemetery Burial NOC</span>`;
      } else if (t.includes('marriage')) {
        return `<span class="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"><i data-lucide="heart" class="w-3.5 h-3.5 text-rose-400"></i> Marriage NOC</span>`;
      } else {
        return `<span class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5"><i data-lucide="file-check-2" class="w-3.5 h-3.5 text-slate-400"></i> ${type || 'Certificate'}</span>`;
      }
    };

    tbody.innerHTML = list.map(c => `
      <tr class="hover:bg-slate-950/40 transition">
        <td class="p-4 text-center align-top">
          <input type="checkbox" class="cert-row-checkbox w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer" data-id="${c.certId}" data-status="${c.status}" onchange="AdminApp.handleCertCheckboxChange()" />
        </td>
        <td class="p-4 align-top whitespace-nowrap">
          <span class="font-mono font-bold text-amber-400 bg-amber-950/70 px-2 py-1 rounded-lg border border-amber-800/60">${c.certId}</span>
          ${c.urgent ? `<span class="mt-1 px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[9px] font-bold flex items-center gap-1 w-max animate-pulse"><i data-lucide="zap" class="w-2.5 h-2.5 text-rose-400"></i> FAST-TRACK</span>` : ''}
        </td>
        <td class="p-4 align-top">
          <p class="font-bold text-white text-sm">${c.applicantName}</p>
          <p class="text-[11px] text-slate-400">${c.relation || 'Member'} (${c.familyId})</p>
          ${c.wifeName ? `<p class="text-[11px] text-emerald-300 font-semibold mt-1 flex items-center gap-1"><i data-lucide="heart" class="w-3 h-3 text-rose-400"></i> Bride/Wife: ${c.wifeName}</p>` : ''}
          ${c.studentName ? `<p class="text-[11px] text-purple-300 font-semibold mt-1 flex items-center gap-1"><i data-lucide="graduation-cap" class="w-3 h-3 text-purple-400"></i> Student: ${c.studentName} ${c.standard ? '(' + c.standard + ')' : ''}</p>` : ''}
          ${c.deceasedName ? `<p class="text-[11px] text-rose-300 font-semibold mt-1 flex items-center gap-1"><i data-lucide="cross" class="w-3 h-3 text-rose-400"></i> Deceased: ${c.deceasedName} ${c.deathDate ? '• ' + c.deathDate : ''}</p>` : ''}
          ${c.contactPhone ? `<p class="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1"><i data-lucide="phone" class="w-2.5 h-2.5"></i> ${c.contactPhone}</p>` : ''}
        </td>
        <td class="p-4 align-top whitespace-nowrap">
          ${getCertBadge(c.certType || c.type)}
        </td>
        <td class="p-4 align-top max-w-xs">
          <p class="text-xs text-slate-300 font-medium">${c.purpose || 'Official Verification'}</p>
          ${c.details ? `<p class="text-[11px] text-slate-400 mt-1 bg-slate-950/60 p-1.5 rounded border border-slate-800/80">${c.details}</p>` : ''}
          <p class="text-[11px] text-slate-500 font-mono mt-1">Applied: ${c.submittedAt || c.requestDate || '2026'}</p>
        </td>
        <td class="p-4 align-top whitespace-nowrap">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${c.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : (c.status === 'REJECTED' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800')}">
            ${c.status}
          </span>
          ${c.verificationHash ? `<div class="text-[10px] text-slate-500 font-mono mt-1">${c.verificationHash.substring(0, 16)}...</div>` : ''}
        </td>
        <td class="p-4 align-top text-right whitespace-nowrap space-x-1.5">
          ${c.status === 'PENDING' ? `
            <button onclick="AdminApp.approveCertificate('${c.certId}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition">
              Approve & Seal
            </button>
            <button onclick="AdminApp.rejectCertificate('${c.certId}')" class="px-2.5 py-1 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 rounded-lg text-xs font-semibold transition">
              Reject
            </button>
          ` : `
            <button onclick="AdminApp.previewOfficialCertificate('${c.certId}')" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition">
              <i data-lucide="printer" class="w-3.5 h-3.5 text-emerald-400"></i>
              <span>Print Official Certificate</span>
            </button>
          `}
          <button onclick="AdminApp.deleteCertificate('${c.certId}')" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 border border-transparent hover:border-rose-900 rounded-lg transition inline-flex items-center" title="Delete Certificate Record ${c.certId}">
            <i data-lucide="trash-2" class="w-3.5 h-3.5 text-rose-400"></i>
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  toggleSelectAllCertificates: function (checked) {
    document.querySelectorAll('.cert-row-checkbox').forEach(cb => {
      cb.checked = checked;
    });
    this.handleCertCheckboxChange();
  },

  handleCertCheckboxChange: function () {
    const checkboxes = document.querySelectorAll('.cert-row-checkbox');
    const checked = Array.from(checkboxes).filter(cb => cb.checked);
    const count = checked.length;
    const btn = document.getElementById('btn-delete-selected-certs');
    const label = document.getElementById('label-delete-selected-certs');
    const headerCb = document.getElementById('cert-select-all-header');

    if (btn) {
      if (count > 0) {
        btn.classList.remove('hidden');
        if (label) label.textContent = `Delete Selected (${count})`;
      } else {
        btn.classList.add('hidden');
      }
    }

    if (headerCb && checkboxes.length > 0) {
      headerCb.checked = count === checkboxes.length;
      headerCb.indeterminate = count > 0 && count < checkboxes.length;
    }
  },

  deleteCertificate: function (certId) {
    if (confirm(`Are you sure you want to permanently delete certificate record ${certId}?`)) {
      MahallDB.deleteCertificate(certId);
      this.showToast(`Certificate record ${certId} deleted successfully.`, 'info');
      this.renderCertificates();
      this.renderKPIs();
    }
  },

  deleteSelectedCertificates: function () {
    const checked = Array.from(document.querySelectorAll('.cert-row-checkbox:checked'));
    if (!checked.length) return;
    const ids = checked.map(cb => cb.getAttribute('data-id'));
    if (confirm(`Are you sure you want to permanently delete the ${ids.length} selected certificate record(s)?`)) {
      MahallDB.deleteCertificates(ids);
      this.showToast(`${ids.length} certificate record(s) deleted successfully.`, 'success');
      this.renderCertificates();
      this.renderKPIs();
    }
  },

  clearProcessedCertificates: function () {
    const allCerts = MahallDB.getCertificates ? MahallDB.getCertificates() : [];
    const processed = allCerts.filter(c => c.status === 'APPROVED' || c.status === 'REJECTED');
    if (!processed.length) {
      this.showToast('No approved or rejected certificate records found to clear.', 'info');
      return;
    }
    const approvedCount = processed.filter(c => c.status === 'APPROVED').length;
    const rejectedCount = processed.filter(c => c.status === 'REJECTED').length;

    if (confirm(`Clear all ${processed.length} processed records (${approvedCount} Approved, ${rejectedCount} Rejected) from the certificate register?`)) {
      const removed = MahallDB.clearCertificatesByStatus(['APPROVED', 'REJECTED']);
      this.showToast(`Cleared ${removed} approved & rejected certificate record(s) successfully.`, 'success');
      this.renderCertificates();
      this.renderKPIs();
    }
  },

  filterCertificates: function (status, elem) {
    this.currentCertFilter = status;
    document.querySelectorAll('.cert-tab-btn').forEach(btn => {
      btn.classList.remove('bg-slate-800', 'text-white');
    });
    const target = elem || (typeof event !== 'undefined' && event ? (event.currentTarget || event.target) : null);
    if (target && target.classList) target.classList.add('bg-slate-800', 'text-white');
    this.renderCertificates();
  },

  approveCertificate: function (certId) {
    MahallDB.updateCertificateStatus(certId, 'APPROVED');
    this.showToast(`Certificate ${certId} approved and cryptographic verification seal generated!`, 'success');
    this.renderCertificates();
    this.renderKPIs();
  },

  rejectCertificate: function (certId) {
    const reason = prompt('Please specify the reason for certificate rejection:');
    if (reason) {
      MahallDB.updateCertificateStatus(certId, 'REJECTED', reason);
      this.showToast(`Certificate ${certId} marked as rejected.`, 'info');
      this.renderCertificates();
      this.renderKPIs();
    }
  },

  openManualCertModal: function () {
    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="award" class="w-5 h-5 text-emerald-400"></i>
            <span>Issue Direct Official Certificate (Walk-In Applicant)</span>
          </h3>
          <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="AdminApp.handleIssueDirectCert(event)" class="space-y-3 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Family ID *</label>
              <input type="text" id="modal-cert-famid" required placeholder="e.g. W02-F005" oninput="AdminApp.updateCertPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Certificate Type *</label>
              <select id="modal-cert-type" onchange="AdminApp.updateCertPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="Marriage NOC">Marriage NOC (No Objection Certificate)</option>
                <option value="Family Register Certified Extract">Family Register Certified Extract</option>
                <option value="Madrasa Transfer Certificate (TC)">Madrasa Transfer Certificate (TC)</option>
                <option value="Cemetery Burial Allotment NOC">Cemetery Burial Allotment NOC</option>
                <option value="Residence & Membership">Residence & Membership Certificate</option>
                <option value="Character Certificate">Moral Conduct & Good Standing</option>
                <option value="Destitute Aid Endorsement">Welfare & Medical Subsidy Endorsement</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Applicant Full Name *</label>
              <input type="text" id="modal-cert-name" required placeholder="Full legal name" oninput="AdminApp.updateCertPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Relationship to Head</label>
              <input type="text" id="modal-cert-rel" placeholder="e.g. Son of Ahmed Koya" oninput="AdminApp.updateCertPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <!-- Name of Wife of Applicant (Marriage Certification field) -->
          <div id="wrapper-cert-wife-name" class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
            <label class="block text-slate-300 font-bold mb-1 flex items-center justify-between">
              <span class="flex items-center gap-1.5 text-emerald-400">
                <i data-lucide="heart" class="w-3.5 h-3.5 text-rose-400"></i>
                <span>Name of Wife of Applicant *</span>
              </span>
              <span class="text-[10px] text-emerald-300 font-mono bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-700/60">Marriage NOC Mandatory</span>
            </label>
            <input type="text" id="modal-cert-wife-name" placeholder="e.g. Fathima Nida (D/o P. M. Moideen Kutty)" oninput="AdminApp.updateCertPreview()"
              class="w-full bg-slate-950 border border-emerald-500/50 focus:border-emerald-400 rounded-xl p-2.5 text-white placeholder-slate-500" />
            <span class="text-[10px] text-slate-400 block">Specifies the legal bride's full name, parentage and background for the official Nikah NOC document.</span>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Official Purpose & Destination Authority *</label>
            <input type="text" id="modal-cert-purpose" required placeholder="e.g. Passport Police Verification / Municipal Registrar Office" oninput="AdminApp.updateCertPreview()"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
          </div>

          <!-- Live Visual Preview of Certificate -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Live Official Certificate Document Preview:</span>
            <div class="rounded-2xl p-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl space-y-2 relative overflow-hidden">
              <div class="flex items-center justify-between border-b border-emerald-800/40 pb-2">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-md bg-emerald-800 text-white flex items-center justify-center text-xs font-bold font-heading">NH</div>
                  <div>
                    <span class="text-[9px] font-mono uppercase tracking-wider text-emerald-300 block">NOORUL HUDA MAHALL JAMA'ATH</span>
                    <h5 id="preview-cert-type" class="text-xs font-bold text-white uppercase">Marriage NOC (No Objection Certificate)</h5>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono text-[9px] font-bold">OFFICIAL DOCUMENT</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span class="text-[10px] text-slate-400 block">Applicant Beneficiary:</span>
                  <strong id="preview-cert-name" class="text-white text-xs font-semibold">Full legal name</strong>
                  <span id="preview-cert-rel" class="text-[10px] text-slate-400 block">Son of Ahmed Koya</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 block">Mahall Family ID:</span>
                  <strong id="preview-cert-famid" class="text-emerald-400 font-mono text-xs font-bold">W02-F005</strong>
                  <span class="text-[9px] font-mono text-slate-400 block">REF: CERT-2026-LIVE</span>
                </div>
              </div>

              <!-- Live Wife Name Preview -->
              <div id="preview-cert-wife-container" class="p-2 rounded-xl bg-emerald-900/30 border border-emerald-500/40 text-[11px] flex items-center justify-between">
                <span class="text-emerald-300 font-medium flex items-center gap-1">
                  <i data-lucide="heart" class="w-3 h-3 text-rose-400"></i> Name of Wife of Applicant:
                </span>
                <strong id="preview-cert-wife" class="text-white font-bold text-xs">Fathima Nida</strong>
              </div>

              <div class="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <div class="truncate max-w-[280px]">
                  <span class="text-slate-400">Authority / Purpose: </span>
                  <span id="preview-cert-purpose" class="text-slate-200 font-medium">Passport Police Verification / Municipal Registrar Office</span>
                </div>
                <span class="text-emerald-400 font-bold flex items-center gap-1 shrink-0"><i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Verified Seal</span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/40">
              Issue & Approve Immediately
            </button>
          </div>
        </form>
      </div>
    `;
    this.openModal(html);
  },

  updateCertPreview: function () {
    const famId = document.getElementById('modal-cert-famid')?.value || 'W02-F005';
    const typeSelect = document.getElementById('modal-cert-type');
    const typeText = typeSelect ? typeSelect.options[typeSelect.selectedIndex]?.text || 'Marriage NOC' : 'Marriage NOC';
    const typeVal = typeSelect ? typeSelect.value : 'Marriage NOC';
    const name = document.getElementById('modal-cert-name')?.value || 'Full legal name';
    const rel = document.getElementById('modal-cert-rel')?.value || 'Son of Ahmed Koya';
    const wifeName = document.getElementById('modal-cert-wife-name')?.value || 'Fathima Nida (D/o P. M. Moideen Kutty)';
    const purpose = document.getElementById('modal-cert-purpose')?.value || 'Passport Police Verification / Municipal Registrar Office';

    const pType = document.getElementById('preview-cert-type');
    const pName = document.getElementById('preview-cert-name');
    const pRel = document.getElementById('preview-cert-rel');
    const pFamId = document.getElementById('preview-cert-famid');
    const pPurpose = document.getElementById('preview-cert-purpose');
    const pWife = document.getElementById('preview-cert-wife');
    const wrapperWife = document.getElementById('wrapper-cert-wife-name');
    const previewWifeContainer = document.getElementById('preview-cert-wife-container');

    const isMarriage = typeVal.includes('Marriage') || typeText.includes('Marriage');
    if (wrapperWife) {
      if (isMarriage) {
        wrapperWife.classList.remove('hidden');
      } else {
        wrapperWife.classList.add('hidden');
      }
    }
    if (previewWifeContainer) {
      if (isMarriage) {
        previewWifeContainer.classList.remove('hidden');
      } else {
        previewWifeContainer.classList.add('hidden');
      }
    }

    if (pType) pType.textContent = typeText.toUpperCase();
    if (pName) pName.textContent = name;
    if (pRel) pRel.textContent = rel;
    if (pFamId) pFamId.textContent = famId.toUpperCase();
    if (pWife) pWife.textContent = wifeName || 'To be specified';
    if (pPurpose) pPurpose.textContent = purpose;
    if (window.lucide) lucide.createIcons();
  },

  handleIssueDirectCert: function (e) {
    e.preventDefault();
    const famId = document.getElementById('modal-cert-famid').value.trim();
    const type = document.getElementById('modal-cert-type').value;
    const name = document.getElementById('modal-cert-name').value.trim();
    const rel = document.getElementById('modal-cert-rel').value.trim();
    const wifeInput = document.getElementById('modal-cert-wife-name');
    const wifeName = wifeInput ? wifeInput.value.trim() : '';
    const purpose = document.getElementById('modal-cert-purpose').value.trim();

    if (type.toLowerCase().includes('marriage') && !wifeName) {
      this.showToast('Please enter the Name of Wife of Applicant for Marriage NOC.', 'warning');
      if (wifeInput) wifeInput.focus();
      return;
    }

    const newReq = MahallDB.createCertificateRequest({
      familyId: famId,
      applicantName: name,
      relation: rel,
      certType: type,
      wifeName: wifeName,
      purpose: purpose
    });

    // Auto approve immediately
    MahallDB.updateCertificateStatus(newReq.certId, 'APPROVED');

    this.showToast(`Certificate ${newReq.certId} created and approved!`, 'success');
    this.closeModal();
    this.renderCertificates();
    this.renderKPIs();
  },

  previewOfficialCertificate: function (certId) {
    const cert = MahallDB.getCertificateById ? MahallDB.getCertificateById(certId) : (MahallDB.getCertificates() || []).find(c => c.certId === certId);
    if (!cert) return;

    const certTypeStr = (cert.certType || cert.type || '').toLowerCase();
    const isMarriage = certTypeStr.includes('marriage') || cert.wifeName;
    const isFamilyExtract = certTypeStr.includes('family') || certTypeStr.includes('extract');
    const isMadrasaTC = certTypeStr.includes('madrasa') || certTypeStr.includes('transfer') || certTypeStr.includes('tc');
    const isBurialNOC = certTypeStr.includes('cemetery') || certTypeStr.includes('burial') || certTypeStr.includes('janazah');

    let docTitle = 'CERTIFICATE OF MAHALL MEMBERSHIP';
    if (isMarriage) docTitle = 'MARRIAGE NOC (NIKAH CLEARANCE)';
    else if (isFamilyExtract) docTitle = 'OFFICIAL FAMILY REGISTER CERTIFIED EXTRACT';
    else if (isMadrasaTC) docTitle = 'MADRASA TRANSFER CERTIFICATE (TC)';
    else if (isBurialNOC) docTitle = 'CEMETERY BURIAL ALLOTMENT NOC & CLEARANCE';
    else if (cert.certType || cert.type) docTitle = (cert.certType || cert.type).toUpperCase();

    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 no-print">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="award" class="w-5 h-5 text-amber-400"></i>
            <span>Official Mahall Document Dossier</span>
          </h3>
          <div class="flex items-center gap-2">
            <button onclick="window.print()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition">
              <i data-lucide="printer" class="w-3.5 h-3.5"></i>
              <span>Print Official Sheet</span>
            </button>
            <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
        </div>

        <!-- Printable Certificate Sheet -->
        <div id="print-modal-content" class="bg-white text-slate-900 p-8 rounded-xl border-4 border-double border-emerald-900 shadow-2xl relative">
          <!-- Header -->
          <div class="text-center pb-4 border-b-2 border-emerald-900/40">
            <p class="font-arabic text-xl text-emerald-950 mb-1">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ</p>
            <h2 class="text-2xl font-heading font-bold tracking-wider text-emerald-950 uppercase">NOORUL HUDA MAHALL JAMA'ATH</h2>
            <p class="text-xs text-slate-700 font-semibold tracking-widest uppercase">Registered Under Wakf Act No: WKF/KRL/984/1968</p>
            <p class="text-[11px] text-slate-600 mt-0.5">Central Juma Masjid & Office of General Secretary, Calicut, Kerala - 673001</p>
            ${isMadrasaTC ? `<p class="text-[10px] text-indigo-900 font-bold uppercase tracking-wider mt-1 bg-indigo-50 py-0.5 border border-indigo-200 rounded">Samastha Kerala Islam Matha Vidyabhyasa Board Affiliation Reg #642</p>` : ''}
            ${isBurialNOC ? `<p class="text-[10px] text-rose-900 font-bold uppercase tracking-wider mt-1 bg-rose-50 py-0.5 border border-rose-200 rounded">24/7 Janazah & Emergency Burial Directorate Clearance</p>` : ''}
          </div>

          <!-- Document Serial & Meta -->
          <div class="flex items-center justify-between mt-4 text-xs font-mono text-slate-700 border-b border-slate-200 pb-2">
            <span>Docket Ref: <strong>${cert.certId || cert.id}</strong></span>
            <span>Issued Date: <strong>${cert.approvedAt || cert.submittedAt || '2026'}</strong></span>
          </div>

          <!-- Title -->
          <div class="text-center my-6">
            <h3 class="text-xl font-heading font-bold text-emerald-900 uppercase underline decoration-2 underline-offset-4">
              ${docTitle}
            </h3>
          </div>

          <!-- Body Text -->
          <div class="text-sm leading-relaxed text-slate-800 space-y-4 my-6">
            <p>
              This is to officially certify from the verified archives of Noorul Huda Mahall Jama'ath that <strong>${cert.applicantName}</strong> (${cert.relation || 'Bonafide Member'}), registered under Family Identity <strong>${cert.familyId}</strong>, is recorded in good standing under this jurisdiction.
            </p>

            ${isMarriage ? `
              <div class="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-900/30 space-y-2 my-3">
                <div class="flex items-center justify-between border-b border-emerald-900/20 pb-1.5">
                  <span class="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    💍 SOLEMNIZATION OF SACRED MATRIMONY (NIKAH CLEARANCE)
                  </span>
                  <span class="text-[10px] font-bold bg-emerald-800 text-white px-2 py-0.5 rounded">OFFICIAL MARRIAGE NOC</span>
                </div>
                <div class="text-sm pt-1">
                  <span class="text-slate-600 text-xs font-semibold block uppercase tracking-wide">Name of Wife of Applicant:</span>
                  <p class="text-base font-bold text-emerald-950 mt-0.5">${cert.wifeName || 'To be specified upon solemnization'}</p>
                </div>
                <p class="text-xs text-slate-700 leading-relaxed pt-1 border-t border-emerald-900/10">
                  This Directorate officially certifies that upon scrutiny of Mahall Census Register and Family Records, there is no objection recorded in this Mahall Jama'ath archives for the solemnization and registration of marriage between the applicant and the bride named above under Sunni Shafi'i jurisprudence and government civil registration regulations.
                </p>
              </div>
            ` : ''}

            ${isFamilyExtract ? `
              <div class="p-4 rounded-xl bg-blue-50 border-2 border-blue-900/30 space-y-2 my-3">
                <div class="flex items-center justify-between border-b border-blue-900/20 pb-1.5">
                  <span class="text-xs font-black uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                    📑 CENSUS REGISTER HOUSEHOLD EXTRACT & VERIFICATION
                  </span>
                  <span class="text-[10px] font-bold bg-blue-800 text-white px-2 py-0.5 rounded">AUTHENTICATED EXTRACT</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span class="text-slate-500 font-semibold block">Household ID:</span>
                    <strong class="font-mono text-blue-950 text-sm">${cert.familyId}</strong>
                  </div>
                  <div>
                    <span class="text-slate-500 font-semibold block">Head of Household / Applicant:</span>
                    <strong class="text-blue-950 text-sm">${cert.applicantName}</strong>
                  </div>
                </div>
                <p class="text-xs text-slate-700 leading-relaxed pt-1 border-t border-blue-900/10">
                  This certified extract confirms that all registered family members residing under this household docket are authenticated bonafide residents of Noorul Huda Mahall Jama'ath with date of birth and lineage records verified against the official Mahall Census Register.
                </p>
              </div>
            ` : ''}

            ${isMadrasaTC ? `
              <div class="p-4 rounded-xl bg-purple-50 border-2 border-purple-900/30 space-y-2 my-3">
                <div class="flex items-center justify-between border-b border-purple-900/20 pb-1.5">
                  <span class="text-xs font-black uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                    🎓 SAMASTHA MADRASA ACADEMIC TRANSFER CREDENTIALS
                  </span>
                  <span class="text-[10px] font-bold bg-purple-800 text-white px-2 py-0.5 rounded">OFFICIAL TC</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span class="text-slate-500 font-semibold block">Student Full Name:</span>
                    <strong class="text-purple-950 text-sm">${cert.studentName || cert.applicantName}</strong>
                  </div>
                  <div>
                    <span class="text-slate-500 font-semibold block">Class / Standard Passed:</span>
                    <strong class="text-purple-950 text-sm">${cert.standard || 'Class 7 (Primary Dars)'}</strong>
                  </div>
                </div>
                <p class="text-xs text-slate-700 leading-relaxed pt-1 border-t border-purple-900/10">
                  Certified that the pupil's conduct and character have been exemplary. All academic and maintenance dues to Noorul Huda Islamic Academy have been cleared. Permission is granted for transfer and enrollment into higher Islamic academies or relocation institutions.
                </p>
              </div>
            ` : ''}

            ${isBurialNOC ? `
              <div class="p-4 rounded-xl bg-amber-50 border-2 border-amber-900/30 space-y-2 my-3">
                <div class="flex items-center justify-between border-b border-amber-900/20 pb-1.5">
                  <span class="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    ⚰️ CEMETERY ALLOTMENT & HOSPITAL RELEASE CLEARANCE
                  </span>
                  <span class="text-[10px] font-bold bg-amber-800 text-white px-2 py-0.5 rounded">JANAZAH CLEARANCE</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span class="text-slate-500 font-semibold block">Name of Deceased (Marhoom):</span>
                    <strong class="text-amber-950 text-sm">${cert.deceasedName || cert.applicantName}</strong>
                  </div>
                  <div>
                    <span class="text-slate-500 font-semibold block">Date / Time of Demise:</span>
                    <strong class="text-amber-950 text-sm">${cert.deathDate || cert.submittedAt || 'Recorded Today'}</strong>
                  </div>
                </div>
                <p class="text-xs text-slate-700 leading-relaxed pt-1 border-t border-amber-900/10">
                  The Janazah Directorate of Noorul Huda Mahall Jama'ath certifies burial sector allotment at Central Juma Masjid Cemetery. This document serves as unconditional clearance for hospital mortuary release, transport, and local Municipal death registry entry.
                </p>
              </div>
            ` : ''}

            <p>
              This document is officially issued upon verified records of the Mahall Census Register for the specific purpose of: <strong>${cert.purpose || 'Official Registration & Record Submission'}</strong>.
            </p>
            ${cert.details ? `<p class="text-xs text-slate-600 bg-slate-100 p-2.5 rounded-lg border border-slate-200"><strong>Application Notes:</strong> ${cert.details}</p>` : ''}
            <p class="text-xs text-slate-600 italic">
              Verification Hash: <code class="font-mono font-bold text-emerald-900">${cert.verificationHash || 'NHM-VERIFIED-SEAL'}</code>. Scan QR or visit public portal verification desk to validate this document.
            </p>
          </div>

          <!-- Signatures & Stamp -->
          <div class="grid grid-cols-2 pt-12 mt-8 border-t border-slate-300 text-center text-xs">
            <div>
              <div class="w-20 h-20 mx-auto rounded-full border-2 border-dashed border-emerald-900/60 flex items-center justify-center text-[10px] uppercase font-bold text-emerald-950 leading-tight">
                OFFICIAL<br>MAHALL<br>SEAL
              </div>
              <p class="mt-2 font-bold text-slate-800">Noorul Huda Mahall Seal</p>
            </div>
            <div>
              <p class="font-bold text-emerald-950 text-sm mt-8">${cert.approvedBy || 'P. K. Abdurahman'}</p>
              <p class="text-slate-600 font-semibold">General Secretary</p>
              <p class="text-[10px] text-slate-500">Executive Committee & Secretariat</p>
            </div>
          </div>
        </div>
      </div>
    `;
    this.openModal(html);
  },

  // =========================================================================
  // 11. MADRASA & EDUCATION MANAGEMENT SUITE
  // =========================================================================
  switchEduSubtab: function (subId) {
    this.activeEduSubtab = subId;

    document.querySelectorAll('.edu-subpane').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`edu-pane-${subId}`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.edu-subnav-btn').forEach(btn => {
      btn.classList.remove('active', 'bg-indigo-900/80', 'text-white', 'border-indigo-600/70', 'shadow-md');
      btn.classList.add('bg-slate-900/90', 'text-slate-300', 'border-slate-800');
    });
    const activeBtn = document.getElementById(`edu-subnav-btn-${subId}`);
    if (activeBtn) {
      activeBtn.classList.remove('bg-slate-900/90', 'text-slate-300', 'border-slate-800');
      activeBtn.classList.add('active', 'bg-indigo-900/80', 'text-white', 'border-indigo-600/70', 'shadow-md');
    }

    if (window.lucide) window.lucide.createIcons();
  },

  renderMadrasa: function () {
    this.renderEduKPIs();
    this.renderAdmissions();
    this.renderStudents();
    this.renderFaculty();
    this.renderCourses();
    this.renderScholarships();
    this.renderMaterials();

    if (window.lucide) window.lucide.createIcons();
  },

  renderEduKPIs: function () {
    const students = MahallDB.getStudents ? MahallDB.getStudents() : [];
    const admissions = MahallDB.getAdmissions ? MahallDB.getAdmissions() : [];
    const pendingAdmissions = admissions.filter(a => a.status === 'PENDING');
    const faculty = MahallDB.getFaculty ? MahallDB.getFaculty() : [];
    const courses = MahallDB.getCourses ? MahallDB.getCourses() : [];
    const scholarships = MahallDB.getScholarships ? MahallDB.getScholarships() : [];
    const materials = MahallDB.getMaterials ? MahallDB.getMaterials() : [];

    const kStd = document.getElementById('kpi-edu-students');
    const kAdm = document.getElementById('kpi-edu-pending');
    const kFac = document.getElementById('kpi-edu-faculty');
    const kCrs = document.getElementById('kpi-edu-courses');
    const kSch = document.getElementById('kpi-edu-scholarships');

    if (kStd) kStd.textContent = students.length;
    if (kAdm) kAdm.textContent = pendingAdmissions.length;
    if (kFac) kFac.textContent = faculty.length;
    if (kCrs) kCrs.textContent = courses.length;
    if (kSch) kSch.textContent = scholarships.length;

    // Subnav badges
    const bAdm = document.getElementById('edu-tab-badge-pending-adm');
    const bStd = document.getElementById('edu-tab-badge-students');
    const bFac = document.getElementById('edu-tab-badge-faculty');
    const bCrs = document.getElementById('edu-tab-badge-courses');
    const bSch = document.getElementById('edu-tab-badge-scholarships');
    const bMat = document.getElementById('edu-tab-badge-materials');
    const bNav = document.getElementById('badge-edu-nav-pending');

    if (bAdm) bAdm.textContent = pendingAdmissions.length;
    if (bStd) bStd.textContent = students.length;
    if (bFac) bFac.textContent = faculty.length;
    if (bCrs) bCrs.textContent = courses.length;
    if (bSch) bSch.textContent = scholarships.length;
    if (bMat) bMat.textContent = materials.length;
    if (bNav) bNav.textContent = pendingAdmissions.length;
  },

  // 11.1 ADMISSIONS DESK & APPROVAL WORKFLOW
  renderAdmissions: function () {
    let list = MahallDB.getAdmissions ? MahallDB.getAdmissions() : [];
    if (this.currentAdmFilter !== 'all') {
      list = list.filter(a => (a.status || '').toUpperCase() === this.currentAdmFilter.toUpperCase());
    }

    const tbody = document.getElementById('admissions-table-body');
    if (!tbody) return;

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-500">No student admission applications found in this queue.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(a => `
      <tr class="hover:bg-slate-950/40 transition">
        <td class="p-4 align-top whitespace-nowrap">
          <span class="font-mono font-bold text-amber-400 bg-amber-950/70 px-2 py-1 rounded border border-amber-800/60">${a.id}</span>
          <div class="text-[10px] text-slate-500 font-mono mt-1">${a.submittedAt || 'Today'}</div>
        </td>
        <td class="p-4 align-top">
          <p class="font-bold text-white text-sm">${a.studentName}</p>
          <p class="text-[11px] text-slate-400">Gender: <span class="text-slate-300 font-medium">${a.gender || 'Male'}</span> • DOB: <span class="font-mono text-slate-300">${a.dob || '-'}</span></p>
        </td>
        <td class="p-4 align-top">
          <span class="px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-300 text-xs font-semibold">${a.course}</span>
          ${a.previousMadrasa ? `<p class="text-[10px] text-slate-500 mt-1">Prev: ${a.previousMadrasa}</p>` : ''}
        </td>
        <td class="p-4 align-top whitespace-nowrap">
          <p class="text-slate-200 font-medium">${a.parentName || 'Parent'}</p>
          <p class="text-[11px] text-slate-400 font-mono">${a.phone || '-'}</p>
        </td>
        <td class="p-4 align-top whitespace-nowrap">
          <span class="font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">${a.familyId || 'W02-F005'}</span>
        </td>
        <td class="p-4 align-top whitespace-nowrap">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${a.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : (a.status === 'REJECTED' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800')}">
            ${a.status}
          </span>
          ${a.rollNo ? `<div class="text-[10px] font-mono text-emerald-400 mt-1 font-bold">Roll: ${a.rollNo}</div>` : ''}
        </td>
        <td class="p-4 align-top text-right whitespace-nowrap space-x-1">
          ${a.status === 'PENDING' ? `
            <button onclick="AdminApp.approveAdmission('${a.id}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition">
              Approve & Enroll
            </button>
            <button onclick="AdminApp.rejectAdmission('${a.id}')" class="px-2.5 py-1 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 rounded-lg text-xs font-semibold transition">
              Reject
            </button>
          ` : `
            <button onclick="AdminApp.printAdmissionPass('${a.id}')" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition">
              <i data-lucide="printer" class="w-3.5 h-3.5 text-emerald-400"></i>
              <span>Pass</span>
            </button>
          `}
          <button onclick="AdminApp.deleteAdmission('${a.id}')" title="Delete application" class="p-1 text-slate-500 hover:text-rose-400 rounded transition">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  filterAdmissions: function (status) {
    this.currentAdmFilter = status;
    document.querySelectorAll('.adm-filter-btn').forEach(btn => {
      btn.classList.remove('bg-emerald-900', 'text-emerald-200', 'border-emerald-700');
      btn.classList.add('bg-slate-800', 'text-slate-300');
    });
    if (event && event.target) {
      event.target.classList.remove('bg-slate-800', 'text-slate-300');
      event.target.classList.add('bg-emerald-900', 'text-emerald-200', 'border-emerald-700');
    }
    this.renderAdmissions();
  },

  approveAdmission: function (id) {
    const updated = MahallDB.approveAdmission(id);
    if (updated) {
      this.showToast(`Application ${id} approved! Enrolled as ${updated.rollNo}`, 'success');
      this.renderMadrasa();
    }
  },

  rejectAdmission: function (id) {
    const reason = prompt('Specify rejection reason (e.g. Ineligible age, Class capacity reached):');
    if (reason) {
      MahallDB.rejectAdmission(id, reason);
      this.showToast(`Application ${id} rejected.`, 'info');
      this.renderMadrasa();
    }
  },

  deleteAdmission: function (id) {
    if (confirm(`Remove admission record ${id}?`)) {
      MahallDB.deleteAdmission(id);
      this.showToast(`Removed admission ${id}`, 'info');
      this.renderMadrasa();
    }
  },

  openNewAdmissionModal: function () {
    const families = MahallDB.getFamilies ? MahallDB.getFamilies() : [];

    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="user-plus" class="w-5 h-5 text-emerald-400"></i>
            <span>Direct Student Admission Desk Application</span>
          </h3>
          <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="AdminApp.handleSaveAdmission(event)" class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">Student Full Legal Name *</label>
            <input type="text" id="modal-adm-name" required placeholder="Student name" oninput="AdminApp.updateAdmissionPreview()"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Gender *</label>
              <select id="modal-adm-gender" onchange="AdminApp.updateAdmissionPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Date of Birth *</label>
              <input type="date" id="modal-adm-dob" required value="2018-05-10" oninput="AdminApp.updateAdmissionPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Desired Course / Class *</label>
              <select id="modal-adm-course" onchange="AdminApp.updateAdmissionPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="Madrasa Primary (Class 1)">Madrasa Primary (Class 1)</option>
                <option value="Madrasa Primary (Classes 2-5)">Madrasa Primary (Classes 2-5)</option>
                <option value="Secondary Islamic Board (Classes 6-10)">Secondary Board (Classes 6-10)</option>
                <option value="Tahfeez-ul-Quran (Full Hifdh)">Tahfeez-ul-Quran (Full Hifdh)</option>
                <option value="Spoken Arabic & Revelation Language">Spoken Arabic & Revelation</option>
                <option value="Dars Halqa (Advanced Shariah)">Dars Halqa (Advanced Shariah)</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Registered Mahall Family *</label>
              <select id="modal-adm-famid" onchange="AdminApp.updateAdmissionPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                ${families.map(f => `<option value="${f.familyId}">${f.familyId} - ${f.head}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Parent / Guardian Name *</label>
              <input type="text" id="modal-adm-parent" required placeholder="Father / Mother Name" oninput="AdminApp.updateAdmissionPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Contact Phone *</label>
              <input type="text" id="modal-adm-phone" required placeholder="+91 " oninput="AdminApp.updateAdmissionPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono" />
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Previous Islamic Education / Madrasa (if any)</label>
            <input type="text" id="modal-adm-prev" placeholder="e.g. Samastha Madrasa Class 3, Calicut" oninput="AdminApp.updateAdmissionPreview()"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Submission Mode</label>
            <div class="flex items-center gap-4 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <label class="flex items-center gap-2 cursor-pointer text-slate-300">
                <input type="radio" name="modal-adm-status" value="APPROVED" checked class="text-emerald-600 focus:ring-emerald-500" />
                <span>Approve & Enroll Immediately</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-slate-300">
                <input type="radio" name="modal-adm-status" value="PENDING" class="text-amber-600 focus:ring-amber-500" />
                <span>Queue as Pending Approval</span>
              </label>
            </div>
          </div>

          <!-- Live Visual Preview of Admission Application -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Live Student Admission Pass Preview:</span>
            <div class="rounded-2xl p-4 bg-gradient-to-r from-teal-950/80 via-slate-900 to-slate-950 border border-teal-500/40 shadow-xl space-y-2 relative">
              <div class="flex items-center justify-between border-b border-teal-800/40 pb-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-bold text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-700/60">
                    ADM-2026-LIVE
                  </span>
                  <span id="preview-adm-course" class="text-[10px] font-semibold text-slate-300 truncate max-w-[200px]">
                    Madrasa Primary (Class 1)
                  </span>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono text-[9px] font-bold">READY TO ENROLL</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span class="text-[10px] text-slate-400 block">Student Applicant:</span>
                  <strong id="preview-adm-name" class="text-white text-xs font-semibold">Student full name</strong>
                  <span id="preview-adm-details" class="text-[10px] text-slate-400 block">Male • DOB: 2018-05-10</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 block">Parent / Guardian:</span>
                  <strong id="preview-adm-parent" class="text-slate-200 text-xs font-medium block">Father / Mother Name</strong>
                  <span id="preview-adm-phone" class="text-[10px] font-mono text-teal-400 block">+91 94470 12345</span>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/40">
              Submit Admission
            </button>
          </div>
        </form>
      </div>
    `;
    this.openModal(html);
  },

  updateAdmissionPreview: function () {
    const name = document.getElementById('modal-adm-name')?.value || 'Student Full Name';
    const genderSelect = document.getElementById('modal-adm-gender');
    const gender = genderSelect ? genderSelect.value : 'Male';
    const dob = document.getElementById('modal-adm-dob')?.value || '2018-05-10';
    const courseSelect = document.getElementById('modal-adm-course');
    const course = courseSelect ? courseSelect.value : 'Madrasa Primary (Class 1)';
    const parent = document.getElementById('modal-adm-parent')?.value || 'Father / Mother Name';
    const phone = document.getElementById('modal-adm-phone')?.value || '+91 94470 12345';

    const pName = document.getElementById('preview-adm-name');
    const pCourse = document.getElementById('preview-adm-course');
    const pDetails = document.getElementById('preview-adm-details');
    const pParent = document.getElementById('preview-adm-parent');
    const pPhone = document.getElementById('preview-adm-phone');

    if (pName) pName.textContent = name;
    if (pCourse) pCourse.textContent = course;
    if (pDetails) pDetails.textContent = `${gender} • DOB: ${dob}`;
    if (pParent) pParent.textContent = parent;
    if (pPhone) pPhone.textContent = phone;
    if (window.lucide) lucide.createIcons();
  },

  handleSaveAdmission: function (e) {
    e.preventDefault();
    const name = document.getElementById('modal-adm-name').value.trim();
    const gender = document.getElementById('modal-adm-gender').value;
    const dob = document.getElementById('modal-adm-dob').value;
    const course = document.getElementById('modal-adm-course').value;
    const famId = document.getElementById('modal-adm-famid').value;
    const parent = document.getElementById('modal-adm-parent').value.trim();
    const phone = document.getElementById('modal-adm-phone').value.trim();
    const prev = document.getElementById('modal-adm-prev').value.trim();
    const statusVal = document.querySelector('input[name="modal-adm-status"]:checked').value;

    const newAdm = MahallDB.createAdmission({
      studentName: name,
      gender: gender,
      dob: dob,
      course: course,
      familyId: famId,
      parentName: parent,
      phone: phone,
      previousMadrasa: prev,
      status: statusVal
    });

    if (statusVal === 'APPROVED') {
      MahallDB.approveAdmission(newAdm.id);
      this.showToast(`Student ${name} enrolled with official admission pass!`, 'success');
    } else {
      this.showToast(`Application queued as pending verification.`, 'info');
    }

    this.closeModal();
    this.renderMadrasa();
  },

  // 11.2 ENROLLED STUDENTS MASTER ROSTER
  renderStudents: function () {
    let list = MahallDB.getStudents ? MahallDB.getStudents() : [];
    const search = (document.getElementById('students-search-input') ? document.getElementById('students-search-input').value : '').toLowerCase().trim();
    const classFilter = document.getElementById('students-class-filter') ? document.getElementById('students-class-filter').value : 'all';

    if (classFilter !== 'all') {
      list = list.filter(s => (s.class || '').toLowerCase().includes(classFilter.toLowerCase()));
    }

    if (search) {
      list = list.filter(s =>
        (s.name || '').toLowerCase().includes(search) ||
        (s.roll || '').toLowerCase().includes(search) ||
        (s.class || '').toLowerCase().includes(search)
      );
    }

    const tbody = document.getElementById('students-table-body') || document.getElementById('madrasa-table-body');
    if (!tbody) return;

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-slate-500">No student records found in active roster.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(s => `
      <tr class="hover:bg-slate-950/40 transition">
        <td class="p-4 align-top whitespace-nowrap">
          <span class="font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-1 rounded border border-sky-800/60">${s.roll}</span>
        </td>
        <td class="p-4 align-top">
          <p class="font-bold text-white text-sm">${s.name}</p>
        </td>
        <td class="p-4 align-top whitespace-nowrap">
          <span class="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 text-xs font-semibold">${s.class || 'Class 5'}</span>
        </td>
        <td class="p-4 align-top whitespace-nowrap">
          <span class="text-emerald-400 font-mono font-bold">${s.att || '98%'}</span>
        </td>
        <td class="p-4 align-top text-xs text-amber-300 font-medium">
          ${s.hifdh || 'Juz Amma'}
        </td>
        <td class="p-4 align-top text-xs text-slate-300 font-mono font-bold">
          ${s.tajweed || 'A'}
        </td>
        <td class="p-4 align-top text-xs text-slate-400">
          ${s.rank || 'Student'}
        </td>
        <td class="p-4 align-top text-right whitespace-nowrap space-x-1">
          <button onclick="AdminApp.editStudent('${s.roll}')" title="Edit student records" class="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
          <button onclick="AdminApp.printStudentCard('${s.roll}')" title="Student ID Card" class="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition">
            <i data-lucide="award" class="w-4 h-4"></i>
          </button>
          <button onclick="AdminApp.deleteStudent('${s.roll}')" title="Remove student" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  filterStudents: function () {
    this.renderStudents();
  },

  openEnrollStudentModal: function (roll = null) {
    let existing = null;
    if (roll) {
      existing = MahallDB.getStudentByRoll ? MahallDB.getStudentByRoll(roll) : (MahallDB.getStudents() || []).find(s => s.roll === roll);
    }

    const defaultRoll = existing ? existing.roll : `NHM-${Math.floor(100 + Math.random() * 899)}`;
    const defaultClass = existing ? existing.class : 'Class 5A';
    const defaultName = existing ? existing.name : 'Mohammed Niyas';
    const defaultAtt = existing ? existing.att : '98.5%';
    const defaultHifdh = existing ? existing.hifdh : 'Juz Amma (30)';
    const defaultTajweed = existing ? existing.tajweed : 'A+ (Exemplary)';
    const defaultRank = existing ? existing.rank : 'Top 5 in Class';

    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="graduation-cap" class="w-5 h-5 text-emerald-400"></i>
            <span>${existing ? 'Edit Enrolled Student Dossier' : 'Direct Student Enrollment in Academy'}</span>
          </h3>
          <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="AdminApp.handleSaveStudent(event, '${roll || ''}')" class="space-y-3 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Roll / Admission Number *</label>
              <input type="text" id="modal-std-roll" required value="${defaultRoll}" oninput="AdminApp.updateStudentPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sky-400 font-mono font-bold" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Class / Standard *</label>
              <select id="modal-std-class" onchange="AdminApp.updateStudentPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="Class 1A" ${defaultClass === 'Class 1A' ? 'selected' : ''}>Class 1A</option>
                <option value="Class 2B" ${defaultClass === 'Class 2B' ? 'selected' : ''}>Class 2B</option>
                <option value="Class 3A" ${defaultClass === 'Class 3A' ? 'selected' : ''}>Class 3A</option>
                <option value="Class 4C" ${defaultClass === 'Class 4C' ? 'selected' : ''}>Class 4C</option>
                <option value="Class 5A" ${defaultClass === 'Class 5A' ? 'selected' : ''}>Class 5A</option>
                <option value="Class 6B" ${defaultClass === 'Class 6B' ? 'selected' : ''}>Class 6B</option>
                <option value="Class 7A" ${defaultClass === 'Class 7A' ? 'selected' : ''}>Class 7A</option>
                <option value="Class 8B" ${defaultClass === 'Class 8B' ? 'selected' : ''}>Class 8B</option>
                <option value="Class 9A" ${defaultClass === 'Class 9A' ? 'selected' : ''}>Class 9A</option>
                <option value="Class 10A" ${defaultClass === 'Class 10A' ? 'selected' : ''}>Class 10A (SSLC Final)</option>
                <option value="Hifdh Wing" ${defaultClass === 'Hifdh Wing' ? 'selected' : ''}>Hifdh Wing</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Full Student Name *</label>
            <input type="text" id="modal-std-name" required value="${existing ? existing.name : ''}" oninput="AdminApp.updateStudentPreview()" placeholder="Full legal name"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none" />
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Attendance Rate</label>
              <input type="text" id="modal-std-att" value="${defaultAtt}" oninput="AdminApp.updateStudentPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-emerald-400 font-mono font-bold" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Hifdh Memorization</label>
              <input type="text" id="modal-std-hifdh" value="${defaultHifdh}" oninput="AdminApp.updateStudentPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Tajweed Grade</label>
              <input type="text" id="modal-std-tajweed" value="${defaultTajweed}" oninput="AdminApp.updateStudentPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono" />
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Class Rank / Honors</label>
            <input type="text" id="modal-std-rank" value="${defaultRank}" oninput="AdminApp.updateStudentPreview()"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
          </div>

          <!-- Live Visual Preview of Madrasa Student Card -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Live Student Madrasa Dossier Preview:</span>
            <div class="rounded-2xl p-4 bg-gradient-to-r from-sky-950/80 via-slate-900 to-slate-950 border border-sky-500/40 shadow-xl space-y-2 relative">
              <div class="flex items-center justify-between border-b border-sky-800/40 pb-2">
                <div class="flex items-center gap-2">
                  <span id="preview-std-roll" class="text-xs font-mono font-bold text-sky-300 bg-sky-950 px-2 py-0.5 rounded border border-sky-700/60">
                    ${defaultRoll}
                  </span>
                  <span id="preview-std-class" class="text-[10px] font-semibold text-slate-300">
                    ${defaultClass}
                  </span>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono text-[9px] font-bold">ACADEMIC HONORS</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span class="text-[10px] text-slate-400 block">Student Scholar:</span>
                  <strong id="preview-std-name" class="text-white text-xs font-semibold">${this.escapeHTML(defaultName)}</strong>
                  <span id="preview-std-rank" class="text-[10px] text-amber-300 block">${this.escapeHTML(defaultRank)}</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 block">Attendance Rate:</span>
                  <strong id="preview-std-att" class="text-emerald-400 font-mono text-xs font-bold block">${this.escapeHTML(defaultAtt)}</strong>
                  <span class="text-[9px] text-slate-400">Regular Enrollment</span>
                </div>
              </div>
              <div class="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span class="text-slate-300">Hifdh: <strong id="preview-std-hifdh" class="text-white">${this.escapeHTML(defaultHifdh)}</strong></span>
                <span class="text-teal-400 font-bold">Tajweed Grade: <strong id="preview-std-tajweed" class="text-teal-300 font-mono">${this.escapeHTML(defaultTajweed)}</strong></span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold">
              ${existing ? 'Update Student' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </div>
    `;
    this.openModal(html);
  },

  updateStudentPreview: function () {
    const roll = document.getElementById('modal-std-roll')?.value || 'NHM-101';
    const clsSelect = document.getElementById('modal-std-class');
    const cls = clsSelect ? clsSelect.value : 'Class 5A';
    const name = document.getElementById('modal-std-name')?.value || 'Full Legal Name';
    const att = document.getElementById('modal-std-att')?.value || '98.5%';
    const hifdh = document.getElementById('modal-std-hifdh')?.value || 'Juz Amma (30)';
    const tajweed = document.getElementById('modal-std-tajweed')?.value || 'A+ (Exemplary)';
    const rank = document.getElementById('modal-std-rank')?.value || 'Top 5 in Class';

    const pRoll = document.getElementById('preview-std-roll');
    const pClass = document.getElementById('preview-std-class');
    const pName = document.getElementById('preview-std-name');
    const pAtt = document.getElementById('preview-std-att');
    const pHifdh = document.getElementById('preview-std-hifdh');
    const pTajweed = document.getElementById('preview-std-tajweed');
    const pRank = document.getElementById('preview-std-rank');

    if (pRoll) pRoll.textContent = roll.toUpperCase();
    if (pClass) pClass.textContent = cls;
    if (pName) pName.textContent = name;
    if (pAtt) pAtt.textContent = att;
    if (pHifdh) pHifdh.textContent = hifdh;
    if (pTajweed) pTajweed.textContent = tajweed;
    if (pRank) pRank.textContent = rank;
    if (window.lucide) lucide.createIcons();
  },

  editStudent: function (roll) {
    this.openEnrollStudentModal(roll);
  },

  handleSaveStudent: function (e, existingRoll) {
    e.preventDefault();
    const roll = document.getElementById('modal-std-roll').value.trim();
    const name = document.getElementById('modal-std-name').value.trim();
    const cls = document.getElementById('modal-std-class').value;
    const att = document.getElementById('modal-std-att').value.trim();
    const hifdh = document.getElementById('modal-std-hifdh').value.trim();
    const tajweed = document.getElementById('modal-std-tajweed').value.trim();
    const rank = document.getElementById('modal-std-rank').value.trim();

    const data = {
      roll: roll,
      name: name,
      class: cls,
      att: att,
      hifdh: hifdh,
      tajweed: tajweed,
      rank: rank
    };

    if (existingRoll) {
      MahallDB.updateStudent(existingRoll, data);
      this.showToast(`Updated student ${name} (${roll})`, 'success');
    } else {
      MahallDB.addStudent(data);
      this.showToast(`Enrolled student ${name} in ${cls}`, 'success');
    }

    this.closeModal();
    this.renderMadrasa();
  },

  deleteStudent: function (roll) {
    if (confirm(`Remove student ${roll} from active master roster?`)) {
      MahallDB.deleteStudent(roll);
      this.showToast(`Student ${roll} removed.`, 'info');
      this.renderMadrasa();
    }
  },

  // 11.3 FACULTY / USTHAD DIRECTORY
  renderFaculty: function () {
    const list = MahallDB.getFaculty ? MahallDB.getFaculty() : [];
    const container = document.getElementById('faculty-cards-container');
    if (!container) return;

    if (!list.length) {
      container.innerHTML = `<div class="col-span-4 p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">No faculty records found.</div>`;
      return;
    }

    container.innerHTML = list.map(f => `
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-500/50 transition">
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-bold flex items-center justify-center text-sm font-heading">
              ${f.name.substring(0, 2).toUpperCase()}
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="font-bold text-white text-sm truncate leading-tight">${f.name}</h4>
              <p class="text-[11px] text-indigo-400 font-semibold mt-0.5 truncate">${f.role}</p>
            </div>
          </div>

          <div class="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
            <div><span class="text-slate-500">Sanad:</span> <span class="text-slate-200 font-medium">${f.qualification}</span></div>
            <div><span class="text-slate-500">Subject:</span> <span class="text-amber-300 font-medium">${f.subject}</span></div>
            <div><span class="text-slate-500">Classes:</span> <span class="text-emerald-400 font-medium">${f.classes}</span></div>
            <div><span class="text-slate-500">Contact:</span> <span class="font-mono text-slate-300">${f.phone}</span></div>
          </div>
        </div>

        <div class="pt-3 mt-3 border-t border-slate-800 flex justify-end gap-2">
          <button onclick="AdminApp.openAddFacultyModal('${f.id}')" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            <span>Edit</span>
          </button>
          <button onclick="AdminApp.deleteFaculty('${f.id}')" class="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            <span>Delete</span>
          </button>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  openAddFacultyModal: function (id = null) {
    let existing = null;
    if (id) {
      existing = (MahallDB.getFaculty() || []).find(f => f.id === id);
    }

    const defaultName = existing ? existing.name : 'Usthad Shihabudheen Baqavi';
    const defaultRole = existing ? existing.role : 'Senior Mudarris';
    const defaultQual = existing ? existing.qualification : 'Faizy (Pattikkad), MA';
    const defaultSub = existing ? existing.subject : 'Tajweed & Fiqh';
    const defaultCls = existing ? existing.classes : 'Classes 5-10';
    const defaultPhone = existing ? (existing.phone || '+91 94470 12345') : '+91 94470 12345';
    const defaultExp = existing ? (existing.exp || '10 Years') : '10 Years';

    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="user-check" class="w-5 h-5 text-indigo-400"></i>
            <span>${existing ? 'Edit Faculty Record' : 'Add New Usthad / Faculty Member'}</span>
          </h3>
          <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="AdminApp.handleSaveFaculty(event, '${id || ''}')" class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">Usthad Full Name & Title *</label>
            <input type="text" id="modal-fac-name" required value="${existing ? existing.name : ''}" oninput="AdminApp.updateFacultyPreview()" placeholder="e.g. Usthad Shihabudheen Baqavi"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Role / Designation *</label>
              <input type="text" id="modal-fac-role" required value="${defaultRole}" oninput="AdminApp.updateFacultyPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Sanad & Qualifications</label>
              <input type="text" id="modal-fac-qual" value="${defaultQual}" oninput="AdminApp.updateFacultyPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Primary Subjects</label>
              <input type="text" id="modal-fac-sub" value="${defaultSub}" oninput="AdminApp.updateFacultyPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Assigned Classes</label>
              <input type="text" id="modal-fac-cls" value="${defaultCls}" oninput="AdminApp.updateFacultyPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Official Mobile Phone</label>
              <input type="text" id="modal-fac-phone" value="${defaultPhone}" oninput="AdminApp.updateFacultyPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Teaching Experience</label>
              <input type="text" id="modal-fac-exp" value="${defaultExp}" oninput="AdminApp.updateFacultyPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <!-- Live Visual Preview of Faculty Profile -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Live Faculty & Usthad Profile Badge Preview:</span>
            <div class="rounded-2xl p-4 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/40 shadow-xl space-y-2 relative">
              <div class="flex items-center justify-between border-b border-indigo-800/40 pb-2">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-indigo-900/80 border border-indigo-700/60 text-indigo-300 flex items-center justify-center font-bold text-xs"><i data-lucide="award" class="w-4 h-4"></i></div>
                  <div>
                    <h5 id="preview-fac-name" class="text-xs font-bold text-white leading-tight">${this.escapeHTML(defaultName)}</h5>
                    <span id="preview-fac-role" class="text-[10px] text-indigo-300 font-medium">${this.escapeHTML(defaultRole)}</span>
                  </div>
                </div>
                <span id="preview-fac-exp" class="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/50 text-indigo-300 font-mono text-[9px] font-bold">${this.escapeHTML(defaultExp)} Exp</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-300">
                <div>
                  <span class="text-[10px] text-slate-400 block">Sanad & Degree:</span>
                  <strong id="preview-fac-qual" class="text-slate-100 text-xs font-medium">${this.escapeHTML(defaultQual)}</strong>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 block">Assigned Classes:</span>
                  <strong id="preview-fac-cls" class="text-slate-100 text-xs font-mono font-medium block">${this.escapeHTML(defaultCls)}</strong>
                </div>
              </div>
              <div class="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span class="text-slate-400">Primary Subject: <strong id="preview-fac-sub" class="text-emerald-400">${this.escapeHTML(defaultSub)}</strong></span>
                <span id="preview-fac-phone" class="text-indigo-300 font-mono">${this.escapeHTML(defaultPhone)}</span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold">
              ${existing ? 'Update Usthad' : 'Save Faculty Member'}
            </button>
          </div>
        </form>
      </div>
    `;
    this.openModal(html);
  },

  updateFacultyPreview: function () {
    const name = document.getElementById('modal-fac-name')?.value || 'Usthad Full Name';
    const role = document.getElementById('modal-fac-role')?.value || 'Senior Mudarris';
    const qual = document.getElementById('modal-fac-qual')?.value || 'Faizy (Pattikkad)';
    const sub = document.getElementById('modal-fac-sub')?.value || 'Tajweed & Fiqh';
    const cls = document.getElementById('modal-fac-cls')?.value || 'Classes 5-10';
    const phone = document.getElementById('modal-fac-phone')?.value || '+91 94470 12345';
    const exp = document.getElementById('modal-fac-exp')?.value || '10 Years';

    const pName = document.getElementById('preview-fac-name');
    const pRole = document.getElementById('preview-fac-role');
    const pQual = document.getElementById('preview-fac-qual');
    const pSub = document.getElementById('preview-fac-sub');
    const pCls = document.getElementById('preview-fac-cls');
    const pPhone = document.getElementById('preview-fac-phone');
    const pExp = document.getElementById('preview-fac-exp');

    if (pName) pName.textContent = name;
    if (pRole) pRole.textContent = role;
    if (pQual) pQual.textContent = qual;
    if (pSub) pSub.textContent = sub;
    if (pCls) pCls.textContent = cls;
    if (pPhone) pPhone.textContent = phone;
    if (pExp) pExp.textContent = `${exp} Exp`;
    if (window.lucide) lucide.createIcons();
  },

  handleSaveFaculty: function (e, existingId) {
    e.preventDefault();
    const name = document.getElementById('modal-fac-name').value.trim();
    const role = document.getElementById('modal-fac-role').value.trim();
    const qual = document.getElementById('modal-fac-qual').value.trim();
    const sub = document.getElementById('modal-fac-sub').value.trim();
    const cls = document.getElementById('modal-fac-cls').value.trim();
    const phone = document.getElementById('modal-fac-phone').value.trim();
    const exp = document.getElementById('modal-fac-exp').value.trim();

    const data = {
      name: name,
      role: role,
      qualification: qual,
      subject: sub,
      classes: cls,
      phone: phone,
      exp: exp
    };

    if (existingId) {
      MahallDB.updateFaculty(existingId, data);
      this.showToast(`Updated faculty ${name}`, 'success');
    } else {
      MahallDB.addFaculty(data);
      this.showToast(`Added ${name} to faculty directory`, 'success');
    }

    this.closeModal();
    this.renderMadrasa();
  },

  deleteFaculty: function (id) {
    if (confirm(`Remove faculty member ${id}?`)) {
      MahallDB.deleteFaculty(id);
      this.showToast('Faculty member removed.', 'info');
      this.renderMadrasa();
    }
  },

  // 11.4 ACADEMIC COURSES & HALQAS
  renderCourses: function () {
    const list = MahallDB.getCourses ? MahallDB.getCourses() : [];
    const container = document.getElementById('courses-cards-container');
    if (!container) return;

    if (!list.length) {
      container.innerHTML = `<div class="col-span-3 p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">No academic courses registered.</div>`;
      return;
    }

    container.innerHTML = list.map(c => `
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-teal-500/50 transition">
        <div class="space-y-3">
          <div class="flex items-center justify-between text-xs">
            <span class="px-2 py-0.5 rounded-md bg-teal-950 text-teal-300 border border-teal-800 font-semibold font-mono">${c.code || 'CRS'}</span>
            <span class="px-2 py-0.5 rounded-full ${c.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'} text-[10px] font-bold">
              ${c.status || 'Active'}
            </span>
          </div>

          <div>
            <h4 class="font-bold text-white text-base leading-snug">${c.title}</h4>
            <p class="text-xs text-slate-400 mt-1">${c.category || 'Islamic Education'}</p>
          </div>

          <div class="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
            <div><span class="text-slate-500">Timing:</span> <span class="text-slate-200 font-medium">${c.timing}</span></div>
            <div><span class="text-slate-500">Capacity:</span> <span class="text-emerald-400 font-medium">${c.intake}</span></div>
            <div><span class="text-slate-500">In-Charge:</span> <span class="text-amber-300 font-medium">${c.usthad}</span></div>
          </div>
        </div>

        <div class="pt-3 mt-3 border-t border-slate-800 flex justify-end gap-2">
          <button onclick="AdminApp.openAddCourseModal('${c.id}')" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            <span>Edit</span>
          </button>
          <button onclick="AdminApp.deleteCourse('${c.id}')" class="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            <span>Delete</span>
          </button>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  openAddCourseModal: function (id = null) {
    let existing = null;
    if (id) {
      existing = (MahallDB.getCourses() || []).find(c => c.id === id);
    }

    const defaultTitle = existing ? existing.title : 'Primary Islamic Education (Classes 1–5)';
    const defaultCode = existing ? existing.code : 'MAD-PRI';
    const defaultCat = existing ? existing.category : 'Primary Madrasa';
    const defaultTiming = existing ? existing.timing : '06:45 AM - 08:30 AM (Daily)';
    const defaultIntake = existing ? existing.intake : '120 Students';
    const defaultUsthad = existing ? existing.usthad : 'Muallim Zainudheen Faizy';
    const defaultStatus = existing ? existing.status : 'Active';

    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="book-open" class="w-5 h-5 text-teal-400"></i>
            <span>${existing ? 'Edit Course Program' : 'Add New Academic Program'}</span>
          </h3>
          <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="AdminApp.handleSaveCourse(event, '${id || ''}')" class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">Course Title *</label>
            <input type="text" id="modal-crs-title" required value="${existing ? existing.title : ''}" oninput="AdminApp.updateCoursePreview()" placeholder="e.g. Primary Islamic Education (Classes 1–5)"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Course Code *</label>
              <input type="text" id="modal-crs-code" required value="${existing ? existing.code : 'MAD-PRI'}" oninput="AdminApp.updateCoursePreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-teal-400 font-mono font-bold" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Category</label>
              <input type="text" id="modal-crs-cat" value="${existing ? existing.category : 'Primary Madrasa'}" oninput="AdminApp.updateCoursePreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Schedule & Timing</label>
              <input type="text" id="modal-crs-timing" value="${existing ? existing.timing : '06:45 AM - 08:30 AM (Daily)'}" oninput="AdminApp.updateCoursePreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Intake Capacity</label>
              <input type="text" id="modal-crs-intake" value="${existing ? existing.intake : '120 Students'}" oninput="AdminApp.updateCoursePreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Usthad / Lecturer in Charge</label>
              <input type="text" id="modal-crs-usthad" value="${existing ? existing.usthad : 'Muallim Zainudheen Faizy'}" oninput="AdminApp.updateCoursePreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Status</label>
              <select id="modal-crs-status" onchange="AdminApp.updateCoursePreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="Active" ${existing && existing.status === 'Active' ? 'selected' : ''}>Active</option>
                <option value="Admissions Open" ${existing && existing.status === 'Admissions Open' ? 'selected' : ''}>Admissions Open</option>
                <option value="Upcoming Batch" ${existing && existing.status === 'Upcoming Batch' ? 'selected' : ''}>Upcoming Batch</option>
              </select>
            </div>
          </div>

          <!-- Live Visual Preview of Course Program -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Live Academic Course Program Card Preview:</span>
            <div class="rounded-2xl p-4 bg-slate-900 border border-teal-500/40 shadow-xl space-y-2.5">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span id="preview-crs-code" class="text-[10px] font-mono font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/60">
                    ${defaultCode}
                  </span>
                  <span id="preview-crs-cat" class="text-[10px] text-slate-400 uppercase font-semibold">
                    ${defaultCat}
                  </span>
                </div>
                <span id="preview-crs-status" class="px-2 py-0.5 rounded-full ${defaultStatus === 'Admissions Open' ? 'bg-amber-950 border border-amber-600/50 text-amber-300' : 'bg-emerald-950 border border-emerald-600/50 text-emerald-300'} font-bold text-[10px]">
                  ${defaultStatus}
                </span>
              </div>
              <h4 id="preview-crs-title" class="text-sm font-bold text-white leading-tight">
                ${defaultTitle}
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                <div class="flex items-center gap-1.5"><i data-lucide="clock" class="w-3.5 h-3.5 text-teal-400 shrink-0"></i><span id="preview-crs-timing">${defaultTiming}</span></div>
                <div class="flex items-center gap-1.5"><i data-lucide="users" class="w-3.5 h-3.5 text-sky-400 shrink-0"></i><span id="preview-crs-intake">${defaultIntake} Intake</span></div>
                <div class="flex items-center gap-1.5 sm:col-span-2"><i data-lucide="graduation-cap" class="w-3.5 h-3.5 text-amber-400 shrink-0"></i><span>Lecturer: </span><strong id="preview-crs-usthad" class="text-white">${defaultUsthad}</strong></div>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/40">
              ${existing ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    `;
    this.openModal(html);
  },

  updateCoursePreview: function () {
    const title = document.getElementById('modal-crs-title')?.value || 'Primary Islamic Education (Classes 1–5)';
    const code = document.getElementById('modal-crs-code')?.value || 'MAD-PRI';
    const cat = document.getElementById('modal-crs-cat')?.value || 'Primary Madrasa';
    const timing = document.getElementById('modal-crs-timing')?.value || '06:45 AM - 08:30 AM (Daily)';
    const intake = document.getElementById('modal-crs-intake')?.value || '120 Students';
    const usthad = document.getElementById('modal-crs-usthad')?.value || 'Muallim Zainudheen Faizy';
    const statusSelect = document.getElementById('modal-crs-status');
    const status = statusSelect ? statusSelect.value : 'Active';

    const pCode = document.getElementById('preview-crs-code');
    const pCat = document.getElementById('preview-crs-cat');
    const pStatus = document.getElementById('preview-crs-status');
    const pTitle = document.getElementById('preview-crs-title');
    const pTiming = document.getElementById('preview-crs-timing');
    const pIntake = document.getElementById('preview-crs-intake');
    const pUsthad = document.getElementById('preview-crs-usthad');

    if (pCode) pCode.textContent = code.toUpperCase();
    if (pCat) pCat.textContent = cat.toUpperCase();
    if (pStatus) {
      pStatus.textContent = status;
      pStatus.className = `px-2 py-0.5 rounded-full border text-[10px] font-bold ${
        status === 'Admissions Open' ? 'bg-amber-950 border-amber-600/50 text-amber-300' :
        status === 'Upcoming Batch' ? 'bg-sky-950 border-sky-600/50 text-sky-300' :
        'bg-emerald-950 border-emerald-600/50 text-emerald-300'
      }`;
    }
    if (pTitle) pTitle.textContent = title;
    if (pTiming) pTiming.textContent = timing;
    if (pIntake) pIntake.textContent = intake.includes('Students') ? intake : `${intake} Students Intake`;
    if (pUsthad) pUsthad.textContent = usthad;
    if (window.lucide) lucide.createIcons();
  },

  handleSaveCourse: function (e, existingId) {
    e.preventDefault();
    const title = document.getElementById('modal-crs-title').value.trim();
    const code = document.getElementById('modal-crs-code').value.trim();
    const cat = document.getElementById('modal-crs-cat').value.trim();
    const timing = document.getElementById('modal-crs-timing').value.trim();
    const intake = document.getElementById('modal-crs-intake').value.trim();
    const usthad = document.getElementById('modal-crs-usthad').value.trim();
    const status = document.getElementById('modal-crs-status').value;

    const data = {
      title: title,
      code: code,
      category: cat,
      timing: timing,
      intake: intake,
      usthad: usthad,
      status: status
    };

    if (existingId) {
      MahallDB.updateCourse(existingId, data);
      this.showToast(`Updated course ${title}`, 'success');
    } else {
      MahallDB.addCourse(data);
      this.showToast(`Created new program ${title}`, 'success');
    }

    this.closeModal();
    this.renderMadrasa();
  },

  deleteCourse: function (id) {
    if (confirm(`Delete course ${id}?`)) {
      MahallDB.deleteCourse(id);
      this.showToast('Course removed.', 'info');
      this.renderMadrasa();
    }
  },

  // 11.5 SCHOLARSHIPS & WELFARE AID
  renderScholarships: function () {
    const list = MahallDB.getScholarships ? MahallDB.getScholarships() : [];
    const tbody = document.getElementById('scholarships-table-body');
    if (!tbody) return;

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-slate-500">No scholarship records registered.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(s => `
      <tr class="hover:bg-slate-950/40 transition">
        <td class="p-4 align-top whitespace-nowrap">
          <span class="font-mono font-bold text-rose-400 bg-rose-950/70 px-2 py-1 rounded border border-rose-800/60">${s.id}</span>
        </td>
        <td class="p-4 align-top">
          <p class="font-bold text-white text-sm">${s.studentName}</p>
        </td>
        <td class="p-4 align-top whitespace-nowrap">
          <span class="text-slate-300 font-medium">${s.class}</span>
        </td>
        <td class="p-4 align-top whitespace-nowrap">
          <span class="font-mono text-slate-400">${s.familyId}</span>
        </td>
        <td class="p-4 align-top">
          <span class="px-2 py-0.5 rounded bg-slate-800 text-rose-300 text-xs font-semibold">${s.type}</span>
        </td>
        <td class="p-4 align-top whitespace-nowrap">
          <span class="font-mono text-emerald-400 font-bold">₹${s.amount}</span>
        </td>
        <td class="p-4 align-top whitespace-nowrap">
          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${
            s.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
            s.status === 'REJECTED' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
            'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
          }">
            ${s.status}
          </span>
          ${s.approvedDate ? `<div class="text-[10px] text-slate-500 mt-1">${s.approvedDate}</div>` : ''}
        </td>
        <td class="p-4 align-top text-right whitespace-nowrap space-x-1">
          ${s.status === 'PENDING' ? `
            <button onclick="AdminApp.approveScholarship('${s.id}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition">
              Approve
            </button>
            <button onclick="AdminApp.rejectScholarship('${s.id}')" class="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow transition">
              Reject
            </button>
          ` : s.status === 'APPROVED' ? `
            <span class="text-xs text-emerald-400 font-semibold px-2">Disbursed</span>
          ` : `
            <span class="text-xs text-rose-400 font-semibold px-2">Declined</span>
          `}
          <button onclick="AdminApp.deleteScholarship('${s.id}')" class="p-1 text-slate-500 hover:text-rose-400 rounded transition" title="Delete record">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  approveScholarship: function (id) {
    MahallDB.approveScholarship(id);
    this.showToast(`Scholarship ${id} approved for disbursement!`, 'success');
    this.renderMadrasa();
  },

  rejectScholarship: function (id) {
    if (confirm(`Decline scholarship request ${id}?`)) {
      MahallDB.rejectScholarship(id);
      this.showToast(`Scholarship ${id} application rejected.`, 'info');
      this.renderMadrasa();
    }
  },

  deleteScholarship: function (id) {
    if (confirm(`Remove scholarship entry ${id}?`)) {
      MahallDB.deleteScholarship(id);
      this.showToast('Scholarship removed.', 'info');
      this.renderMadrasa();
    }
  },

  openNewScholarshipModal: function () {
    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="award" class="w-5 h-5 text-rose-400"></i>
            <span>Log Madrasa Scholarship / Aid Request</span>
          </h3>
          <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="AdminApp.handleSaveScholarship(event)" class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">Student Full Name *</label>
            <input type="text" id="modal-sch-name" required placeholder="Student name" oninput="AdminApp.updateScholarshipPreview()"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Class / Standard *</label>
              <input type="text" id="modal-sch-class" required value="Class 7" oninput="AdminApp.updateScholarshipPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Family ID *</label>
              <input type="text" id="modal-sch-famid" required value="W02-F005" oninput="AdminApp.updateScholarshipPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Subsidy / Aid Type</label>
              <select id="modal-sch-type" onchange="AdminApp.updateScholarshipPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="Orphan Education Subsidy">Orphan Education Subsidy</option>
                <option value="Destitute Madrasa Kit & Fee Waiver">Destitute Kit & Fee Waiver</option>
                <option value="Merit Excellence Scholarship">Merit Excellence Scholarship</option>
                <option value="Higher Studies Support">Higher Studies Support</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Sanctioned Amount (₹)</label>
              <input type="number" id="modal-sch-amt" value="2500" oninput="AdminApp.updateScholarshipPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-emerald-400 font-mono font-bold" />
            </div>
          </div>

          <!-- Live Visual Preview of Scholarship Sanction Grant Card -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <i data-lucide="eye" class="w-3.5 h-3.5 text-amber-400"></i>
              <span>LIVE PREVIEW AS SEEN ON PUBLIC PORTAL:</span>
            </span>
            <div class="rounded-2xl p-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border border-amber-500/40 shadow-xl space-y-2 relative">
              <div class="flex items-center justify-between border-b border-amber-800/40 pb-2">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-md bg-amber-900 text-amber-300 flex items-center justify-center text-xs font-bold font-heading"><i data-lucide="award" class="w-3.5 h-3.5"></i></div>
                  <div>
                    <span class="text-[9px] font-mono uppercase tracking-wider text-amber-300 block">EDUCATION WELFARE SCHOLARSHIP FUND</span>
                    <h5 id="preview-sch-type" class="text-xs font-bold text-white uppercase">Orphan Education Subsidy</h5>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono text-[9px] font-bold">SANCTION ORDER</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span class="text-[10px] text-slate-400 block">Beneficiary Scholar:</span>
                  <strong id="preview-sch-name" class="text-white text-xs font-semibold">Student Name</strong>
                  <span id="preview-sch-class" class="text-[10px] text-slate-400 block">Class 7 • Noorul Huda Madrasa</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 block">Grant Amount Sanctioned:</span>
                  <strong id="preview-sch-amt" class="text-emerald-400 font-mono text-sm font-bold block">₹2,500</strong>
                  <span id="preview-sch-famid" class="text-[10px] font-mono text-amber-300">W02-F005</span>
                </div>
              </div>
              <div class="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>Disbursement: Direct Bank / Madrasa Fee Waiver</span>
                <span class="text-emerald-400 font-bold flex items-center gap-1"><i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Verified Allocation</span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold">Log Request</button>
          </div>
        </form>
      </div>
    `;
    this.openModal(html);
  },

  updateScholarshipPreview: function () {
    const name = document.getElementById('modal-sch-name')?.value || 'Student Name';
    const cls = document.getElementById('modal-sch-class')?.value || 'Class 7';
    const famid = document.getElementById('modal-sch-famid')?.value || 'W02-F005';
    const typeSelect = document.getElementById('modal-sch-type');
    const type = typeSelect ? typeSelect.value : 'Orphan Education Subsidy';
    const amt = document.getElementById('modal-sch-amt')?.value || '2500';

    const pName = document.getElementById('preview-sch-name');
    const pCls = document.getElementById('preview-sch-class');
    const pFamId = document.getElementById('preview-sch-famid');
    const pType = document.getElementById('preview-sch-type');
    const pAmt = document.getElementById('preview-sch-amt');

    if (pName) pName.textContent = name;
    if (pCls) pCls.textContent = `${cls} • Noorul Huda Madrasa`;
    if (pFamId) pFamId.textContent = famid.toUpperCase();
    if (pType) pType.textContent = type.toUpperCase();
    if (pAmt) pAmt.textContent = `₹${Number(amt).toLocaleString()}`;
    if (window.lucide) lucide.createIcons();
  },

  handleSaveScholarship: function (e) {
    e.preventDefault();
    const name = document.getElementById('modal-sch-name').value.trim();
    const cls = document.getElementById('modal-sch-class').value.trim();
    const famId = document.getElementById('modal-sch-famid').value.trim();
    const type = document.getElementById('modal-sch-type').value;
    const amt = parseFloat(document.getElementById('modal-sch-amt').value) || 2500;

    MahallDB.createScholarship({
      studentName: name,
      class: cls,
      familyId: famId,
      type: type,
      amount: amt
    });

    this.showToast(`Scholarship request logged for ${name}`, 'success');
    this.closeModal();
    this.renderMadrasa();
  },

  // 11.6 STUDY MATERIALS & CIRCULARS
  renderMaterials: function () {
    const list = MahallDB.getMaterials ? MahallDB.getMaterials() : [];
    const tbody = document.getElementById('materials-table-body');
    if (!tbody) return;

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-500">No study materials published yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(m => `
      <tr class="hover:bg-slate-950/40 transition">
        <td class="p-4 align-top">
          <p class="font-bold text-white text-sm">${m.title}</p>
        </td>
        <td class="p-4 align-top whitespace-nowrap">
          <span class="text-slate-300 font-medium">${m.class}</span>
        </td>
        <td class="p-4 align-top whitespace-nowrap">
          <span class="px-2 py-0.5 rounded bg-slate-800 text-teal-300 text-xs font-semibold">${m.category}</span>
        </td>
        <td class="p-4 align-top font-mono text-slate-400 text-xs">
          ${m.file}
        </td>
        <td class="p-4 align-top whitespace-nowrap text-slate-400 text-xs">
          ${m.date}
        </td>
        <td class="p-4 align-top text-right whitespace-nowrap">
          <button onclick="AdminApp.deleteMaterial('${m.id}')" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  openAddMaterialModal: function () {
    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="upload" class="w-5 h-5 text-amber-400"></i>
            <span>Publish Madrasa Study Material or Timetable</span>
          </h3>
          <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="AdminApp.handleSaveMaterial(event)" class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">Document Title *</label>
            <input type="text" id="modal-mat-title" required placeholder="e.g. Samastha Half-Yearly Exam Timetable 2026" oninput="AdminApp.updateMaterialPreview()"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Target Class / Level</label>
              <input type="text" id="modal-mat-class" value="Classes 1 to 10" oninput="AdminApp.updateMaterialPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Category</label>
              <select id="modal-mat-cat" onchange="AdminApp.updateMaterialPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="Timetable">Timetable & Schedule</option>
                <option value="Study Material">Study Material & Notes</option>
                <option value="Syllabus">Board Syllabus</option>
                <option value="Circular">Official Circular</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">PDF File / Document Name</label>
            <input type="text" id="modal-mat-file" value="Noorul_Huda_Document.pdf" oninput="AdminApp.updateMaterialPreview()"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono" />
          </div>

          <!-- Live Visual Preview of Study Material Document -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <i data-lucide="eye" class="w-3.5 h-3.5 text-teal-400"></i>
              <span>LIVE PREVIEW AS SEEN ON PUBLIC PORTAL:</span>
            </span>
            <div class="rounded-2xl p-4 bg-slate-900 border border-teal-500/40 shadow-xl space-y-2.5">
              <div class="flex items-center justify-between gap-2">
                <span id="preview-mat-cat" class="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/60 inline-block">
                  TIMETABLE & SCHEDULE
                </span>
                <span id="preview-mat-class" class="text-[10px] text-slate-300 font-semibold bg-slate-800 px-2 py-0.5 rounded">
                  Classes 1 to 10
                </span>
              </div>
              <div>
                <h4 id="preview-mat-title" class="text-sm font-bold text-white leading-tight">Samastha Half-Yearly Exam Timetable 2026</h4>
                <p id="preview-mat-file" class="text-xs text-teal-400 font-mono mt-1 flex items-center gap-1"><i data-lucide="file-text" class="w-3.5 h-3.5"></i> Noorul_Huda_Document.pdf</p>
              </div>
              <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>Official PDF Publication • Free Download for Students</span>
                <span class="text-emerald-400 font-semibold flex items-center gap-1"><i data-lucide="download" class="w-3.5 h-3.5"></i> Ready to Publish</span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold">Publish Document</button>
          </div>
        </form>
      </div>
    `;
    this.openModal(html);
  },

  updateMaterialPreview: function () {
    const title = document.getElementById('modal-mat-title')?.value || 'Samastha Half-Yearly Exam Timetable 2026';
    const cls = document.getElementById('modal-mat-class')?.value || 'Classes 1 to 10';
    const catSelect = document.getElementById('modal-mat-cat');
    const cat = catSelect ? catSelect.options[catSelect.selectedIndex]?.text || 'Timetable & Schedule' : 'Timetable & Schedule';
    const file = document.getElementById('modal-mat-file')?.value || 'Noorul_Huda_Document.pdf';

    const pTitle = document.getElementById('preview-mat-title');
    const pCls = document.getElementById('preview-mat-class');
    const pCat = document.getElementById('preview-mat-cat');
    const pFile = document.getElementById('preview-mat-file');

    if (pTitle) pTitle.textContent = title;
    if (pCls) pCls.textContent = cls;
    if (pCat) pCat.textContent = cat.toUpperCase();
    if (pFile) pFile.innerHTML = `<i data-lucide="file-text" class="w-3.5 h-3.5"></i> ${file}`;
    if (window.lucide) lucide.createIcons();
  },

  handleSaveMaterial: function (e) {
    e.preventDefault();
    const title = document.getElementById('modal-mat-title').value.trim();
    const cls = document.getElementById('modal-mat-class').value.trim();
    const cat = document.getElementById('modal-mat-cat').value;
    const file = document.getElementById('modal-mat-file').value.trim();

    MahallDB.addMaterial({
      title: title,
      class: cls,
      category: cat,
      file: file
    });

    this.showToast(`Published document: ${title}`, 'success');
    this.closeModal();
    this.renderMadrasa();
  },

  deleteMaterial: function (id) {
    if (confirm('Delete this published study material?')) {
      MahallDB.deleteMaterial(id);
      this.showToast('Material removed.', 'info');
      this.renderMadrasa();
    }
  },

  // 11.7 PRINTABLE OFFICIAL ADMISSION PASS & STUDENT CARD
  printAdmissionPass: function (admId) {
    const list = MahallDB.getAdmissions ? MahallDB.getAdmissions() : [];
    const adm = list.find(a => a.id === admId);
    if (!adm) return;

    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 no-print">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="printer" class="w-5 h-5 text-emerald-400"></i>
            <span>Official Course Admission Pass</span>
          </h3>
          <div class="flex items-center gap-2">
            <button onclick="window.print()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition">
              <i data-lucide="printer" class="w-3.5 h-3.5"></i>
              <span>Print Pass</span>
            </button>
            <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
        </div>

        <div id="print-modal-content" class="bg-white text-slate-900 p-8 rounded-xl border-4 border-double border-emerald-900 shadow-2xl relative max-w-xl mx-auto">
          <div class="text-center pb-4 border-b-2 border-emerald-900/40">
            <p class="font-arabic text-lg text-emerald-950 mb-0.5">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ</p>
            <h2 class="text-xl font-heading font-bold tracking-wider text-emerald-950 uppercase">NOORUL HUDA ISLAMIC ACADEMY</h2>
            <p class="text-[10px] text-slate-700 font-semibold tracking-widest uppercase">Affiliated to Samastha Kerala Islam Matha Vidyabhyasa Board (Reg #642)</p>
            <p class="text-[10px] text-slate-600">Central Juma Masjid Complex, Calicut, Kerala</p>
          </div>

          <div class="flex items-center justify-between mt-3 text-[11px] font-mono text-slate-700 border-b border-slate-200 pb-2">
            <span>Pass Ref: <strong class="text-emerald-950">${adm.id}</strong></span>
            <span>Issued: <strong>${adm.reviewedAt || '2026'}</strong></span>
          </div>

          <div class="text-center my-4">
            <span class="inline-block bg-emerald-900 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full mb-1">
              ADMISSION CONFIRMED & ENROLLED
            </span>
            <h3 class="text-lg font-heading font-bold text-emerald-950 uppercase underline decoration-emerald-800 underline-offset-4">
              STUDENT COURSE ADMISSION PASS
            </h3>
          </div>

          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-800 mb-6">
            <div class="flex justify-between border-b border-slate-200 pb-1">
              <span class="text-slate-600">Student Name:</span>
              <strong class="text-slate-950 text-sm">${adm.studentName}</strong>
            </div>
            <div class="flex justify-between border-b border-slate-200 pb-1">
              <span class="text-slate-600">Allotted Roll Number:</span>
              <strong class="font-mono text-emerald-900 text-sm">${adm.rollNo || 'NHM-ENROLLED'}</strong>
            </div>
            <div class="flex justify-between border-b border-slate-200 pb-1">
              <span class="text-slate-600">Enrolled Course:</span>
              <span class="font-semibold text-slate-900">${adm.course}</span>
            </div>
            <div class="flex justify-between border-b border-slate-200 pb-1">
              <span class="text-slate-600">Parent / Guardian:</span>
              <span>${adm.parentName} (${adm.familyId})</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Contact Mobile:</span>
              <span class="font-mono">${adm.phone}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 pt-8 border-t border-slate-300 text-center text-xs">
            <div>
              <div class="w-16 h-16 mx-auto rounded-full border border-dashed border-emerald-900 flex items-center justify-center text-[9px] uppercase font-bold text-emerald-900">
                OFFICIAL<br>ACADEMY<br>SEAL
              </div>
            </div>
            <div>
              <p class="font-bold text-emerald-950 text-xs mt-6">Usthad M. Abdul Rasheed Faizy</p>
              <p class="text-[10px] text-slate-600 font-semibold">Sadar Mudarris (Principal)</p>
            </div>
          </div>
        </div>
      </div>
    `;
    this.openModal(html);
  },

  printStudentCard: function (roll) {
    const s = MahallDB.getStudentByRoll ? MahallDB.getStudentByRoll(roll) : (MahallDB.getStudents() || []).find(std => std.roll === roll);
    if (!s) return;

    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 no-print">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="award" class="w-5 h-5 text-sky-400"></i>
            <span>Student Academic Identity Card</span>
          </h3>
          <div class="flex items-center gap-2">
            <button onclick="window.print()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition">
              <i data-lucide="printer" class="w-3.5 h-3.5"></i>
              <span>Print Card</span>
            </button>
            <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
        </div>

        <div id="print-modal-content" class="bg-white text-slate-900 p-6 rounded-2xl border-2 border-emerald-900 shadow-xl max-w-sm mx-auto text-center">
          <div class="border-b border-emerald-900/30 pb-2 mb-3">
            <h4 class="font-heading font-bold text-xs text-emerald-950 uppercase">NOORUL HUDA ISLAMIC ACADEMY</h4>
            <p class="text-[9px] text-slate-600 uppercase font-semibold">Student Academic Identity</p>
          </div>

          <div class="w-16 h-16 rounded-full bg-emerald-900/10 border-2 border-emerald-800 mx-auto flex items-center justify-center font-bold text-lg text-emerald-950 font-heading mb-2">
            ${s.name.substring(0, 2).toUpperCase()}
          </div>

          <h3 class="font-bold text-slate-900 text-sm leading-tight">${s.name}</h3>
          <p class="font-mono text-emerald-900 font-bold text-xs mt-0.5">${s.roll}</p>

          <div class="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-left text-xs space-y-1">
            <div class="flex justify-between"><span class="text-slate-500">Class:</span> <strong class="text-slate-900">${s.class}</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">Attendance:</span> <span class="font-bold text-emerald-800">${s.att}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Hifdh:</span> <span class="text-slate-800">${s.hifdh}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Tajweed:</span> <span class="font-mono font-bold text-slate-900">${s.tajweed}</span></div>
          </div>

          <div class="mt-4 pt-2 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-500">
            <span>Academic Year 2026-27</span>
            <span>Authorized Seal</span>
          </div>
        </div>
      </div>
    `;
    this.openModal(html);
  },

  // =========================================================================
  // 12. BAITULMAL & FINANCIAL DUES LEDGER
  // =========================================================================
  currentFinanceFilter: 'all',
  financeSearchQuery: '',

  renderFinance: function () {
    const allList = MahallDB.getPayments ? MahallDB.getPayments() : [];
    const tbody = document.getElementById('payments-table-body');

    // 1. Calculate & Update Treasury KPIs dynamically
    let totalInflow = 0;
    let dialysisTotal = 0;
    let dialysisSessions = 0;
    let rationTotal = 0;
    let rationKits = 0;
    let chandaTotal = 0;

    allList.forEach(p => {
      const amt = Number(p.amount) || 0;
      totalInflow += amt;
      const purpose = (p.purpose || p.months || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();

      if (purpose.includes('dialysis') || cat.includes('dialysis')) {
        dialysisTotal += amt;
        const match = purpose.match(/(\d+)\s*session/i);
        dialysisSessions += match ? parseInt(match[1], 10) : Math.max(1, Math.floor(amt / 1000));
      } else if (purpose.includes('ration') || purpose.includes('kit') || cat.includes('ration')) {
        rationTotal += amt;
        const match = purpose.match(/(\d+)\s*kit/i);
        rationKits += match ? parseInt(match[1], 10) : Math.max(1, Math.floor(amt / 2500));
      } else if (purpose.includes('subscription') || purpose.includes('chanda') || purpose.includes('month') || cat.includes('chanda')) {
        chandaTotal += amt;
      }
    });

    const kpiTotalEl = document.getElementById('treasury-kpi-total');
    const kpiDiaEl = document.getElementById('treasury-kpi-dialysis');
    const kpiDiaSub = document.getElementById('treasury-kpi-dialysis-sub');
    const kpiRatEl = document.getElementById('treasury-kpi-ration');
    const kpiRatSub = document.getElementById('treasury-kpi-ration-sub');
    const kpiChandaEl = document.getElementById('treasury-kpi-chanda');

    if (kpiTotalEl) kpiTotalEl.textContent = `₹${totalInflow.toLocaleString('en-IN')}`;
    if (kpiDiaEl) kpiDiaEl.textContent = `₹${dialysisTotal.toLocaleString('en-IN')}`;
    if (kpiDiaSub) kpiDiaSub.textContent = `${dialysisSessions} Dialysis sessions sponsored`;
    if (kpiRatEl) kpiRatEl.textContent = `₹${rationTotal.toLocaleString('en-IN')}`;
    if (kpiRatSub) kpiRatSub.textContent = `${rationKits} Destitute family kits funded`;
    if (kpiChandaEl) kpiChandaEl.textContent = `₹${chandaTotal.toLocaleString('en-IN')}`;

    if (!tbody) return;

    // 2. Apply Category Filter
    let filtered = allList;
    if (this.currentFinanceFilter !== 'all') {
      filtered = filtered.filter(p => {
        const text = ((p.purpose || '') + ' ' + (p.months || '') + ' ' + (p.category || '')).toUpperCase();
        if (this.currentFinanceFilter === 'DIALYSIS') return text.includes('DIALYSIS');
        if (this.currentFinanceFilter === 'RATION') return text.includes('RATION') || text.includes('KIT');
        if (this.currentFinanceFilter === 'CHANDA') return text.includes('SUBSCRIPTION') || text.includes('CHANDA') || text.includes('MONTH');
        if (this.currentFinanceFilter === 'WELFARE') return text.includes('ZAKAT') || text.includes('SADAQAH') || text.includes('WELFARE') || text.includes('ENDOWMENT');
        return true;
      });
    }

    // 3. Apply Search Filter
    if (this.financeSearchQuery) {
      const q = this.financeSearchQuery.toLowerCase();
      filtered = filtered.filter(p => {
        return (p.receiptNo || '').toLowerCase().includes(q) ||
          (p.paymentId || '').toLowerCase().includes(q) ||
          (p.familyHead || '').toLowerCase().includes(q) ||
          (p.familyId || '').toLowerCase().includes(q) ||
          (p.phone || '').toLowerCase().includes(q) ||
          (p.purpose || '').toLowerCase().includes(q) ||
          (p.mode || '').toLowerCase().includes(q) ||
          (p.note || '').toLowerCase().includes(q);
      });
    }

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-500">No payment transactions or sponsorships found matching the criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const purposeText = p.purpose || p.months || 'Monthly Mahall Subscription';
      const pLower = purposeText.toLowerCase();
      const isDialysis = pLower.includes('dialysis') || (p.category || '').toLowerCase().includes('dialysis');
      const isRation = pLower.includes('ration') || pLower.includes('kit') || (p.category || '').toLowerCase().includes('ration');
      const isChanda = pLower.includes('subscription') || pLower.includes('chanda');

      let categoryBadge = '';
      if (isDialysis) {
        categoryBadge = `<span class="px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800 text-[11px] font-semibold inline-flex items-center gap-1.5 shadow-sm"><i data-lucide="heart" class="w-3.5 h-3.5 text-rose-400"></i> Dialysis Sponsorship</span>`;
      } else if (isRation) {
        categoryBadge = `<span class="px-2.5 py-1 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800 text-[11px] font-semibold inline-flex items-center gap-1.5 shadow-sm"><i data-lucide="shopping-bag" class="w-3.5 h-3.5 text-amber-400"></i> Ration Kit Donation</span>`;
      } else if (isChanda) {
        categoryBadge = `<span class="px-2.5 py-1 rounded-lg bg-sky-950/80 text-sky-300 border border-sky-800 text-[11px] font-semibold inline-flex items-center gap-1.5 shadow-sm"><i data-lucide="wallet" class="w-3.5 h-3.5 text-sky-400"></i> Monthly Chanda Dues</span>`;
      } else {
        categoryBadge = `<span class="px-2.5 py-1 rounded-lg bg-teal-950/80 text-teal-300 border border-teal-800 text-[11px] font-semibold inline-flex items-center gap-1.5 shadow-sm"><i data-lucide="gift" class="w-3.5 h-3.5 text-teal-400"></i> Welfare Endowment</span>`;
      }

      return `
        <tr class="hover:bg-slate-950/40 transition">
          <td class="p-4 align-top whitespace-nowrap">
            <span class="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800/60 block w-max">${p.receiptNo || p.paymentId}</span>
            <span class="text-[10px] text-slate-500 font-mono mt-1 block">${p.paymentId || 'TXN-CONFIRMED'}</span>
          </td>
          <td class="p-4 align-top">
            <p class="font-bold text-white text-sm">${p.familyHead || 'Community Philanthropist'}</p>
            <p class="text-[11px] text-slate-400 font-mono">${p.familyId || 'COMMUNITY-DONOR'} ${p.phone ? `• <a href="tel:${p.phone}" class="text-emerald-400 hover:underline">${p.phone}</a>` : ''}</p>
            ${p.ward ? `<span class="text-[10px] text-slate-500 block">${p.ward}</span>` : ''}
          </td>
          <td class="p-4 align-top max-w-sm">
            ${categoryBadge}
            <p class="text-xs text-slate-200 font-medium mt-1">${purposeText}</p>
            ${p.note ? `<p class="text-[11px] text-slate-400 italic bg-slate-950/60 p-1.5 rounded border border-slate-800/80 mt-1">"${p.note}"</p>` : ''}
          </td>
          <td class="p-4 align-top whitespace-nowrap">
            <span class="text-base font-bold text-emerald-400 font-mono">₹${Number(p.amount || 0).toLocaleString('en-IN')}</span>
            <span class="text-[10px] text-emerald-500 font-semibold block flex items-center gap-1"><i data-lucide="check-circle" class="w-3 h-3"></i> Verified</span>
          </td>
          <td class="p-4 align-top whitespace-nowrap">
            <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-xs font-mono font-medium">${p.mode || 'UPI'}</span>
            <span class="text-[10px] text-slate-500 block mt-0.5">${p.collector || 'Digital Treasury'}</span>
          </td>
          <td class="p-4 align-top text-xs text-slate-400 whitespace-nowrap">
            ${p.timestamp || 'Today'}
          </td>
          <td class="p-4 align-top text-right whitespace-nowrap space-x-1.5">
            <button onclick="AdminApp.printReceipt('${p.receiptNo || p.paymentId}')" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition">
              <i data-lucide="printer" class="w-3.5 h-3.5 text-emerald-400"></i>
              <span>Receipt</span>
            </button>
            <button onclick="AdminApp.deletePaymentEntry('${p.receiptNo || p.paymentId}')" class="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 rounded-lg transition inline-flex items-center" title="Delete payment transaction">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  filterFinance: function (filterName, elem) {
    this.currentFinanceFilter = filterName;
    document.querySelectorAll('.finance-filter-btn').forEach(btn => {
      btn.classList.remove('bg-emerald-900', 'text-emerald-200', 'border-emerald-700');
      btn.classList.add('bg-slate-800', 'text-slate-300');
    });
    const target = elem || (typeof event !== 'undefined' && event ? (event.currentTarget || event.target) : null);
    if (target && target.classList) {
      target.classList.remove('bg-slate-800', 'text-slate-300');
      target.classList.add('bg-emerald-900', 'text-emerald-200', 'border', 'border-emerald-700');
    }
    this.renderFinance();
  },

  handleFinanceSearch: function () {
    const input = document.getElementById('finance-search-input');
    this.financeSearchQuery = (input ? input.value : '').trim();
    this.renderFinance();
  },

  deletePaymentEntry: function (receiptNum) {
    if (confirm(`Are you sure you want to delete payment transaction ${receiptNum} from the Treasury ledger?`)) {
      MahallDB.deletePayment(receiptNum);
      this.showToast(`Transaction ${receiptNum} removed from Treasury ledger.`, 'info');
      this.renderFinance();
    }
  },

  openRecordPaymentModal: function () {
    const families = MahallDB.getFamilies ? MahallDB.getFamilies() : [];

    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="receipt" class="w-5 h-5 text-emerald-400"></i>
            <span>Record Monthly Chanda / Subscription Payment</span>
          </h3>
          <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="AdminApp.handleRecordPayment(event)" class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">Select Registered Family *</label>
            <select id="modal-pay-fam" required onchange="AdminApp.updatePaymentPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
              ${families.map(f => `<option value="${f.familyId}">${f.familyId} - ${f.head} (${f.houseName})</option>`).join('')}
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Months Covered</label>
              <select id="modal-pay-months" onchange="AdminApp.calcPayAmount(); AdminApp.updatePaymentPreview();" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="1">1 Month (₹250)</option>
                <option value="2">2 Months (₹500)</option>
                <option value="3">3 Months (Quarterly - ₹750)</option>
                <option value="6">6 Months (Half-Yearly - ₹1,500)</option>
                <option value="12">12 Months (Annual - ₹3,000)</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Total Amount (₹)</label>
              <input type="text" id="modal-pay-amount" readonly value="250"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-emerald-400 font-mono font-bold text-sm" />
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Payment Mode</label>
            <select id="modal-pay-mode" onchange="AdminApp.updatePaymentPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
              <option value="UPI (Google Pay / PhonePe)">UPI (Google Pay / PhonePe)</option>
              <option value="Office Cash Counter">Office Cash Counter</option>
              <option value="Bank Direct NEFT / RTGS">Bank Direct NEFT / RTGS</option>
            </select>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Internal Reference / Notes</label>
            <input type="text" id="modal-pay-notes" placeholder="e.g. Cleared pending dues for 2026 Q3" oninput="AdminApp.updatePaymentPreview()"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
          </div>

          <!-- Live Visual Preview of Official Receipt Voucher -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <i data-lucide="eye" class="w-3.5 h-3.5 text-emerald-400"></i>
              <span>LIVE PREVIEW AS SEEN ON PUBLIC PORTAL:</span>
            </span>
            <div class="rounded-2xl p-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl space-y-2 relative">
              <div class="flex items-center justify-between border-b border-emerald-800/40 pb-2">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-md bg-emerald-800 text-white flex items-center justify-center text-xs font-bold font-heading">NH</div>
                  <div>
                    <span class="text-[9px] font-mono uppercase tracking-wider text-emerald-300 block">NOORUL HUDA MAHALL JAMA'ATH</span>
                    <h5 class="text-xs font-bold text-white uppercase">Official Contribution Receipt Voucher</h5>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono text-[9px] font-bold">DIGITAL RECEIPT</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span class="text-[10px] text-slate-400 block">Family Account:</span>
                  <strong id="preview-pay-fam" class="text-white text-xs font-semibold">${families[0] ? `${families[0].familyId} - ${families[0].head}` : 'Select Registered Family'}</strong>
                  <span id="preview-pay-mode" class="text-[10px] text-emerald-400 block">UPI (Google Pay / PhonePe)</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 block">Amount Received:</span>
                  <strong id="preview-pay-amount" class="text-emerald-400 font-mono text-base font-bold block">₹250</strong>
                  <span id="preview-pay-months" class="text-[9px] font-mono text-slate-400">1 Month Subscription</span>
                </div>
              </div>
              <div class="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span id="preview-pay-notes" class="truncate max-w-[260px]">Cleared pending dues</span>
                <span class="text-emerald-400 font-bold flex items-center gap-1 shrink-0"><i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Authenticated</span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/40">
              Record & Generate Receipt
            </button>
          </div>
        </form>
      </div>
    `;
    this.openModal(html);
  },

  updatePaymentPreview: function () {
    const famSelect = document.getElementById('modal-pay-fam');
    const famText = famSelect ? famSelect.options[famSelect.selectedIndex]?.text || 'Registered Family' : 'Registered Family';
    const monthsSelect = document.getElementById('modal-pay-months');
    const monthsText = monthsSelect ? monthsSelect.options[monthsSelect.selectedIndex]?.text || '1 Month' : '1 Month';
    const amount = document.getElementById('modal-pay-amount')?.value || '250';
    const mode = document.getElementById('modal-pay-mode')?.value || 'UPI';
    const notes = document.getElementById('modal-pay-notes')?.value || 'Cleared pending dues';

    const pFam = document.getElementById('preview-pay-fam');
    const pMonths = document.getElementById('preview-pay-months');
    const pAmount = document.getElementById('preview-pay-amount');
    const pMode = document.getElementById('preview-pay-mode');
    const pNotes = document.getElementById('preview-pay-notes');

    if (pFam) pFam.textContent = famText;
    if (pMonths) pMonths.textContent = monthsText;
    if (pAmount) pAmount.textContent = `₹${Number(amount).toLocaleString()}`;
    if (pMode) pMode.textContent = mode;
    if (pNotes) pNotes.textContent = notes || 'Cleared pending dues';
    if (window.lucide) lucide.createIcons();
  },

  calcPayAmount: function () {
    const months = parseInt(document.getElementById('modal-pay-months').value, 10) || 1;
    const amountInput = document.getElementById('modal-pay-amount');
    if (amountInput) amountInput.value = months * 250;
  },

  handleRecordPayment: function (e) {
    e.preventDefault();
    const famId = document.getElementById('modal-pay-fam').value;
    const monthsCount = parseInt(document.getElementById('modal-pay-months').value, 10) || 1;
    const mode = document.getElementById('modal-pay-mode').value;
    const notes = document.getElementById('modal-pay-notes').value.trim();

    const payment = MahallDB.recordPayment({
      familyId: famId,
      monthsCount: monthsCount,
      mode: mode,
      note: notes
    });

    this.showToast(`Recorded payment of ₹${payment.amount} for ${famId}. Receipt: ${payment.receiptNo}`, 'success');
    this.closeModal();
    this.renderFinance();
    this.renderCensus();
    this.printReceipt(payment.receiptNo);
  },

  printReceipt: function (receiptNum) {
    const payments = MahallDB.getPayments ? MahallDB.getPayments() : [];
    const p = payments.find(pay => (pay.receiptNo === receiptNum) || (pay.paymentId === receiptNum));
    if (!p) return;

    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 no-print">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="receipt" class="w-5 h-5 text-emerald-400"></i>
            <span>Official Treasury Receipt</span>
          </h3>
          <div class="flex items-center gap-2">
            <button onclick="window.print()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition">
              <i data-lucide="printer" class="w-3.5 h-3.5"></i>
              <span>Print Receipt</span>
            </button>
            <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
        </div>

        <div id="print-modal-content" class="bg-white text-slate-900 p-6 rounded-xl border border-slate-300 shadow-xl max-w-lg mx-auto">
          <div class="text-center border-b pb-3 mb-3">
            <p class="font-arabic text-sm text-emerald-950">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ</p>
            <h4 class="font-heading font-bold text-base text-emerald-950 uppercase tracking-wide">NOORUL HUDA MAHALL JAMA'ATH</h4>
            <p class="text-[10px] text-slate-600">Baitulmal & Treasury Desk • Calicut, Kerala</p>
            <p class="text-xs font-bold text-emerald-900 mt-1 uppercase">OFFICIAL PAYMENT RECEIPT</p>
          </div>

          <div class="grid grid-cols-2 text-xs py-2 border-b border-slate-200">
            <div>Receipt No: <strong class="font-mono text-emerald-950">${p.receiptNo || p.paymentId}</strong></div>
            <div class="text-right">Date: <strong>${p.timestamp}</strong></div>
          </div>

          <div class="py-3 text-xs space-y-2 border-b border-slate-200">
            <div class="flex justify-between">
              <span class="text-slate-600">Received From:</span>
              <strong class="text-slate-900">${p.familyHead} (${p.familyId})</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Contribution / Purpose:</span>
              <strong class="text-slate-900">${p.purpose || p.months || 'Community Contribution'}</strong>
            </div>
            ${p.note ? `
            <div class="flex justify-between">
              <span class="text-slate-600">Dedication / Notes:</span>
              <span class="italic text-slate-800">${p.note}</span>
            </div>` : ''}
            <div class="flex justify-between">
              <span class="text-slate-600">Payment Channel:</span>
              <span class="font-mono text-slate-800 font-bold">${p.mode || 'UPI (Instant)'}</span>
            </div>
          </div>

          <div class="py-3 flex justify-between items-center bg-slate-50 px-3 rounded-lg my-3 border border-slate-200">
            <span class="font-bold text-slate-800 text-xs">Total Amount Paid:</span>
            <span class="text-xl font-bold font-mono text-emerald-900">₹${p.amount}.00</span>
          </div>

          <div class="pt-4 flex justify-between items-end text-[10px] text-slate-500">
            <div>
              <p>Collector: ${p.collector || 'Treasury Desk'}</p>
              <p class="italic">Jazakallahu Khairan for your contribution.</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-8 border-b border-slate-400 mb-1"></div>
              <span>Authorized Signature</span>
            </div>
          </div>
        </div>
      </div>
    `;
    this.openModal(html);
  },

  // =========================================================================
  // 13. SULHU MEDIATION DESK
  // =========================================================================
  renderSulhu: function () {
    const list = MahallDB.getSulhuPetitions ? MahallDB.getSulhuPetitions() : [];
    const tbody = document.getElementById('sulhu-table-body');
    if (!tbody) return;

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-slate-500">No active mediation disputes logged.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(s => `
      <tr class="hover:bg-slate-950/40 transition">
        <td class="p-4 align-top whitespace-nowrap">
          <span class="font-mono font-bold text-purple-400 bg-purple-950/80 px-2 py-1 rounded border border-purple-800/60">${s.petitionId}</span>
        </td>
        <td class="p-4 align-top">
          <p class="font-bold text-white text-sm">${s.petitionerName}</p>
          <p class="text-[11px] text-slate-400 font-mono">${s.familyId} • ${s.phone || '-'}</p>
        </td>
        <td class="p-4 align-top max-w-xs">
          <p class="font-semibold text-slate-200 text-xs">${s.category || 'General Guidance'}</p>
          <p class="text-[11px] text-slate-400 line-clamp-2 mt-0.5">${s.description || ''}</p>
        </td>
        <td class="p-4 align-top text-xs text-slate-300">
          ${s.assignedMediator || 'Chief Qazi Chamber'}
        </td>
        <td class="p-4 align-top text-xs font-mono text-slate-400 whitespace-nowrap">
          ${s.meetingDate || 'Pending'}
        </td>
        <td class="p-4 align-top whitespace-nowrap">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${s.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-purple-950 text-purple-300 border border-purple-800'}">
            ${s.status}
          </span>
        </td>
        <td class="p-4 align-top text-right whitespace-nowrap">
          <button onclick="AdminApp.editSulhuStatus('${s.petitionId}')" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition">
            Update Case
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  openNewSulhuModal: function () {
    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="scale" class="w-5 h-5 text-purple-400"></i>
            <span>Log Confidential Sulhu Mediation Case</span>
          </h3>
          <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="AdminApp.handleSaveSulhu(event)" class="space-y-3 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Family ID *</label>
              <input type="text" id="modal-sulhu-famid" required placeholder="e.g. W02-F005" oninput="AdminApp.updateSulhuPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Petitioner Name *</label>
              <input type="text" id="modal-sulhu-name" required placeholder="Legal full name" oninput="AdminApp.updateSulhuPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Contact Mobile</label>
              <input type="text" id="modal-sulhu-phone" placeholder="+91 " oninput="AdminApp.updateSulhuPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Dispute / Consultation Category</label>
              <select id="modal-sulhu-cat" onchange="AdminApp.updateSulhuPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="Family Guidance & Reconciliation">Family Guidance & Reconciliation</option>
                <option value="Boundary & Neighborhood Consultation">Boundary & Neighborhood Consultation</option>
                <option value="Commercial & Financial Settlement">Commercial & Financial Settlement</option>
                <option value="Inheritance & Estate Consultation">Inheritance & Estate Consultation</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Confidential Case Summary *</label>
            <textarea id="modal-sulhu-desc" required rows="3" oninput="AdminApp.updateSulhuPreview()" placeholder="Brief outline of the dispute and requests for guidance..."
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"></textarea>
          </div>

          <!-- Live Visual Preview of Sulhu Mediation Docket -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Live Sulhu Mediation Case Docket Preview:</span>
            <div class="rounded-2xl p-4 bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-950 border border-purple-500/40 shadow-xl space-y-2 relative">
              <div class="flex items-center justify-between border-b border-purple-800/40 pb-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-700/60">
                    CASE #SLH-LIVE
                  </span>
                  <span id="preview-sulhu-cat" class="text-[10px] font-semibold text-slate-300">
                    Family Guidance & Reconciliation
                  </span>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/50 text-purple-300 font-mono text-[9px] font-bold">CONFIDENTIAL DOCKET</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span class="text-[10px] text-slate-400 block">Petitioner:</span>
                  <strong id="preview-sulhu-name" class="text-white text-xs font-semibold">Legal full name</strong>
                  <span id="preview-sulhu-phone" class="text-[10px] font-mono text-purple-300 block">+91 94470 12345</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 block">Mahall Family ID:</span>
                  <strong id="preview-sulhu-famid" class="text-purple-300 font-mono text-xs font-bold block">W02-F005</strong>
                  <span class="text-[9px] text-slate-400">Judicial Panel Assigned</span>
                </div>
              </div>
              <div class="pt-1.5 border-t border-slate-800/80">
                <p id="preview-sulhu-desc" class="text-[11px] text-slate-300 line-clamp-2 italic">Brief outline of the dispute and requests for guidance...</p>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold">Register Case</button>
          </div>
        </form>
      </div>
    `;
    this.openModal(html);
  },

  updateSulhuPreview: function () {
    const famId = document.getElementById('modal-sulhu-famid')?.value || 'W02-F005';
    const name = document.getElementById('modal-sulhu-name')?.value || 'Legal full name';
    const phone = document.getElementById('modal-sulhu-phone')?.value || '+91 94470 12345';
    const catSelect = document.getElementById('modal-sulhu-cat');
    const cat = catSelect ? catSelect.value : 'Family Guidance & Reconciliation';
    const desc = document.getElementById('modal-sulhu-desc')?.value || 'Brief outline of the dispute and requests for guidance...';

    const pFamId = document.getElementById('preview-sulhu-famid');
    const pName = document.getElementById('preview-sulhu-name');
    const pPhone = document.getElementById('preview-sulhu-phone');
    const pCat = document.getElementById('preview-sulhu-cat');
    const pDesc = document.getElementById('preview-sulhu-desc');

    if (pFamId) pFamId.textContent = famId.toUpperCase();
    if (pName) pName.textContent = name;
    if (pPhone) pPhone.textContent = phone;
    if (pCat) pCat.textContent = cat;
    if (pDesc) pDesc.textContent = desc;
    if (window.lucide) lucide.createIcons();
  },

  handleSaveSulhu: function (e) {
    e.preventDefault();
    const famId = document.getElementById('modal-sulhu-famid').value.trim();
    const name = document.getElementById('modal-sulhu-name').value.trim();
    const phone = document.getElementById('modal-sulhu-phone').value.trim();
    const cat = document.getElementById('modal-sulhu-cat').value;
    const desc = document.getElementById('modal-sulhu-desc').value.trim();

    const petition = MahallDB.createSulhuPetition({
      familyId: famId,
      petitionerName: name,
      phone: phone,
      category: cat,
      description: desc
    });

    this.showToast(`Mediation case ${petition.petitionId} logged in confidential registry.`, 'success');
    this.closeModal();
    this.renderSulhu();
  },

  editSulhuStatus: function (petitionId) {
    const p = MahallDB.getSulhuPetitionById ? MahallDB.getSulhuPetitionById(petitionId) : (MahallDB.getSulhuPetitions() || []).find(x => x.petitionId === petitionId);
    if (!p) return;

    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="scale" class="w-5 h-5 text-purple-400"></i>
            <span>Update Mediation Case ${p.petitionId}</span>
          </h3>
          <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="AdminApp.handleUpdateSulhu(event, '${p.petitionId}')" class="space-y-3 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Status</label>
              <select id="modal-sulhu-status" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="SUBMITTED" ${p.status === 'SUBMITTED' ? 'selected' : ''}>Submitted (Pending Assign)</option>
                <option value="IN_HEARING" ${p.status === 'IN_HEARING' ? 'selected' : ''}>In Hearing Chamber</option>
                <option value="RESOLVED" ${p.status === 'RESOLVED' ? 'selected' : ''}>Resolved (Amicably Settled)</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Next Hearing Date</label>
              <input type="text" id="modal-sulhu-date" value="${p.meetingDate || '25-Sep-2026'}"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono" />
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Resolution Minutes & Consent Notes</label>
            <textarea id="modal-sulhu-notes" rows="3" placeholder="Enter findings, agreed conditions, and witness signatures..."
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">${p.resolutionNotes || ''}</textarea>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold">Save Case Notes</button>
          </div>
        </form>
      </div>
    `;
    this.openModal(html);
  },

  handleUpdateSulhu: function (e, petitionId) {
    e.preventDefault();
    const status = document.getElementById('modal-sulhu-status').value;
    const date = document.getElementById('modal-sulhu-date').value.trim();
    const notes = document.getElementById('modal-sulhu-notes').value.trim();

    MahallDB.updateSulhuStatus(petitionId, status, notes, date);
    this.showToast(`Case ${petitionId} status updated.`, 'success');
    this.closeModal();
    this.renderSulhu();
  },

  // =========================================================================
  // 14. COMMUNITY SERVICES (DONORS & AUDITORIUM)
  // =========================================================================
  renderCommunity: function () {
    // 1. Donors
    const donors = MahallDB.getBloodDonors ? MahallDB.getBloodDonors() : [];
    const donorsContainer = document.getElementById('donors-list-container');
    if (donorsContainer) {
      if (!donors.length) {
        donorsContainer.innerHTML = `<p class="text-xs text-slate-500 py-4 text-center">No blood donors registered.</p>`;
      } else {
        donorsContainer.innerHTML = donors.map(d => `
          <div class="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div class="flex items-center gap-3">
              <span class="w-9 h-9 rounded-full bg-rose-950 border border-rose-800 text-rose-300 font-bold flex items-center justify-center font-mono">
                ${d.group}
              </span>
              <div>
                <p class="font-bold text-white">${d.name}</p>
                <p class="text-[11px] text-slate-400 font-mono">${d.phone} • ${d.ward || 'Ward 02'}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[11px] text-emerald-400 font-semibold">${d.status || 'Available'}</span>
              <button onclick="AdminApp.deleteDonor('${d.phone}')" class="p-1 text-slate-500 hover:text-rose-400">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
        `).join('');
      }
    }

    // 2. Bookings
    const bookings = MahallDB.getBookings ? MahallDB.getBookings() : [];
    const bookingsContainer = document.getElementById('bookings-list-container');
    if (bookingsContainer) {
      if (!bookings.length) {
        bookingsContainer.innerHTML = `<p class="text-xs text-slate-500 py-4 text-center">No auditorium reservations.</p>`;
      } else {
        bookingsContainer.innerHTML = bookings.map(b => {
          const isPending = b.status === 'PENDING';
          const statusClass = b.status === 'CONFIRMED'
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
            : (b.status === 'REJECTED' ? 'bg-rose-950/80 text-rose-300 border-rose-700/60' : 'bg-amber-950/80 text-amber-300 border-amber-700/60');
          return `
          <div class="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col gap-2.5 text-xs hover:border-slate-700 transition">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <div class="flex items-center flex-wrap gap-2 mb-1">
                  <span class="font-bold text-white text-sm truncate">${b.event}</span>
                  <span class="px-2 py-0.5 rounded ${statusClass} border text-[10px] font-mono font-bold uppercase tracking-wider">${b.status}</span>
                </div>
                <p class="text-[11px] text-slate-300 truncate">
                  By: <strong class="text-white">${b.bookedBy}</strong> ${b.phone ? `<span class="text-slate-400 font-mono">(${b.phone})</span>` : ''}
                </p>
                <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400 mt-0.5">
                  <span>📅 <strong class="text-slate-200">${b.date}</strong></span>
                  <span>•</span>
                  <span>⏰ ${b.slot}</span>
                  ${b.guests ? `<span>•</span><span>👥 Est. ${b.guests} Guests</span>` : ''}
                </div>
              </div>
              ${b.tariff ? `
                <div class="text-right shrink-0">
                  <span class="inline-block px-2 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-[11px] text-emerald-300 font-mono font-bold">${b.tariff}</span>
                </div>
              ` : ''}
            </div>

            <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div class="flex items-center flex-wrap gap-1.5">
                ${isPending ? `
                  <button onclick="AdminApp.approveBooking('${b.id}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition shadow-sm" title="Approve Booking & Send Message to Main Portal">
                    <i data-lucide="check" class="w-3.5 h-3.5"></i> <span>Approve</span>
                  </button>
                  <button onclick="AdminApp.rejectBooking('${b.id}')" class="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition shadow-sm" title="Reject Booking & Send Message to Main Portal">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i> <span>Reject</span>
                  </button>
                ` : `
                  <button onclick="AdminApp.approveBooking('${b.id}')" class="px-2.5 py-1 bg-slate-900 hover:bg-emerald-950 border border-slate-700 hover:border-emerald-700 text-slate-300 hover:text-emerald-300 rounded-lg text-[11px] font-medium flex items-center gap-1 transition" title="Re-approve / Resend message to main portal">
                    <i data-lucide="send" class="w-3 h-3 text-sky-400"></i> <span>${b.status === 'CONFIRMED' ? 'Resend Confirmed Msg' : 'Approve & Notify'}</span>
                  </button>
                  ${b.status !== 'REJECTED' ? `
                  <button onclick="AdminApp.rejectBooking('${b.id}')" class="px-2.5 py-1 bg-slate-900 hover:bg-rose-950 border border-slate-700 hover:border-rose-700 text-slate-400 hover:text-rose-300 rounded-lg text-[11px] font-medium flex items-center gap-1 transition" title="Reject & notify portal">
                    <i data-lucide="x" class="w-3 h-3 text-rose-400"></i> <span>Reject</span>
                  </button>` : ''}
                `}
              </div>

              <button onclick="AdminApp.deleteBooking('${b.id}')" class="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition" title="Delete record">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        `}).join('');
      }
    }

    // 3. Volunteer Corp Approval Requests
    const volRequests = MahallDB.getVolunteerRequests ? MahallDB.getVolunteerRequests() : [];
    const volContainer = document.getElementById('volunteer-requests-container');
    const volBadge = document.getElementById('volunteer-pending-badge');
    const pendingCount = volRequests.filter(r => r.status === 'PENDING').length;
    if (volBadge) {
      volBadge.innerText = `${pendingCount} Pending`;
      if (pendingCount > 0) {
        volBadge.className = 'px-2.5 py-1 rounded-full bg-amber-950 border border-amber-700 text-amber-300 text-xs font-bold font-mono animate-pulse';
      } else {
        volBadge.className = 'px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold font-mono';
      }
    }

    if (volContainer) {
      if (!volRequests.length) {
        volContainer.innerHTML = `<p class="text-xs text-slate-500 py-6 text-center">No volunteer recruitment applications received.</p>`;
      } else {
        volContainer.innerHTML = volRequests.map(r => {
          const isPending = r.status === 'PENDING';
          const statusClass = r.status === 'APPROVED'
            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
            : (r.status === 'REJECTED' ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-amber-950 text-amber-300 border-amber-800');
          return `
          <div class="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div class="space-y-1.5">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-bold text-white text-sm">${r.name}</span>
                <span class="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold">${r.squad}</span>
                <span class="px-2 py-0.5 rounded ${statusClass} border text-[10px] font-mono font-bold">${r.status}</span>
                ${r.bloodGroup ? `<span class="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-900 text-[10px] font-mono font-bold">🩸 ${r.bloodGroup}</span>` : ''}
              </div>
              <p class="text-[11px] text-slate-400">
                Phone: <a href="tel:${r.phone}" class="text-emerald-400 font-mono font-bold hover:underline">${r.phone}</a> • 
                Ward: <strong class="text-slate-300">${r.ward || 'Ward 02'}</strong> • 
                Applied: <span class="text-slate-400">${r.timestamp || 'Recently'}</span>
              </p>
              ${r.skills ? `<p class="text-[11px] text-slate-300 bg-slate-900/90 p-2 rounded-lg border border-slate-800"><strong class="text-amber-400">Skills / Experience:</strong> ${r.skills} ${r.availability ? `• <span class="text-teal-400">Availability: ${r.availability}</span>` : ''}</p>` : ''}
            </div>
            <div class="flex items-center gap-2 shrink-0 self-end md:self-center">
              ${isPending ? `
                <button onclick="AdminApp.approveVolunteerRequest('${r.id}')" class="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm hover:scale-[1.02]" title="Approve & Send Message to Main Portal">
                  <i data-lucide="check" class="w-3.5 h-3.5"></i> <span>Approve</span>
                </button>
                <button onclick="AdminApp.rejectVolunteerRequest('${r.id}')" class="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm hover:scale-[1.02]" title="Reject & Send Message to Main Portal">
                  <i data-lucide="x" class="w-3.5 h-3.5"></i> <span>Reject</span>
                </button>
              ` : `
                <button onclick="AdminApp.approveVolunteerRequest('${r.id}')" class="px-2.5 py-1 bg-slate-900 hover:bg-emerald-950 border border-slate-700 hover:border-emerald-700 text-slate-300 hover:text-emerald-300 rounded-xl text-[10px] font-medium flex items-center gap-1 transition" title="Re-approve / Resend message to portal">
                  <i data-lucide="send" class="w-3 h-3"></i> <span>${r.status === 'APPROVED' ? 'Resend Approved Msg' : 'Approve & Notify'}</span>
                </button>
                ${r.status !== 'REJECTED' ? `
                <button onclick="AdminApp.rejectVolunteerRequest('${r.id}')" class="px-2.5 py-1 bg-slate-900 hover:bg-rose-950 border border-slate-700 hover:border-rose-700 text-slate-400 hover:text-rose-300 rounded-xl text-[10px] font-medium flex items-center gap-1 transition" title="Reject & notify portal">
                  <i data-lucide="x" class="w-3 h-3"></i> <span>Reject</span>
                </button>` : ''}
              `}
              <button onclick="AdminApp.deleteVolunteerRequest('${r.id}')" class="p-2 text-slate-500 hover:text-rose-400 transition" title="Delete Record">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        `}).join('');
      }
    }

    // 4. Blood Donor Registration Requests
    const donorRequests = MahallDB.getDonorRequests ? MahallDB.getDonorRequests() : [];
    const donorReqContainer = document.getElementById('donor-requests-container');
    const donorReqBadge = document.getElementById('donor-requests-pending-badge');
    const pendingDonors = donorRequests.filter(d => d.status === 'PENDING').length;
    if (donorReqBadge) {
      donorReqBadge.innerText = `${pendingDonors} Pending`;
      donorReqBadge.className = pendingDonors > 0
        ? 'px-2.5 py-1 rounded-full bg-rose-950 border border-rose-700 text-rose-300 text-xs font-bold font-mono animate-pulse'
        : 'px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold font-mono';
    }
    if (donorReqContainer) {
      if (!donorRequests.length) {
        donorReqContainer.innerHTML = `<p class="text-xs text-slate-500 py-6 text-center">No blood donor registration requests pending.</p>`;
      } else {
        donorReqContainer.innerHTML = donorRequests.map(d => {
          const isPending = d.status === 'PENDING';
          const statusClass = d.status === 'APPROVED'
            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
            : (d.status === 'REJECTED' ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-amber-950 text-amber-300 border-amber-800');
          return `
            <div class="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div class="space-y-1.5">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="w-8 h-8 rounded-full bg-rose-950 border border-rose-800 text-rose-300 font-bold flex items-center justify-center font-mono">
                    ${d.group}
                  </span>
                  <span class="font-bold text-white text-sm">${d.name}</span>
                  <span class="px-2 py-0.5 rounded ${statusClass} border text-[10px] font-mono font-bold">${d.status}</span>
                  <span class="text-[11px] text-slate-400 font-mono">${d.ward || 'Ward 02'} • Age: ${d.age || 25}</span>
                </div>
                <p class="text-[11px] text-slate-400">
                  Phone: <a href="tel:${d.phone}" class="text-rose-400 font-mono font-bold hover:underline">${d.phone}</a> • 
                  Last Donated: <strong class="text-slate-300">${d.lastDonation || 'Ready to donate'}</strong> • 
                  Submitted: <span class="text-slate-400">${d.timestamp || 'Recently'}</span>
                </p>
              </div>
              <div class="flex items-center gap-2 shrink-0 self-end md:self-center">
                ${isPending ? `
                  <button onclick="AdminApp.approveDonorRequest('${d.id}')" class="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm hover:scale-[1.02]" title="Approve Donor & Add to Verified Directory">
                    <i data-lucide="check" class="w-3.5 h-3.5"></i> <span>Approve & Verify</span>
                  </button>
                  <button onclick="AdminApp.rejectDonorRequest('${d.id}')" class="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm hover:scale-[1.02]" title="Decline Donor Application">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i> <span>Reject</span>
                  </button>
                ` : `
                  <button onclick="AdminApp.approveDonorRequest('${d.id}')" class="px-2.5 py-1 bg-slate-900 hover:bg-emerald-950 border border-slate-700 hover:border-emerald-700 text-slate-300 hover:text-emerald-300 rounded-xl text-[10px] font-medium flex items-center gap-1 transition" title="Re-approve & notify portal">
                    <i data-lucide="send" class="w-3 h-3"></i> <span>${d.status === 'APPROVED' ? 'Resend Approved Msg' : 'Approve & Notify'}</span>
                  </button>
                  ${d.status !== 'REJECTED' ? `
                  <button onclick="AdminApp.rejectDonorRequest('${d.id}')" class="px-2.5 py-1 bg-slate-900 hover:bg-rose-950 border border-slate-700 hover:border-rose-700 text-slate-400 hover:text-rose-300 rounded-xl text-[10px] font-medium flex items-center gap-1 transition">
                    <i data-lucide="x" class="w-3 h-3"></i> <span>Reject</span>
                  </button>` : ''}
                `}
                <button onclick="AdminApp.deleteDonorRequest('${d.id}')" class="p-2 text-slate-500 hover:text-rose-400 transition" title="Delete Record">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 5. Job Applications
    const jobApps = MahallDB.getJobApplications ? MahallDB.getJobApplications() : [];
    const jobContainer = document.getElementById('job-apps-container');
    const jobBadge = document.getElementById('job-apps-pending-badge');
    const pendingJobs = jobApps.filter(j => j.status === 'PENDING').length;
    if (jobBadge) {
      jobBadge.innerText = `${pendingJobs} Pending`;
      jobBadge.className = pendingJobs > 0
        ? 'px-2.5 py-1 rounded-full bg-amber-950 border border-amber-700 text-amber-300 text-xs font-bold font-mono animate-pulse'
        : 'px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold font-mono';
    }
    if (jobContainer) {
      if (!jobApps.length) {
        jobContainer.innerHTML = `<p class="text-xs text-slate-500 py-6 text-center">No job applications submitted.</p>`;
      } else {
        jobContainer.innerHTML = jobApps.map(j => {
          const isPending = j.status === 'PENDING';
          const statusClass = j.status === 'APPROVED'
            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
            : (j.status === 'REJECTED' ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-amber-950 text-amber-300 border-amber-800');
          return `
            <div class="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div class="space-y-1.5">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-bold text-white text-sm">${j.name}</span>
                  <span class="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-semibold">${j.jobTitle}</span>
                  <span class="px-2 py-0.5 rounded ${statusClass} border text-[10px] font-mono font-bold">${j.status}</span>
                  <span class="text-[11px] text-slate-400 font-mono">${j.ward || 'Ward 02'}</span>
                </div>
                <p class="text-[11px] text-slate-400">
                  Phone: <a href="tel:${j.phone}" class="text-amber-400 font-mono font-bold hover:underline">${j.phone}</a> • 
                  Qualification: <strong class="text-slate-300">${j.qualification || 'Graduate'}</strong> • 
                  Experience: <strong class="text-slate-300">${j.experience || 'Entry Level'}</strong> • 
                  Submitted: <span class="text-slate-400">${j.timestamp || 'Recently'}</span>
                </p>
                ${j.coverNotes ? `<p class="text-[11px] text-slate-300 bg-slate-900/90 p-2 rounded-lg border border-slate-800"><strong class="text-amber-400">Candidate Notes:</strong> ${j.coverNotes}</p>` : ''}
              </div>
              <div class="flex items-center gap-2 shrink-0 self-end md:self-center">
                ${isPending ? `
                  <button onclick="AdminApp.approveJobApp('${j.id}')" class="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm hover:scale-[1.02]" title="Approve & Send Notification to Main Portal">
                    <i data-lucide="check" class="w-3.5 h-3.5"></i> <span>Approve & Notify</span>
                  </button>
                  <button onclick="AdminApp.rejectJobApp('${j.id}')" class="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm hover:scale-[1.02]" title="Decline Candidate Application">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i> <span>Reject</span>
                  </button>
                ` : `
                  <button onclick="AdminApp.approveJobApp('${j.id}')" class="px-2.5 py-1 bg-slate-900 hover:bg-emerald-950 border border-slate-700 hover:border-emerald-700 text-slate-300 hover:text-emerald-300 rounded-xl text-[10px] font-medium flex items-center gap-1 transition" title="Resend approval alert to portal">
                    <i data-lucide="send" class="w-3 h-3"></i> <span>${j.status === 'APPROVED' ? 'Resend Approved Msg' : 'Approve & Notify'}</span>
                  </button>
                  ${j.status !== 'REJECTED' ? `
                  <button onclick="AdminApp.rejectJobApp('${j.id}')" class="px-2.5 py-1 bg-slate-900 hover:bg-rose-950 border border-slate-700 hover:border-rose-700 text-slate-400 hover:text-rose-300 rounded-xl text-[10px] font-medium flex items-center gap-1 transition">
                    <i data-lucide="x" class="w-3 h-3"></i> <span>Reject</span>
                  </button>` : ''}
                `}
                <button onclick="AdminApp.deleteJobApp('${j.id}')" class="p-2 text-slate-500 hover:text-rose-400 transition" title="Delete Record">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 6. Medical Aid & Dialysis Assistance Applications
    const medRequests = MahallDB.getMedicalAidRequests ? MahallDB.getMedicalAidRequests() : [];
    const medContainer = document.getElementById('medical-aid-container');
    const medBadge = document.getElementById('medical-aid-pending-badge');
    const pendingMed = medRequests.filter(m => m.status === 'PENDING').length;
    if (medBadge) {
      medBadge.innerText = `${pendingMed} Pending`;
      medBadge.className = pendingMed > 0
        ? 'px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-bold font-mono animate-pulse'
        : 'px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold font-mono';
    }
    if (medContainer) {
      if (!medRequests.length) {
        medContainer.innerHTML = `<p class="text-xs text-slate-500 py-6 text-center">No medical relief applications pending.</p>`;
      } else {
        medContainer.innerHTML = medRequests.map(m => {
          const isPending = m.status === 'PENDING';
          const statusClass = m.status === 'APPROVED'
            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
            : (m.status === 'REJECTED' ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-amber-950 text-amber-300 border-amber-800');
          return `
            <div class="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div class="space-y-1.5">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-bold text-white text-sm">${m.patientName}</span>
                  <span class="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold">${m.category}</span>
                  <span class="px-2 py-0.5 rounded ${statusClass} border text-[10px] font-mono font-bold">${m.status}</span>
                  <span class="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 text-[10px] font-mono font-bold">₹${Number(m.amountRequested || 0).toLocaleString('en-IN')}</span>
                </div>
                <p class="text-[11px] text-slate-400">
                  Guardian: <strong class="text-slate-300">${m.guardian || m.patientName}</strong> • 
                  Phone: <a href="tel:${m.phone}" class="text-emerald-400 font-mono font-bold hover:underline">${m.phone}</a> • 
                  Hospital: <strong class="text-slate-300">${m.hospital}</strong> • 
                  Ward: <strong class="text-slate-300">${m.ward || 'Ward 02'}</strong> • 
                  Applied: <span class="text-slate-400">${m.timestamp || 'Recently'}</span>
                </p>
                ${m.doctorNotes ? `<p class="text-[11px] text-slate-300 bg-slate-900/90 p-2 rounded-lg border border-slate-800"><strong class="text-emerald-400">Medical Condition / Rx:</strong> ${m.doctorNotes}</p>` : ''}
              </div>
              <div class="flex items-center gap-2 shrink-0 self-end md:self-center">
                ${isPending ? `
                  <button onclick="AdminApp.approveMedicalAid('${m.id}')" class="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm hover:scale-[1.02]" title="Approve Medical Aid & Send Approval Alert to Main Portal">
                    <i data-lucide="check" class="w-3.5 h-3.5"></i> <span>Approve Grant</span>
                  </button>
                  <button onclick="AdminApp.rejectMedicalAid('${m.id}')" class="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm hover:scale-[1.02]" title="Decline Medical Subsidy">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i> <span>Decline</span>
                  </button>
                ` : `
                  <button onclick="AdminApp.approveMedicalAid('${m.id}')" class="px-2.5 py-1 bg-slate-900 hover:bg-emerald-950 border border-slate-700 hover:border-emerald-700 text-slate-300 hover:text-emerald-300 rounded-xl text-[10px] font-medium flex items-center gap-1 transition" title="Resend approval alert to portal">
                    <i data-lucide="send" class="w-3 h-3"></i> <span>${m.status === 'APPROVED' ? 'Resend Approved Msg' : 'Approve & Notify'}</span>
                  </button>
                  ${m.status !== 'REJECTED' ? `
                  <button onclick="AdminApp.rejectMedicalAid('${m.id}')" class="px-2.5 py-1 bg-slate-900 hover:bg-rose-950 border border-slate-700 hover:border-rose-700 text-slate-400 hover:text-rose-300 rounded-xl text-[10px] font-medium flex items-center gap-1 transition">
                    <i data-lucide="x" class="w-3 h-3"></i> <span>Reject</span>
                  </button>` : ''}
                `}
                <button onclick="AdminApp.deleteMedicalAid('${m.id}')" class="p-2 text-slate-500 hover:text-rose-400 transition" title="Delete Record">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    if (window.lucide) window.lucide.createIcons();
  },

  openAddDonorModal: function () {
    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="droplet" class="w-5 h-5 text-rose-400"></i>
            <span>Register Voluntary Blood Donor</span>
          </h3>
          <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="AdminApp.handleSaveDonor(event)" class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">Donor Full Name *</label>
            <input type="text" id="modal-don-name" required placeholder="Legal full name" oninput="AdminApp.updateDonorPreview()"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Blood Group *</label>
              <select id="modal-don-group" onchange="AdminApp.updateDonorPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono">
                <option value="O+">O+ (Universal RBC)</option>
                <option value="A+">A+ (Positive)</option>
                <option value="B+">B+ (Positive)</option>
                <option value="AB+">AB+ (Positive)</option>
                <option value="O-">O- (Universal Donor)</option>
                <option value="A-">A- (Negative)</option>
                <option value="B-">B- (Negative)</option>
                <option value="AB-">AB- (Negative)</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Phone Number *</label>
              <input type="text" id="modal-don-phone" required placeholder="+91 " oninput="AdminApp.updateDonorPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono" />
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Ward Location</label>
            <input type="text" id="modal-don-ward" value="Ward 02 (Masjid Central)" oninput="AdminApp.updateDonorPreview()"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
          </div>

          <!-- Live Visual Preview of Blood Donor Card -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Live Emergency Blood Donor Card Preview:</span>
            <div class="rounded-2xl p-4 bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-950 border border-rose-500/40 shadow-xl space-y-2 relative">
              <div class="flex items-center justify-between border-b border-rose-800/40 pb-2">
                <div class="flex items-center gap-2">
                  <span id="preview-don-group" class="text-sm font-mono font-black text-white bg-rose-600 px-2.5 py-0.5 rounded-lg shadow-md shadow-rose-900/50">
                    O+
                  </span>
                  <div>
                    <span class="text-[9px] font-mono uppercase tracking-wider text-rose-300 block">LIFE RESCUE BLOOD BANK</span>
                    <span id="preview-don-group-desc" class="text-[10px] text-slate-300 font-medium">Universal RBC Donor</span>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono text-[9px] font-bold">READY TO DONATE</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span class="text-[10px] text-slate-400 block">Registered Donor:</span>
                  <strong id="preview-don-name" class="text-white text-xs font-semibold">Legal full name</strong>
                  <span id="preview-don-ward" class="text-[10px] text-slate-400 block">Ward 02 (Masjid Central)</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 block">Emergency Helpline:</span>
                  <strong id="preview-don-phone" class="text-rose-400 font-mono text-xs font-bold block">+91 94470 12345</strong>
                  <span class="text-[9px] text-emerald-400">24/7 Mahall Contactable</span>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold">Add Donor</button>
          </div>
        </form>
      </div>
    `;
    this.openModal(html);
  },

  updateDonorPreview: function () {
    const name = document.getElementById('modal-don-name')?.value || 'Legal full name';
    const groupSelect = document.getElementById('modal-don-group');
    const group = groupSelect ? groupSelect.value : 'O+';
    const phone = document.getElementById('modal-don-phone')?.value || '+91 94470 12345';
    const ward = document.getElementById('modal-don-ward')?.value || 'Ward 02 (Masjid Central)';

    const pName = document.getElementById('preview-don-name');
    const pGroup = document.getElementById('preview-don-group');
    const pGroupDesc = document.getElementById('preview-don-group-desc');
    const pPhone = document.getElementById('preview-don-phone');
    const pWard = document.getElementById('preview-don-ward');

    const descMap = {
      'O+': 'Universal RBC Donor',
      'A+': 'Positive Platelet & Blood',
      'B+': 'Positive Platelet & Blood',
      'AB+': 'Universal Plasma Donor',
      'O-': 'Universal Emergency Donor',
      'A-': 'Negative Blood Group',
      'B-': 'Negative Blood Group',
      'AB-': 'Rare Negative Plasma'
    };

    if (pName) pName.textContent = name;
    if (pGroup) pGroup.textContent = group;
    if (pGroupDesc) pGroupDesc.textContent = descMap[group] || 'Registered Donor';
    if (pPhone) pPhone.textContent = phone;
    if (pWard) pWard.textContent = ward;
    if (window.lucide) lucide.createIcons();
  },

  handleSaveDonor: function (e) {
    e.preventDefault();
    const name = document.getElementById('modal-don-name').value.trim();
    const group = document.getElementById('modal-don-group').value;
    const phone = document.getElementById('modal-don-phone').value.trim();
    const ward = document.getElementById('modal-don-ward').value.trim();

    MahallDB.addDonor({
      name: name,
      group: group,
      phone: phone,
      ward: ward,
      status: 'Available'
    });

    this.showToast(`Blood donor ${name} (${group}) registered!`, 'success');
    this.closeModal();
    this.renderCommunity();
    this.renderKPIs();
  },

  deleteDonor: function (phone) {
    if (confirm('Remove donor from directory?')) {
      MahallDB.deleteDonor(phone);
      this.showToast('Donor removed.', 'info');
      this.renderCommunity();
      this.renderKPIs();
    }
  },

  openAddBookingModal: function () {
    const todayStr = new Date().toISOString().split('T')[0];
    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="calendar" class="w-5 h-5 text-sky-400"></i>
            <span>Reserve Mahall Community Auditorium</span>
          </h3>
          <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="AdminApp.handleSaveBooking(event)" class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">Event / Banquet Name *</label>
            <input type="text" id="modal-bkg-event" required placeholder="e.g. Nikah Ceremony & Banquet" oninput="AdminApp.updateBookingPreview()"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Applicant Name *</label>
              <input type="text" id="modal-bkg-name" required placeholder="Applicant name" oninput="AdminApp.updateBookingPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Contact Phone</label>
              <input type="text" id="modal-bkg-phone" placeholder="+91 " oninput="AdminApp.updateBookingPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Reservation Date *</label>
              <input type="date" id="modal-bkg-date" required value="${todayStr}" oninput="AdminApp.updateBookingPreview()" onchange="AdminApp.updateBookingPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Time Slot</label>
              <select id="modal-bkg-slot" onchange="AdminApp.updateBookingPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="Full Day (09:00 AM - 08:00 PM)">Full Day (09:00 AM - 08:00 PM)</option>
                <option value="Morning Session (08:00 AM - 02:00 PM)">Morning Session (08:00 AM - 02:00 PM)</option>
                <option value="Evening Session (04:00 PM - 10:00 PM)">Evening Session (04:00 PM - 10:00 PM)</option>
              </select>
            </div>
          </div>

          <!-- Live Visual Preview of Auditorium Reservation -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Live Auditorium Reservation Ticket / Pass Preview:</span>
            <div class="rounded-2xl p-4 bg-gradient-to-r from-sky-950/80 via-slate-900 to-slate-950 border border-sky-500/40 shadow-xl space-y-2 relative">
              <div class="flex items-center justify-between border-b border-sky-800/40 pb-2">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-md bg-sky-900 text-sky-300 flex items-center justify-center text-xs font-bold"><i data-lucide="building" class="w-3.5 h-3.5"></i></div>
                  <div>
                    <span class="text-[9px] font-mono uppercase tracking-wider text-sky-300 block">COMMUNITY AUDITORIUM BANQUET DESK</span>
                    <h5 id="preview-bkg-event" class="text-xs font-bold text-white">Nikah Ceremony & Banquet</h5>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono text-[9px] font-bold">RESERVED PASS</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span class="text-[10px] text-slate-400 block">Reserved For:</span>
                  <strong id="preview-bkg-name" class="text-white text-xs font-semibold">Applicant Name</strong>
                  <span id="preview-bkg-phone" class="text-[10px] font-mono text-emerald-400 block">+91 94470 12345</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 block">Reserved Date & Slot:</span>
                  <strong id="preview-bkg-date" class="text-amber-300 text-xs font-semibold font-mono block">${todayStr}</strong>
                  <span id="preview-bkg-slot" class="text-[10px] text-slate-300 block">Full Day (09:00 AM - 08:00 PM)</span>
                </div>
              </div>
              <div class="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>Facility: 800 Seats • Centralized Stage & Dining</span>
                <span class="text-emerald-400 font-bold flex items-center gap-1"><i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Booking Confirmed</span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/40">Confirm Reservation</button>
          </div>
        </form>
      </div>
    `;
    this.openModal(html);
  },

  updateBookingPreview: function () {
    const eventName = document.getElementById('modal-bkg-event')?.value || 'Nikah Ceremony & Banquet';
    const name = document.getElementById('modal-bkg-name')?.value || 'Applicant Name';
    const phone = document.getElementById('modal-bkg-phone')?.value || '+91 94470 12345';
    const date = document.getElementById('modal-bkg-date')?.value || new Date().toISOString().split('T')[0];
    const slotSelect = document.getElementById('modal-bkg-slot');
    const slot = slotSelect ? slotSelect.value : 'Full Day (09:00 AM - 08:00 PM)';

    const pEvent = document.getElementById('preview-bkg-event');
    const pName = document.getElementById('preview-bkg-name');
    const pPhone = document.getElementById('preview-bkg-phone');
    const pDate = document.getElementById('preview-bkg-date');
    const pSlot = document.getElementById('preview-bkg-slot');

    if (pEvent) pEvent.textContent = eventName;
    if (pName) pName.textContent = name;
    if (pPhone) pPhone.textContent = phone;
    if (pDate) pDate.textContent = date;
    if (pSlot) pSlot.textContent = slot;
    if (window.lucide) lucide.createIcons();
  },

  handleSaveBooking: function (e) {
    e.preventDefault();
    const eventName = document.getElementById('modal-bkg-event').value.trim();
    const name = document.getElementById('modal-bkg-name').value.trim();
    const phone = document.getElementById('modal-bkg-phone').value.trim();
    const date = document.getElementById('modal-bkg-date').value;
    const slot = document.getElementById('modal-bkg-slot').value;

    MahallDB.createBooking({
      event: eventName,
      bookedBy: name,
      phone: phone,
      date: date,
      slot: slot
    });

    this.showToast(`Auditorium booked for ${eventName} on ${date}`, 'success');
    this.closeModal();
    this.renderCommunity();
  },

  deleteBooking: function (id) {
    if (confirm('Cancel this auditorium booking?')) {
      MahallDB.deleteBooking(id);
      this.showToast('Booking cancelled.', 'info');
      this.renderCommunity();
    }
  },

  approveBooking: function (id) {
    if (MahallDB.updateBookingStatus) {
      const res = MahallDB.updateBookingStatus(id, 'CONFIRMED');
      const eventName = res ? res.event : id;
      this.showToast(`Auditorium reservation "${eventName}" approved & message sent to main portal!`, 'success');
      this.renderCommunity();
    }
  },

  rejectBooking: function (id) {
    if (confirm(`Reject reservation request ${id}?`)) {
      if (MahallDB.updateBookingStatus) {
        const res = MahallDB.updateBookingStatus(id, 'REJECTED');
        const eventName = res ? res.event : id;
        this.showToast(`Auditorium reservation "${eventName}" rejected & update sent to main portal.`, 'info');
        this.renderCommunity();
      }
    }
  },

  approveVolunteerRequest: function (id) {
    if (MahallDB.updateVolunteerRequestStatus) {
      const res = MahallDB.updateVolunteerRequestStatus(id, 'APPROVED');
      const name = res ? res.name : id;
      this.showToast(`Volunteer application for "${name}" approved & message sent to main portal!`, 'success');
      this.renderCommunity();
    }
  },

  rejectVolunteerRequest: function (id) {
    if (confirm(`Decline volunteer enlistment request ${id}?`)) {
      if (MahallDB.updateVolunteerRequestStatus) {
        const res = MahallDB.updateVolunteerRequestStatus(id, 'REJECTED');
        const name = res ? res.name : id;
        this.showToast(`Volunteer application for "${name}" rejected & message sent to main portal.`, 'info');
        this.renderCommunity();
      }
    }
  },

  deleteVolunteerRequest: function (id) {
    if (confirm('Delete this volunteer application record?')) {
      if (MahallDB.deleteVolunteerRequest) {
        MahallDB.deleteVolunteerRequest(id);
        this.showToast('Volunteer application removed.', 'info');
        this.renderCommunity();
      }
    }
  },

  // Blood Donor Approval Handlers
  approveDonorRequest: function (id) {
    if (MahallDB.updateDonorRequestStatus) {
      const res = MahallDB.updateDonorRequestStatus(id, 'APPROVED');
      const name = res ? res.name : id;
      const grp = res ? res.group : '';
      this.showToast(`Blood donor ${name} (${grp}) approved & added to Verified Directory! Message sent to main portal.`, 'success');
      this.renderCommunity();
    }
  },

  rejectDonorRequest: function (id) {
    if (confirm(`Decline blood donor registration request ${id}?`)) {
      if (MahallDB.updateDonorRequestStatus) {
        const res = MahallDB.updateDonorRequestStatus(id, 'REJECTED');
        const name = res ? res.name : id;
        this.showToast(`Blood donor request for ${name} declined & notification sent to main portal.`, 'info');
        this.renderCommunity();
      }
    }
  },

  deleteDonorRequest: function (id) {
    if (confirm('Delete this blood donor registration record?')) {
      if (MahallDB.deleteDonorRequest) {
        MahallDB.deleteDonorRequest(id);
        this.showToast('Donor registration record removed.', 'info');
        this.renderCommunity();
      }
    }
  },

  // Job Application Approval Handlers
  approveJobApp: function (id) {
    if (MahallDB.updateJobApplicationStatus) {
      const res = MahallDB.updateJobApplicationStatus(id, 'APPROVED');
      const name = res ? res.name : id;
      const role = res ? res.jobTitle : 'Job Opportunity';
      this.showToast(`Job application for ${name} (${role}) approved! Forwarding details sent to main portal.`, 'success');
      this.renderCommunity();
    }
  },

  rejectJobApp: function (id) {
    if (confirm(`Decline job application ${id}?`)) {
      if (MahallDB.updateJobApplicationStatus) {
        const res = MahallDB.updateJobApplicationStatus(id, 'REJECTED');
        const name = res ? res.name : id;
        this.showToast(`Job application for ${name} declined & notification sent to main portal.`, 'info');
        this.renderCommunity();
      }
    }
  },

  deleteJobApp: function (id) {
    if (confirm('Delete this job application record?')) {
      if (MahallDB.deleteJobApplication) {
        MahallDB.deleteJobApplication(id);
        this.showToast('Job application removed.', 'info');
        this.renderCommunity();
      }
    }
  },

  // Medical Relief Assistance Approval Handlers
  approveMedicalAid: function (id) {
    if (MahallDB.updateMedicalAidRequestStatus) {
      const res = MahallDB.updateMedicalAidRequestStatus(id, 'APPROVED');
      const patient = res ? res.patientName : id;
      const cat = res ? res.category : 'Medical Aid';
      this.showToast(`Medical assistance grant for ${patient} (${cat}) APPROVED! Settlement message sent to main portal.`, 'success');
      this.renderCommunity();
    }
  },

  rejectMedicalAid: function (id) {
    if (confirm(`Decline medical relief subsidy application ${id}?`)) {
      if (MahallDB.updateMedicalAidRequestStatus) {
        const res = MahallDB.updateMedicalAidRequestStatus(id, 'REJECTED');
        const patient = res ? res.patientName : id;
        this.showToast(`Medical relief application for ${patient} declined & notification sent to main portal.`, 'info');
        this.renderCommunity();
      }
    }
  },

  deleteMedicalAid: function (id) {
    if (confirm('Delete this medical relief application record?')) {
      if (MahallDB.deleteMedicalAidRequest) {
        MahallDB.deleteMedicalAidRequest(id);
        this.showToast('Medical aid application removed.', 'info');
        this.renderCommunity();
      }
    }
  },

  // =========================================================================
  // 15. PHOTO GALLERY & MEDIA
  // =========================================================================
  renderGallery: function () {
    const list = MahallDB.getGallery ? MahallDB.getGallery() : [];
    const container = document.getElementById('gallery-cards-grid');
    if (!container) return;

    if (!list.length) {
      container.innerHTML = `<div class="col-span-4 p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">No photos in public gallery.</div>`;
      return;
    }

    container.innerHTML = list.map(g => `
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-emerald-600/50 transition">
        <div class="h-36 bg-slate-950 overflow-hidden relative">
          <img src="../${g.img || 'assets/images/mahall_logo.jpg'}" alt="${g.title}" onerror="this.src='../assets/images/mahall_logo.jpg'"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          <span class="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/90 text-emerald-400 text-[10px] font-semibold backdrop-blur border border-emerald-800/60">
            ${g.category || 'General'}
          </span>
        </div>
        <div class="p-3">
          <h4 class="font-bold text-white text-xs truncate">${g.title}</h4>
          <p class="text-[10px] text-slate-400 mt-0.5">${g.date || 'Recent'}</p>
          <div class="pt-2 mt-2 border-t border-slate-800 flex justify-end">
            <button onclick="AdminApp.deleteGalleryItem('${g.id}')" class="text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1 transition">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  openAddGalleryModal: function () {
    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="upload" class="w-5 h-5 text-teal-400"></i>
            <span>Add Photo to Public Gallery</span>
          </h3>
          <button onclick="AdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="AdminApp.handleSaveGallery(event)" class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">Photo Title *</label>
            <input type="text" id="modal-gal-title" required placeholder="e.g. Friday Juma Gathering & Reflection" oninput="AdminApp.updateGalleryPreview()"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Category</label>
              <select id="modal-gal-cat" onchange="AdminApp.updateGalleryPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="Jum'ah & Masjid">Jum'ah & Masjid</option>
                <option value="Madrasa & Quran">Madrasa & Quran Fest</option>
                <option value="Centenary Project">Centenary Renovations</option>
                <option value="Social Welfare">Social Relief & Community</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Date</label>
              <input type="text" id="modal-gal-date" value="Sep 2026" oninput="AdminApp.updateGalleryPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Image Asset Path / URL</label>
            <input type="text" id="modal-gal-img" value="assets/images/mahall_logo.jpg" oninput="AdminApp.updateGalleryPreview()"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono" />
            <p class="text-[10px] text-slate-500 mt-1">Specify relative asset path (e.g. <code>assets/images/...</code>) or image URL.</p>
          </div>

          <!-- Live Visual Preview of Gallery Photo Card -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Live Public Gallery Card Preview:</span>
            <div class="rounded-2xl p-3 bg-slate-900 border border-teal-500/40 shadow-xl flex gap-3 items-center">
              <div class="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                <img id="preview-gal-img" src="assets/images/mahall_logo.jpg" alt="Preview" class="w-full h-full object-cover" onerror="this.src='assets/images/mahall_logo.jpg'" />
              </div>
              <div class="space-y-1 min-w-0 flex-1">
                <div class="flex items-center justify-between gap-1">
                  <span id="preview-gal-cat" class="text-[9px] font-mono font-bold uppercase tracking-wider text-teal-400 bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-800/60 inline-block">
                    Jum'ah & Masjid
                  </span>
                  <span id="preview-gal-date" class="text-[10px] text-slate-400 font-mono">Sep 2026</span>
                </div>
                <h5 id="preview-gal-title" class="text-xs font-bold text-white truncate">Friday Juma Gathering & Reflection</h5>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold">Add Photo</button>
          </div>
        </form>
      </div>
    `;
    this.openModal(html);
  },

  updateGalleryPreview: function () {
    const title = document.getElementById('modal-gal-title')?.value || 'Photo Title';
    const catSelect = document.getElementById('modal-gal-cat');
    const cat = catSelect ? catSelect.value : "Jum'ah & Masjid";
    const date = document.getElementById('modal-gal-date')?.value || 'Sep 2026';
    const img = document.getElementById('modal-gal-img')?.value || 'assets/images/mahall_logo.jpg';

    const pTitle = document.getElementById('preview-gal-title');
    const pCat = document.getElementById('preview-gal-cat');
    const pDate = document.getElementById('preview-gal-date');
    const pImg = document.getElementById('preview-gal-img');

    if (pTitle) pTitle.textContent = title;
    if (pCat) pCat.textContent = cat;
    if (pDate) pDate.textContent = date;
    if (pImg && img) pImg.src = img;
    if (window.lucide) lucide.createIcons();
  },

  handleSaveGallery: function (e) {
    e.preventDefault();
    const title = document.getElementById('modal-gal-title').value.trim();
    const cat = document.getElementById('modal-gal-cat').value;
    const date = document.getElementById('modal-gal-date').value.trim();
    const img = document.getElementById('modal-gal-img').value.trim();

    MahallDB.addGalleryItem({
      title: title,
      category: cat,
      date: date,
      img: img
    });

    this.showToast('Photo added to public gallery!', 'success');
    this.closeModal();
    this.renderGallery();
  },

  deleteGalleryItem: function (id) {
    if (confirm('Delete this photo from gallery?')) {
      MahallDB.deleteGalleryItem(id);
      this.showToast('Photo removed.', 'info');
      this.renderGallery();
    }
  },

  // =========================================================================
  // 16. MAHALL IDENTITY & GLOBAL SETTINGS
  // =========================================================================
  renderSettings: function () {
    // 1. Ticker
    const ticker = MahallDB.getTicker ? MahallDB.getTicker() : {};
    const tickerText = document.getElementById('settings-ticker-text');
    const tickerPri = document.getElementById('settings-ticker-priority');
    const tickerEn = document.getElementById('settings-ticker-enabled');
    if (tickerText) tickerText.value = ticker.text || '';
    if (tickerPri) tickerPri.value = ticker.priority || 'NORMAL';
    if (tickerEn) tickerEn.value = String(ticker.enabled !== false);

    // 2. Hadith
    const hadith = MahallDB.getHadith ? MahallDB.getHadith() : {};
    const hAr = document.getElementById('settings-hadith-ar');
    const hEn = document.getElementById('settings-hadith-en');
    const hMl = document.getElementById('settings-hadith-ml');
    const hSrc = document.getElementById('settings-hadith-src');
    if (hAr) hAr.value = hadith.arabic || '';
    if (hEn) hEn.value = hadith.translationEn || '';
    if (hMl) hMl.value = hadith.translationMl || '';
    if (hSrc) hSrc.value = hadith.source || '';

    // 3. Profile
    const profile = MahallDB.getMahallProfile ? MahallDB.getMahallProfile() : {};
    const pName = document.getElementById('settings-profile-name');
    const pReg = document.getElementById('settings-profile-reg');
    const pPhone = document.getElementById('settings-profile-phone');
    const pEmerg = document.getElementById('settings-profile-emergency');
    const pAddr = document.getElementById('settings-profile-address');
    if (pName) pName.value = profile.nameEn || 'Noorul Huda Mahall Jama\'ath';
    if (pReg) pReg.value = profile.registrationNo || 'WKF/KRL/984/1968';
    if (pPhone) pPhone.value = profile.phone || '+91 94472 88990';
    if (pEmerg) pEmerg.value = profile.emergencyHelpline || '+91 94470 12345';
    if (pAddr) pAddr.value = profile.address || 'Central Juma Masjid Complex, Calicut, Kerala - 673001';

    // 4. Firebase Status Indicator in Settings
    this.renderFirebaseStatusBadge();
  },

  saveTickerSettings: function () {
    const text = (document.getElementById('settings-ticker-text').value || '').trim();
    const pri = document.getElementById('settings-ticker-priority').value;
    const en = document.getElementById('settings-ticker-enabled').value === 'true';

    MahallDB.updateTicker({
      text: text,
      priority: pri,
      enabled: en
    });

    this.showToast('Breaking alert ticker updated on public header!', 'success');
  },

  saveHadithSettings: function () {
    const ar = (document.getElementById('settings-hadith-ar').value || '').trim();
    const en = (document.getElementById('settings-hadith-en').value || '').trim();
    const ml = (document.getElementById('settings-hadith-ml').value || '').trim();
    const src = (document.getElementById('settings-hadith-src').value || '').trim();

    MahallDB.updateHadith({
      arabic: ar,
      translationEn: en,
      translationMl: ml,
      source: src
    });

    this.showToast('Spiritual reflection & Hadith updated on public portal!', 'success');
  },

  saveProfileSettings: function () {
    const name = document.getElementById('settings-profile-name').value.trim();
    const reg = document.getElementById('settings-profile-reg').value.trim();
    const phone = document.getElementById('settings-profile-phone').value.trim();
    const emerg = document.getElementById('settings-profile-emergency').value.trim();
    const addr = document.getElementById('settings-profile-address').value.trim();

    MahallDB.updateMahallProfile({
      nameEn: name,
      registrationNo: reg,
      phone: phone,
      emergencyHelpline: emerg,
      address: addr
    });

    this.showToast('Official Mahall identity & contact details saved!', 'success');
  },

  exportDB: function () {
    const dump = MahallDB.exportDatabaseJSON();
    const blob = new Blob([dump], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MahallDB_Backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('Full MahallDB JSON backup downloaded successfully.', 'success');
  },

  importDB: function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const success = MahallDB.importDatabaseJSON(e.target.result);
      if (success) {
        this.showToast('Database successfully restored from JSON snapshot!', 'success');
        this.renderAll();
      } else {
        this.showToast('Failed to restore database. Invalid JSON format.', 'error');
      }
    };
    reader.readAsText(file);
  },

  resetDB: function () {
    if (confirm('WARNING: Reset database to initial factory defaults? All manual changes will be reverted.')) {
      MahallDB.resetToDefaultData();
      this.showToast('Database restored to factory certified state.', 'info');
      this.renderAll();
    }
  },

  // =========================================================================
  // 17. FIREBASE CLOUD DATABASE CONTROLLER & DATA SYNCHRONIZATION
  // =========================================================================
  renderFirebaseStatusBadge: function () {
    if (!window.FirebaseEngine) return;
    const status = window.FirebaseEngine.getStatus();

    // 1. Sidebar Nav Badge
    const navBadge = document.getElementById('badge-firebase-status');
    if (navBadge) {
      if (status.isLive) {
        navBadge.textContent = 'Live Cloud';
        navBadge.className = 'px-1.5 py-0.5 text-[10px] rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono';
      } else {
        navBadge.textContent = 'Local';
        navBadge.className = 'px-1.5 py-0.5 text-[10px] rounded-md bg-amber-950 text-amber-300 border border-amber-800 font-mono';
      }
    }

    // 2. Top Header Indicator
    const topDot = document.getElementById('top-firebase-dot');
    const topText = document.getElementById('top-firebase-text');
    if (topDot && topText) {
      if (status.isLive) {
        topDot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
        topText.textContent = `Firebase: ${status.projectId || 'Live'}`;
      } else {
        topDot.className = 'w-2 h-2 rounded-full bg-amber-400';
        topText.textContent = 'Firebase: Local';
      }
    }

    // 3. Settings Tab Cards
    const setBadge = document.getElementById('settings-fb-badge');
    const setProj = document.getElementById('settings-fb-project');
    const setEngine = document.getElementById('settings-fb-engine');
    if (setBadge) {
      setBadge.textContent = status.isLive ? 'Live Cloud Connected' : 'Local Mode';
      setBadge.className = status.isLive 
        ? 'px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800'
        : 'px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800';
    }
    if (setProj) setProj.textContent = status.projectId || 'None';
    if (setEngine) setEngine.textContent = status.isLive ? 'Cloud Firestore (Live)' : 'Local Dual-Engine';
  },

  renderFirebaseSettings: function () {
    this.renderFirebaseStatusBadge();
    if (!window.FirebaseEngine) return;

    const data = window.FirebaseEngine.getConfig();
    const status = window.FirebaseEngine.getStatus();
    const cfg = data.active || {};

    // 1. Fill input fields
    const elApiKey = document.getElementById('fb-input-api-key');
    const elProjId = document.getElementById('fb-input-project-id');
    const elAuthDom = document.getElementById('fb-input-auth-domain');
    const elStorage = document.getElementById('fb-input-storage-bucket');
    const elSender = document.getElementById('fb-input-sender-id');
    const elAppId = document.getElementById('fb-input-app-id');
    const elMeas = document.getElementById('fb-input-measurement-id');
    const elDbUrl = document.getElementById('fb-input-db-url');

    if (elApiKey && !elApiKey.value) elApiKey.value = cfg.apiKey || '';
    if (elProjId && !elProjId.value) elProjId.value = cfg.projectId || '';
    if (elAuthDom && !elAuthDom.value) elAuthDom.value = cfg.authDomain || '';
    if (elStorage && !elStorage.value) elStorage.value = cfg.storageBucket || '';
    if (elSender && !elSender.value) elSender.value = cfg.messagingSenderId || '';
    if (elAppId && !elAppId.value) elAppId.value = cfg.appId || '';
    if (elMeas && !elMeas.value) elMeas.value = cfg.measurementId || '';
    if (elDbUrl && !elDbUrl.value) elDbUrl.value = cfg.databaseURL || '';

    // 2. Metrics card elements
    const heroPill = document.getElementById('firebase-hero-status-pill');
    const cardEngineMode = document.getElementById('fb-card-engine-mode');
    const cardEngineDot = document.getElementById('fb-card-engine-dot');
    const cardEngineSub = document.getElementById('fb-card-engine-sub');
    const cardProjectId = document.getElementById('fb-card-project-id');
    const cardProjectSub = document.getElementById('fb-card-project-sub');

    if (heroPill) {
      if (status.isLive) {
        heroPill.className = 'px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5';
        heroPill.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span>Live Cloud Connected</span>';
      } else {
        heroPill.className = 'px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1.5';
        heroPill.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400"></span><span>Local Dual-Engine Mode</span>';
      }
    }

    if (cardEngineMode) cardEngineMode.textContent = status.isLive ? 'Cloud Firestore (Live)' : 'Local Dual-Engine';
    if (cardEngineDot) cardEngineDot.className = status.isLive ? 'w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse' : 'w-2.5 h-2.5 rounded-full bg-amber-400';
    if (cardEngineSub) cardEngineSub.textContent = status.isLive ? 'Live synchronized Cloud persistence' : 'UID-isolated local persistence';
    if (cardProjectId) cardProjectId.textContent = cfg.projectId || 'None';
    if (cardProjectSub) cardProjectSub.textContent = cfg.authDomain || 'Google Firebase';

    this.logFirebaseTerminal(`Loaded active settings. Engine: ${status.isLive ? 'LIVE CLOUD' : 'LOCAL RESILIENT'}. Project: "${cfg.projectId || 'none'}".`);
  },

  logFirebaseTerminal: function (msg, type = 'info') {
    const logs = document.getElementById('firebase-terminal-logs');
    if (!logs) return;
    const timeStr = new Date().toLocaleTimeString();
    let prefix = '<span class="text-slate-500">[' + timeStr + ']</span> ';
    if (type === 'success') {
      prefix += '<span class="text-emerald-400 font-bold">[SUCCESS]</span> ';
    } else if (type === 'error') {
      prefix += '<span class="text-rose-400 font-bold">[ERROR]</span> ';
    } else if (type === 'warn') {
      prefix += '<span class="text-amber-400 font-bold">[WARNING]</span> ';
    } else {
      prefix += '<span class="text-sky-400 font-bold">[INFO]</span> ';
    }

    const row = document.createElement('div');
    row.innerHTML = prefix + msg;
    logs.appendChild(row);
    logs.scrollTop = logs.scrollHeight;
  },

  clearFirebaseLogs: function () {
    const logs = document.getElementById('firebase-terminal-logs');
    if (logs) {
      logs.innerHTML = '<div><span class="text-slate-500">[' + new Date().toLocaleTimeString() + ']</span> <span class="text-emerald-400">[SYSTEM]</span> Console cleared.</div>';
    }
  },

  toggleApiKeyVisibility: function () {
    const input = document.getElementById('fb-input-api-key');
    const eyeText = document.getElementById('fb-eye-text');
    const eyeIcon = document.getElementById('fb-eye-icon');
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (eyeText) eyeText.textContent = 'Hide';
      if (eyeIcon) eyeIcon.setAttribute('data-lucide', 'eye-off');
    } else {
      input.type = 'password';
      if (eyeText) eyeText.textContent = 'Show';
      if (eyeIcon) eyeIcon.setAttribute('data-lucide', 'eye');
    }
    if (window.lucide) window.lucide.createIcons();
  },

  parseFirebaseSnippet: function () {
    const textarea = document.getElementById('firebase-paste-area');
    if (!textarea) return;
    const raw = (textarea.value || '').trim();
    if (!raw) {
      this.showToast('Please paste your Firebase config snippet or JSON first.', 'error');
      return;
    }

    let parsed = {};

    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      const extract = (key) => {
        const regex = new RegExp(`["']?${key}["']?\\s*:\\s*["']([^"']+)["']`, 'i');
        const match = raw.match(regex);
        return match ? match[1].trim() : '';
      };

      parsed.apiKey = extract('apiKey');
      parsed.authDomain = extract('authDomain');
      parsed.projectId = extract('projectId');
      parsed.storageBucket = extract('storageBucket');
      parsed.messagingSenderId = extract('messagingSenderId');
      parsed.appId = extract('appId');
      parsed.measurementId = extract('measurementId');
      parsed.databaseURL = extract('databaseURL');
    }

    if (!parsed.apiKey && !parsed.projectId) {
      this.showToast('Could not find apiKey or projectId in pasted text. Check the format.', 'error');
      this.logFirebaseTerminal('Failed to parse pasted snippet. Ensure it contains apiKey and projectId.', 'error');
      return;
    }

    if (parsed.apiKey) document.getElementById('fb-input-api-key').value = parsed.apiKey;
    if (parsed.projectId) document.getElementById('fb-input-project-id').value = parsed.projectId;
    if (parsed.authDomain) document.getElementById('fb-input-auth-domain').value = parsed.authDomain;
    if (parsed.storageBucket) document.getElementById('fb-input-storage-bucket').value = parsed.storageBucket;
    if (parsed.messagingSenderId) document.getElementById('fb-input-sender-id').value = parsed.messagingSenderId;
    if (parsed.appId) document.getElementById('fb-input-app-id').value = parsed.appId;
    if (parsed.measurementId) document.getElementById('fb-input-measurement-id').value = parsed.measurementId;
    if (parsed.databaseURL) document.getElementById('fb-input-db-url').value = parsed.databaseURL;

    this.showToast(`Auto-detected credentials for project: ${parsed.projectId || 'Found'}!`, 'success');
    this.logFirebaseTerminal(`Successfully parsed snippet. Project ID: "${parsed.projectId}". API Key: present. Ready to test or connect!`, 'success');
  },

  fillDemoFirebaseKeys: function () {
    document.getElementById('fb-input-api-key').value = 'AIzaSyDemo-NoorulHuda-2026-SecureKey';
    document.getElementById('fb-input-project-id').value = 'noorul-huda-mahall';
    document.getElementById('fb-input-auth-domain').value = 'noorul-huda-mahall.firebaseapp.com';
    document.getElementById('fb-input-storage-bucket').value = 'noorul-huda-mahall.appspot.com';
    document.getElementById('fb-input-sender-id').value = '109876543210';
    document.getElementById('fb-input-app-id').value = '1:109876543210:web:abcdef1234567890';
    this.showToast('Default template populated into input fields.', 'info');
    this.logFirebaseTerminal('Populated demonstration template parameters.', 'info');
  },

  getFirebaseFormValues: function () {
    return {
      apiKey: (document.getElementById('fb-input-api-key')?.value || '').trim(),
      projectId: (document.getElementById('fb-input-project-id')?.value || '').trim(),
      authDomain: (document.getElementById('fb-input-auth-domain')?.value || '').trim(),
      storageBucket: (document.getElementById('fb-input-storage-bucket')?.value || '').trim(),
      messagingSenderId: (document.getElementById('fb-input-sender-id')?.value || '').trim(),
      appId: (document.getElementById('fb-input-app-id')?.value || '').trim(),
      measurementId: (document.getElementById('fb-input-measurement-id')?.value || '').trim(),
      databaseURL: (document.getElementById('fb-input-db-url')?.value || '').trim()
    };
  },

  testFirebaseConnection: async function () {
    const candidate = this.getFirebaseFormValues();
    if (!candidate.apiKey || !candidate.projectId) {
      this.showToast('Please enter at least an API Key and Project ID to test connection.', 'error');
      return;
    }

    const btn = document.getElementById('btn-test-fb-conn');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i><span>Pinging Firebase...</span>';
      if (window.lucide) window.lucide.createIcons();
    }

    this.logFirebaseTerminal(`Initiating live connection ping to project "${candidate.projectId}"...`, 'info');

    try {
      const result = await window.FirebaseEngine.testConnection(candidate);
      if (result.success) {
        this.showToast(result.message, 'success');
        this.logFirebaseTerminal(result.message, 'success');

        const latencyEl = document.getElementById('fb-card-latency');
        const healthText = document.getElementById('fb-card-health-text');
        const healthIcon = document.getElementById('fb-card-health-icon');
        if (latencyEl) latencyEl.textContent = `${result.pingMs}ms`;
        if (healthText) {
          healthText.textContent = 'ONLINE (Verified)';
          healthText.className = 'text-sm font-bold text-emerald-400';
        }
        if (healthIcon) healthIcon.className = 'w-4 h-4 text-emerald-400';
      } else {
        this.showToast(result.message, 'error');
        this.logFirebaseTerminal(result.message, 'error');
        const healthText = document.getElementById('fb-card-health-text');
        if (healthText) {
          healthText.textContent = 'Connection Failed';
          healthText.className = 'text-sm font-bold text-rose-400';
        }
      }
    } catch (err) {
      this.showToast(`Error: ${err.message}`, 'error');
      this.logFirebaseTerminal(`Exception during test: ${err.message}`, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  },

  saveFirebaseConfig: async function () {
    const config = this.getFirebaseFormValues();
    if (!config.apiKey || !config.projectId) {
      this.showToast('Both Firebase API Key and Project ID are required.', 'error');
      return;
    }

    const btn = document.getElementById('btn-save-fb-conn');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Connecting Database...</span>';
      if (window.lucide) window.lucide.createIcons();
    }

    this.logFirebaseTerminal(`Saving credentials and initializing live Cloud Firestore connection for "${config.projectId}"...`, 'info');

    try {
      await window.FirebaseEngine.saveConfigAndConnect(config);
      this.showToast(`Connected to Firebase project "${config.projectId}" successfully!`, 'success');
      this.logFirebaseTerminal(`Firebase connection initialized! Active across all website pages.`, 'success');
      this.renderFirebaseSettings();
      this.renderAll();
    } catch (err) {
      this.showToast(`Failed to connect: ${err.message}`, 'error');
      this.logFirebaseTerminal(`Failed to save or initialize: ${err.message}`, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  },

  resetFirebaseConfig: async function () {
    if (!confirm('Revert Firebase connection to local resilient dual-engine? Custom keys will be cleared from this browser.')) {
      return;
    }

    this.logFirebaseTerminal('Resetting Firebase configuration to local dual-engine provider...', 'warn');
    await window.FirebaseEngine.disconnectAndReset();
    this.showToast('Reverted to local dual-engine provider.', 'info');
    this.logFirebaseTerminal('Local emulation provider active.', 'info');
    this.renderFirebaseSettings();
    this.renderAll();
  },

  syncDataToFirestore: async function () {
    const btn = document.getElementById('btn-sync-to-firestore');
    const statusBox = document.getElementById('sync-push-status');
    const msgEl = document.getElementById('sync-push-msg');
    const pctEl = document.getElementById('sync-push-pct');
    const barEl = document.getElementById('sync-push-bar');

    if (btn) btn.disabled = true;
    if (statusBox) statusBox.classList.remove('hidden');

    this.logFirebaseTerminal('Starting local dataset upload to Cloud Firestore collections...', 'info');

    try {
      const result = await window.FirebaseEngine.syncLocalToFirestore((msg, pct) => {
        if (msgEl) msgEl.textContent = msg;
        if (pctEl) pctEl.textContent = `${pct}%`;
        if (barEl) barEl.style.width = `${pct}%`;
        this.logFirebaseTerminal(msg, 'info');
      });

      this.showToast(`Synced ${result.count} records to Cloud Firestore successfully!`, 'success');
      this.logFirebaseTerminal(`All data collections synchronized! Total documents uploaded: ${result.count}.`, 'success');
    } catch (err) {
      this.showToast(`Upload failed: ${err.message}`, 'error');
      this.logFirebaseTerminal(`Sync error: ${err.message}`, 'error');
    } finally {
      if (btn) btn.disabled = false;
      setTimeout(() => {
        if (statusBox) statusBox.classList.add('hidden');
      }, 4000);
    }
  },

  pullDataFromFirestore: async function () {
    const btn = document.getElementById('btn-pull-from-firestore');
    const statusBox = document.getElementById('sync-pull-status');
    const msgEl = document.getElementById('sync-pull-msg');
    const pctEl = document.getElementById('sync-pull-pct');
    const barEl = document.getElementById('sync-pull-bar');

    if (btn) btn.disabled = true;
    if (statusBox) statusBox.classList.remove('hidden');

    this.logFirebaseTerminal('Starting Cloud Firestore download to local cache...', 'info');

    try {
      const result = await window.FirebaseEngine.pullFirestoreToLocal((msg, pct) => {
        if (msgEl) msgEl.textContent = msg;
        if (pctEl) pctEl.textContent = `${pct}%`;
        if (barEl) barEl.style.width = `${pct}%`;
        this.logFirebaseTerminal(msg, 'info');
      });

      this.showToast(`Downloaded ${result.count} records from Cloud Firestore!`, 'success');
      this.logFirebaseTerminal(`Download finished. Updated ${result.count} records in local repository.`, 'success');
      this.renderAll();
    } catch (err) {
      this.showToast(`Download failed: ${err.message}`, 'error');
      this.logFirebaseTerminal(`Pull error: ${err.message}`, 'error');
    } finally {
      if (btn) btn.disabled = false;
      setTimeout(() => {
        if (statusBox) statusBox.classList.add('hidden');
      }, 4000);
    }
  },

  copyFirestoreRules: function () {
    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null && request.auth.uid != null; }
    function isOwner(uid) { return isAuthenticated() && request.auth.uid == uid; }
    function isAdmin() {
      return isAuthenticated() && (
        exists(/databases/$(database)/documents/admins/$(request.auth.uid)) ||
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin') ||
        (request.auth.token.role == 'admin')
      );
    }
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId) && (!request.resource.data.keys().hasAny(['role']) || request.resource.data.role == 'user');
      allow update: if (isOwner(userId) && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']))) || isAdmin();
      allow delete: if isAdmin();
      match /{subcollection}/{docId} { allow read, write: if isOwner(userId) || isAdmin(); }
    }
    match /registrations/{registrationId} {
      allow read: if isAuthenticated() && (resource.data.ownerUid == request.auth.uid || isAdmin());
      allow create: if isAuthenticated() && request.resource.data.ownerUid == request.auth.uid;
      allow update: if isAuthenticated() && ((resource.data.ownerUid == request.auth.uid && request.resource.data.ownerUid == resource.data.ownerUid) || isAdmin());
      allow delete: if (isAuthenticated() && resource.data.ownerUid == request.auth.uid) || isAdmin();
    }
    match /admins/{adminUid} { allow read, write: if isAdmin(); }
    match /events/{eventId} { allow read: if true; allow write: if isAdmin(); }
    match /announcements/{annId} { allow read: if true; allow write: if isAdmin(); }
    match /prayer_times/{docId} { allow read: if true; allow write: if isAdmin(); }
    match /families/{familyId} { allow read, write: if isAdmin(); }
    match /settings/{docId} { allow read: if true; allow write: if isAdmin(); }
  }
}`;
    navigator.clipboard.writeText(rules).then(() => {
      this.showToast('Copied security rules to clipboard!', 'success');
      this.logFirebaseTerminal('Copied production firestore.rules to clipboard.', 'success');
    }).catch(() => {
      this.showToast('Failed to copy. Please copy from firestore.rules file.', 'error');
    });
  },

  // =========================================================================
  // 17. MODAL & TOAST ENGINE
  // =========================================================================
  openModal: function (html) {
    const container = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    if (container && content) {
      content.innerHTML = html;
      container.classList.remove('hidden');
      container.classList.add('flex');
      if (window.lucide) window.lucide.createIcons();
    }
  },

  closeModal: function () {
    this.currentViewingEventRsvpId = null;
    const container = document.getElementById('modal-container');
    if (container) {
      container.classList.add('hidden');
      container.classList.remove('flex');
    }
  },

  showToast: function (msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const colors = {
      success: 'bg-emerald-950 border-emerald-600 text-emerald-200',
      error: 'bg-rose-950 border-rose-600 text-rose-200',
      info: 'bg-slate-900 border-slate-700 text-slate-200'
    };

    toast.className = `p-3 rounded-xl border shadow-2xl text-xs flex items-center gap-2 transform transition duration-300 pointer-events-auto ${colors[type] || colors.info}`;
    toast.innerHTML = `
      <span class="w-2 h-2 rounded-full ${type === 'success' ? 'bg-emerald-400' : (type === 'error' ? 'bg-rose-400' : 'bg-slate-400')}"></span>
      <span>${msg}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  escapeHTML: function (str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  // =========================================================================
  // 18. USER INQUIRIES & PUBLIC SUBMISSIONS CONSOLE
  // =========================================================================
  renderInquiries: function () {
    try {
      const list = (typeof MahallDB !== 'undefined' && MahallDB.getInquiries) ? MahallDB.getInquiries() : [];
      const tbody = document.getElementById('inquiries-table-body');
      const emptyState = document.getElementById('inquiries-empty-state');
      const counterBadge = document.getElementById('inquiries-counter-badge');

      // Metrics
      const totalCount = list.length;
      const newCount = list.filter(i => (i.status || '').toUpperCase() === 'NEW').length;
      const reviewCount = list.filter(i => (i.status || '').toUpperCase() === 'READ').length;
      const resolvedCount = list.filter(i => (i.status || '').toUpperCase() === 'RESOLVED').length;

      const elTotal = document.getElementById('inquiries-stat-total');
      const elNew = document.getElementById('inquiries-stat-new');
      const elReview = document.getElementById('inquiries-stat-review');
      const elResolved = document.getElementById('inquiries-stat-resolved');
      if (elTotal) elTotal.textContent = totalCount;
      if (elNew) elNew.textContent = newCount;
      if (elReview) elReview.textContent = reviewCount;
      if (elResolved) elResolved.textContent = resolvedCount;
      if (counterBadge) counterBadge.textContent = `${newCount} Unread`;

      // Filter values
      const search = (document.getElementById('inquiries-search-input')?.value || '').toLowerCase().trim();
      const catFilter = (document.getElementById('inquiries-category-filter')?.value || 'ALL').trim();
      const statusFilter = (document.getElementById('inquiries-status-filter')?.value || 'ALL').trim();

      const filtered = list.filter(item => {
        if (!item) return false;
        const itemName = (item.name || '').toLowerCase();
        const itemPhone = (item.phone || '').toLowerCase();
        const itemId = (item.id || '').toLowerCase();
        const itemMsg = (item.message || '').toLowerCase();
        const itemWard = (item.ward || '').toLowerCase();

        const matchSearch = !search ||
          itemName.includes(search) ||
          itemPhone.includes(search) ||
          itemId.includes(search) ||
          itemMsg.includes(search) ||
          itemWard.includes(search);

        const itemCat = (item.category || '').toLowerCase();
        const matchCat = catFilter.toUpperCase() === 'ALL' || itemCat === catFilter.toLowerCase();

        const itemStatus = (item.status || 'NEW').toUpperCase();
        const matchStatus = statusFilter.toUpperCase() === 'ALL' || itemStatus === statusFilter.toUpperCase();

        return matchSearch && matchCat && matchStatus;
      });

      if (tbody) {
        if (!filtered.length) {
          if (list.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
          } else {
            if (emptyState) emptyState.classList.add('hidden');
            tbody.innerHTML = `
              <tr>
                <td colspan="6" class="p-8 text-center">
                  <div class="flex flex-col items-center justify-center space-y-2 text-slate-500">
                    <i data-lucide="inbox" class="w-8 h-8 text-slate-600 mb-1"></i>
                    <p class="text-sm font-semibold text-slate-300">No submissions match the current filter</p>
                    <p class="text-xs text-slate-500">Total ${list.length} inquiries in database. Reset filters to view all entries.</p>
                    <button onclick="document.getElementById('inquiries-status-filter').value='ALL'; document.getElementById('inquiries-category-filter').value='ALL'; document.getElementById('inquiries-search-input').value=''; AdminApp.filterInquiries();" class="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-medium border border-slate-700 transition">
                      Reset Filter to All
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }
        } else {
          if (emptyState) emptyState.classList.add('hidden');
          tbody.innerHTML = filtered.map(item => {
            const statusKey = (item.status || 'NEW').toUpperCase();
            const statusBadges = {
              NEW: '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 w-fit"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>NEW</span>',
              READ: '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1 w-fit"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>IN REVIEW</span>',
              RESOLVED: '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800 flex items-center gap-1 w-fit"><span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>RESOLVED</span>'
            };

            const categoryPills = {
              membership: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
              welfare: 'bg-rose-950/80 text-rose-300 border-rose-800/60',
              madrasa: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
              feedback: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
              general: 'bg-slate-800 text-slate-300 border-slate-700'
            };

            const catClass = categoryPills[(item.category || '').toLowerCase()] || categoryPills.general;

            return `
              <tr class="hover:bg-slate-800/40 transition">
                <td class="p-3.5">
                  <span class="font-mono font-bold text-white block">${this.escapeHTML(item.id || '')}</span>
                  <span class="text-[10px] text-slate-400">${this.escapeHTML(item.submittedAt || 'Today')}</span>
                </td>
                <td class="p-3.5">
                  <div class="font-semibold text-white">${this.escapeHTML(item.name || 'Anonymous')}</div>
                  <a href="tel:${this.escapeHTML(item.phone || '')}" class="text-[11px] text-emerald-400 font-mono hover:underline flex items-center gap-1 mt-0.5">
                    <i data-lucide="phone" class="w-3 h-3"></i> ${this.escapeHTML(item.phone || 'No Phone')}
                  </a>
                </td>
                <td class="p-3.5">
                  <span class="px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${catClass} block w-fit mb-1">
                    ${this.escapeHTML(item.categoryLabel || item.category || 'General')}
                  </span>
                  <span class="text-[10px] text-slate-400 flex items-center gap-1">
                    <i data-lucide="map-pin" class="w-3 h-3 text-slate-500"></i> ${this.escapeHTML(item.ward || 'General')}
                  </span>
                </td>
                <td class="p-3.5 max-w-xs sm:max-w-md">
                  <p class="text-slate-300 line-clamp-2 text-xs leading-relaxed">${this.escapeHTML(item.message || '')}</p>
                  ${item.responseNotes ? `<div class="mt-1 text-[10px] text-slate-400 italic">Office Note: ${this.escapeHTML(item.responseNotes)}</div>` : ''}
                </td>
                <td class="p-3.5">
                  ${statusBadges[statusKey] || statusBadges.NEW}
                </td>
                <td class="p-3.5 text-right space-x-1 whitespace-nowrap">
                  <button onclick="AdminApp.viewInquiryDetail('${this.escapeHTML(item.id || '')}')" title="View & Reply" class="p-1.5 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 transition">
                    <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                  </button>
                  <button onclick="AdminApp.deleteInquiryRecord('${this.escapeHTML(item.id || '')}')" title="Delete" class="p-1.5 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 transition">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </td>
              </tr>
            `;
          }).join('');
        }
      }

      // Also render Religious Consultations sub-table
      this.renderConsultations();

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error('[AdminApp] Error rendering inquiries console:', err);
    }
  },

  renderConsultations: function () {
    try {
      const list = (typeof MahallDB !== 'undefined' && MahallDB.getConsultations) ? MahallDB.getConsultations() : [];
      const tbody = document.getElementById('consultations-table-body');
      if (!tbody) return;

      if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="8" class="p-5 text-center text-xs text-slate-500">No religious consultation appointments currently registered.</td></tr>`;
        return;
      }

      tbody.innerHTML = list.map(c => `
        <tr class="hover:bg-slate-800/40 transition">
          <td class="p-3 font-mono font-bold text-amber-400">${this.escapeHTML(c.refId || '')}</td>
          <td class="p-3 font-semibold text-white">${this.escapeHTML(c.name || 'Resident')}</td>
          <td class="p-3 font-mono text-emerald-400">
            <a href="tel:${this.escapeHTML(c.phone || '')}" class="hover:underline flex items-center gap-1">
              <i data-lucide="phone" class="w-3 h-3 text-slate-500"></i> ${this.escapeHTML(c.phone || '')}
            </a>
          </td>
          <td class="p-3 text-slate-300">${this.escapeHTML(c.scholar || 'Chief Imam')}</td>
          <td class="p-3"><span class="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px]">${this.escapeHTML(c.category || 'Consultation')}</span></td>
          <td class="p-3 text-[11px] text-slate-400">${this.escapeHTML(c.slot || 'Post-Asr')} (${this.escapeHTML(c.mode || 'In-Person')})</td>
          <td class="p-3">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${(c.status || '').toUpperCase() === 'CONFIRMED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'}">
              ${this.escapeHTML(c.status || 'CONFIRMED')}
            </span>
          </td>
          <td class="p-3 text-right">
            <button onclick="AdminApp.toggleConsultationStatus('${this.escapeHTML(c.refId || '')}')" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-medium border border-slate-700 transition">
              ${(c.status || '').toUpperCase() === 'CONFIRMED' ? 'Mark Completed' : 'Reactivate'}
            </button>
          </td>
        </tr>
      `).join('');

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error('[AdminApp] Error rendering consultations:', err);
    }
  },

  filterInquiries: function () {
    this.renderInquiries();
  },

  viewInquiryDetail: function (id) {
    const list = MahallDB.getInquiries ? MahallDB.getInquiries() : [];
    const item = list.find(i => i.id === id);
    if (!item) return;

    // Automatically mark NEW as READ
    if (item.status === 'NEW') {
      MahallDB.updateInquiryStatus(id, 'READ');
      this.renderKPIs();
    }

    const cleanPhone = (item.phone || '').replace(/[^0-9+]/g, '');
    const waPhone = cleanPhone.replace(/^\+/, '');

    const modalHtml = `
      <div class="space-y-5">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <i data-lucide="message-square" class="w-5 h-5"></i>
            </span>
            <div>
              <h3 class="text-base font-heading font-bold text-white">Public Inquiry Details</h3>
              <p class="text-xs text-slate-400 font-mono">Ref: ${item.id} • ${item.submittedAt}</p>
            </div>
          </div>
          <button onclick="AdminApp.closeModal()" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span class="text-slate-400 text-[10px] uppercase block">Sender Full Name</span>
            <span class="text-sm font-bold text-white mt-0.5 block">${this.escapeHTML(item.name)}</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span class="text-slate-400 text-[10px] uppercase block">Contact Phone / WhatsApp</span>
            <span class="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">${this.escapeHTML(item.phone)}</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span class="text-slate-400 text-[10px] uppercase block">Inquiry Category</span>
            <span class="font-semibold text-white mt-0.5 block">${this.escapeHTML(item.categoryLabel || item.category)}</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span class="text-slate-400 text-[10px] uppercase block">Resident Ward</span>
            <span class="font-semibold text-white mt-0.5 block">${this.escapeHTML(item.ward || 'General')}</span>
          </div>
        </div>

        <div class="space-y-1.5 text-xs">
          <label class="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">User Message</label>
          <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed font-sans whitespace-pre-line">
            ${this.escapeHTML(item.message)}
          </div>
        </div>

        <div class="space-y-3 pt-2 border-t border-slate-800 text-xs">
          <div>
            <label class="block text-slate-400 font-semibold mb-1">Office Response & Resolution Notes</label>
            <textarea id="inquiry-response-notes" rows="2" placeholder="Record internal office notes, actions taken, or replies given..." class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500">${this.escapeHTML(item.responseNotes || '')}</textarea>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div class="flex items-center gap-2">
              <span class="text-slate-400">Status:</span>
              <select id="inquiry-modal-status" class="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500">
                <option value="NEW" ${item.status === 'NEW' ? 'selected' : ''}>New (Unread)</option>
                <option value="READ" ${item.status === 'READ' ? 'selected' : ''}>Under Review</option>
                <option value="RESOLVED" ${item.status === 'RESOLVED' ? 'selected' : ''}>Resolved</option>
              </select>
            </div>

            <div class="flex items-center gap-2">
              <a href="https://wa.me/${waPhone}?text=${encodeURIComponent(`Assalamu Alaikum ${item.name}, with reference to your inquiry ${item.id} to Noorul Huda Mahall Office:`)}" target="_blank" class="px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center gap-1.5 transition">
                <i data-lucide="message-circle" class="w-3.5 h-3.5"></i> Reply via WhatsApp
              </a>
              <button onclick="AdminApp.saveInquiryResolution('${item.id}')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition">
                <i data-lucide="check" class="w-3.5 h-3.5"></i> Save Updates
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.openModal(modalHtml);
  },

  saveInquiryResolution: function (id) {
    const status = document.getElementById('inquiry-modal-status')?.value || 'RESOLVED';
    const notes = document.getElementById('inquiry-response-notes')?.value || '';

    MahallDB.updateInquiryStatus(id, status, notes);
    this.closeModal();
    this.showToast(`Inquiry ${id} updated to ${status}!`, 'success');
    this.renderInquiries();
    this.renderKPIs();
  },

  deleteInquiryRecord: function (id) {
    if (confirm(`Are you sure you want to delete inquiry record ${id}?`)) {
      MahallDB.deleteInquiry(id);
      this.showToast(`Inquiry ${id} deleted`, 'info');
      this.renderInquiries();
      this.renderKPIs();
    }
  },

  toggleConsultationStatus: function (refId) {
    const list = MahallDB.getConsultations ? MahallDB.getConsultations() : [];
    const item = list.find(c => c.refId === refId);
    if (!item) return;

    const newStatus = item.status === 'CONFIRMED' ? 'COMPLETED' : 'CONFIRMED';
    MahallDB.updateConsultationStatus(refId, newStatus);
    this.showToast(`Appointment ${refId} status changed to ${newStatus}`, 'success');
    this.renderConsultations();
  },

  openNewInquiryModal: function () {
    const modalHtml = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <i data-lucide="plus-circle" class="w-5 h-5"></i>
            </span>
            <h3 class="text-base font-heading font-bold text-white">Log Walk-In / Phone Inquiry</h3>
          </div>
          <button onclick="AdminApp.closeModal()" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <form id="manual-inquiry-form" onsubmit="event.preventDefault(); AdminApp.saveManualInquiry();" class="space-y-3 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Full Name *</label>
              <input type="text" id="manual-inq-name" required placeholder="User name" oninput="AdminApp.updateInquiryPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Mobile / WhatsApp *</label>
              <input type="tel" id="manual-inq-phone" required placeholder="+91 94470 12345" oninput="AdminApp.updateInquiryPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Category</label>
              <select id="manual-inq-cat" onchange="AdminApp.updateInquiryPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500">
                <option value="general">General Mahall Inquiry</option>
                <option value="membership">Family Membership / Ward Transfer</option>
                <option value="madrasa">Madrasa Admission & Syllabus</option>
                <option value="welfare">Medical / Dialysis Aid Assistance</option>
                <option value="feedback">Feedback / Suggestion</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Resident Ward</label>
              <input type="text" id="manual-inq-ward" placeholder="Ward 2 or Non-Resident" oninput="AdminApp.updateInquiryPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Inquiry / Note Message *</label>
            <textarea id="manual-inq-msg" required rows="3" placeholder="Enter inquiry message details..." oninput="AdminApp.updateInquiryPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"></textarea>
          </div>

          <!-- Live Visual Preview of Inquiry Ticket Docket -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <i data-lucide="eye" class="w-3.5 h-3.5 text-emerald-400"></i>
              <span>LIVE PREVIEW AS SEEN ON PUBLIC PORTAL:</span>
            </span>
            <div class="rounded-2xl p-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl space-y-2 relative">
              <div class="flex items-center justify-between border-b border-emerald-800/40 pb-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700/60">
                    TKT-2026-LIVE
                  </span>
                  <span id="preview-inq-cat" class="text-[10px] font-semibold text-slate-300">
                    General Mahall Inquiry
                  </span>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono text-[9px] font-bold">DESK TICKET</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span class="text-[10px] text-slate-400 block">Inquirer:</span>
                  <strong id="preview-inq-name" class="text-white text-xs font-semibold">User Name</strong>
                  <span id="preview-inq-phone" class="text-[10px] font-mono text-emerald-400 block">+91 94470 12345</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 block">Resident Ward:</span>
                  <strong id="preview-inq-ward" class="text-slate-200 text-xs font-semibold block">Ward 2 / Non-Resident</strong>
                  <span class="text-[9px] text-slate-400">Secretariat Helpdesk</span>
                </div>
              </div>
              <div class="pt-1.5 border-t border-slate-800/80">
                <p id="preview-inq-msg" class="text-xs text-slate-300 line-clamp-2">Enter inquiry message details...</p>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button type="button" onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/30">Save Inquiry</button>
          </div>
        </form>
      </div>
    `;

    this.openModal(modalHtml);
  },

  updateInquiryPreview: function () {
    const name = document.getElementById('manual-inq-name')?.value || 'User Name';
    const phone = document.getElementById('manual-inq-phone')?.value || '+91 94470 12345';
    const catSelect = document.getElementById('manual-inq-cat');
    const cat = catSelect ? catSelect.options[catSelect.selectedIndex]?.text || 'General Mahall Inquiry' : 'General Mahall Inquiry';
    const ward = document.getElementById('manual-inq-ward')?.value || 'Ward 2 / Non-Resident';
    const msg = document.getElementById('manual-inq-msg')?.value || 'Enter inquiry message details...';

    const pName = document.getElementById('preview-inq-name');
    const pPhone = document.getElementById('preview-inq-phone');
    const pCat = document.getElementById('preview-inq-cat');
    const pWard = document.getElementById('preview-inq-ward');
    const pMsg = document.getElementById('preview-inq-msg');

    if (pName) pName.textContent = name;
    if (pPhone) pPhone.textContent = phone;
    if (pCat) pCat.textContent = cat;
    if (pWard) pWard.textContent = ward || 'General';
    if (pMsg) pMsg.textContent = msg;
    if (window.lucide) lucide.createIcons();
  },

  saveManualInquiry: function () {
    const name = document.getElementById('manual-inq-name')?.value;
    const phone = document.getElementById('manual-inq-phone')?.value;
    const category = document.getElementById('manual-inq-cat')?.value;
    const ward = document.getElementById('manual-inq-ward')?.value;
    const message = document.getElementById('manual-inq-msg')?.value;

    if (!name || !phone || !message) {
      this.showToast('Please fill out all required fields', 'warning');
      return;
    }

    const item = MahallDB.addInquiry({
      name, phone, category, ward, message
    });

    this.closeModal();
    this.showToast(`Logged inquiry with ref: ${item.id}`, 'success');
    this.renderInquiries();
    this.renderKPIs();
  },

  exportInquiriesCSV: function () {
    const list = MahallDB.getInquiries ? MahallDB.getInquiries() : [];
    if (!list.length) {
      this.showToast('No inquiries to export.', 'warning');
      return;
    }

    const headers = ["Inquiry ID", "Sender Name", "Phone", "Category", "Ward", "Message", "Status", "Date Submitted", "Resolution Notes"];
    const rows = list.map(i => [
      `"${i.id}"`,
      `"${(i.name || '').replace(/"/g, '""')}"`,
      `"${i.phone || ''}"`,
      `"${i.categoryLabel || i.category || ''}"`,
      `"${i.ward || ''}"`,
      `"${(i.message || '').replace(/"/g, '""')}"`,
      `"${i.status}"`,
      `"${i.submittedAt || ''}"`,
      `"${(i.responseNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mahall_Inquiries_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('Inquiries exported successfully as CSV file.', 'success');
  },

  // =========================================================================
  // PROGRAM REGISTRATIONS & TICKET MANAGEMENT (CLOUD FIRESTORE)
  // =========================================================================
  cachedRegistrations: [],
  cachedUsers: [],

  renderRegistrations: async function () {
    try {
      if (typeof AuthService === 'undefined' || !AuthService.isAdmin()) {
        console.warn('Admin clearance required to fetch registrations.');
        return;
      }

      const list = await AuthService.getAllRegistrations();
      this.cachedRegistrations = list || [];
      this.filterRegistrations();
    } catch (err) {
      console.error('Error fetching registrations:', err);
    }
  },

  filterRegistrations: function () {
    const searchInput = document.getElementById('regs-search-input');
    const eventFilter = document.getElementById('regs-event-filter');
    const sortSelect = document.getElementById('regs-sort-select');
    const tbody = document.getElementById('registrations-table-body');

    const searchVal = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const eventVal = eventFilter ? eventFilter.value : 'all';
    const sortVal = sortSelect ? sortSelect.value : 'newest';

    let filtered = [...(this.cachedRegistrations || [])];

    // Filter by event
    if (eventVal !== 'all') {
      filtered = filtered.filter(r => r.eventId === eventVal);
    }

    // Filter by search text
    if (searchVal) {
      filtered = filtered.filter(r => {
        const name = (r.ownerName || '').toLowerCase();
        const username = (r.ownerUsername || '').toLowerCase();
        const email = (r.ownerEmail || '').toLowerCase();
        const uid = (r.ownerUid || '').toLowerCase();
        const title = (r.eventTitle || '').toLowerCase();
        const tkt = (r.ticketNumber || '').toLowerCase();
        const regId = (r.registrationId || r.id || '').toLowerCase();
        return name.includes(searchVal) || username.includes(searchVal) || email.includes(searchVal) || uid.includes(searchVal) || title.includes(searchVal) || tkt.includes(searchVal) || regId.includes(searchVal);
      });
    }

    // Sorting
    if (sortVal === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortVal === 'tickets-desc') {
      filtered.sort((a, b) => (parseInt(b.ticketCount, 10) || 0) - (parseInt(a.ticketCount, 10) || 0));
    } else if (sortVal === 'tickets-asc') {
      filtered.sort((a, b) => (parseInt(a.ticketCount, 10) || 0) - (parseInt(b.ticketCount, 10) || 0));
    } else if (sortVal === 'name') {
      filtered.sort((a, b) => (a.ownerName || '').localeCompare(b.ownerName || ''));
    }

    // Calculate totals
    const totalBookings = filtered.length;
    const totalTickets = filtered.reduce((sum, r) => sum + (parseInt(r.ticketCount, 10) || 0), 0);
    const uniqueUsers = new Set(filtered.map(r => r.ownerUid)).size;

    const elTotal = document.getElementById('kpi-regs-total');
    const elTickets = document.getElementById('kpi-regs-tickets');
    const elUsers = document.getElementById('kpi-regs-users');
    const navBadge = document.getElementById('badge-registrations-count');

    if (elTotal) elTotal.textContent = totalBookings;
    if (elTickets) elTickets.textContent = totalTickets;
    if (elUsers) elUsers.textContent = uniqueUsers;
    if (navBadge) navBadge.textContent = totalBookings;

    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="p-8 text-center text-slate-500">
            <i data-lucide="ticket" class="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-50"></i>
            <p class="font-semibold text-slate-400">No program registrations found matching the query.</p>
            <p class="text-[11px] text-slate-600 mt-1">Registrations made by residents in Cloud Firestore will appear here in real time.</p>
          </td>
        </tr>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    tbody.innerHTML = filtered.map(r => {
      const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
      const statusColor = r.status === 'confirmed' 
        ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
        : r.status === 'cancelled'
        ? 'bg-rose-950 text-rose-300 border-rose-800'
        : 'bg-amber-950 text-amber-300 border-amber-800';

      return `
        <tr class="hover:bg-slate-800/40 transition group">
          <td class="p-4">
            <div class="font-bold text-white text-xs">${this.escapeHTML(r.ownerName || 'Resident Member')}</div>
            <div class="text-[11px] text-slate-400 font-mono">${this.escapeHTML(r.ownerEmail || r.ownerUsername || '')}</div>
          </td>
          <td class="p-4">
            <span class="font-mono text-[11px] bg-slate-950 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded-lg select-all">
              ${this.escapeHTML(r.ownerUid || 'UID_UNKNOWN')}
            </span>
          </td>
          <td class="p-4">
            <div class="font-semibold text-slate-200 text-xs">${this.escapeHTML(r.eventTitle || 'Annual Campus Program')}</div>
            <div class="text-[10px] text-slate-500 font-mono">ID: ${this.escapeHTML(r.eventId || '')}</div>
          </td>
          <td class="p-4">
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold font-mono text-xs">
              <i data-lucide="ticket" class="w-3.5 h-3.5 text-amber-400"></i>
              <span>${r.ticketCount} ${r.ticketCount === 1 ? 'Ticket' : 'Tickets'}</span>
            </span>
          </td>
          <td class="p-4">
            <div class="font-mono text-xs text-amber-400 font-semibold">${this.escapeHTML(r.ticketNumber || r.id || '')}</div>
            <div class="text-[10px] text-slate-500">${dateStr}</div>
          </td>
          <td class="p-4">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border font-mono ${statusColor}">
              ${r.status || 'registered'}
            </span>
          </td>
          <td class="p-4 text-right">
            <div class="inline-flex items-center gap-1.5">
              <button onclick="AdminApp.viewRegistrationDetail('${r.registrationId || r.id}')"
                class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition" title="View Full Reservation Details">
                <i data-lucide="eye" class="w-4 h-4"></i>
              </button>
              <button onclick="AdminApp.toggleRegistrationStatus('${r.registrationId || r.id}', '${r.status === 'confirmed' ? 'registered' : 'confirmed'}')"
                class="p-1.5 rounded-lg ${r.status === 'confirmed' ? 'bg-amber-950 text-amber-400 hover:bg-amber-900' : 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900'} transition" title="Toggle Confirmed Status">
                <i data-lucide="${r.status === 'confirmed' ? 'check' : 'check-circle-2'}" class="w-4 h-4"></i>
              </button>
              <button onclick="AdminApp.deleteRegistrationPrompt('${r.registrationId || r.id}')"
                class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition" title="Cancel & Remove Reservation">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  },

  viewRegistrationDetail: function (regId) {
    const reg = (this.cachedRegistrations || []).find(r => (r.registrationId === regId || r.id === regId));
    if (!reg) return;

    this.openModal(`
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <i data-lucide="ticket" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-white font-heading">Program Registration Details</h3>
              <p class="text-xs text-slate-400 font-mono">${reg.ticketNumber || reg.id}</p>
            </div>
          </div>
          <button onclick="AdminApp.closeModal()" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Attendee Name</span>
            <strong class="text-white text-sm">${this.escapeHTML(reg.ownerName || 'Resident Member')}</strong>
          </div>
          <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Ticket Quantity</span>
            <strong class="text-amber-400 text-sm font-mono">${reg.ticketCount} Tickets</strong>
          </div>
          <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 col-span-2">
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Authenticated Firebase UID (Owner Key)</span>
            <span class="font-mono text-cyan-400 text-xs select-all">${this.escapeHTML(reg.ownerUid || '')}</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Program Name</span>
            <span class="text-slate-200">${this.escapeHTML(reg.eventTitle || '')}</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
            <span class="font-bold text-emerald-400 uppercase text-xs">${reg.status || 'Registered'}</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 col-span-2">
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Attendee Notes</span>
            <p class="text-slate-300 mt-1">${this.escapeHTML(reg.notes || 'No special notes recorded.')}</p>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button onclick="AdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold">
            Close
          </button>
        </div>
      </div>
    `);
  },

  toggleRegistrationStatus: async function (regId, newStatus) {
    try {
      if (typeof AuthService !== 'undefined') {
        await AuthService.updateRegistrationStatus(regId, newStatus);
        this.showToast(`Registration marked as ${newStatus}!`, 'success');
        this.renderRegistrations();
      }
    } catch (e) {
      this.showToast(e.message || 'Could not update status', 'error');
    }
  },

  deleteRegistrationPrompt: async function (regId) {
    if (!confirm('Are you sure you want to cancel and remove this reservation record from Firestore?')) return;
    try {
      if (typeof AuthService !== 'undefined') {
        await AuthService.cancelRegistration(regId);
        this.showToast('Reservation removed.', 'info');
        this.renderRegistrations();
      }
    } catch (e) {
      this.showToast(e.message || 'Could not delete', 'error');
    }
  },

  exportRegistrationsCSV: function () {
    const list = this.cachedRegistrations || [];
    if (!list.length) {
      this.showToast('No registrations to export.', 'info');
      return;
    }

    const headers = ["Registration ID", "Attendee Name", "Email", "Firebase UID", "Program Title", "Ticket Count", "Ticket Code", "Status", "Created Date"];
    const rows = list.map(r => [
      `"${r.registrationId || r.id}"`,
      `"${(r.ownerName || '').replace(/"/g, '""')}"`,
      `"${r.ownerEmail || ''}"`,
      `"${r.ownerUid || ''}"`,
      `"${(r.eventTitle || '').replace(/"/g, '""')}"`,
      r.ticketCount || 1,
      `"${r.ticketNumber || ''}"`,
      `"${r.status || 'registered'}"`,
      `"${r.createdAt || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Program_Registrations_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('Program Registrations CSV exported.', 'success');
  },

  printRegistrations: function () {
    const list = this.cachedRegistrations || [];
    const printArea = document.getElementById('print-modal-content');
    if (!printArea) return;

    printArea.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="margin: 0; color: #047857;">NOORUL HUDA MAHALL JAMA'ATH</h2>
        <h3 style="margin: 4px 0 16px 0; color: #b45309;">OFFICIAL PROGRAM REGISTRATIONS & ATTENDEE ROSTER</h3>
        <p style="font-size: 12px; color: #64748b;">Generated: ${new Date().toLocaleString()} • Cloud Firestore Master Record</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 8px;">#</th>
              <th style="padding: 8px;">Attendee Name</th>
              <th style="padding: 8px;">Firebase UID</th>
              <th style="padding: 8px;">Program</th>
              <th style="padding: 8px;">Tickets</th>
              <th style="padding: 8px;">Pass Code</th>
              <th style="padding: 8px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((r, i) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px;">${i + 1}</td>
                <td style="padding: 8px; font-weight: bold;">${r.ownerName || 'Resident'}</td>
                <td style="padding: 8px; font-family: monospace;">${r.ownerUid || ''}</td>
                <td style="padding: 8px;">${r.eventTitle || 'Annual Program'}</td>
                <td style="padding: 8px; font-weight: bold; color: #b45309;">${r.ticketCount}</td>
                <td style="padding: 8px; font-family: monospace;">${r.ticketNumber || ''}</td>
                <td style="padding: 8px; text-transform: uppercase;">${r.status || 'Registered'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    window.print();
  },

  // =========================================================================
  // REGISTERED FAMILY AUTHENTICATOR REGISTRY
  // =========================================================================
  filterUsers: function () {
    this.renderUsers();
  },

  renderUsers: async function () {
    try {
      const search = (document.getElementById('users-search-input')?.value || '').toLowerCase().trim();
      const wardFilter = document.getElementById('users-ward-select')?.value || 'all';

      // 1. Get all registered families from MahallDB
      let families = (typeof MahallDB !== 'undefined' && MahallDB.getFamilies) ? MahallDB.getFamilies() : [];

      // Build authenticated user entries:
      // Include Executive Admin first
      let authUsers = [
        {
          uid: 'UID_ADMIN_SEC_01',
          familyId: 'MAHALL-EXEC',
          displayName: 'P. K. Abdurahman',
          title: 'General Secretary',
          role: 'ADMIN',
          userId: 'admin',
          username: 'admin',
          email: 'admin@mahall.org',
          phone: '+91 495 2724800',
          houseName: 'Executive Secretariat Office',
          houseNo: 'Desk 01',
          ward: 'Ward 02 (Masjid Central)',
          pin: 'admin123',
          membersCount: 1,
          isFamilyHead: true,
          status: 'Active Executive',
          created: '01/01/2026'
        }
      ];

      // Add each registered family as an authenticated resident family
      families.forEach(f => {
        authUsers.push({
          uid: `UID_${(f.familyId || '').replace(/[^a-zA-Z0-9]/g, '_')}`,
          familyId: f.familyId,
          displayName: f.head || 'Family Head',
          title: 'Head of Family',
          role: 'RESIDENT FAMILY',
          userId: f.userId || f.familyId,
          username: f.userId || f.familyId,
          email: f.email || `${(f.userId || f.familyId).toLowerCase()}@mahall.org`,
          phone: f.phone || '-',
          houseName: f.houseName || 'Family Residence',
          houseNo: f.houseNo || '-',
          ward: f.ward || 'Ward 02 (Masjid Central)',
          pin: f.pin || f.password || '1968',
          membersCount: f.membersCount || (f.members ? f.members.length : 1),
          members: f.members || [],
          isFamilyHead: true,
          status: f.monthlyStatus === 'PAID' ? 'Verified Household' : 'Active Member',
          created: f.registeredAt || 'Active'
        });
      });

      // Apply Ward Filter
      if (wardFilter && wardFilter !== 'all') {
        authUsers = authUsers.filter(u => u.ward && u.ward.toLowerCase().includes(wardFilter.toLowerCase()));
      }

      // Apply Search Filter
      if (search) {
        authUsers = authUsers.filter(u =>
          (u.familyId && u.familyId.toLowerCase().includes(search)) ||
          (u.displayName && u.displayName.toLowerCase().includes(search)) ||
          (u.houseName && u.houseName.toLowerCase().includes(search)) ||
          (u.userId && u.userId.toLowerCase().includes(search)) ||
          (u.phone && u.phone.toLowerCase().includes(search)) ||
          (u.email && u.email.toLowerCase().includes(search)) ||
          (u.ward && u.ward.toLowerCase().includes(search))
        );
      }

      const tbody = document.getElementById('users-table-body');
      const badge = document.getElementById('badge-users-count');
      if (badge) badge.textContent = families.length;

      if (!tbody) return;

      if (!authUsers.length) {
        tbody.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-slate-500 font-medium">No registered family authenticators found matching filter.</td></tr>`;
        return;
      }

      tbody.innerHTML = authUsers.map(u => {
        const isAdmin = u.role === 'ADMIN';
        const initial = (u.displayName || 'M').trim().charAt(0).toUpperCase();
        return `
          <tr class="hover:bg-slate-800/40 transition">
            <td class="p-4 align-top whitespace-nowrap">
              <div class="flex flex-col gap-1">
                <span class="font-mono font-bold ${isAdmin ? 'text-amber-400 bg-amber-950/80 border-amber-800/60' : 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60'} px-2 py-0.5 rounded text-xs border w-fit">
                  ${this.escapeHTML(u.familyId)}
                </span>
                <span class="font-mono text-[10px] text-cyan-300 bg-slate-950 border border-slate-700 px-1.5 py-0.5 rounded select-all w-fit">
                  ${this.escapeHTML(u.uid)}
                </span>
              </div>
            </td>
            <td class="p-4 align-top">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full ${isAdmin ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'} flex items-center justify-center font-bold text-xs shrink-0 shadow">
                  ${initial}
                </div>
                <div>
                  <p class="font-bold text-white text-xs leading-tight">${this.escapeHTML(u.displayName)}</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">${this.escapeHTML(u.title)} • <span class="text-emerald-400 font-bold">${u.membersCount} Member(s)</span></p>
                </div>
              </div>
            </td>
            <td class="p-4 align-top">
              <div class="text-slate-200 text-xs font-medium">${this.escapeHTML(u.houseName)} ${u.houseNo ? `(${this.escapeHTML(u.houseNo)})` : ''}</div>
              <div class="text-[11px] text-slate-400 mt-0.5">${this.escapeHTML(u.ward)}</div>
            </td>
            <td class="p-4 align-top font-mono text-cyan-300 text-xs whitespace-nowrap">
              <span class="bg-cyan-950/60 border border-cyan-800/50 px-2 py-1 rounded">
                ${this.escapeHTML(u.userId)}
              </span>
            </td>
            <td class="p-4 align-top whitespace-nowrap">
              <div class="font-mono text-slate-300 text-xs">${this.escapeHTML(u.phone)}</div>
              <div class="text-[10px] text-slate-500 font-mono">${this.escapeHTML(u.email)}</div>
            </td>
            <td class="p-4 align-top whitespace-nowrap">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${isAdmin ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}">
                ${u.role}
              </span>
            </td>
            <td class="p-4 align-top whitespace-nowrap">
              <div class="flex items-center gap-1.5">
                <span class="font-mono text-xs text-amber-300 bg-slate-950 border border-slate-700 px-2 py-0.5 rounded font-bold">
                  ${this.escapeHTML(u.pin)}
                </span>
                <button onclick="AdminApp.copyText('${u.pin}', 'Security PIN copied!')" title="Copy PIN" class="p-1 hover:text-amber-400 text-slate-500 transition">
                  <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </td>
            <td class="p-4 align-top text-right whitespace-nowrap space-x-1">
              ${!isAdmin ? `
                <button onclick="AdminApp.loginAsFamily('${u.familyId}')" title="Log In as This Family in Portal" class="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition">
                  <i data-lucide="log-in" class="w-4 h-4"></i>
                </button>
                <button onclick="AdminApp.viewFamilyCard('${u.familyId}')" title="View Full Family Tree" class="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition">
                  <i data-lucide="eye" class="w-4 h-4"></i>
                </button>
                <button onclick="AdminApp.openRegisterFamilyUserModal('${u.familyId}')" title="Edit Family Record" class="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition">
                  <i data-lucide="edit-3" class="w-4 h-4"></i>
                </button>
                <button onclick="AdminApp.deleteFamily('${u.familyId}')" title="Delete Family Record" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              ` : `
                <span class="text-[10px] text-slate-500 font-mono pr-2">System Core</span>
              `}
            </td>
          </tr>
        `;
      }).join('');

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      console.error('Error rendering users directory:', e);
    }
  },

  openRegisterFamilyUserModal: function (existingId = null) {
    this.openAddFamilyModal(existingId);
  },

  copyText: function (text, message = 'Copied to clipboard!') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast(message, 'success');
      }).catch(() => {
        this.showToast(`Key: ${text}`, 'info');
      });
    } else {
      this.showToast(`Key: ${text}`, 'info');
    }
  },

  loginAsFamily: function (familyId) {
    const f = (MahallDB.getFamilies() || []).find(fam => fam.familyId.toUpperCase() === familyId.toUpperCase());
    if (!f) {
      this.showToast('Family record not found', 'error');
      return;
    }
    const session = {
      isAuthenticated: true,
      uid: `UID_${f.familyId.replace(/[^a-zA-Z0-9]/g, '_')}`,
      role: 'member',
      user: {
        uid: `UID_${f.familyId.replace(/[^a-zA-Z0-9]/g, '_')}`,
        familyId: f.familyId,
        name: f.head,
        displayName: f.head,
        houseName: f.houseName,
        houseNo: f.houseNo,
        ward: f.ward,
        phone: f.phone,
        membersCount: f.membersCount || (f.members ? f.members.length : 1),
        role: 'member'
      },
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('mahall_auth_session', JSON.stringify(session));
    localStorage.setItem('nhm_role', 'member');
    localStorage.setItem('nhm_user_family', f.familyId);
    localStorage.setItem('nhm_user_name', f.head);
    this.showToast(`Switched active portal identity to ${f.head} (${f.familyId})`, 'success');
    setTimeout(() => {
      window.open('../my-mahall.html', '_blank');
    }, 400);
  }
};

window.AdminApp = AdminApp;
window.escapeHTML = AdminApp.escapeHTML;

// Auto-run when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});
