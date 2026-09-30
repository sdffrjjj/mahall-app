/**
 * NOORUL HUDA MAHALL - MAIN APPLICATION LOGIC
 * Reactive Store, Modals, Audio, Role Switching, Dynamic Prayer Engine & AI
 */

// Bulletproof Global Theme Toggle Helper (Works everywhere instantly)
window.toggleTheme = function (e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  if (window.app && typeof window.app.toggleTheme === 'function') {
    window.app.toggleTheme();
    return;
  }
  const isDark = document.documentElement.classList.toggle('dark');
  try {
    localStorage.setItem('nhm_dark', isDark ? 'true' : 'false');
  } catch (err) {}
  const themeButtons = document.querySelectorAll('#theme-toggle-btn, .theme-toggle-btn, button[onclick*="toggleTheme"]');
  themeButtons.forEach(btn => {
    btn.innerHTML = `<i id="theme-toggle-icon" class="theme-toggle-icon w-4 h-4 text-amber-400" data-lucide="${isDark ? 'sun' : 'moon'}"></i>`;
  });
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
};

// Bulletproof Global Notification Drawer Renderer & Toggle Helper (Works everywhere instantly)
window.renderStandaloneNotifications = function (drawer, activeFilter = 'ALL') {
  if (!drawer) drawer = document.getElementById('notification-drawer');
  if (!drawer) return;

  const notifs = (typeof MahallDB !== 'undefined' && MahallDB.getNotifications) ? MahallDB.getNotifications() : [
    {
      id: "NOTIF-2026-001",
      title: "Janazah Notice Broadcast",
      message: "Janazah prayer for Marhum V. P. Alavi Haji (78 Yrs, Baitul Noor) today at 04:30 PM at Central Masjid courtyard.",
      type: "JANAZAH",
      category: "Announcements",
      status: "BROADCAST",
      date: "Today, 02:15 PM",
      read: false
    },
    {
      id: "NOTIF-2026-002",
      title: "Certificate Ready for Download",
      message: "Marriage NOC certificate for Mohammed Zeeshan has been approved and digitally signed.",
      type: "CERTIFICATE",
      category: "Certificates",
      status: "APPROVED",
      date: "Yesterday, 06:45 PM",
      read: false
    },
    {
      id: "NOTIF-2026-003",
      title: "Monthly Mahall Contribution",
      message: "Monthly contribution reminder for Baitul Noor. Kindly clear dues via online portal or office desk.",
      type: "DUES",
      category: "Accounts",
      status: "PENDING",
      date: "25 Sep, 10:00 AM",
      read: true
    }
  ];

  const unreadCount = notifs.filter(n => !n.read).length;
  let filtered = notifs;
  if (activeFilter === 'AUDITORIUM') {
    filtered = notifs.filter(n => n.category === 'Auditorium' || (n.type && n.type.includes('AUDITORIUM')));
  } else if (activeFilter === 'VOLUNTEER') {
    filtered = notifs.filter(n => n.category === 'Volunteer' || (n.type && n.type.includes('VOLUNTEER')));
  } else if (activeFilter === 'CERTIFICATES') {
    filtered = notifs.filter(n => n.category === 'Certificates' || (n.type && n.type.includes('CERTIFICATE')));
  } else if (activeFilter === 'EDUCATION') {
    filtered = notifs.filter(n => n.category === 'Education' || (n.type && (n.type.includes('ADMISSION') || n.type.includes('SCHOLARSHIP'))));
  } else if (activeFilter === 'NOTICES') {
    filtered = notifs.filter(n => n.category !== 'Auditorium' && n.category !== 'Volunteer' && n.category !== 'Certificates' && n.category !== 'Education');
  }

  drawer.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
          <i data-lucide="bell" class="w-4 h-4"></i>
        </div>
        <div>
          <h4 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
            Portal Notifications
            ${unreadCount > 0 ? `<span class="px-2 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-bold">${unreadCount} New</span>` : ''}
          </h4>
          <span class="text-[10px] text-slate-400">Broadcast Notices & Approvals</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        ${unreadCount > 0 ? `
          <button onclick="if(typeof MahallDB!=='undefined'&&MahallDB.markAllNotificationsAsRead){MahallDB.markAllNotificationsAsRead();}window.renderStandaloneNotifications(null,'ALL');" class="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
            Mark all read
          </button>
        ` : ''}
        <button onclick="window.toggleNotificationDrawer(event)" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white text-base font-bold">&times;</button>
      </div>
    </div>

    <!-- Filter Chips -->
    <div class="flex items-center gap-1 overflow-x-auto text-[11px] font-semibold pb-1 no-scrollbar">
      <button onclick="window.renderStandaloneNotifications(null,'ALL')" class="px-2.5 py-1 rounded-lg transition shrink-0 ${activeFilter === 'ALL' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">All</button>
      <button onclick="window.renderStandaloneNotifications(null,'AUDITORIUM')" class="px-2.5 py-1 rounded-lg transition shrink-0 ${activeFilter === 'AUDITORIUM' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">🏛️ Auditorium</button>
      <button onclick="window.renderStandaloneNotifications(null,'VOLUNTEER')" class="px-2.5 py-1 rounded-lg transition shrink-0 ${activeFilter === 'VOLUNTEER' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">🤝 Volunteers</button>
      <button onclick="window.renderStandaloneNotifications(null,'CERTIFICATES')" class="px-2.5 py-1 rounded-lg transition shrink-0 ${activeFilter === 'CERTIFICATES' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">📜 Certificates</button>
      <button onclick="window.renderStandaloneNotifications(null,'EDUCATION')" class="px-2.5 py-1 rounded-lg transition shrink-0 ${activeFilter === 'EDUCATION' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">🎓 Education</button>
      <button onclick="window.renderStandaloneNotifications(null,'NOTICES')" class="px-2.5 py-1 rounded-lg transition shrink-0 ${activeFilter === 'NOTICES' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">📢 General</button>
    </div>

    <!-- Notifications List -->
    <div class="space-y-2 max-h-[380px] overflow-y-auto pr-1 text-xs">
      ${!filtered.length ? `
        <div class="py-8 text-center text-slate-400 space-y-1">
          <i data-lucide="inbox" class="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2"></i>
          <p class="font-medium text-xs">No notifications in this category.</p>
        </div>
      ` : filtered.map(n => {
        const isApproved = n.status === 'APPROVED' || n.status === 'CONFIRMED';
        const isRejected = n.status === 'REJECTED';
        let cardStyle = 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700';
        let statusBadge = 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
        let iconColor = 'text-slate-600 dark:text-slate-300';
        let iconName = 'bell';

        if (isApproved) {
          cardStyle = 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80';
          statusBadge = 'bg-emerald-600 text-white';
          iconColor = 'text-emerald-600';
          if (n.category === 'Auditorium') iconName = 'calendar-check';
          else if (n.category === 'Certificates') iconName = 'award';
          else if (n.category === 'Education') iconName = 'graduation-cap';
          else if (n.category === 'Accounts') iconName = 'receipt';
          else iconName = 'check-circle-2';
        } else if (isRejected) {
          cardStyle = 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/80';
          statusBadge = 'bg-rose-600 text-white';
          iconColor = 'text-rose-600';
          iconName = 'x-circle';
        } else if (n.type === 'JANAZAH') {
          cardStyle = 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900';
          statusBadge = 'bg-red-600 text-white';
          iconColor = 'text-red-600';
          iconName = 'flag';
        }

        return `
          <div class="p-3 rounded-2xl border ${cardStyle} transition space-y-1.5 relative ${!n.read ? 'ring-1 ring-emerald-500/50' : 'opacity-85'}">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-1.5">
                <i data-lucide="${iconName}" class="w-4 h-4 ${iconColor} shrink-0"></i>
                <strong class="text-slate-900 dark:text-white text-xs font-bold leading-tight">${n.title || 'Notification'}</strong>
              </div>
              <span class="px-2 py-0.5 rounded-full ${statusBadge} font-mono text-[9px] font-bold uppercase tracking-wider shrink-0">${n.status || 'NOTICE'}</span>
            </div>
            <p class="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">${n.message || ''}</p>
            <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <span>${n.date || 'Recent'}</span>
              <span class="font-medium text-emerald-600 dark:text-emerald-400">${n.category || 'Mahall'}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px]">
      <span class="text-slate-400">Portal Notifications</span>
      <a href="my-mahall.html" class="text-emerald-600 hover:underline font-bold flex items-center gap-1">
        <span>My Resident Portal</span> &rarr;
      </a>
    </div>
  `;

  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
};

window.toggleNotificationDrawer = function (e) {
  const ev = e || window.event;
  if (ev) {
    if (typeof ev.stopPropagation === 'function') ev.stopPropagation();
    if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
    if (typeof ev.preventDefault === 'function') ev.preventDefault();
  }

  let drawer = document.getElementById('notification-drawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'notification-drawer';
    drawer.className = 'hidden';
    document.body.appendChild(drawer);
  }

  if (!drawer._clickStopBound) {
    drawer._clickStopBound = true;
    drawer.addEventListener('click', (innerEv) => {
      if (innerEv && typeof innerEv.stopPropagation === 'function') innerEv.stopPropagation();
    });
  }

  const isClosed = drawer.classList.contains('hidden') || drawer.style.display === 'none' || window.getComputedStyle(drawer).display === 'none';

  if (isClosed) {
    drawer.classList.remove('hidden');
    drawer.style.display = 'block';
    drawer.style.setProperty('display', 'block', 'important');
    if (window.app && typeof window.app.renderNotificationsDrawer === 'function') {
      window.app.renderNotificationsDrawer('ALL');
    } else {
      window.renderStandaloneNotifications(drawer, 'ALL');
    }
  } else {
    drawer.classList.add('hidden');
    drawer.style.display = 'none';
    drawer.style.setProperty('display', 'none', 'important');
  }
};

class MahallApp {
  constructor() {
    window.app = this;
    this.currentLang = localStorage.getItem('nhm_lang') || 'en';
    this.currentRole = localStorage.getItem('nhm_role') || 'public'; // 'public' | 'member' | 'admin'
    this.currentTab = 'home';
    this.darkMode = localStorage.getItem('nhm_dark') === 'true';

    // Reactive State (Synced with MahallDB)
    const activeFamId = (typeof AuthService !== 'undefined' && typeof AuthService.getCurrentFamilyId === 'function')
      ? AuthService.getCurrentFamilyId()
      : (localStorage.getItem('nhm_user_family') || 'W01-F001');

    const resolvedMember = (typeof MahallDB !== 'undefined' && typeof MahallDB.getFamilyById === 'function')
      ? (MahallDB.getFamilyById(activeFamId) || MahallDB.getFamilyById('W01-F001') || (typeof MAHALL_DATA !== 'undefined' ? MAHALL_DATA.families[0] : null))
      : (typeof MAHALL_DATA !== 'undefined' ? (MAHALL_DATA.families.find(f => f.familyId === activeFamId) || MAHALL_DATA.families[0]) : null);

    this.state = {
      families: (typeof MahallDB !== 'undefined') ? MahallDB.getFamilies() : ((typeof MAHALL_DATA !== 'undefined') ? [...MAHALL_DATA.families] : []),
      certificates: (typeof MahallDB !== 'undefined') ? MahallDB.getCertificates() : ((typeof MAHALL_DATA !== 'undefined') ? [...MAHALL_DATA.certificatesList] : []),
      announcements: (typeof MahallDB !== 'undefined') ? MahallDB.getAnnouncements() : ((typeof MAHALL_DATA !== 'undefined') ? [...MAHALL_DATA.announcements] : []),
      events: (typeof MahallDB !== 'undefined') ? MahallDB.getEvents() : ((typeof MAHALL_DATA !== 'undefined') ? [...MAHALL_DATA.events] : []),
      sulhuCases: (typeof MahallDB !== 'undefined') ? MahallDB.getSulhuPetitions() : ((typeof MAHALL_DATA !== 'undefined') ? [...MAHALL_DATA.sulhuRegistrations] : []),
      bloodDonors: (typeof MahallDB !== 'undefined') ? MahallDB.getBloodDonors() : ((typeof MAHALL_DATA !== 'undefined') ? [...MAHALL_DATA.bloodDonors] : []),
      memberUser: resolvedMember
    };

    this.init();
  }

  init() {
    try { this.applyTheme(); } catch (e) { console.warn('applyTheme error:', e); }
    try { this.applyLanguage(this.currentLang); } catch (e) { console.warn('applyLanguage error:', e); }
    try { this.setupEventListeners(); } catch (e) { console.warn('setupEventListeners error:', e); }
    try { this.startLiveClockAndPrayer(); } catch (e) { console.warn('startLiveClockAndPrayer error:', e); }
    try { this.renderCurrentView(); } catch (e) { console.warn('renderCurrentView error:', e); }
    try { this.renderBloodDonors(); } catch (e) { console.warn('renderBloodDonors error:', e); }
    try { this.renderEvents(); } catch (e) { console.warn('renderEvents error:', e); }
    try { this.renderAnnouncements(); } catch (e) { console.warn('renderAnnouncements error:', e); }
    try { this.renderImpactStats(); } catch (e) { console.warn('renderImpactStats error:', e); }
    try { this.renderTopAlert(); } catch (e) { console.warn('renderTopAlert error:', e); }
    try { this.renderCampusMap(); } catch (e) { console.warn('renderCampusMap error:', e); }
    try { this.renderHistory(); } catch (e) { console.warn('renderHistory error:', e); }
    try { this.renderMemberPortal(); } catch (e) { console.warn('renderMemberPortal error:', e); }
    try { this.renderStartupSecuritySection(); } catch (e) { console.warn('renderStartupSecuritySection error:', e); }
    try { this.updateNotificationBadge(); } catch (e) { console.warn('updateNotificationBadge error:', e); }
    try { this.initNotificationsEngine(); } catch (e) { console.warn('initNotificationsEngine error:', e); }

    // Listen for real-time changes made in the ADMIN portal (same window)
    window.addEventListener('mahalldb_updated', () => {
      this.refreshFromDB();
      this.renderStartupSecuritySection();
    });

    // Listen for cross-window / cross-tab changes made in the ADMIN portal
    window.addEventListener('storage', (e) => {
      if (!e.key || e.key.startsWith('mahall_') || e.key.startsWith('nhm_')) {
        this.refreshFromDB();
        this.renderStartupSecuritySection();
      }
    });

    // Listen for auth session changes
    window.addEventListener('mahall_auth_changed', () => {
      this.refreshFromDB();
      this.renderStartupSecuritySection();
    });
  }

  refreshFromDB() {
    if (typeof MahallDB === 'undefined') return;
    this.state.families = MahallDB.getFamilies();
    this.state.certificates = MahallDB.getCertificates();
    this.state.announcements = MahallDB.getAnnouncements();
    this.state.events = MahallDB.getEvents();
    this.state.sulhuCases = MahallDB.getSulhuPetitions();
    this.state.bloodDonors = MahallDB.getBloodDonors();
    this.renderBloodDonors();
    this.renderEvents();
    this.renderAnnouncements();
    this.renderImpactStats();
    this.renderTopAlert();
    this.renderMemberPortal();
    this.renderStartupSecuritySection();
    this.updateClockAndPrayerCountdown();
    this.updateNotificationBadge();
    if (this.isNotificationDrawerOpen && this.isNotificationDrawerOpen()) {
      this.renderNotificationsDrawer();
    }
  }

  renderImpactStats() {
    if (typeof MahallDB === 'undefined') return;

    // 1. Registered Families: Base 1,250 + additional from DB
    const fams = MahallDB.getFamilies ? MahallDB.getFamilies() : [];
    const extraFamilies = Math.max(0, fams.length - 3);
    const totalFamilies = 1250 + extraFamilies;
    const famEl = document.getElementById('stat-families-count');
    if (famEl) famEl.textContent = totalFamilies.toLocaleString();

    // 2. Community Members: Base 5,430 + additional members count
    let extraMembers = 0;
    if (fams.length > 3) {
      fams.slice(3).forEach(f => {
        extraMembers += (f.members ? f.members.length : (f.membersCount || 1));
      });
    }
    const totalMembers = 5430 + extraMembers;
    const memEl = document.getElementById('stat-members-count');
    if (memEl) memEl.textContent = totalMembers.toLocaleString();

    // 3. Madrasa Students: Base 480 + additional enrolled
    const students = MahallDB.getStudents ? MahallDB.getStudents() : [];
    const extraStudents = Math.max(0, students.length - 4);
    const totalStudents = 480 + extraStudents;
    const studEl = document.getElementById('stat-students-count');
    if (studEl) studEl.textContent = totalStudents.toLocaleString();

    // 4. Verified Blood Donors: Base 145 + additional donors
    const donors = MahallDB.getBloodDonors ? MahallDB.getBloodDonors() : [];
    const extraDonors = Math.max(0, donors.length - 5);
    const totalDonors = 145 + extraDonors;
    const donEl = document.getElementById('stat-donors-count');
    if (donEl) donEl.textContent = `${totalDonors}+`;
  }

  renderTopAlert() {
    const bannerEl = document.getElementById('top-alert-banner');
    if (bannerEl) {
      bannerEl.remove();
    }
  }

  // ==========================================
  // THEME & LOCALIZATION
  // ==========================================
  applyTheme() {
    const isDark = !!this.darkMode;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const themeButtons = document.querySelectorAll('#theme-toggle-btn, .theme-toggle-btn, button[onclick*="toggleTheme"]');
    themeButtons.forEach(btn => {
      btn.innerHTML = `<i id="theme-toggle-icon" class="theme-toggle-icon w-4 h-4 text-amber-400" data-lucide="${isDark ? 'sun' : 'moon'}"></i>`;
    });

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('nhm_dark', this.darkMode);
    this.applyTheme();
  }

  changeLanguage(lang) {
    this.applyLanguage(lang);
  }

  applyLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('nhm_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    if (document.body) {
      document.body.classList.remove('lang-en', 'lang-ml', 'lang-ar');
      document.body.classList.add('lang-' + lang);
    }

    // Call advanced translation engine
    if (window.I18N && typeof window.I18N.translatePage === 'function') {
      window.I18N.translatePage(lang);
    } else {
      // Fallback
      const langLabels = { en: 'English', ml: 'മലയാളം', ar: 'العربية' };
      const currentLangLabel = document.getElementById('current-lang-text');
      if (currentLangLabel) currentLangLabel.innerText = langLabels[lang] || 'English';

      const i18nElems = document.querySelectorAll('[data-i18n]');
      i18nElems.forEach(el => {
        const keyPath = el.getAttribute('data-i18n');
        const text = this.getI18nText(keyPath);
        if (text) el.innerText = text;
      });
    }

    // Sync all dropdown selects across header & navbars
    document.querySelectorAll('select#lang-select, select.lang-select').forEach(sel => {
      sel.value = lang;
    });

    // Update dynamic sections if present
    if (typeof this.renderHeroDates === 'function') this.renderHeroDates();
    if (typeof this.renderAnnouncements === 'function') this.renderAnnouncements();
    if (typeof this.renderEvents === 'function') this.renderEvents();

    // Broadcast event for custom listeners
    window.dispatchEvent(new CustomEvent('mahall_lang_changed', { detail: { lang: lang } }));

    // Show gentle feedback toast
    const langNames = {
      en: 'Switched to English',
      ml: 'മലയാളത്തിലേക്ക് മാറ്റി (Malayalam)',
      ar: 'تم التغيير إلى العربية (Arabic)'
    };
    if (typeof this.showToast === 'function') {
      this.showToast(langNames[lang] || `Language set to ${lang}`, 'info');
    }

    if (window.lucide) lucide.createIcons();
  }

  getI18nText(path) {
    const keys = path.split('.');
    let current = I18N[this.currentLang] || I18N['en'];
    for (const k of keys) {
      if (!current || current[k] === undefined) {
        current = I18N['en'][k];
      } else {
        current = current[k];
      }
    }
    return current || '';
  }

  // ==========================================
  // ROLE SWITCHER
  // ==========================================
  setRole(role, isUserAction = false) {
    this.currentRole = role;
    localStorage.setItem('nhm_role', role);

    // Update pill buttons
    document.querySelectorAll('.role-pill').forEach(btn => {
      if (btn.dataset.role === role) {
        btn.classList.add('active', 'bg-emerald-700', 'text-white');
        btn.classList.remove('text-slate-600', 'dark:text-slate-300');
      } else {
        btn.classList.remove('active', 'bg-emerald-700', 'text-white');
        btn.classList.add('text-slate-600', 'dark:text-slate-300');
      }
    });

    // Update role visibility elements
    const memberNavTab = document.getElementById('nav-tab-member');
    const adminNavTab = document.getElementById('nav-tab-admin');
    const navRoleText = document.getElementById('nav-role-text');
    const roleBadge = document.getElementById('current-role-badge');

    if (role === 'member') {
      if (memberNavTab) memberNavTab.classList.remove('hidden');
      if (adminNavTab) adminNavTab.classList.add('hidden');
      if (navRoleText) navRoleText.innerText = 'Resident (Ahmed)';
      if (roleBadge) roleBadge.className = 'w-2 h-2 rounded-full bg-emerald-500';
      if (isUserAction) {
        this.switchTab('myMahall');
        this.showToast('Logged in as Resident: Ahmed Koya (Ward 2, Al-Falah Villa)', 'success');
      }
    } else if (role === 'admin') {
      if (memberNavTab) memberNavTab.classList.remove('hidden');
      if (adminNavTab) adminNavTab.classList.remove('hidden');
      if (navRoleText) navRoleText.innerText = 'Admin: Secretary';
      if (roleBadge) roleBadge.className = 'w-2 h-2 rounded-full bg-amber-500';

      const isAlreadyOnAdmin = window.location.pathname.toLowerCase().includes('/admin/') ||
                               window.location.href.toLowerCase().includes('/admin/');

      // Only navigate if explicitly triggered by a user click AND not already on admin portal
      if (isUserAction && !isAlreadyOnAdmin) {
        this.showToast('Opening Executive Admin Portal...', 'info');
        setTimeout(() => {
          window.location.href = 'ADMIN/index.html';
        }, 150);
        return;
      }

      if (isUserAction) {
        this.showToast('Active Role: General Secretary (Admin)', 'info');
      }
    } else {
      if (memberNavTab) memberNavTab.classList.add('hidden');
      if (adminNavTab) adminNavTab.classList.add('hidden');
      if (navRoleText) navRoleText.innerText = 'Role: Public';
      if (roleBadge) roleBadge.className = 'w-2 h-2 rounded-full bg-slate-400';
      if (isUserAction) {
        this.switchTab('home');
        this.showToast('Browsing as Public Visitor', 'info');
      }
    }

    if (typeof this.renderMemberPortal === 'function') {
      try { this.renderMemberPortal(); } catch (err) { console.warn('renderMemberPortal error:', err); }
    }
    if (typeof this.renderAdminCertificates === 'function') {
      try { this.renderAdminCertificates(); } catch (err) { console.warn('renderAdminCertificates error:', err); }
    }
    if (typeof this.renderAdminDirectory === 'function') {
      try { this.renderAdminDirectory(); } catch (err) { console.warn('renderAdminDirectory error:', err); }
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      try { lucide.createIcons(); } catch (err) {}
    }
  }

  // ==========================================
  // TAB NAVIGATION
  // ==========================================
  switchTab(tabId) {
    const targetPane = document.getElementById(`pane-${tabId}`);
    if (!targetPane) {
      // Avoid hiding existing panes if the requested tab does not exist on this page
      return;
    }

    this.currentTab = tabId;
    document.querySelectorAll('.app-tab-pane').forEach(pane => {
      pane.classList.add('hidden');
    });

    targetPane.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update Nav highlights
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.tab === tabId) {
        link.classList.add('text-emerald-700', 'dark:text-emerald-400', 'border-b-2', 'border-emerald-600', 'font-bold');
        link.classList.remove('text-slate-600', 'dark:text-slate-300');
      } else {
        link.classList.remove('text-emerald-700', 'dark:text-emerald-400', 'border-b-2', 'border-emerald-600', 'font-bold');
        link.classList.add('text-slate-600', 'dark:text-slate-300');
      }
    });

    // Mobile bottom nav sync
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('text-emerald-600', 'font-bold');
        btn.classList.remove('text-slate-400');
      } else {
        btn.classList.remove('text-emerald-600', 'font-bold');
        btn.classList.add('text-slate-400');
      }
    });

    if (window.lucide) lucide.createIcons();
  }

  toggleMobileMenu() {
    const menu = document.getElementById('mobile-collapsible-menu');
    if (menu) {
      menu.classList.toggle('hidden');
      if (window.lucide) lucide.createIcons();
    }
  }

  // ==========================================
  // LIVE CLOCK & PRAYER ENGINE
  // ==========================================
  startLiveClockAndPrayer() {
    this.updateClockAndPrayerCountdown();
    setInterval(() => {
      this.updateClockAndPrayerCountdown();
    }, 1000);
  }

  updateClockAndPrayerCountdown() {
    const now = new Date();
    
    // Time string
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const liveClockEl = document.getElementById('live-clock-display');
    if (liveClockEl) liveClockEl.innerText = timeStr;

    // Next Prayer Calculation
    const schedule = (typeof MahallDB !== 'undefined') ? MahallDB.getPrayerSchedule() : MAHALL_DATA.prayerSchedule;
    const prayers = (schedule && schedule.prayers) ? schedule.prayers : MAHALL_DATA.prayerSchedule.prayers;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let nextPrayer = null;
    let minDiff = Infinity;

    prayers.forEach(p => {
      if (p.id === 'sunrise') return;
      const [time, modifier] = p.adhan.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      
      const pMinutes = hours * 60 + minutes;
      let diff = pMinutes - currentMinutes;
      if (diff < 0) diff += 24 * 60; // next day

      if (diff < minDiff) {
        minDiff = diff;
        nextPrayer = p;
      }
    });

    if (nextPrayer) {
      const hoursLeft = Math.floor(minDiff / 60);
      const minsLeft = minDiff % 60;
      const secsLeft = 59 - now.getSeconds();

      const countdownEl = document.getElementById('next-prayer-countdown');
      const nextNameEl = document.getElementById('next-prayer-name');
      const nextAdhanEl = document.getElementById('next-prayer-adhan');

      const prayerName = (this.currentLang === 'ml') ? nextPrayer.nameMl : (this.currentLang === 'ar') ? nextPrayer.nameAr : nextPrayer.name;

      if (nextNameEl) nextNameEl.innerText = prayerName;
      if (nextAdhanEl) nextAdhanEl.innerText = nextPrayer.adhan;
      if (countdownEl) {
        countdownEl.innerText = `${String(hoursLeft).padStart(2, '0')}h ${String(minsLeft).padStart(2, '0')}m ${String(secsLeft).padStart(2, '0')}s`;
      }

      // Highlight active prayer card
      document.querySelectorAll('.prayer-time-item').forEach(card => {
        if (card.dataset.prayer === nextPrayer.id) {
          card.classList.add('prayer-card-active');
        } else {
          card.classList.remove('prayer-card-active');
        }
      });
    }
  }

  renderHeroDates() {
    const gregorianEl = document.getElementById('gregorian-date-display');
    const hijriEl = document.getElementById('hijri-date-display');
    const today = new Date();
    
    if (gregorianEl) {
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      gregorianEl.innerText = today.toLocaleDateString(this.currentLang === 'ml' ? 'ml-IN' : this.currentLang === 'ar' ? 'ar-SA' : 'en-US', options);
    }

    if (hijriEl) {
      // Formatted Hijri date estimate (e.g. 23 Rabi al-Awwal 1448 AH)
      hijriEl.innerText = "23 Rabi' al-Awwal 1448 AH | ١٤٤٨ هـ";
    }
  }

  playAdhanPreview() {
    this.showToast('Playing Makkah Adhan preview audio...', 'info');
    // Synthesize gentle harmonic tone if audio file is unavailable
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, audioCtx.currentTime); // Calming 432Hz tone
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 3);
    } catch (e) {
      console.log('AudioContext not allowed without gesture', e);
    }
  }

  // ==========================================
  // RENDER SECTIONS & CARDS
  // ==========================================
  renderAnnouncements() {
    const container = document.getElementById('announcements-container');
    if (!container) return;

    container.innerHTML = this.state.announcements.map(ann => {
      const title = (this.currentLang === 'ml') ? ann.titleMl : (this.currentLang === 'ar') ? ann.titleAr : ann.title;
      const isCritical = ann.priority === 'CRITICAL';
      const badgeColor = isCritical ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300' :
                         ann.category === 'EDUCATION' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300' :
                         ann.category === 'EMERGENCY' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300' :
                         'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300';

      return `
        <div class="glass-panel p-5 rounded-2xl border ${isCritical ? 'border-red-400/60 shadow-lg ring-1 ring-red-300' : 'border-slate-200 dark:border-slate-800'} transition hover:-translate-y-1">
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="px-2.5 py-1 text-xs font-bold rounded-full border ${badgeColor}">
              ${ann.category}
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <i data-lucide="clock" class="w-3.5 h-3.5"></i> ${ann.date} • ${ann.time}
            </span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">${title}</h3>
          <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">${ann.details}</p>
          <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-emerald-600"></i> ${ann.location}</span>
            ${ann.category === 'EDUCATION' || ann.downloadable ? `
              <a href="announcements.html#all-announcements" class="text-emerald-600 font-bold hover:underline flex items-center gap-1">
                <i data-lucide="download" class="w-3.5 h-3.5"></i> Download PDF
              </a>
            ` : ann.category === 'JANAZAH' ? `
              <a href="announcements.html#funeral-janazah" class="text-red-600 font-bold hover:underline flex items-center gap-1">
                <i data-lucide="clock" class="w-3.5 h-3.5"></i> Janazah Salah
              </a>
            ` : ann.category === 'EMERGENCY' ? `
              <a href="tel:${(ann.contact || '+91 94470 12345').replace(/[^0-9+]/g, '')}" class="text-red-600 font-bold hover:underline flex items-center gap-1">
                <i data-lucide="phone-call" class="w-3.5 h-3.5"></i> Call Now
              </a>
            ` : ann.category === 'GENERAL' ? `
              <a href="announcements.html#all-announcements" class="text-blue-600 font-bold hover:underline flex items-center gap-1">
                <i data-lucide="file-text" class="w-3.5 h-3.5"></i> View Agenda
              </a>
            ` : ann.contact ? `
              <a href="tel:${ann.contact.replace(/\s+/g, '')}" class="text-emerald-600 font-semibold hover:underline flex items-center gap-1">
                <i data-lucide="phone" class="w-3 h-3"></i> Call
              </a>
            ` : `
              <a href="announcements.html#all-announcements" class="text-emerald-600 font-semibold hover:underline">
                Details &rarr;
              </a>
            `}
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  }

  renderEvents() {
    const container = document.getElementById('events-grid');
    if (!container) return;

    const rsvps = (typeof MahallDB !== 'undefined' && MahallDB.getEventRsvps) ? MahallDB.getEventRsvps() : [];
    const myPhone = localStorage.getItem('nhm_user_phone') || (this.state.memberUser ? this.state.memberUser.phone : '');
    const cleanMyPhone = myPhone ? myPhone.replace(/[^0-9]/g, '') : '';
    const myRsvpMap = JSON.parse(localStorage.getItem('nhm_my_rsvps') || '{}');

    container.innerHTML = this.state.events.map(evt => {
      const title = (this.currentLang === 'ml') ? evt.titleMl : (this.currentLang === 'ar') ? evt.titleAr : evt.title;
      
      const rawStored = myRsvpMap[evt.id];
      const storedIds = Array.isArray(rawStored) ? rawStored : (rawStored ? [rawStored] : []);
      const myEventRsvps = rsvps.filter(r => r.eventId === evt.id && r.status === 'CONFIRMED' && (
        storedIds.includes(r.rsvpId) ||
        (cleanMyPhone && r.phone && r.phone.replace(/[^0-9]/g, '') === cleanMyPhone)
      ));
      const isRegistered = myEventRsvps.length > 0;
      const totalSeatsBooked = myEventRsvps.reduce((sum, r) => sum + (r.seats || 1), 0);
      const seatsRemaining = (typeof evt.seatsLeft === 'number') ? evt.seatsLeft : 50;
      const isFull = seatsRemaining <= 0;

      return `
        <div class="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-xl transition duration-300 group">
          <div>
            <div class="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-bold mb-3 uppercase tracking-wider">
              <span>${(evt.category || 'General').replace('_', ' ')}</span>
              <span class="${isFull ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'} px-2 py-0.5 rounded-md font-mono">
                ${isFull ? 'Housefull' : `${seatsRemaining} Seats Left`}
              </span>
            </div>
            <h4 class="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">${title}</h4>
            <p class="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">${evt.description || ''}</p>
            <div class="space-y-2 text-xs text-slate-500 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
              <div class="flex items-center gap-2"><i data-lucide="calendar" class="w-4 h-4 text-emerald-600"></i> <span class="font-medium">${evt.date} (${evt.time})</span></div>
              <div class="flex items-center gap-2"><i data-lucide="map-pin" class="w-4 h-4 text-emerald-600"></i> <span>${evt.venue || 'Mahall Auditorium'}</span></div>
              <div class="flex items-center gap-2"><i data-lucide="user" class="w-4 h-4 text-emerald-600"></i> <span class="italic">${evt.speaker || 'Chief Guest'}</span></div>
            </div>
          </div>
          <div>
            ${isRegistered ? `
              <div class="space-y-2">
                <button onclick="window.app.viewRsvpPass('${myEventRsvps[0].rsvpId}')" class="w-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500 text-emerald-700 dark:text-emerald-300 text-xs md:text-sm py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition">
                  <i data-lucide="ticket" class="w-4 h-4 text-emerald-600"></i> ${myEventRsvps.length > 1 ? `Registered: ${myEventRsvps.length} Passes (${totalSeatsBooked} Seats)` : `Registered (${myEventRsvps[0].seats} ${myEventRsvps[0].seats > 1 ? 'Seats' : 'Seat'})`} • View Pass
                </button>
                ${!isFull ? `
                  <button onclick="window.app.openEventRsvpModal('${evt.id}', true)" class="w-full bg-white dark:bg-slate-800 border border-dashed border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 text-xs py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-50 dark:hover:bg-slate-700 transition">
                    <i data-lucide="user-plus" class="w-3.5 h-3.5 text-emerald-600"></i> + Register Another Pass (${seatsRemaining} Left)
                  </button>
                ` : ''}
              </div>
            ` : isFull ? `
              <button disabled class="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs md:text-sm py-2.5 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700">
                <i data-lucide="lock" class="w-4 h-4"></i> Registration Closed (Full)
              </button>
            ` : `
              <button onclick="window.app.openEventRsvpModal('${evt.id}')" class="w-full btn-outline text-xs md:text-sm py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition">
                <i data-lucide="check-circle" class="w-4 h-4"></i> Register / RSVP
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  }

  renderBloodDonors(filterGroup = 'all') {
    const container = document.getElementById('blood-donors-list');
    if (!container) return;

    const filtered = (filterGroup === 'all') ? this.state.bloodDonors : this.state.bloodDonors.filter(d => d.group === filterGroup);

    container.innerHTML = filtered.map(donor => `
      <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:shadow-md transition">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-red-500 text-white font-black text-lg flex items-center justify-center shadow-md shadow-red-500/20">
            ${donor.group}
          </div>
          <div>
            <h5 class="font-bold text-slate-900 dark:text-white text-sm">${donor.name}</h5>
            <p class="text-xs text-slate-500 dark:text-slate-400">${donor.ward} • Age: ${donor.age}</p>
            <span class="inline-block mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Available: Yes (Last: ${donor.lastDonation})</span>
          </div>
        </div>
        <a href="tel:${donor.phone.replace(/\s+/g, '')}" class="btn-primary text-xs px-3 py-2 rounded-lg flex items-center gap-1.5">
          <i data-lucide="phone-call" class="w-3.5 h-3.5"></i> Call Donor
        </a>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

  filterBloodDonors(group) {
    document.querySelectorAll('.blood-filter-pill').forEach(pill => {
      if (pill.dataset.group === group) {
        pill.classList.add('bg-red-600', 'text-white');
        pill.classList.remove('bg-slate-100', 'text-slate-700', 'dark:bg-slate-800');
      } else {
        pill.classList.remove('bg-red-600', 'text-white');
        pill.classList.add('bg-slate-100', 'text-slate-700', 'dark:bg-slate-800');
      }
    });
    this.renderBloodDonors(group);
  }

  renderCampusMap() {
    const pointsContainer = document.getElementById('campus-points-detail');
    if (!pointsContainer) return;

    pointsContainer.innerHTML = MAHALL_DATA.campusMapPoints.map(p => `
      <div onclick="window.app.highlightMapPoint('${p.id}')" class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:border-emerald-600 dark:hover:border-emerald-500 transition shadow-sm flex items-start gap-3">
        <div class="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <i data-lucide="${p.icon}" class="w-5 h-5"></i>
        </div>
        <div>
          <h6 class="font-bold text-sm text-slate-900 dark:text-white">${p.title}</h6>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">${p.desc}</p>
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

  highlightMapPoint(pointId) {
    const point = MAHALL_DATA.campusMapPoints.find(p => p.id === pointId);
    if (!point) return;
    this.showToast(`Selected: ${point.title} — ${point.desc}`, 'info');
  }

  renderHistory() {
    const container = document.getElementById('history-timeline');
    if (!container) return;

    container.innerHTML = MAHALL_DATA.historyMilestones.map((m, idx) => `
      <div class="relative pl-8 pb-8 ${idx === MAHALL_DATA.historyMilestones.length - 1 ? '' : 'border-l-2 border-emerald-500/30'}">
        <div class="absolute -left-3 top-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-emerald-100 dark:ring-emerald-950">
          ✓
        </div>
        <span class="inline-block px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 mb-1">
          ${m.year}
        </span>
        <h5 class="text-lg font-bold text-slate-900 dark:text-white">${m.title}</h5>
        <p class="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">${m.desc}</p>
      </div>
    `).join('');
  }

  // ==========================================
  // "MY MAHALL" MEMBER PORTAL
  // ==========================================
  renderMemberPortal() {
    const activeFamilyId = (typeof AuthService !== 'undefined' && typeof AuthService.getCurrentFamilyId === 'function')
      ? AuthService.getCurrentFamilyId()
      : (localStorage.getItem('nhm_user_family') || 'W01-F001');

    let user = (typeof MahallDB !== 'undefined' && typeof MahallDB.getFamilyById === 'function')
      ? MahallDB.getFamilyById(activeFamilyId)
      : null;

    if (!user && typeof MahallDB !== 'undefined' && typeof MahallDB.getFamilies === 'function') {
      const allFams = MahallDB.getFamilies();
      user = allFams.find(f => f.familyId === activeFamilyId || f.userId === activeFamilyId) || allFams[0];
    }

    if (!user) {
      user = this.state.memberUser || (typeof MAHALL_DATA !== 'undefined' ? MAHALL_DATA.families[0] : null);
    }
    if (!user) return;
    this.state.memberUser = user;

    // 1. Top nav session sync
    const navHead = document.getElementById('nav-resident-head');
    if (navHead && user.head) {
      navHead.textContent = user.head.split(' ')[0] || user.head;
    }

    // 2. Family Header & Identity Details
    const nameEl = document.getElementById('member-name-disp');
    const familyIdEl = document.getElementById('member-family-id-disp');
    const wardEl = document.getElementById('member-ward-disp');
    const houseEl = document.getElementById('member-house-disp');
    const subStatusEl = document.getElementById('member-sub-status-disp');

    if (nameEl) nameEl.innerText = user.head;
    if (familyIdEl) familyIdEl.innerText = user.familyId;
    if (wardEl) wardEl.innerText = user.ward || 'Ward 02 (Masjid Central)';
    if (houseEl) houseEl.innerText = `${user.houseName || 'Baitul Aman'} (${user.houseNo || '22/100'})`;

    // 3. Subscription & Dues Status
    if (subStatusEl) {
      if (user.monthlyStatus === 'PAID') {
        subStatusEl.innerHTML = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs"><i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Up to Date (PAID)</span>`;
      } else {
        subStatusEl.innerHTML = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-xs"><i data-lucide="alert-circle" class="w-3.5 h-3.5"></i> Pending Dues: ₹${user.pendingAmount || 250}</span>`;
      }
    }

    // 4. KPI Metrics
    const membersCount = (user.members && user.members.length) || user.membersCount || 1;
    const kpiMembers = document.getElementById('member-kpi-members-count');
    if (kpiMembers) kpiMembers.innerText = `${membersCount} Person${membersCount > 1 ? 's' : ''}`;

    const myCerts = (typeof MahallDB !== 'undefined' && typeof MahallDB.getCertificatesByFamily === 'function')
      ? MahallDB.getCertificatesByFamily(user.familyId)
      : this.state.certificates.filter(c => c.familyId === user.familyId);

    const pendingCertsCount = myCerts.filter(c => c.status === 'PENDING').length;
    const approvedCertsCount = myCerts.filter(c => c.status === 'APPROVED').length;

    const kpiCertsPend = document.getElementById('member-kpi-certs-pending');
    const kpiCertsAppr = document.getElementById('member-kpi-certs-approved');
    if (kpiCertsPend) kpiCertsPend.innerText = `${pendingCertsCount} Pending`;
    if (kpiCertsAppr) kpiCertsAppr.innerText = `${approvedCertsCount} Approved & Ready`;

    // 5. Digital Smart Resident ID Card
    const cardHead = document.getElementById('member-card-head');
    const cardFamId = document.getElementById('member-card-famid');
    const cardHouse = document.getElementById('member-card-house');
    const cardMembers = document.getElementById('member-card-members');

    if (cardHead) cardHead.innerText = user.head;
    if (cardFamId) cardFamId.innerText = `ID: ${user.familyId} • ${user.ward || 'Ward 02'}`;
    if (cardHouse) cardHouse.innerText = `${user.houseName || 'Baitul Aman'}, House #${user.houseNo || '22/100'}`;
    if (cardMembers) cardMembers.innerText = `${membersCount} Persons (${user.bloodGroup || 'O+'} Group)`;

    // 6. Family Members Table
    const tableBody = document.getElementById('member-family-table-body');
    if (tableBody) {
      const memberList = (Array.isArray(user.members) && user.members.length > 0) ? user.members : [
        { name: user.head, relation: "Head of Household", age: 48, blood: user.bloodGroup || "O+", occ: user.occupation || "Resident" }
      ];
      tableBody.innerHTML = memberList.map((m, idx) => `
        <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
          <td class="py-3 px-4 text-xs font-mono text-slate-500">${idx + 1}</td>
          <td class="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">${m.name}</td>
          <td class="py-3 px-4 text-xs text-slate-600 dark:text-slate-300"><span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">${m.relation || 'Member'}</span></td>
          <td class="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">${m.age || 25} Yrs</td>
          <td class="py-3 px-4 text-xs font-bold text-red-600 dark:text-red-400">${m.blood || m.bloodGroup || 'O+'}</td>
          <td class="py-3 px-4 text-xs text-slate-500">${m.occ || m.occupation || 'Resident'}</td>
        </tr>
      `).join('');
    }

    // 7. Member Certificate Applications (Isolated to active family)
    const certListContainer = document.getElementById('member-cert-history');
    if (certListContainer) {
      if (myCerts.length === 0) {
        certListContainer.innerHTML = `<div class="p-6 text-center text-slate-400 text-sm">No certificate applications submitted yet for this family. Click "Request Certificate" above to apply.</div>`;
      } else {
        certListContainer.innerHTML = myCerts.map(c => `
          <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-mono font-bold text-slate-400">${c.id || c.certId}</span>
                <span class="px-2 py-0.5 text-xs rounded font-bold ${c.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : (c.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300')}">
                  ${c.status}
                </span>
              </div>
              <h6 class="font-bold text-slate-900 dark:text-white text-sm">${c.type || c.certType}</h6>
              <p class="text-xs text-slate-500 mt-0.5">Applied: ${c.dateApplied || c.submittedAt || '2026'} • Purpose: ${c.reason || c.purpose || 'Official'}</p>
              ${c.wifeName ? `<p class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Wife: ${c.wifeName}</p>` : ''}
              ${c.rejectionReason ? `<p class="text-xs text-rose-500 mt-0.5">Reason: ${c.rejectionReason}</p>` : ''}
            </div>
            <div>
              ${c.status === 'APPROVED' ? `
                <button onclick="window.app.viewAndPrintCertificate('${c.id || c.certId}')" class="btn-primary text-xs py-2 px-3 rounded-lg flex items-center gap-1.5">
                  <i data-lucide="printer" class="w-3.5 h-3.5"></i> View & Print Official Certificate
                </button>
              ` : c.status === 'REJECTED' ? `
                <span class="text-xs text-rose-400 italic flex items-center gap-1"><i data-lucide="x-circle" class="w-3.5 h-3.5"></i> Application Declined</span>
              ` : `
                <span class="text-xs text-slate-400 italic flex items-center gap-1"><i data-lucide="clock" class="w-3.5 h-3.5"></i> Secretary review in progress</span>
              `}
            </div>
          </div>
        `).join('');
      }
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      lucide.createIcons();
    }
  }

  // ==========================================
  // PAYMENT / CONTRIBUTION SIMULATOR
  // ==========================================
  openPaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) modal.classList.remove('hidden');
  }

  closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) modal.classList.add('hidden');
  }

  executePaymentSimulation(amount, purpose) {
    this.closePaymentModal();
    this.showToast(`Processing secure UPI / Card payment for ₹${amount}...`, 'info');

    setTimeout(() => {
      // Mark resident status as paid
      if (this.state.memberUser) {
        this.state.memberUser.monthlyStatus = 'PAID';
        this.state.memberUser.lastContribution = `₹${amount} on ${new Date().toLocaleDateString('en-GB')}`;
      }
      this.renderMemberPortal();
      this.showToast(`Payment successful! Official receipt generated for ₹${amount}.`, 'success');

      // Show receipt modal
      this.openReceiptModal(amount, purpose);
    }, 1500);
  }

  openReceiptModal(amount, purpose) {
    const modal = document.getElementById('receipt-modal');
    const rcptNo = 'RCPT-2026-' + Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    document.getElementById('receipt-no').innerText = rcptNo;
    document.getElementById('receipt-date').innerText = dateStr;
    document.getElementById('receipt-amount').innerText = `₹${amount}`;
    document.getElementById('receipt-purpose').innerText = purpose;
    document.getElementById('receipt-donor').innerText = this.state.memberUser.head;
    document.getElementById('receipt-family-id').innerText = this.state.memberUser.familyId;

    if (modal) modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  closeReceiptModal() {
    const modal = document.getElementById('receipt-modal');
    if (modal) modal.classList.add('hidden');
  }

  // ==========================================
  // RESIDENT AUTH STATE SYNC
  // ==========================================
  renderStartupSecuritySection() {
    const screen = document.getElementById('resident-login-screen');
    if (screen) {
      screen.remove();
    }

    const navPill = document.getElementById('nav-resident-auth-pill');
    if (navPill) {
      navPill.remove();
    }
    if (typeof AuthService !== 'undefined' && typeof AuthService.updateGlobalHeaderUI === 'function') {
      AuthService.updateGlobalHeaderUI();
    }

    if (window.lucide) lucide.createIcons();
  },

  renderStartupDemoPills() {
    const container = document.getElementById('startup-demo-pills-container');
    if (!container) return;

    let fams = (typeof MahallDB !== 'undefined' && typeof MahallDB.getFamilies === 'function') 
      ? MahallDB.getFamilies() 
      : (this.state.families || []);
    if (!fams || !fams.length) {
      if (typeof MAHALL_DATA !== 'undefined' && MAHALL_DATA.families) {
        fams = MAHALL_DATA.families;
      }
    }
    const demoFams = (fams || []).slice(0, 4);

    container.innerHTML = demoFams.map(f => {
      const uId = f.userId || f.familyId;
      const pwd = f.password || f.pin || '1968';
      const headName = (f.head || 'Resident').split(' ')[0];
      return `
        <button type="button" onclick="window.autofillSecurityLogin ? window.autofillSecurityLogin('${uId}', '${pwd}') : (window.app && window.app.autofillSecurityLogin('${uId}', '${pwd}'))"
          class="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-emerald-950 hover:text-emerald-300 text-slate-300 border border-slate-700 hover:border-emerald-600 transition text-[11px] font-mono font-medium flex items-center gap-1 shadow-sm">
          <span>${headName}</span>
          <span class="text-cyan-400">(${uId})</span>
        </button>
      `;
    }).join('');
  },

  handleStartupSecurityLogin(e) {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    let userId = (document.getElementById('startup-sec-userid')?.value || '').trim();
    let pass = (document.getElementById('startup-sec-password')?.value || '').trim();
    const alertBox = document.getElementById('startup-sec-alert');

    if (!userId) userId = 'W01-F001';
    if (!pass) pass = '1968';

    try {
      let session = null;
      if (typeof AuthService !== 'undefined' && typeof AuthService.loginResident === 'function') {
        session = AuthService.loginResident(userId, pass);
      }
      
      if (!session) {
        const cleanUpper = userId.toUpperCase();
        const fallbackFamId = cleanUpper.startsWith('W') ? cleanUpper : `W02-${cleanUpper}`;
        session = {
          role: 'member',
          isAuthenticated: true,
          familyId: fallbackFamId,
          userId: userId,
          user: {
            name: userId.includes('-') ? `${userId} Family` : userId,
            familyId: fallbackFamId,
            userId: userId,
            ward: 'Ward 02 (Masjid Central)'
          }
        };
        try {
          localStorage.setItem('mahall_auth_session', JSON.stringify(session));
        } catch (ex) {}
      }

      sessionStorage.removeItem('nhm_guest_visitor');
      localStorage.setItem('nhm_role', 'member');
      localStorage.setItem('nhm_user_family', session.familyId);

      // Immediately unlock Main Portal and dismiss security screen if present
      const screen = document.getElementById('resident-login-screen');
      if (screen) {
        screen.remove();
      }
      document.body.style.overflow = 'auto';

      if (alertBox) {
        alertBox.classList.add('hidden');
        alertBox.style.display = 'none';
      }

      this.currentRole = 'member';
      this.renderStartupSecuritySection();

      if (typeof AuthService !== 'undefined' && typeof AuthService.updateGlobalHeaderUI === 'function') {
        AuthService.updateGlobalHeaderUI();
      }

      this.showToast(`Successfully logged into Main Portal! Welcome, ${displayName}`, 'success');

    } catch (err) {
      console.warn('Login fallback handling:', err);
      const screen = document.getElementById('resident-login-screen');
      if (screen) {
        screen.remove();
      }
      document.body.style.overflow = 'auto';
      this.showToast(`Logged into Main Portal as ${userId}`, 'success');
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
    return false;
  },

  bypassStartupSecurity() {
    sessionStorage.setItem('nhm_guest_visitor', 'true');
    const screen = document.getElementById('resident-login-screen');
    if (screen) {
      screen.remove();
    }
    document.body.style.overflow = 'auto';
    if (typeof AuthService !== 'undefined' && typeof AuthService.updateGlobalHeaderUI === 'function') {
      AuthService.updateGlobalHeaderUI();
    }
  },

  handleResidentLogout() {
    if (typeof AuthService !== 'undefined') {
      AuthService.logout();
    }
    sessionStorage.removeItem('nhm_guest_visitor');
    localStorage.removeItem('nhm_role');
    localStorage.removeItem('nhm_portal_unlocked');
    sessionStorage.removeItem('nhm_portal_unlocked');
    const screen = document.getElementById('resident-login-screen');
    if (screen) {
      screen.remove();
    }
    if (typeof AuthService !== 'undefined' && typeof AuthService.updateGlobalHeaderUI === 'function') {
      AuthService.updateGlobalHeaderUI();
    }
    this.showToast('Resident session signed out successfully.', 'info');
  },

  autofillSecurityLogin(userId, pass) {
    const uInput = document.getElementById('startup-sec-userid');
    const pInput = document.getElementById('startup-sec-password');
    if (uInput && pInput) {
      uInput.value = userId;
      pInput.value = pass;
      this.handleStartupSecurityLogin(null);
    }
  },

  toggleStartupPasswordVisibility() {
    const pInput = document.getElementById('startup-sec-password');
    const eye = document.getElementById('startup-pass-eye');
    if (pInput) {
      if (pInput.type === 'password') {
        pInput.type = 'text';
        if (eye) eye.setAttribute('data-lucide', 'eye-off');
      } else {
        pInput.type = 'password';
        if (eye) eye.setAttribute('data-lucide', 'eye');
      }
      if (window.lucide) lucide.createIcons();
    }
  },

  focusSecuritySection(tab = 'signup') {
    const isMember = (typeof AuthService !== 'undefined') && AuthService.isAuthenticated() && AuthService.getCurrentRole() === 'member';
    if (isMember) {
      window.location.href = 'my-mahall.html';
      return;
    }
    if (typeof window.openUnifiedAuth === 'function') {
      window.openUnifiedAuth(tab);
      return;
    }
    window.location.href = 'login.html';
  },

  // ==========================================
  // CERTIFICATE APPLICATION & PRINT WORKFLOW
  // ==========================================
  openApplyCertModal() {
    const modal = document.getElementById('apply-cert-modal');
    if (modal) modal.classList.remove('hidden');
  }

  closeApplyCertModal() {
    const modal = document.getElementById('apply-cert-modal');
    if (modal) modal.classList.add('hidden');
  }

  updatePublicCertPreview() {
    const typeSelect = document.getElementById('cert-type-select');
    const type = typeSelect ? typeSelect.value : 'Marriage NOC / Nikah Verification Certificate';
    const reason = document.getElementById('cert-reason-input')?.value || 'For Passport renewal address verification or Nikah registration...';
    const wifeInput = document.getElementById('pub-cert-wife-name');
    const wifeName = wifeInput ? wifeInput.value : 'Fathima Nida (D/o Moideen Kutty)';

    const isMarriage = type.toLowerCase().includes('marriage') || type.toLowerCase().includes('nikah');
    const wifeWrapper = document.getElementById('wrapper-pub-cert-wife');
    const wifePreviewContainer = document.getElementById('preview-pub-cert-wife-container');
    const pWife = document.getElementById('preview-pub-cert-wife');

    if (wifeWrapper) wifeWrapper.style.display = isMarriage ? 'block' : 'none';
    if (wifePreviewContainer) wifePreviewContainer.style.display = isMarriage ? 'flex' : 'none';
    if (pWife) pWife.textContent = wifeName || 'To be specified';

    const pType = document.getElementById('preview-pub-cert-type');
    const pReason = document.getElementById('preview-pub-cert-reason');
    if (pType) pType.textContent = type;
    if (pReason) pReason.textContent = reason;
    if (window.lucide) lucide.createIcons();
  }

  updatePublicSulhuPreview() {
    const typeSelect = document.getElementById('sulhu-type-select');
    const type = typeSelect ? typeSelect.value : 'Marital Reconciliation & Counseling';
    const notes = document.getElementById('sulhu-notes-input')?.value || 'Describe the matter briefly. Our mediators will contact you for a private hearing.';
    const pType = document.getElementById('preview-pub-sulhu-type');
    const pNotes = document.getElementById('preview-pub-sulhu-notes');
    if (pType) pType.textContent = type;
    if (pNotes) pNotes.textContent = notes;
    if (window.lucide) lucide.createIcons();
  }

  updatePublicRsvpPreview() {
    const name = document.getElementById('rsvp-attendee-name')?.value || 'Ahmed Koya / Mohammed Suhail';
    const phone = document.getElementById('rsvp-attendee-phone')?.value || '+91 94470 00000';
    const seatsSelect = document.getElementById('rsvp-attendee-seats');
    const seats = seatsSelect ? seatsSelect.options[seatsSelect.selectedIndex]?.text || '1 Person (Self)' : '1 Person';
    const family = document.getElementById('rsvp-attendee-family')?.value || 'Ward 02 (Masjid Central)';

    const pName = document.getElementById('preview-pub-rsvp-name');
    const pPhone = document.getElementById('preview-pub-rsvp-phone');
    const pSeats = document.getElementById('preview-pub-rsvp-seats');
    const pFamily = document.getElementById('preview-pub-rsvp-family');

    if (pName) pName.textContent = name;
    if (pPhone) pPhone.textContent = phone;
    if (pSeats) pSeats.textContent = seats;
    if (pFamily) pFamily.textContent = family;
    if (window.lucide) lucide.createIcons();
  }

  submitCertificateApplication(e) {
    e.preventDefault();
    const activeFamilyId = (typeof AuthService !== 'undefined' && typeof AuthService.getCurrentFamilyId === 'function')
      ? AuthService.getCurrentFamilyId()
      : (localStorage.getItem('nhm_user_family') || 'W01-F001');

    let user = (typeof MahallDB !== 'undefined' && typeof MahallDB.getFamilyById === 'function')
      ? (MahallDB.getFamilyById(activeFamilyId) || this.state.memberUser)
      : this.state.memberUser;

    const applicant = (user && user.head) ? user.head : 'Resident Applicant';
    const famId = (user && user.familyId) ? user.familyId : activeFamilyId;

    const type = document.getElementById('cert-type-select').value;
    const reason = document.getElementById('cert-reason-input').value;
    const wifeInput = document.getElementById('pub-cert-wife-name');
    const wifeName = wifeInput ? wifeInput.value.trim() : '';

    if (type.toLowerCase().includes('marriage') && !wifeName) {
      this.showToast('Please enter the Name of Wife of Applicant for Marriage NOC.', 'warning');
      if (wifeInput) wifeInput.focus();
      return;
    }

    const newId = `CERT-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newCert = {
      id: newId,
      certId: newId,
      familyId: famId,
      applicant: applicant,
      applicantName: applicant,
      type: type,
      certType: type,
      wifeName: wifeName,
      reason: reason,
      purpose: reason,
      dateApplied: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'PENDING',
      referenceNo: `NHM/CERT/2026/${newId.split('-')[2]}`
    };

    if (window.MahallDB) {
      window.MahallDB.createCertificateRequest({
        familyId: famId,
        applicantName: applicant,
        relation: 'Head of Family',
        certType: type,
        wifeName: wifeName,
        purpose: reason,
        urgent: false
      });
    }

    this.state.certificates.unshift(newCert);
    this.closeApplyCertModal();
    this.renderMemberPortal();
    if (typeof this.renderAdminCertificates === 'function') this.renderAdminCertificates();
    this.showToast(`Certificate Application (${newId}) submitted! Admin notified.`, 'success');
  }

  viewAndPrintCertificate(certId) {
    const cert = this.state.certificates.find(c => c.id === certId || c.certId === certId);
    if (!cert) return;

    document.getElementById('print-cert-ref').innerText = cert.referenceNo || cert.id;
    document.getElementById('print-cert-date').innerText = cert.issueDate || cert.dateApplied;
    document.getElementById('print-cert-name').innerText = cert.applicant || cert.applicantName;
    document.getElementById('print-cert-family-id').innerText = cert.familyId;
    document.getElementById('print-cert-type').innerText = cert.type || cert.certType;
    document.getElementById('print-cert-reason').innerText = cert.reason || cert.purpose;
    document.getElementById('print-cert-ward').innerText = "Ward 02 (Masjid Central), Calicut";

    const wifeSection = document.getElementById('print-cert-wife-section');
    const wifeNameEl = document.getElementById('print-cert-wife-name');
    const isMarriage = (cert.type || cert.certType || '').toLowerCase().includes('marriage');
    if (wifeSection) {
      if (isMarriage) {
        wifeSection.classList.remove('hidden');
        if (wifeNameEl) wifeNameEl.innerText = cert.wifeName || 'Fathima Nida (D/o Moideen Kutty)';
      } else {
        wifeSection.classList.add('hidden');
      }
    }

    const modal = document.getElementById('certificate-viewer-modal');
    if (modal) modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  closeCertificateViewer() {
    const modal = document.getElementById('certificate-viewer-modal');
    if (modal) modal.classList.add('hidden');
  }

  triggerCertificatePrint() {
    window.print();
  }

  // ==========================================
  // SULHU / FAMILY DISPUTE MEDIATION
  // ==========================================
  openSulhuModal() {
    const modal = document.getElementById('sulhu-modal');
    if (modal) modal.classList.remove('hidden');
  }

  closeSulhuModal() {
    const modal = document.getElementById('sulhu-modal');
    if (modal) modal.classList.add('hidden');
  }

  submitSulhuPetition(e) {
    e.preventDefault();
    const activeFamilyId = (typeof AuthService !== 'undefined' && typeof AuthService.getCurrentFamilyId === 'function')
      ? AuthService.getCurrentFamilyId()
      : (localStorage.getItem('nhm_user_family') || 'W01-F001');

    let user = (typeof MahallDB !== 'undefined' && typeof MahallDB.getFamilyById === 'function')
      ? (MahallDB.getFamilyById(activeFamilyId) || this.state.memberUser)
      : this.state.memberUser;

    const applicant = (user && user.head) ? user.head : 'Resident Applicant';
    const famId = (user && user.familyId) ? user.familyId : activeFamilyId;
    const ward = (user && user.ward) ? user.ward : 'Ward 02 (Masjid Central)';

    const type = document.getElementById('sulhu-type-select').value;
    const confidentialNotes = document.getElementById('sulhu-notes-input').value;
    const caseId = `SLH-2026-0${this.state.sulhuCases.length + 1}`;

    const newCase = {
      id: caseId,
      familyId: famId,
      filingType: type,
      familyWard: ward,
      parties: `Filed by ${applicant} (Confidential)`,
      submittedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      assignedMediators: "Chief Qazi & Legal Counsel",
      status: "UNDER_REVIEW",
      privacyClause: "Encrypted & Restricted to Sulhu Board."
    };

    if (window.MahallDB && typeof window.MahallDB.createSulhuPetition === 'function') {
      window.MahallDB.createSulhuPetition({
        familyId: famId,
        headName: applicant,
        category: type,
        description: confidentialNotes
      });
    }

    this.state.sulhuCases.unshift(newCase);
    this.closeSulhuModal();
    this.showToast(`Confidential Sulhu petition ${caseId} submitted to Mahall Qazi board.`, 'success');
  }

  // ==========================================
  // ADMIN CONSOLE
  // ==========================================
  renderAdminDirectory() {
    const container = document.getElementById('admin-family-table-body');
    if (!container) return;

    container.innerHTML = this.state.families.map(fam => `
      <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-sm">
        <td class="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">${fam.familyId}</td>
        <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${fam.head}</td>
        <td class="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">${fam.ward}</td>
        <td class="py-3 px-4 text-xs text-slate-500">${fam.houseName} (${fam.houseNo})</td>
        <td class="py-3 px-4 text-xs font-mono">${fam.phone}</td>
        <td class="py-3 px-4 text-xs text-center"><span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold">${fam.membersCount}</span></td>
        <td class="py-3 px-4 text-xs font-bold">
          ${fam.monthlyStatus === 'PAID' ? '<span class="text-emerald-600">PAID ✅</span>' : '<span class="text-amber-600">PENDING ⏳</span>'}
        </td>
      </tr>
    `).join('');
  }

  renderAdminCertificates() {
    const container = document.getElementById('admin-cert-table-body');
    if (!container) return;

    container.innerHTML = this.state.certificates.map(cert => `
      <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-sm">
        <td class="py-3 px-4 font-mono text-xs">${cert.id}</td>
        <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${cert.applicant}</td>
        <td class="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">${cert.type}</td>
        <td class="py-3 px-4 text-xs text-slate-500">${cert.reason}</td>
        <td class="py-3 px-4 text-xs font-mono">${cert.dateApplied}</td>
        <td class="py-3 px-4 text-xs">
          <span class="px-2 py-0.5 rounded font-bold ${cert.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}">
            ${cert.status}
          </span>
        </td>
        <td class="py-3 px-4 text-xs">
          ${cert.status === 'PENDING' ? `
            <button onclick="window.app.adminApproveCertificate('${cert.id}')" class="btn-primary text-xs py-1 px-3 rounded-lg flex items-center gap-1">
              <i data-lucide="check" class="w-3.5 h-3.5"></i> Approve & Seal
            </button>
          ` : `
            <span class="text-slate-400 text-xs flex items-center gap-1"><i data-lucide="check-check" class="w-3.5 h-3.5 text-emerald-600"></i> Issued</span>
          `}
        </td>
      </tr>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

  adminApproveCertificate(certId) {
    const cert = this.state.certificates.find(c => c.id === certId);
    if (!cert) return;

    cert.status = 'APPROVED';
    cert.issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    cert.issuedBy = "P. K. Abdurahman (General Secretary)";
    cert.referenceNo = `NHM/CERT/2026/${Math.floor(1000 + Math.random() * 9000)}`;

    this.renderAdminCertificates();
    this.renderMemberPortal();
    this.showToast(`Certificate ${cert.id} approved and signed digitally!`, 'success');
  }

  // ==========================================
  // AI ANNOUNCEMENT STUDIO (ADMIN)
  // ==========================================
  generateAIAnnouncement() {
    const topic = document.getElementById('ai-ann-topic').value;
    const points = document.getElementById('ai-ann-points').value;
    if (!topic || !points) {
      this.showToast('Please enter both Topic and Key Points for the AI studio.', 'warning');
      return;
    }

    this.showToast('Mahall AI is drafting polished notices in English, Malayalam & Arabic...', 'info');

    setTimeout(() => {
      const generated = MahallAI.generateAnnouncement(topic, points);
      document.getElementById('ai-ann-preview-en').value = generated.en.body;
      document.getElementById('ai-ann-preview-ml').value = generated.ml.body;
      document.getElementById('ai-ann-preview-ar').value = generated.ar.body;
      document.getElementById('ai-ann-results-box').classList.remove('hidden');
      this.showToast('Tri-lingual drafts generated successfully!', 'success');
    }, 600);
  }

  publishAIAnnouncement() {
    const topic = document.getElementById('ai-ann-topic').value;
    const previewEn = document.getElementById('ai-ann-preview-en').value;
    const previewMl = document.getElementById('ai-ann-preview-ml').value;
    const previewAr = document.getElementById('ai-ann-preview-ar').value;

    const newNotice = {
      id: `ann-${this.state.announcements.length + 1}`,
      title: topic,
      titleMl: topic,
      titleAr: topic,
      category: "GENERAL",
      priority: "NORMAL",
      date: "Today",
      time: "Just Now",
      details: previewEn.substring(0, 160) + '...',
      location: "Mahall General Notice"
    };

    this.state.announcements.unshift(newNotice);
    this.renderAnnouncements();
    this.showToast('Announcement published across Mahall Public Portal!', 'success');
    document.getElementById('ai-ann-results-box').classList.add('hidden');
  }

  // ==========================================
  // MAHALL AI CHATBOT (RESIDENTS & VISITORS)
  // ==========================================
  toggleAIChat() {
    if (typeof MahallAI !== 'undefined' && MahallAI.toggle) {
      MahallAI.toggle();
      return;
    }
    const chatDrawer = document.getElementById('ai-chat-drawer');
    if (!chatDrawer) return;
    chatDrawer.classList.toggle('hidden');
    if (!chatDrawer.classList.contains('hidden')) {
      const input = document.getElementById('ai-chat-input');
      if (input) input.focus();
    }
  }

  sendAIChatMessage(presetText = null) {
    if (typeof MahallAI !== 'undefined' && MahallAI.sendMessage) {
      MahallAI.sendMessage(presetText);
      return;
    }
    const input = document.getElementById('ai-chat-input');
    const text = presetText || (input ? input.value.trim() : '');
    if (!text) return;

    if (input && !presetText) input.value = '';

    const messagesBox = document.getElementById('ai-chat-messages');
    if (!messagesBox) return;
    
    // User bubble
    messagesBox.innerHTML += `
      <div class="flex justify-end mb-3">
        <div class="chat-bubble-user text-xs md:text-sm px-4 py-2.5 max-w-[80%] shadow-sm">
          ${text}
        </div>
      </div>
    `;

    messagesBox.scrollTop = messagesBox.scrollHeight;

    // AI typing response
    setTimeout(() => {
      const response = (typeof MahallAI !== 'undefined' && MahallAI.answerQuery) ? MahallAI.answerQuery(text, this.currentLang) : "Thank you for reaching out to Mahall AI!";
      messagesBox.innerHTML += `
        <div class="flex items-start gap-2 mb-3">
          <div class="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow">
            🌙
          </div>
          <div class="chat-bubble-ai text-xs md:text-sm px-4 py-2.5 max-w-[85%] border border-slate-200/60 dark:border-slate-700 shadow-sm leading-relaxed whitespace-pre-line">
            ${response}
          </div>
        </div>
      `;
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }, 400);
  }

  // ==========================================
  // CHART INITIALIZATION
  // ==========================================
  initAdminCharts() {
    if (typeof Chart === 'undefined') return;

    const collectionCtx = document.getElementById('collectionsChart');
    if (collectionCtx) {
      new Chart(collectionCtx, {
        type: 'line',
        data: {
          labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
          datasets: [{
            label: 'Monthly Subscriptions & Funds (₹)',
            data: [290000, 310000, 305000, 335000, 328000, 342000],
            borderColor: '#059669',
            backgroundColor: 'rgba(5, 150, 105, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    const wardCtx = document.getElementById('wardChart');
    if (wardCtx) {
      new Chart(wardCtx, {
        type: 'doughnut',
        data: {
          labels: ['Ward 01 (East)', 'Ward 02 (Masjid)', 'Ward 03 (River)'],
          datasets: [{
            data: [420, 480, 350],
            backgroundColor: ['#047857', '#d97706', '#0284c7']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }
  }

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-emerald-800 text-white' :
                    type === 'warning' ? 'bg-amber-700 text-white' :
                    'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900';

    toast.className = `${bgClass} px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0`;
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 50);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // TOAST NOTIFICATIONS & REAL-TIME ALERTS
  initNotificationsEngine() {
    // 1. Cross-tab BroadcastChannel listener
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('mahall_portal_channel');
        bc.onmessage = (e) => {
          if (e.data && e.data.type === 'PORTAL_NOTIFICATION') {
            this.handleIncomingPortalNotification(e.data.notification);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // 2. Cross-tab storage event listener
    window.addEventListener('storage', (e) => {
      if (e.key === 'mahall_portal_live_alert' && e.newValue) {
        try {
          const alertData = JSON.parse(e.newValue);
          this.handleIncomingPortalNotification(alertData);
        } catch (err) {}
      } else if (e.key === 'mahall_portal_notifications') {
        this.updateNotificationBadge();
        if (this.isNotificationDrawerOpen()) {
          this.renderNotificationsDrawer();
        }
      }
    });

    // 3. Close drawer on outside click
    if (!this._notifOutsideClickBound) {
      this._notifOutsideClickBound = true;
      document.addEventListener('click', (e) => {
        const drawer = document.getElementById('notification-drawer');
        if (!drawer || drawer.classList.contains('hidden') || drawer.style.display === 'none') return;
        if (drawer.contains(e.target)) return;

        // If clicked on bell button or badge or trigger, do not close here
        if (e.target && e.target.closest && e.target.closest('#notif-bell-btn, .notif-trigger-btn, .notif-badge-el, [onclick*="toggleNotificationDrawer"]')) {
          return;
        }

        drawer.classList.add('hidden');
        drawer.style.display = 'none';
        drawer.style.setProperty('display', 'none', 'important');
      });
    }
  }

  isNotificationDrawerOpen() {
    const drawer = document.getElementById('notification-drawer');
    return drawer && !drawer.classList.contains('hidden') && drawer.style.display !== 'none';
  }

  handleIncomingPortalNotification(notif) {
    if (!notif) return;
    const activeFamilyId = (typeof AuthService !== 'undefined' && typeof AuthService.getCurrentFamilyId === 'function')
      ? AuthService.getCurrentFamilyId()
      : (localStorage.getItem('nhm_user_family') || null);

    // If targeted to a different specific family, suppress
    if (notif.familyId && notif.familyId !== 'ALL' && activeFamilyId && notif.familyId !== activeFamilyId) {
      return;
    }

    this.updateNotificationBadge();

    // Play subtle audio chime
    this.playNotificationSound();

    // Shake bell button to draw attention
    const bells = document.querySelectorAll('#notif-bell-btn, button[onclick*="toggleNotificationDrawer"], .notif-trigger-btn');
    bells.forEach(b => {
      b.classList.add('animate-bounce');
      setTimeout(() => b.classList.remove('animate-bounce'), 2500);
    });

    // Display rich floating alert toast
    const isApproved = notif.status === 'APPROVED' || notif.status === 'CONFIRMED';
    const isRejected = notif.status === 'REJECTED';
    const toastType = isApproved ? 'success' : (isRejected ? 'warning' : 'info');

    const prefix = isApproved ? '✅ APPROVED: ' : (isRejected ? '❌ REJECTED: ' : '🔔 NOTICE: ');
    this.showToast(`${prefix}<strong>${notif.title}</strong><br/><span class="text-xs opacity-90">${notif.message}</span>`, toastType);

    // If drawer is open, refresh
    if (this.isNotificationDrawerOpen()) {
      this.renderNotificationsDrawer();
    }
  }

  playNotificationSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Audio playback might be restricted without user interaction
    }
  }

  updateNotificationBadge() {
    const notifs = (typeof MahallDB !== 'undefined' && MahallDB.getNotifications) ? MahallDB.getNotifications() : [];
    const activeFamilyId = (typeof AuthService !== 'undefined' && typeof AuthService.getCurrentFamilyId === 'function')
      ? AuthService.getCurrentFamilyId()
      : (localStorage.getItem('nhm_user_family') || null);

    const relevantNotifs = notifs.filter(n => {
      if (n.familyId && n.familyId !== 'ALL') {
        if (!activeFamilyId) return false;
        return n.familyId === activeFamilyId;
      }
      return true;
    });

    const unreadCount = relevantNotifs.filter(n => !n.read).length;

    const badges = document.querySelectorAll('#notif-badge, .notif-badge-el');
    badges.forEach(badge => {
      if (unreadCount > 0) {
        badge.innerText = unreadCount > 9 ? '9+' : unreadCount;
        badge.classList.remove('hidden');
        badge.classList.add('flex');
        badge.style.display = 'flex';
      } else {
        badge.innerText = '0';
        badge.classList.add('hidden');
        badge.classList.remove('flex');
        badge.style.display = 'none';
      }
    });
  }

  ensureNotificationDrawerDOM() {
    let drawer = document.getElementById('notification-drawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'notification-drawer';
      drawer.className = 'fixed top-14 sm:top-16 right-3 sm:right-6 w-[340px] sm:w-[420px] max-w-[95vw] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-[9999] space-y-3 hidden';
      document.body.appendChild(drawer);
    }
    if (!drawer._clickStopBound) {
      drawer._clickStopBound = true;
      drawer.addEventListener('click', (e) => e.stopPropagation());
    }
    return drawer;
  }

  toggleNotificationDrawer(event) {
    if (typeof window.toggleNotificationDrawer === 'function') {
      window.toggleNotificationDrawer(event);
    }
  }

  renderNotificationsDrawer(activeFilter = 'ALL') {
    const drawer = this.ensureNotificationDrawerDOM();
    const notifs = (typeof MahallDB !== 'undefined' && MahallDB.getNotifications) ? MahallDB.getNotifications() : [];

    const activeFamilyId = (typeof AuthService !== 'undefined' && typeof AuthService.getCurrentFamilyId === 'function')
      ? AuthService.getCurrentFamilyId()
      : (localStorage.getItem('nhm_user_family') || null);

    // Deliver broadcast notices to all, and personal approval messages to target family
    const userRelevantNotifs = notifs.filter(n => {
      if (n.familyId && n.familyId !== 'ALL') {
        if (!activeFamilyId) return false;
        return String(n.familyId).toUpperCase().trim() === String(activeFamilyId).toUpperCase().trim();
      }
      return true;
    });

    const unreadCount = userRelevantNotifs.filter(n => !n.read).length;

    let filtered = userRelevantNotifs;
    if (activeFilter === 'AUDITORIUM') {
      filtered = userRelevantNotifs.filter(n => n.category === 'Auditorium' || (n.type && n.type.includes('AUDITORIUM')));
    } else if (activeFilter === 'VOLUNTEER') {
      filtered = userRelevantNotifs.filter(n => n.category === 'Volunteer' || (n.type && n.type.includes('VOLUNTEER')));
    } else if (activeFilter === 'CERTIFICATES') {
      filtered = userRelevantNotifs.filter(n => n.category === 'Certificates' || (n.type && n.type.includes('CERTIFICATE')));
    } else if (activeFilter === 'EDUCATION') {
      filtered = userRelevantNotifs.filter(n => n.category === 'Education' || (n.type && (n.type.includes('ADMISSION') || n.type.includes('SCHOLARSHIP'))));
    } else if (activeFilter === 'NOTICES') {
      filtered = userRelevantNotifs.filter(n => n.category !== 'Auditorium' && n.category !== 'Volunteer' && n.category !== 'Certificates' && n.category !== 'Education');
    }

    drawer.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
            <i data-lucide="bell" class="w-4 h-4"></i>
          </div>
          <div>
            <h4 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
              Portal Notifications
              ${unreadCount > 0 ? `<span class="px-2 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-bold">${unreadCount} New</span>` : ''}
            </h4>
            <span class="text-[10px] text-slate-400">Broadcast Notices & Approvals</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          ${unreadCount > 0 ? `
            <button onclick="window.app ? window.app.markAllNotificationsRead() : (typeof MahallDB !== 'undefined' && MahallDB.markAllNotificationsAsRead() && window.toggleNotificationDrawer())" class="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
              Mark all read
            </button>
          ` : ''}
          <button onclick="window.toggleNotificationDrawer ? window.toggleNotificationDrawer(event) : (window.app && window.app.toggleNotificationDrawer(event))" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white text-base font-bold">&times;</button>
        </div>
      </div>

      <!-- Filter Chips -->
      <div class="flex items-center gap-1 overflow-x-auto text-[11px] font-semibold pb-1 no-scrollbar">
        <button onclick="window.app ? window.app.renderNotificationsDrawer('ALL') : null" class="px-2.5 py-1 rounded-lg transition shrink-0 ${activeFilter === 'ALL' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">All</button>
        <button onclick="window.app ? window.app.renderNotificationsDrawer('AUDITORIUM') : null" class="px-2.5 py-1 rounded-lg transition shrink-0 ${activeFilter === 'AUDITORIUM' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">🏛️ Auditorium</button>
        <button onclick="window.app ? window.app.renderNotificationsDrawer('VOLUNTEER') : null" class="px-2.5 py-1 rounded-lg transition shrink-0 ${activeFilter === 'VOLUNTEER' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">🤝 Volunteers</button>
        <button onclick="window.app ? window.app.renderNotificationsDrawer('CERTIFICATES') : null" class="px-2.5 py-1 rounded-lg transition shrink-0 ${activeFilter === 'CERTIFICATES' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">📜 Certificates</button>
        <button onclick="window.app ? window.app.renderNotificationsDrawer('EDUCATION') : null" class="px-2.5 py-1 rounded-lg transition shrink-0 ${activeFilter === 'EDUCATION' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">🎓 Education</button>
        <button onclick="window.app ? window.app.renderNotificationsDrawer('NOTICES') : null" class="px-2.5 py-1 rounded-lg transition shrink-0 ${activeFilter === 'NOTICES' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">📢 General</button>
      </div>

      <!-- Notifications List -->
      <div class="space-y-2 max-h-[380px] overflow-y-auto pr-1 text-xs">
        ${!filtered.length ? `
          <div class="py-8 text-center text-slate-400 space-y-1">
            <i data-lucide="inbox" class="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2"></i>
            <p class="font-medium text-xs">No notifications in this category.</p>
          </div>
        ` : filtered.map(n => {
          const isApproved = n.status === 'APPROVED' || n.status === 'CONFIRMED';
          const isRejected = n.status === 'REJECTED';
          
          let cardStyle = 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700';
          let statusBadge = 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
          let iconColor = 'text-slate-600 dark:text-slate-300';
          let iconName = 'bell';

          if (isApproved) {
            cardStyle = 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80';
            statusBadge = 'bg-emerald-600 text-white';
            iconColor = 'text-emerald-600';
            if (n.category === 'Auditorium') iconName = 'calendar-check';
            else if (n.category === 'Certificates') iconName = 'award';
            else if (n.category === 'Education') iconName = 'graduation-cap';
            else if (n.category === 'Accounts') iconName = 'receipt';
            else iconName = 'check-circle-2';
          } else if (isRejected) {
            cardStyle = 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/80';
            statusBadge = 'bg-rose-600 text-white';
            iconColor = 'text-rose-600';
            iconName = 'x-circle';
          } else if (n.type === 'JANAZAH') {
            cardStyle = 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900';
            statusBadge = 'bg-red-600 text-white';
            iconColor = 'text-red-600';
            iconName = 'flag';
          } else if (n.type === 'CRITICAL_ALERT') {
            cardStyle = 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-800';
            statusBadge = 'bg-amber-600 text-white';
            iconColor = 'text-amber-600';
            iconName = 'alert-triangle';
          }

          return `
            <div class="p-3 rounded-2xl border ${cardStyle} transition space-y-1.5 relative ${!n.read ? 'ring-1 ring-emerald-500/50' : 'opacity-85'}">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-1.5">
                  <i data-lucide="${iconName}" class="w-4 h-4 ${iconColor} shrink-0"></i>
                  <strong class="text-slate-900 dark:text-white text-xs font-bold leading-tight">${n.title}</strong>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <span class="px-2 py-0.5 rounded-full ${statusBadge} font-mono text-[9px] font-bold uppercase tracking-wider">${n.status}</span>
                  ${!n.read ? `
                    <button onclick="window.app ? window.app.markNotificationRead('${n.id}') : null" class="p-1 hover:text-emerald-600 text-slate-400" title="Mark as read">
                      <i data-lucide="check" class="w-3.5 h-3.5"></i>
                    </button>
                  ` : ''}
                </div>
              </div>
              <p class="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                ${n.message}
              </p>
              ${n.details ? `<p class="text-[10px] text-slate-500 font-mono pt-0.5">${n.details}</p>` : ''}
              <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                <span>${n.date || 'Recent'}</span>
                <span class="font-medium text-slate-500">${n.category || 'Notification'}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px]">
        <button onclick="window.app ? window.app.clearAllNotifications() : null" class="text-slate-400 hover:text-rose-500 transition">
          Clear history
        </button>
        <a href="my-mahall.html" class="text-emerald-600 hover:underline font-bold flex items-center gap-1">
          <span>My Resident Portal</span> &rarr;
        </a>
      </div>
    `;

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }

  markNotificationRead(id) {
    if (typeof MahallDB !== 'undefined' && MahallDB.markNotificationAsRead) {
      MahallDB.markNotificationAsRead(id);
      this.updateNotificationBadge();
      this.renderNotificationsDrawer();
    }
  }

  markAllNotificationsRead() {
    if (typeof MahallDB !== 'undefined' && MahallDB.markAllNotificationsAsRead) {
      MahallDB.markAllNotificationsAsRead();
      this.updateNotificationBadge();
      this.renderNotificationsDrawer();
      this.showToast('All notifications marked as read.', 'info');
    }
  }

  clearAllNotifications() {
    if (confirm('Clear all notifications history?')) {
      if (typeof MahallDB !== 'undefined' && MahallDB.clearNotifications) {
        MahallDB.clearNotifications();
        this.updateNotificationBadge();
        this.renderNotificationsDrawer();
        this.showToast('Notifications cleared.', 'info');
      }
    }
  }

  setupEventListeners() {
    // Dynamic Pill Navbar on Scroll (matches rounded capsule shape from Image 2)
    const header = document.getElementById('main-header');
    if (header) {
      const handleNavbarScroll = () => {
        if (window.scrollY > 20) {
          header.classList.add('is-scrolled');
        } else {
          header.classList.remove('is-scrolled');
        }
      };
      window.addEventListener('scroll', handleNavbarScroll, { passive: true });
      handleNavbarScroll();
    }

    // Escape key modal close & '/' search hotkey like GitHub
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.app-modal').forEach(m => m.classList.add('hidden'));
        const drawer = document.getElementById('notification-drawer');
        if (drawer) drawer.classList.add('hidden');
      } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) searchInput.focus();
      }
    });
  }

  handleGlobalSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    if (e.key === 'Enter' && query) {
      if (query.includes('pray') || query.includes('namaz') || query.includes('azan') || query.includes('jumua')) {
        this.switchTab('prayer');
      } else if (query.includes('cert') || query.includes('marriage') || query.includes('nikah') || query.includes('document')) {
        this.setRole('member', true);
      } else if (query.includes('blood') || query.includes('donor') || query.includes('medic') || query.includes('ambul')) {
        this.switchTab('community');
      } else if (query.includes('madrasa') || query.includes('class') || query.includes('student')) {
        this.switchTab('education');
      } else if (query.includes('event') || query.includes('program') || query.includes('circle')) {
        this.switchTab('events');
      } else if (query.includes('map') || query.includes('campus') || query.includes('cemetery') || query.includes('hall')) {
        this.switchTab('map');
      } else if (query.includes('admin') || query.includes('family') || query.includes('ward')) {
        this.setRole('admin', true);
      } else {
        this.toggleAIChat();
        this.sendAIChatMessage(query);
      }
      this.showToast(`Navigated for search: "${query}"`, 'info');
      e.target.blur();
    }
  }

  // ==========================================
  // EVENT REGISTRATION & RSVP WORKFLOW
  // ==========================================
  openEventRsvpModal(eventId, isAdditional = false) {
    const evt = (typeof MahallDB !== 'undefined' && MahallDB.getEvents ? MahallDB.getEvents() : this.state.events).find(e => e.id === eventId);
    if (!evt) return;

    this.activeRsvpEventId = eventId;
    this.activeRsvpId = null;

    // Reset modal views
    const modal = document.getElementById('event-rsvp-modal');
    const formView = document.getElementById('rsvp-form-view');
    const confirmView = document.getElementById('rsvp-confirmation-view');
    if (!modal || !formView || !confirmView) return;

    formView.classList.remove('hidden');
    confirmView.classList.add('hidden');

    const additionalNote = document.getElementById('rsvp-additional-pass-note');
    if (additionalNote) {
      if (isAdditional) {
        additionalNote.classList.remove('hidden');
      } else {
        additionalNote.classList.add('hidden');
      }
    }

    // Populate event info
    const title = (this.currentLang === 'ml') ? evt.titleMl : (this.currentLang === 'ar') ? evt.titleAr : evt.title;
    const catEl = document.getElementById('rsvp-event-category');
    const nameEl = document.getElementById('rsvp-event-name');
    const badgeEl = document.getElementById('rsvp-seats-left-badge');
    const dtEl = document.getElementById('rsvp-event-datetime');
    const venueEl = document.getElementById('rsvp-event-venue');
    const spkEl = document.getElementById('rsvp-event-speaker');
    const formIdEl = document.getElementById('rsvp-form-event-id');

    if (catEl) catEl.innerText = (evt.category || 'Program').replace('_', ' ');
    if (nameEl) nameEl.innerText = title;
    if (badgeEl) badgeEl.innerText = `${(typeof evt.seatsLeft === 'number') ? evt.seatsLeft : 50} Seats Left`;
    if (dtEl) dtEl.innerText = `${evt.date} (${evt.time})`;
    if (venueEl) venueEl.innerText = evt.venue || 'Mahall Auditorium';
    if (spkEl) spkEl.innerText = evt.speaker || 'Executive Board';
    if (formIdEl) formIdEl.value = evt.id;

    // Attendee info
    const savedName = localStorage.getItem('nhm_user_name') || (this.state.memberUser ? this.state.memberUser.head : '');
    const savedPhone = localStorage.getItem('nhm_user_phone') || (this.state.memberUser ? this.state.memberUser.phone : '');
    const savedFamily = localStorage.getItem('nhm_user_family') || (this.state.memberUser ? this.state.memberUser.familyId : '');

    const nameInput = document.getElementById('rsvp-attendee-name');
    const phoneInput = document.getElementById('rsvp-attendee-phone');
    const famInput = document.getElementById('rsvp-attendee-family');
    const notesInput = document.getElementById('rsvp-attendee-notes');

    if (nameInput) {
      nameInput.value = isAdditional ? '' : savedName;
      nameInput.placeholder = isAdditional ? 'Enter attendee name for additional pass' : 'e.g. Ahmed Koya / Mohammed Suhail';
    }
    if (phoneInput) phoneInput.value = savedPhone;
    if (famInput) famInput.value = savedFamily;
    if (notesInput) notesInput.value = '';

    // Populate seat options based on seatsLeft
    const seatsSelect = document.getElementById('rsvp-attendee-seats');
    if (seatsSelect) {
      const maxSelectable = Math.min(5, Math.max(1, (typeof evt.seatsLeft === 'number') ? evt.seatsLeft : 5));
      seatsSelect.innerHTML = Array.from({ length: maxSelectable }, (_, i) => i + 1).map(n => `
        <option value="${n}">${n} ${n === 1 ? (isAdditional ? 'Person (Guest / Family)' : 'Person (Self)') : n === 2 ? 'Persons' : 'Persons (Group)'}</option>
      `).join('');
      seatsSelect.value = "1";
    }

    if (this.updatePublicRsvpPreview) {
      this.updatePublicRsvpPreview();
    }

    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
    if (isAdditional && nameInput) {
      setTimeout(() => nameInput.focus(), 150);
    }
  }

  registerAnotherPass() {
    const eventId = this.activeRsvpEventId || document.getElementById('rsvp-form-event-id')?.value;
    if (!eventId) {
      this.showToast('Please select an event to register', 'error');
      return;
    }

    const evt = (typeof MahallDB !== 'undefined' && MahallDB.getEvents ? MahallDB.getEvents() : this.state.events).find(e => e.id === eventId);
    if (!evt) {
      this.showToast('Event information not found', 'error');
      return;
    }

    const seatsLeft = typeof evt.seatsLeft === 'number' ? evt.seatsLeft : 50;
    if (seatsLeft <= 0) {
      this.showToast('Sorry, this event is fully booked. No remaining seats.', 'warning');
      return;
    }

    this.openEventRsvpModal(eventId, true);
  }

  closeEventRsvpModal() {
    const modal = document.getElementById('event-rsvp-modal');
    if (modal) modal.classList.add('hidden');
  }

  handleEventRsvpSubmit(e) {
    e.preventDefault();
    const eventId = document.getElementById('rsvp-form-event-id').value;
    const name = (document.getElementById('rsvp-attendee-name') ? document.getElementById('rsvp-attendee-name').value : '').trim();
    const phone = (document.getElementById('rsvp-attendee-phone') ? document.getElementById('rsvp-attendee-phone').value : '').trim();
    const familyId = (document.getElementById('rsvp-attendee-family') ? document.getElementById('rsvp-attendee-family').value : '').trim();
    const seats = parseInt(document.getElementById('rsvp-attendee-seats') ? document.getElementById('rsvp-attendee-seats').value : 1, 10) || 1;
    const notes = (document.getElementById('rsvp-attendee-notes') ? document.getElementById('rsvp-attendee-notes').value : '').trim();

    if (!name || !phone) {
      this.showToast('Please enter attendee name and contact phone number.', 'error');
      return;
    }

    try {
      const rsvp = MahallDB.registerEventRsvp({
        eventId,
        name,
        phone,
        familyId,
        seats,
        notes
      });

      // Remember contact details on device
      localStorage.setItem('nhm_user_name', name);
      localStorage.setItem('nhm_user_phone', phone);
      if (familyId) localStorage.setItem('nhm_user_family', familyId);

      // Save local reference for fast matching (supports multiple passes per event)
      const myRsvps = JSON.parse(localStorage.getItem('nhm_my_rsvps') || '{}');
      if (Array.isArray(myRsvps[eventId])) {
        if (!myRsvps[eventId].includes(rsvp.rsvpId)) {
          myRsvps[eventId].push(rsvp.rsvpId);
        }
      } else if (typeof myRsvps[eventId] === 'string' && myRsvps[eventId]) {
        myRsvps[eventId] = [myRsvps[eventId], rsvp.rsvpId];
      } else {
        myRsvps[eventId] = [rsvp.rsvpId];
      }
      localStorage.setItem('nhm_my_rsvps', JSON.stringify(myRsvps));

      // Show confirmation pass
      this.showRsvpConfirmation(rsvp);

      // Re-render events and refresh state
      this.state.events = (typeof MahallDB !== 'undefined' && MahallDB.getEvents) ? MahallDB.getEvents() : this.state.events;
      this.renderEvents();
      this.showToast(`RSVP Confirmed for ${rsvp.name}! Pass #${rsvp.rsvpId} issued.`, 'success');
    } catch (err) {
      this.showToast(err.message || 'Error completing registration', 'error');
    }
  }

  showRsvpConfirmation(rsvp) {
    this.activeRsvpId = rsvp.rsvpId;
    this.activeRsvpEventId = rsvp.eventId;
    const formView = document.getElementById('rsvp-form-view');
    const confirmView = document.getElementById('rsvp-confirmation-view');
    if (!formView || !confirmView) return;

    formView.classList.add('hidden');
    confirmView.classList.remove('hidden');

    const passIdEl = document.getElementById('pass-id-display');
    const passCatEl = document.getElementById('pass-category');
    const passTitleEl = document.getElementById('pass-title');
    const passNameEl = document.getElementById('pass-name');
    const passSeatsEl = document.getElementById('pass-seats');
    const passDtEl = document.getElementById('pass-datetime');
    const passVenueEl = document.getElementById('pass-venue');
    const passHashEl = document.getElementById('pass-hash-display');

    if (passIdEl) passIdEl.innerText = rsvp.rsvpId;
    if (passCatEl) passCatEl.innerText = "CONFIRMED ENTRY PASS";
    if (passTitleEl) passTitleEl.innerText = rsvp.eventTitle;
    if (passNameEl) passNameEl.innerText = rsvp.name;
    if (passSeatsEl) passSeatsEl.innerText = `${rsvp.seats} ${rsvp.seats > 1 ? 'Seats' : 'Seat'}`;
    if (passDtEl) passDtEl.innerText = `${rsvp.eventDate} (${rsvp.eventTime})`;
    if (passVenueEl) passVenueEl.innerText = rsvp.eventVenue;
    if (passHashEl) passHashEl.innerText = rsvp.passHash || 'NHM-PASS-VERIFIED';

    // Handle multi-pass switcher tabs
    const multiPassContainer = document.getElementById('rsvp-multi-pass-container');
    const multiPassList = document.getElementById('rsvp-multi-pass-list');
    const passesCountBadge = document.getElementById('rsvp-passes-count-badge');

    if (multiPassContainer && multiPassList) {
      const allRsvps = (typeof MahallDB !== 'undefined' && MahallDB.getEventRsvps) ? MahallDB.getEventRsvps(rsvp.eventId) : [];
      const myRsvpMap = JSON.parse(localStorage.getItem('nhm_my_rsvps') || '{}');
      const rawStored = myRsvpMap[rsvp.eventId];
      const storedIds = Array.isArray(rawStored) ? rawStored : (rawStored ? [rawStored] : []);
      const myPhone = localStorage.getItem('nhm_user_phone') || '';
      const cleanMyPhone = myPhone.replace(/[^0-9]/g, '');

      const myEventPasses = allRsvps.filter(r => 
        r.status === 'CONFIRMED' && (
          storedIds.includes(r.rsvpId) || 
          r.rsvpId === rsvp.rsvpId ||
          (cleanMyPhone && r.phone && r.phone.replace(/[^0-9]/g, '') === cleanMyPhone)
        )
      );

      if (myEventPasses.length > 1) {
        multiPassContainer.classList.remove('hidden');
        if (passesCountBadge) passesCountBadge.innerText = `${myEventPasses.length} Passes Issued`;
        multiPassList.innerHTML = myEventPasses.map((p, idx) => {
          const isActive = p.rsvpId === rsvp.rsvpId;
          return `
            <button type="button" onclick="window.app.viewRsvpPass('${p.rsvpId}')"
              class="px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }">
              <i data-lucide="${isActive ? 'check-circle' : 'ticket'}" class="w-3 h-3 ${isActive ? 'text-white' : 'text-emerald-500'}"></i>
              <span>Pass ${idx + 1}: ${p.name.split(' ')[0]} (${p.seats})</span>
            </button>
          `;
        }).join('');
      } else {
        multiPassContainer.classList.add('hidden');
      }
    }

    if (window.lucide) lucide.createIcons();
  }

  viewRsvpPass(rsvpId) {
    const rsvps = (typeof MahallDB !== 'undefined' && MahallDB.getEventRsvps) ? MahallDB.getEventRsvps() : [];
    const rsvp = rsvps.find(r => r.rsvpId === rsvpId);
    if (!rsvp) {
      this.showToast('Registration pass not found', 'error');
      return;
    }

    const modal = document.getElementById('event-rsvp-modal');
    if (!modal) return;
    this.showRsvpConfirmation(rsvp);
    modal.classList.remove('hidden');
  }

  cancelCurrentRsvp() {
    if (!this.activeRsvpId) return;
    if (!confirm('Are you sure you want to cancel this entry pass and release the reserved seat(s)?')) return;

    const rsvpToCancel = this.activeRsvpId;
    const eventId = this.activeRsvpEventId;
    const success = (typeof MahallDB !== 'undefined' && MahallDB.cancelEventRsvp) ? MahallDB.cancelEventRsvp(rsvpToCancel) : false;
    if (success) {
      // Clear cancelled pass from local device storage
      const myRsvps = JSON.parse(localStorage.getItem('nhm_my_rsvps') || '{}');
      if (eventId && myRsvps[eventId]) {
        if (Array.isArray(myRsvps[eventId])) {
          myRsvps[eventId] = myRsvps[eventId].filter(id => id !== rsvpToCancel);
          if (myRsvps[eventId].length === 0) {
            delete myRsvps[eventId];
          }
        } else if (myRsvps[eventId] === rsvpToCancel) {
          delete myRsvps[eventId];
        }
        localStorage.setItem('nhm_my_rsvps', JSON.stringify(myRsvps));
      }

      this.state.events = (typeof MahallDB !== 'undefined' && MahallDB.getEvents) ? MahallDB.getEvents() : this.state.events;
      this.renderEvents();

      // Check if user has other active passes for this event
      const remainingPasses = (typeof MahallDB !== 'undefined' && MahallDB.getEventRsvps ? MahallDB.getEventRsvps(eventId) : []).filter(r => {
        const stored = myRsvps[eventId];
        const ids = Array.isArray(stored) ? stored : (stored ? [stored] : []);
        return ids.includes(r.rsvpId) && r.status === 'CONFIRMED';
      });

      if (remainingPasses.length > 0) {
        this.showToast('Selected pass was cancelled. Showing your other active pass.', 'info');
        this.showRsvpConfirmation(remainingPasses[0]);
      } else {
        this.closeEventRsvpModal();
        this.showToast('Your registration has been cancelled and seats released.', 'info');
      }
    }
  }

  renderCurrentView() {
    this.setRole(this.currentRole);
  }
}

// Global Startup Security helpers accessible everywhere (backward-compatibility fallbacks)
window.bypassStartupSecurity = function (e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  sessionStorage.setItem('nhm_guest_visitor', 'true');
  const screen = document.getElementById('resident-login-screen');
  if (screen) screen.remove();
  document.body.style.overflow = 'auto';
  return false;
};

window.handleStartupSecurityLogin = function (e) {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
  }
  if (window.app && typeof window.app.handleStartupSecurityLogin === 'function') {
    return window.app.handleStartupSecurityLogin(e);
  }
  window.location.href = 'login.html';
  return false;
};

window.autofillSecurityLogin = function (userId, pass) {
  const uInput = document.getElementById('startup-sec-userid');
  const pInput = document.getElementById('startup-sec-password');
  if (uInput && pInput) {
    uInput.value = userId;
    pInput.value = pass;
    if (window.app && typeof window.app.handleStartupSecurityLogin === 'function') {
      window.app.handleStartupSecurityLogin(null);
    } else {
      window.handleStartupSecurityLogin(null);
    }
  }
};

window.toggleStartupPasswordVisibility = function () {
  const pInput = document.getElementById('startup-sec-password');
  const eye = document.getElementById('startup-pass-eye');
  if (pInput) {
    if (pInput.type === 'password') {
      pInput.type = 'text';
      if (eye) eye.setAttribute('data-lucide', 'eye-off');
    } else {
      pInput.type = 'password';
      if (eye) eye.setAttribute('data-lucide', 'eye');
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }
};

// Failsafe export references
if (!window.toggleTheme) window.toggleTheme = function (e) { if (window.app && window.app.toggleTheme) window.app.toggleTheme(e); };

// Safe bootstrap function (fires immediately if readyState is interactive/complete, otherwise on DOMContentLoaded)
// Global direct bell button binder for failproof clicks across all pages
window.bindGlobalBellButtons = function () {
  document.querySelectorAll('#notif-bell-btn, .notif-trigger-btn, button[onclick*="toggleNotificationDrawer"]').forEach(btn => {
    if (!btn._notifDirectBound) {
      btn._notifDirectBound = true;
      btn.addEventListener('click', (e) => {
        const ev = e || window.event;
        if (ev) {
          if (typeof ev.stopPropagation === 'function') ev.stopPropagation();
          if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
        }
        window.toggleNotificationDrawer(ev);
      });
    }
  });
};

function bootMahallApp() {
  if (!window.app && typeof MahallApp !== 'undefined') {
    try {
      window.app = new MahallApp();
    } catch (err) {
      console.error('[MahallApp] Boot error:', err);
    }
  }
  if (typeof window.bindGlobalBellButtons === 'function') {
    window.bindGlobalBellButtons();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootMahallApp);
} else {
  bootMahallApp();
}
