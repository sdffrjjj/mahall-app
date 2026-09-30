/**
 * NOORUL HUDA ISLAMIC ACADEMY - EDUCATION ADMINISTRATION DESK CONTROLLER
 * Full management of student admissions, enrollment master roster, faculty, courses, and scholarships.
 */

const EduAdminApp = {
  activeTab: 'admissions',
  currentAdmFilter: 'all',

  init: function () {
    console.log('[EduAdminApp] Initializing Education Admin Desk...');

    // 1. Initialize DB if needed
    if (typeof MahallDB !== 'undefined') {
      MahallDB.init();
    }

    // 2. Start Live Clock
    this.startLiveClock();

    // 3. Render all components
    this.renderAll();

    // 4. Listen for cross-tab database updates
    window.addEventListener('mahalldb_updated', () => {
      this.renderAll();
    });

    // 5. Initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // =========================================================================
  // AUTHENTICATION
  // =========================================================================
  checkAuth: function () {
    const session = localStorage.getItem('mahall_auth_session');
    const role = localStorage.getItem('nhm_role');
    const screen = document.getElementById('edu-admin-login-screen');
    let isAuthed = false;

    if (role === 'admin') isAuthed = true;
    else if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.role === 'admin') isAuthed = true;
      } catch (e) { }
    }

    if (isAuthed && screen) {
      screen.classList.add('hidden');
    }
  },

  handleLogin: function (e) {
    if (e) e.preventDefault();
    const pass = (document.getElementById('edu-passkey-input').value || '').trim();
    const err = document.getElementById('edu-login-error');
    const screen = document.getElementById('edu-admin-login-screen');

    if (pass === 'admin2026' || pass === 'admin') {
      localStorage.setItem('nhm_role', 'admin');
      localStorage.setItem('mahall_auth_session', JSON.stringify({
        role: 'admin',
        name: 'Sadar Mudarris',
        title: 'Education Desk',
        timestamp: Date.now()
      }));
      if (screen) screen.classList.add('hidden');
      if (err) err.classList.add('hidden');
      this.showToast('Authentication successful. Welcome, Sadar Mudarris!', 'success');
      this.renderAll();
    } else {
      if (err) err.classList.remove('hidden');
      this.showToast('Invalid passkey!', 'error');
    }
  },

  handleLogout: function () {
    if (confirm('Log out from Education Administration Desk?')) {
      localStorage.removeItem('nhm_role');
      localStorage.removeItem('mahall_auth_session');
      const screen = document.getElementById('edu-admin-login-screen');
      if (screen) {
        screen.classList.remove('hidden');
        document.getElementById('edu-passkey-input').value = '';
      }
      this.showToast('Logged out of education desk.', 'info');
    }
  },

  // =========================================================================
  // LIVE CLOCK
  // =========================================================================
  startLiveClock: function () {
    const update = () => {
      const el = document.getElementById('edu-live-clock');
      if (el) {
        const now = new Date();
        el.textContent = now.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' • ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }
    };
    update();
    setInterval(update, 1000);
  },

  // =========================================================================
  // TAB NAVIGATION
  // =========================================================================
  switchTab: function (tabId) {
    this.activeTab = tabId;

    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`pane-${tabId}`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.edu-tab-btn').forEach(btn => {
      btn.classList.remove('active', 'bg-emerald-900/70', 'text-white', 'border-emerald-700/60');
      btn.classList.add('bg-slate-900', 'text-slate-300', 'border-slate-800');
    });
    const activeBtn = document.getElementById(`tab-btn-${tabId}`);
    if (activeBtn) {
      activeBtn.classList.remove('bg-slate-900', 'text-slate-300', 'border-slate-800');
      activeBtn.classList.add('active', 'bg-emerald-900/70', 'text-white', 'border-emerald-700/60');
    }

    if (window.lucide) window.lucide.createIcons();
    window.scrollTo({ top: 180, behavior: 'smooth' });
  },

  // =========================================================================
  // MASTER RENDER ROUTINE
  // =========================================================================
  renderAll: function () {
    this.renderKPIs();
    this.renderAdmissions();
    this.renderStudents();
    this.renderFaculty();
    this.renderCourses();
    this.renderScholarships();
    this.renderMaterials();

    if (window.lucide) window.lucide.createIcons();
  },

  renderKPIs: function () {
    const students = MahallDB.getStudents ? MahallDB.getStudents() : [];
    const admissions = MahallDB.getAdmissions ? MahallDB.getAdmissions() : [];
    const pendingAdmissions = admissions.filter(a => a.status === 'PENDING');
    const faculty = MahallDB.getFaculty ? MahallDB.getFaculty() : [];
    const courses = MahallDB.getCourses ? MahallDB.getCourses() : [];
    const scholarships = MahallDB.getScholarships ? MahallDB.getScholarships() : [];

    const kStd = document.getElementById('kpi-edu-students');
    const kAdm = document.getElementById('kpi-edu-pending');
    const kFac = document.getElementById('kpi-edu-faculty');
    const kCrs = document.getElementById('kpi-edu-courses');
    const kSch = document.getElementById('kpi-edu-scholarships');
    const bAdm = document.getElementById('tab-badge-pending-adm');

    if (kStd) kStd.textContent = students.length;
    if (kAdm) kAdm.textContent = pendingAdmissions.length;
    if (kFac) kFac.textContent = faculty.length;
    if (kCrs) kCrs.textContent = courses.length;
    if (kSch) kSch.textContent = scholarships.length;
    if (bAdm) bAdm.textContent = pendingAdmissions.length;
  },

  // =========================================================================
  // TAB 1: ADMISSIONS DESK & APPROVAL WORKFLOW
  // =========================================================================
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
            <button onclick="EduAdminApp.approveAdmission('${a.id}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition">
              Approve & Enroll
            </button>
            <button onclick="EduAdminApp.rejectAdmission('${a.id}')" class="px-2.5 py-1 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 rounded-lg text-xs font-semibold transition">
              Reject
            </button>
          ` : `
            <button onclick="EduAdminApp.printAdmissionPass('${a.id}')" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition">
              <i data-lucide="printer" class="w-3.5 h-3.5 text-emerald-400"></i>
              <span>Pass</span>
            </button>
          `}
          <button onclick="EduAdminApp.deleteAdmission('${a.id}')" title="Delete application" class="p-1 text-slate-500 hover:text-rose-400 rounded transition">
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
    event.target.classList.add('bg-emerald-900', 'text-emerald-200', 'border-emerald-700');
    this.renderAdmissions();
  },

  approveAdmission: function (id) {
    const updated = MahallDB.approveAdmission(id);
    if (updated) {
      this.showToast(`Application ${id} approved! Enrolled as ${updated.rollNo}`, 'success');
      this.renderAll();
    }
  },

  rejectAdmission: function (id) {
    const reason = prompt('Specify rejection reason (e.g. Ineligible age, Class capacity reached):');
    if (reason) {
      MahallDB.rejectAdmission(id, reason);
      this.showToast(`Application ${id} rejected.`, 'info');
      this.renderAll();
    }
  },

  deleteAdmission: function (id) {
    if (confirm(`Remove admission record ${id}?`)) {
      MahallDB.deleteAdmission(id);
      this.showToast(`Removed admission ${id}`, 'info');
      this.renderAll();
    }
  },

  openNewAdmissionModal: function () {
    const families = MahallDB.getFamilies ? MahallDB.getFamilies() : [];
    const courses = MahallDB.getCourses ? MahallDB.getCourses() : [];

    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="user-plus" class="w-5 h-5 text-emerald-400"></i>
            <span>Direct Student Admission Desk Application</span>
          </h3>
          <button onclick="EduAdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="EduAdminApp.handleSaveAdmission(event)" class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">Student Full Legal Name *</label>
            <input type="text" id="modal-adm-name" required placeholder="Student name" oninput="EduAdminApp.updateAdmissionPreview()"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Gender *</label>
              <select id="modal-adm-gender" onchange="EduAdminApp.updateAdmissionPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Date of Birth *</label>
              <input type="date" id="modal-adm-dob" required value="2018-05-10" oninput="EduAdminApp.updateAdmissionPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Desired Course / Class *</label>
              <select id="modal-adm-course" onchange="EduAdminApp.updateAdmissionPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
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
              <select id="modal-adm-famid" onchange="EduAdminApp.updateAdmissionPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                ${families.map(f => `<option value="${f.familyId}">${f.familyId} - ${f.head}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Parent / Guardian Name *</label>
              <input type="text" id="modal-adm-parent" required placeholder="Father / Mother Name" oninput="EduAdminApp.updateAdmissionPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Contact Phone *</label>
              <input type="text" id="modal-adm-phone" required placeholder="+91 " oninput="EduAdminApp.updateAdmissionPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono" />
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Previous Islamic Education / Madrasa (if any)</label>
            <input type="text" id="modal-adm-prev" placeholder="e.g. Samastha Madrasa Class 3, Calicut" oninput="EduAdminApp.updateAdmissionPreview()"
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
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <i data-lucide="eye" class="w-3.5 h-3.5 text-teal-400"></i>
              <span>LIVE PREVIEW AS SEEN ON PUBLIC PORTAL:</span>
            </span>
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
                  <span class="text-[10px] text-slate-400 block">Candidate Student:</span>
                  <strong id="preview-adm-name" class="text-white text-xs font-semibold">Student Name</strong>
                  <span id="preview-adm-parent" class="text-[10px] text-slate-400 block">Parent: Guardian Name</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 block">Family Ward ID:</span>
                  <strong id="preview-adm-famid" class="text-teal-300 font-mono text-xs font-bold block">${families[0] ? families[0].familyId : 'W02-F001'}</strong>
                  <span id="preview-adm-phone" class="text-[10px] font-mono text-emerald-400">+91 94470 12345</span>
                </div>
              </div>
              <div class="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span id="preview-adm-prev" class="truncate max-w-[260px]">Previous: Samastha Madrasa</span>
                <span class="text-emerald-400 font-bold flex items-center gap-1"><i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Verified Eligibility</span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="EduAdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
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
    const name = document.getElementById('modal-adm-name')?.value || 'Student Name';
    const parent = document.getElementById('modal-adm-parent')?.value || 'Guardian Name';
    const courseSelect = document.getElementById('modal-adm-course');
    const course = courseSelect ? courseSelect.value : 'Madrasa Primary (Class 1)';
    const famSelect = document.getElementById('modal-adm-famid');
    const famid = famSelect ? famSelect.value : 'W02-F001';
    const phone = document.getElementById('modal-adm-phone')?.value || '+91 94470 12345';
    const prev = document.getElementById('modal-adm-prev')?.value || 'Samastha Madrasa';

    const pName = document.getElementById('preview-adm-name');
    const pParent = document.getElementById('preview-adm-parent');
    const pCourse = document.getElementById('preview-adm-course');
    const pFamId = document.getElementById('preview-adm-famid');
    const pPhone = document.getElementById('preview-adm-phone');
    const pPrev = document.getElementById('preview-adm-prev');

    if (pName) pName.textContent = name;
    if (pParent) pParent.textContent = `Parent: ${parent}`;
    if (pCourse) pCourse.textContent = course;
    if (pFamId) pFamId.textContent = famid;
    if (pPhone) pPhone.textContent = phone;
    if (pPrev) pPrev.textContent = `Previous: ${prev}`;
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
    this.renderAll();
  },

  // =========================================================================
  // TAB 2: ENROLLED STUDENTS MASTER ROSTER
  // =========================================================================
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

    const tbody = document.getElementById('students-table-body');
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
          <button onclick="EduAdminApp.editStudent('${s.roll}')" title="Edit student records" class="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
          <button onclick="EduAdminApp.printStudentCard('${s.roll}')" title="Student ID Card" class="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition">
            <i data-lucide="award" class="w-4 h-4"></i>
          </button>
          <button onclick="EduAdminApp.deleteStudent('${s.roll}')" title="Remove student" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition">
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

    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="graduation-cap" class="w-5 h-5 text-emerald-400"></i>
            <span>${existing ? 'Edit Enrolled Student Dossier' : 'Direct Student Enrollment'}</span>
          </h3>
          <button onclick="EduAdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="EduAdminApp.handleSaveStudent(event, '${roll || ''}')" class="space-y-3 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Roll / Admission Number *</label>
              <input type="text" id="modal-std-roll" required value="${existing ? existing.roll : `NHM-${Math.floor(100 + Math.random() * 899)}`}" oninput="EduAdminApp.updateStudentPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sky-400 font-mono font-bold" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Class / Standard *</label>
              <select id="modal-std-class" onchange="EduAdminApp.updateStudentPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="Class 1A" ${existing && existing.class === 'Class 1A' ? 'selected' : ''}>Class 1A</option>
                <option value="Class 2B" ${existing && existing.class === 'Class 2B' ? 'selected' : ''}>Class 2B</option>
                <option value="Class 3A" ${existing && existing.class === 'Class 3A' ? 'selected' : ''}>Class 3A</option>
                <option value="Class 4C" ${existing && existing.class === 'Class 4C' ? 'selected' : ''}>Class 4C</option>
                <option value="Class 5A" ${existing && existing.class === 'Class 5A' ? 'selected' : ''}>Class 5A</option>
                <option value="Class 6B" ${existing && existing.class === 'Class 6B' ? 'selected' : ''}>Class 6B</option>
                <option value="Class 7A" ${existing && existing.class === 'Class 7A' ? 'selected' : ''}>Class 7A</option>
                <option value="Class 8B" ${existing && existing.class === 'Class 8B' ? 'selected' : ''}>Class 8B</option>
                <option value="Class 9A" ${existing && existing.class === 'Class 9A' ? 'selected' : ''}>Class 9A</option>
                <option value="Class 10A" ${existing && existing.class === 'Class 10A' ? 'selected' : ''}>Class 10A (SSLC Final)</option>
                <option value="Hifdh Wing" ${existing && existing.class === 'Hifdh Wing' ? 'selected' : ''}>Hifdh Wing</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Full Student Name *</label>
            <input type="text" id="modal-std-name" required value="${existing ? existing.name : ''}" placeholder="Full legal name" oninput="EduAdminApp.updateStudentPreview()"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none" />
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Attendance Rate</label>
              <input type="text" id="modal-std-att" value="${existing ? existing.att : '98.5%'}" oninput="EduAdminApp.updateStudentPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-emerald-400 font-mono font-bold" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Hifdh Memorization</label>
              <input type="text" id="modal-std-hifdh" value="${existing ? existing.hifdh : 'Juz Amma (30)'}" oninput="EduAdminApp.updateStudentPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Tajweed Grade</label>
              <input type="text" id="modal-std-tajweed" value="${existing ? existing.tajweed : 'A+ (Exemplary)'}" oninput="EduAdminApp.updateStudentPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono" />
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Class Rank / Honors</label>
            <input type="text" id="modal-std-rank" value="${existing ? existing.rank : 'Top 5 in Class'}" oninput="EduAdminApp.updateStudentPreview()"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
          </div>

          <!-- Live Visual Preview of Madrasa Student Card -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <i data-lucide="eye" class="w-3.5 h-3.5 text-sky-400"></i>
              <span>LIVE PREVIEW AS SEEN ON PUBLIC PORTAL:</span>
            </span>
            <div class="rounded-2xl p-4 bg-gradient-to-r from-sky-950/80 via-slate-900 to-slate-950 border border-sky-500/40 shadow-xl space-y-2 relative">
              <div class="flex items-center justify-between border-b border-sky-800/40 pb-2">
                <div class="flex items-center gap-2">
                  <span id="preview-std-roll" class="text-xs font-mono font-bold text-sky-300 bg-sky-950 px-2 py-0.5 rounded border border-sky-700/60">
                    ${existing ? existing.roll : 'NHM-LIVE'}
                  </span>
                  <span id="preview-std-class" class="text-[10px] font-semibold text-slate-300">
                    ${existing ? existing.class : 'Class 1A'}
                  </span>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono text-[9px] font-bold">ACADEMIC HONORS</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span class="text-[10px] text-slate-400 block">Student Scholar:</span>
                  <strong id="preview-std-name" class="text-white text-xs font-semibold">${existing ? existing.name : 'Student Full Name'}</strong>
                  <span id="preview-std-rank" class="text-[10px] text-amber-300 block">${existing ? existing.rank : 'Top 5 in Class'}</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 block">Attendance Rate:</span>
                  <strong id="preview-std-att" class="text-emerald-400 font-mono text-xs font-bold block">${existing ? existing.att : '98.5%'}</strong>
                  <span class="text-[9px] text-slate-400">Regular Enrollment</span>
                </div>
              </div>
              <div class="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span class="text-slate-300">Hifdh: <strong id="preview-std-hifdh" class="text-white">${existing ? existing.hifdh : 'Juz Amma (30)'}</strong></span>
                <span class="text-teal-400 font-bold">Tajweed Grade: <strong id="preview-std-tajweed" class="text-teal-300 font-mono">${existing ? existing.tajweed : 'A+ (Exemplary)'}</strong></span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="EduAdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
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
    const roll = document.getElementById('modal-std-roll')?.value || 'NHM-LIVE';
    const cls = document.getElementById('modal-std-class')?.value || 'Class 1A';
    const name = document.getElementById('modal-std-name')?.value || 'Student Full Name';
    const att = document.getElementById('modal-std-att')?.value || '98.5%';
    const hifdh = document.getElementById('modal-std-hifdh')?.value || 'Juz Amma (30)';
    const tajweed = document.getElementById('modal-std-tajweed')?.value || 'A+ (Exemplary)';
    const rank = document.getElementById('modal-std-rank')?.value || 'Top 5 in Class';

    const pRoll = document.getElementById('preview-std-roll');
    const pClass = document.getElementById('preview-std-class');
    const pName = document.getElementById('preview-std-name');
    const pAtt = document.getElementById('preview-std-att');
    const pRank = document.getElementById('preview-std-rank');
    const pHifdh = document.getElementById('preview-std-hifdh');
    const pTajweed = document.getElementById('preview-std-tajweed');

    if (pRoll) pRoll.textContent = roll;
    if (pClass) pClass.textContent = cls;
    if (pName) pName.textContent = name;
    if (pAtt) pAtt.textContent = att;
    if (pRank) pRank.textContent = rank;
    if (pHifdh) pHifdh.textContent = hifdh;
    if (pTajweed) pTajweed.textContent = tajweed;
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
    this.renderAll();
  },

  deleteStudent: function (roll) {
    if (confirm(`Remove student ${roll} from active master roster?`)) {
      MahallDB.deleteStudent(roll);
      this.showToast(`Student ${roll} removed.`, 'info');
      this.renderAll();
    }
  },

  // =========================================================================
  // TAB 3: FACULTY / USTHAD DIRECTORY (ADDING & DELETING)
  // =========================================================================
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
          <button onclick="EduAdminApp.openAddFacultyModal('${f.id}')" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            <span>Edit</span>
          </button>
          <button onclick="EduAdminApp.deleteFaculty('${f.id}')" class="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
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

    const html = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-base font-heading font-bold text-white flex items-center gap-2">
            <i data-lucide="user-check" class="w-5 h-5 text-indigo-400"></i>
            <span>${existing ? 'Edit Faculty Record' : 'Add New Usthad / Faculty Member'}</span>
          </h3>
          <button onclick="EduAdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="EduAdminApp.handleSaveFaculty(event, '${id || ''}')" class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">Usthad Full Name & Title *</label>
            <input type="text" id="modal-fac-name" required value="${existing ? existing.name : ''}" placeholder="e.g. Usthad Shihabudheen Baqavi" oninput="EduAdminApp.updateFacultyPreview()"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Role / Designation *</label>
              <input type="text" id="modal-fac-role" required value="${existing ? existing.role : 'Senior Mudarris'}" oninput="EduAdminApp.updateFacultyPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Sanad & Qualifications</label>
              <input type="text" id="modal-fac-qual" value="${existing ? existing.qualification : 'Faizy (Pattikkad), MA'}" oninput="EduAdminApp.updateFacultyPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Primary Subjects</label>
              <input type="text" id="modal-fac-sub" value="${existing ? existing.subject : 'Tajweed & Fiqh'}" oninput="EduAdminApp.updateFacultyPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Assigned Classes</label>
              <input type="text" id="modal-fac-cls" value="${existing ? existing.classes : 'Classes 5-10'}" oninput="EduAdminApp.updateFacultyPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Official Mobile Phone</label>
              <input type="text" id="modal-fac-phone" value="${existing ? existing.phone : '+91 '}" oninput="EduAdminApp.updateFacultyPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Teaching Experience</label>
              <input type="text" id="modal-fac-exp" value="${existing ? existing.exp : '10 Years'}" oninput="EduAdminApp.updateFacultyPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <!-- Live Visual Preview of Faculty Profile -->
          <div class="pt-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <i data-lucide="eye" class="w-3.5 h-3.5 text-indigo-400"></i>
              <span>LIVE PREVIEW AS SEEN ON PUBLIC PORTAL:</span>
            </span>
            <div class="rounded-2xl p-4 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/40 shadow-xl space-y-2 relative">
              <div class="flex items-center justify-between border-b border-indigo-800/40 pb-2">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-indigo-900/80 border border-indigo-700/60 text-indigo-300 flex items-center justify-center font-bold text-xs"><i data-lucide="award" class="w-4 h-4"></i></div>
                  <div>
                    <h5 id="preview-fac-name" class="text-xs font-bold text-white leading-tight">${existing ? existing.name : 'Usthad Full Name'}</h5>
                    <span id="preview-fac-role" class="text-[10px] text-indigo-300 font-medium">${existing ? existing.role : 'Senior Mudarris'}</span>
                  </div>
                </div>
                <span id="preview-fac-exp" class="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/50 text-indigo-300 font-mono text-[9px] font-bold">${existing ? existing.exp : '10 Years'} Exp</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-300">
                <div>
                  <span class="text-[10px] text-slate-400 block">Sanad & Degree:</span>
                  <strong id="preview-fac-qual" class="text-slate-100 text-xs font-medium">${existing ? existing.qualification : 'Faizy (Pattikkad), MA'}</strong>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 block">Assigned Classes:</span>
                  <strong id="preview-fac-cls" class="text-slate-100 text-xs font-mono font-medium block">${existing ? existing.classes : 'Classes 5-10'}</strong>
                </div>
              </div>
              <div class="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span class="text-slate-400">Primary Subject: <strong id="preview-fac-sub" class="text-emerald-400">${existing ? existing.subject : 'Tajweed & Fiqh'}</strong></span>
                <span id="preview-fac-phone" class="text-indigo-300 font-mono">${existing ? existing.phone : '+91 94470 12345'}</span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onclick="EduAdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
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
    const qual = document.getElementById('modal-fac-qual')?.value || 'Faizy (Pattikkad), MA';
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
    this.renderAll();
  },

  deleteFaculty: function (id) {
    if (confirm(`Remove faculty member ${id}?`)) {
      MahallDB.deleteFaculty(id);
      this.showToast('Faculty member removed.', 'info');
      this.renderAll();
    }
  },

  // =========================================================================
  // TAB 4: ACADEMIC COURSES & HALQAS (ADDING & DELETING)
  // =========================================================================
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
          <button onclick="EduAdminApp.openAddCourseModal('${c.id}')" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            <span>Edit</span>
          </button>
          <button onclick="EduAdminApp.deleteCourse('${c.id}')" class="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
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
          <button onclick="EduAdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="EduAdminApp.handleSaveCourse(event, '${id || ''}')" class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">Course Title *</label>
            <input type="text" id="modal-crs-title" required value="${existing ? existing.title : ''}" oninput="EduAdminApp.updateCoursePreview()" placeholder="e.g. Primary Islamic Education (Classes 1–5)"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Course Code *</label>
              <input type="text" id="modal-crs-code" required value="${existing ? existing.code : 'MAD-PRI'}" oninput="EduAdminApp.updateCoursePreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-teal-400 font-mono font-bold" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Category</label>
              <input type="text" id="modal-crs-cat" value="${existing ? existing.category : 'Primary Madrasa'}" oninput="EduAdminApp.updateCoursePreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Schedule & Timing</label>
              <input type="text" id="modal-crs-timing" value="${existing ? existing.timing : '06:45 AM - 08:30 AM (Daily)'}" oninput="EduAdminApp.updateCoursePreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Intake Capacity</label>
              <input type="text" id="modal-crs-intake" value="${existing ? existing.intake : '120 Students'}" oninput="EduAdminApp.updateCoursePreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Usthad / Lecturer in Charge</label>
              <input type="text" id="modal-crs-usthad" value="${existing ? existing.usthad : 'Muallim Zainudheen Faizy'}" oninput="EduAdminApp.updateCoursePreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Status</label>
              <select id="modal-crs-status" onchange="EduAdminApp.updateCoursePreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
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
            <button type="button" onclick="EduAdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
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
    if (pIntake) pIntake.textContent = `${intake} Intake`;
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
    this.renderAll();
  },

  deleteCourse: function (id) {
    if (confirm(`Delete course ${id}?`)) {
      MahallDB.deleteCourse(id);
      this.showToast('Course removed.', 'info');
      this.renderAll();
    }
  },

  // =========================================================================
  // TAB 5: SCHOLARSHIPS & AID (SUBMISSIONS & APPROVALS)
  // =========================================================================
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
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${s.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}">
            ${s.status}
          </span>
          ${s.approvedDate ? `<div class="text-[10px] text-slate-500 mt-1">${s.approvedDate}</div>` : ''}
        </td>
        <td class="p-4 align-top text-right whitespace-nowrap space-x-1">
          ${s.status === 'PENDING' ? `
            <button onclick="EduAdminApp.approveScholarship('${s.id}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition">
              Approve Subsidy
            </button>
          ` : `
            <span class="text-xs text-emerald-400 font-semibold px-2">Disbursed</span>
          `}
          <button onclick="EduAdminApp.deleteScholarship('${s.id}')" class="p-1 text-slate-500 hover:text-rose-400 rounded transition">
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
    this.renderAll();
  },

  deleteScholarship: function (id) {
    if (confirm(`Remove scholarship entry ${id}?`)) {
      MahallDB.deleteScholarship(id);
      this.showToast('Scholarship removed.', 'info');
      this.renderAll();
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
          <button onclick="EduAdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="EduAdminApp.handleSaveScholarship(event)" class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">Student Full Name *</label>
            <input type="text" id="modal-sch-name" required placeholder="Student name" oninput="EduAdminApp.updateScholarshipPreview()"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Class / Standard *</label>
              <input type="text" id="modal-sch-class" required value="Class 7" oninput="EduAdminApp.updateScholarshipPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Family ID *</label>
              <input type="text" id="modal-sch-famid" required value="W02-F005" oninput="EduAdminApp.updateScholarshipPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Subsidy / Aid Type</label>
              <select id="modal-sch-type" onchange="EduAdminApp.updateScholarshipPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="Orphan Education Subsidy">Orphan Education Subsidy</option>
                <option value="Destitute Madrasa Kit & Fee Waiver">Destitute Kit & Fee Waiver</option>
                <option value="Merit Excellence Scholarship">Merit Excellence Scholarship</option>
                <option value="Higher Studies Support">Higher Studies Support</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Sanctioned Amount (₹)</label>
              <input type="number" id="modal-sch-amt" value="2500" oninput="EduAdminApp.updateScholarshipPreview()"
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
            <button type="button" onclick="EduAdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
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
    this.renderAll();
  },

  // =========================================================================
  // TAB 6: STUDY MATERIALS & CIRCULARS (ADDING & DELETING)
  // =========================================================================
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
          <button onclick="EduAdminApp.deleteMaterial('${m.id}')" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition">
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
          <button onclick="EduAdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="EduAdminApp.handleSaveMaterial(event)" class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">Document Title *</label>
            <input type="text" id="modal-mat-title" required placeholder="e.g. Samastha Half-Yearly Exam Timetable 2026" oninput="EduAdminApp.updateMaterialPreview()"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Target Class / Level</label>
              <input type="text" id="modal-mat-class" value="Classes 1 to 10" oninput="EduAdminApp.updateMaterialPreview()"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Category</label>
              <select id="modal-mat-cat" onchange="EduAdminApp.updateMaterialPreview()" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="Timetable">Timetable & Schedule</option>
                <option value="Study Material">Study Material & Notes</option>
                <option value="Syllabus">Board Syllabus</option>
                <option value="Circular">Official Circular</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">PDF File / Document Name</label>
            <input type="text" id="modal-mat-file" value="Noorul_Huda_Document.pdf" oninput="EduAdminApp.updateMaterialPreview()"
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
            <button type="button" onclick="EduAdminApp.closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">Cancel</button>
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
    this.renderAll();
  },

  deleteMaterial: function (id) {
    if (confirm('Delete this published study material?')) {
      MahallDB.deleteMaterial(id);
      this.showToast('Material removed.', 'info');
      this.renderAll();
    }
  },

  // =========================================================================
  // PRINTABLE OFFICIAL ADMISSION PASS & STUDENT CARD
  // =========================================================================
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
            <button onclick="EduAdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
        </div>

        <div id="print-certificate-area" class="bg-white text-slate-900 p-8 rounded-xl border-4 border-double border-emerald-900 shadow-2xl relative max-w-xl mx-auto">
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
            <button onclick="EduAdminApp.closeModal()" class="p-1 text-slate-400 hover:text-white rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
        </div>

        <div id="print-certificate-area" class="bg-white text-slate-900 p-6 rounded-2xl border-2 border-emerald-900 shadow-xl max-w-sm mx-auto text-center">
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
  // MODAL & TOAST HELPERS
  // =========================================================================
  openModal: function (html) {
    const backdrop = document.getElementById('edu-modal-backdrop');
    const dialog = document.getElementById('edu-modal-dialog');
    if (backdrop && dialog) {
      dialog.innerHTML = html;
      backdrop.classList.remove('hidden');
      backdrop.classList.add('flex');
      if (window.lucide) window.lucide.createIcons();
    }
  },

  closeModal: function () {
    const backdrop = document.getElementById('edu-modal-backdrop');
    if (backdrop) {
      backdrop.classList.add('hidden');
      backdrop.classList.remove('flex');
    }
  },

  showToast: function (msg, type = 'info') {
    const container = document.getElementById('edu-toast-container');
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
  }
};

// Auto-run when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  EduAdminApp.init();
});
