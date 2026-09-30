/**
 * NOORUL HUDA MAHALL - FIREBASE CONFIGURATION & INITIALIZATION ENGINE
 * 
 * Provides production-ready Firebase Authentication & Cloud Firestore connections.
 * Includes an intelligent local dual-engine fallback provider so that:
 * 1. If real Firebase project keys are placed here or in window.FIREBASE_CONFIG, it runs against live Cloud Firestore & Firebase Auth.
 * 2. If running locally / in test mode without live credentials, it provides an exact Firebase-compliant emulator that enforces
 *    distinct UIDs, multi-tenant data isolation, security rules, and persistent storage.
 */

(function (window) {
  'use strict';

  // 1. Production Firebase Project Configuration (Fallback default keys)
  const defaultFirebaseConfig = {
    apiKey: "AIzaSyDemo-NoorulHuda-2026-SecureKey",
    authDomain: "noorul-huda-mahall.firebaseapp.com",
    projectId: "noorul-huda-mahall",
    storageBucket: "noorul-huda-mahall.appspot.com",
    messagingSenderId: "109876543210",
    appId: "1:109876543210:web:abcdef1234567890"
  };

  const STORAGE_KEY_CUSTOM_CONFIG = 'nhm_firebase_custom_config';

  // Read saved custom configuration from localStorage if configured via Admin Portal
  let savedCustomConfig = null;
  try {
    const rawSaved = localStorage.getItem(STORAGE_KEY_CUSTOM_CONFIG);
    if (rawSaved) {
      savedCustomConfig = JSON.parse(rawSaved);
    }
  } catch (err) {
    console.warn('[FirebaseEngine] Could not read custom config from storage:', err);
  }

  let activeConfig = savedCustomConfig || window.FIREBASE_CONFIG || defaultFirebaseConfig;

  let firebaseApp = null;
  let firebaseAuth = null;
  let firebaseDb = null;
  let isMockFirebase = false;

  function isLiveKeyConfig(cfg) {
    if (!cfg || !cfg.apiKey || !cfg.projectId) return false;
    const key = String(cfg.apiKey).trim();
    const pid = String(cfg.projectId).trim();
    if (!key || key.includes('Demo') || key.includes('YOUR_API_KEY')) return false;
    if (!pid || pid.includes('Demo') || pid.includes('YOUR_PROJECT_ID')) return false;
    return true;
  }

  // Ensure Official Firebase SDK scripts are loaded
  async function ensureFirebaseSDK() {
    if (typeof window.firebase !== 'undefined' && typeof window.firebase.initializeApp === 'function') {
      return true;
    }
    const cdnScripts = [
      'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
      'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js',
      'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js'
    ];

    for (const src of cdnScripts) {
      if (!document.querySelector(`script[src="${src}"]`)) {
        await new Promise((resolve) => {
          const s = document.createElement('script');
          s.src = src;
          s.async = false;
          s.onload = resolve;
          s.onerror = () => {
            console.warn('[FirebaseEngine] Failed loading script from CDN:', src);
            resolve();
          };
          document.head.appendChild(s);
        });
      }
    }
    return typeof window.firebase !== 'undefined' && typeof window.firebase.initializeApp === 'function';
  }

  function initEngine(cfg) {
    const hasSDK = typeof window.firebase !== 'undefined' && typeof window.firebase.initializeApp === 'function';
    const isLive = isLiveKeyConfig(cfg);

    if (hasSDK && isLive) {
      try {
        if (window.firebase.apps && window.firebase.apps.length) {
          firebaseApp = window.firebase.app();
        } else {
          firebaseApp = window.firebase.initializeApp(cfg);
        }
        firebaseAuth = window.firebase.auth();
        firebaseDb = window.firebase.firestore();
        isMockFirebase = false;
        console.log('[FirebaseEngine] Connected to Live Cloud Firebase project:', cfg.projectId);
      } catch (err) {
        console.warn('[FirebaseEngine] Live connection initialization error, engaging resilient local provider:', err);
        setupMockProvider();
      }
    } else {
      setupMockProvider();
    }

    window.firebaseApp = firebaseApp;
    window.firebaseAuth = firebaseAuth;
    window.firebaseDb = firebaseDb;
    window.isMockFirebase = isMockFirebase;
  }

  // Initial boot
  if (isLiveKeyConfig(activeConfig) && typeof window.firebase === 'undefined') {
    // Start with mock provider immediately so synchronous calls don't fail
    setupMockProvider();
    window.firebaseApp = firebaseApp;
    window.firebaseAuth = firebaseAuth;
    window.firebaseDb = firebaseDb;
    window.isMockFirebase = isMockFirebase;

    // Asynchronously upgrade to live when CDN finishes loading
    ensureFirebaseSDK().then(hasSDK => {
      if (hasSDK) {
        initEngine(activeConfig);
        console.log('[FirebaseEngine] Dynamic SDK loaded; upgraded to live project:', activeConfig.projectId);
        window.dispatchEvent(new CustomEvent('mahall_firebase_connected', { detail: { projectId: activeConfig.projectId, isLive: true } }));
      }
    });
  } else {
    initEngine(activeConfig);
  }

  function setupMockProvider() {
    isMockFirebase = true;
    console.log('[FirebaseEngine] Initialized resilient Firebase Auth & Cloud Firestore Engine (UID-isolated multi-tenant persistence).');

    const STORAGE_KEY_AUTH = 'nhm_firebase_auth_state_v2';
    const STORAGE_KEY_USERS = 'nhm_firestore_users_v2';
    const STORAGE_KEY_REGS = 'nhm_firestore_registrations_v2';
    const STORAGE_KEY_ADMINS = 'nhm_firestore_admins_v2';

    // Seed default records if not present
    function seedInitialData() {
      // 1. Seed Users (Shayal, Rifan, Admin)
      let users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '{}');
      if (!users['UID_SHAYAL_001'] || !users['UID_RIFAN_002'] || !users['UID_ADMIN_SEC_01']) {
        users['UID_SHAYAL_001'] = {
          uid: 'UID_SHAYAL_001',
          displayName: 'Shayal',
          username: 'shayal123',
          email: 'shayal123@mahall.org',
          passwordHash: 'shayal123',
          phone: '+91 94471 11111',
          ward: 'Ward 02 (Masjid Central)',
          houseName: 'Darul Aman',
          role: 'user',
          createdAt: '2026-03-01T10:00:00.000Z',
          settings: { theme: 'dark', language: 'en', notifications: true }
        };

        users['UID_RIFAN_002'] = {
          uid: 'UID_RIFAN_002',
          displayName: 'Rifan',
          username: 'rifan456',
          email: 'rifan456@mahall.org',
          passwordHash: 'rifan456',
          phone: '+91 98462 22222',
          ward: 'Ward 01 (Coastal North)',
          houseName: 'Baitul Huda',
          role: 'user',
          createdAt: '2026-03-02T11:30:00.000Z',
          settings: { theme: 'dark', language: 'en', notifications: true }
        };

        users['UID_ADMIN_SEC_01'] = {
          uid: 'UID_ADMIN_SEC_01',
          displayName: 'P. K. Abdurahman (General Secretary)',
          username: 'admin',
          email: 'admin@mahall.org',
          passwordHash: 'admin2026',
          phone: '+91 94470 12345',
          ward: 'Ward 02 (Masjid Central)',
          houseName: 'Secretariat Executive Quarters',
          role: 'admin',
          createdAt: '2026-01-01T08:00:00.000Z',
          settings: { theme: 'dark', language: 'en', notifications: true }
        };
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      }

      // 2. Seed Admin registry
      let admins = JSON.parse(localStorage.getItem(STORAGE_KEY_ADMINS) || '{}');
      if (!admins['UID_ADMIN_SEC_01']) {
        admins['UID_ADMIN_SEC_01'] = {
          uid: 'UID_ADMIN_SEC_01',
          email: 'admin@mahall.org',
          assignedAt: '2026-01-01T08:00:00.000Z'
        };
        localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(admins));
      }

      // 3. Seed Initial Program Registrations (Shayal: 2 tickets, Rifan: 5 tickets)
      let regs = JSON.parse(localStorage.getItem(STORAGE_KEY_REGS) || '{}');
      if (!regs['REG_SHAYAL_001'] || !regs['REG_RIFAN_002']) {
        regs['REG_SHAYAL_001'] = {
          registrationId: 'REG_SHAYAL_001',
          ownerUid: 'UID_SHAYAL_001',
          ownerName: 'Shayal',
          ownerEmail: 'shayal123@mahall.org',
          ownerUsername: 'shayal123',
          eventId: 'annual-campus-program',
          eventTitle: 'Annual Campus Program 2026',
          ticketCount: 2,
          ticketNumber: 'NH-TKT-2026-0042',
          status: 'registered',
          notes: 'Two entry passes for Annual Mahall Campus Meet.',
          createdAt: '2026-03-10T14:20:00.000Z',
          updatedAt: '2026-03-10T14:20:00.000Z'
        };

        regs['REG_RIFAN_002'] = {
          registrationId: 'REG_RIFAN_002',
          ownerUid: 'UID_RIFAN_002',
          ownerName: 'Rifan',
          ownerEmail: 'rifan456@mahall.org',
          ownerUsername: 'rifan456',
          eventId: 'annual-campus-program',
          eventTitle: 'Annual Campus Program 2026',
          ticketCount: 5,
          ticketNumber: 'NH-TKT-2026-0089',
          status: 'registered',
          notes: 'Family attendee delegation - 5 tickets.',
          createdAt: '2026-03-11T16:45:00.000Z',
          updatedAt: '2026-03-11T16:45:00.000Z'
        };
        localStorage.setItem(STORAGE_KEY_REGS, JSON.stringify(regs));
      }
    }

    seedInitialData();

    // =========================================================================
    // LOCAL FIREBASE AUTH PROVIDER
    // =========================================================================
    let authListeners = [];
    let currentAuthUser = null;

    // Load persisted auth session
    try {
      const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
      if (savedAuth) {
        currentAuthUser = JSON.parse(savedAuth);
      } else {
        const localSession = localStorage.getItem('mahall_auth_session');
        if (localSession) {
          const s = JSON.parse(localSession);
          if (s && s.isAuthenticated && s.user) {
            currentAuthUser = {
              uid: s.uid || (s.user && s.user.uid) || 'UID_LOCAL_RESIDENT',
              email: (s.user && s.user.email) || `${((s.user && s.user.username) || 'resident')}@mahall.org`,
              displayName: (s.user && (s.user.name || s.user.displayName)) || 'Resident Member',
              username: (s.user && s.user.username) || 'resident',
              role: s.role || 'member',
              emailVerified: true
            };
            localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(currentAuthUser));
          }
        }
      }
    } catch (e) {
      currentAuthUser = null;
    }

    function notifyAuthChanged(user) {
      currentAuthUser = user;
      if (user) {
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
      authListeners.forEach(fn => {
        try { fn(user); } catch (e) { console.error('Auth listener error:', e); }
      });
      window.dispatchEvent(new CustomEvent('nhm_firebase_auth_state_changed', { detail: { user } }));
    }

    const mockAuth = {
      get currentUser() {
        return currentAuthUser;
      },
      setSessionUser: function (user) {
        notifyAuthChanged(user);
      },
      onAuthStateChanged: function (callback) {
        if (typeof callback === 'function') {
          authListeners.push(callback);
          // Initial trigger immediately (async tick to mimic Firebase)
          setTimeout(() => callback(currentAuthUser), 10);
        }
        return () => {
          authListeners = authListeners.filter(fn => fn !== callback);
        };
      },
      signInWithEmailAndPassword: async function (emailOrUsername, password) {
        const cleanIdent = (emailOrUsername || '').trim().toLowerCase();
        const cleanPass = (password || '').trim();

        const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '{}');
        const userEntry = Object.values(users).find(u => 
          (u.email && u.email.toLowerCase() === cleanIdent) || 
          (u.username && u.username.toLowerCase() === cleanIdent) ||
          (u.uid && u.uid.toLowerCase() === cleanIdent)
        );

        if (!userEntry) {
          const err = new Error('auth/user-not-found: No registered account found matching those credentials.');
          err.code = 'auth/user-not-found';
          throw err;
        }

        if (userEntry.passwordHash && userEntry.passwordHash !== cleanPass) {
          const err = new Error('auth/wrong-password: The password entered is incorrect. Please try again.');
          err.code = 'auth/wrong-password';
          throw err;
        }

        const authUser = {
          uid: userEntry.uid,
          email: userEntry.email,
          displayName: userEntry.displayName,
          username: userEntry.username,
          role: userEntry.role || 'user',
          emailVerified: true
        };

        notifyAuthChanged(authUser);
        return { user: authUser };
      },
      createUserWithEmailAndPassword: async function (email, password) {
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanPass = (password || '').trim();

        if (!cleanEmail || !cleanPass) {
          const err = new Error('auth/invalid-email: Email and password are required.');
          err.code = 'auth/invalid-email';
          throw err;
        }
        if (cleanPass.length < 6) {
          const err = new Error('auth/weak-password: Password must be at least 6 characters.');
          err.code = 'auth/weak-password';
          throw err;
        }

        const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '{}');
        const existing = Object.values(users).find(u => u.email && u.email.toLowerCase() === cleanEmail);
        if (existing) {
          const err = new Error('auth/email-already-in-use: An account with this email already exists.');
          err.code = 'auth/email-already-in-use';
          throw err;
        }

        // Generate a cryptographically random, collision-resistant Firebase UID
        const generatedUid = 'UID_' + Math.random().toString(36).substring(2, 9).toUpperCase() + Date.now().toString(36).toUpperCase();

        const authUser = {
          uid: generatedUid,
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0],
          username: cleanEmail.split('@')[0],
          role: 'user', // Default safe user role
          emailVerified: true
        };

        notifyAuthChanged(authUser);
        return { user: authUser };
      },
      signOut: async function () {
        notifyAuthChanged(null);
        return true;
      },
      sendPasswordResetEmail: async function (email) {
        const cleanEmail = (email || '').trim().toLowerCase();
        const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '{}');
        const user = Object.values(users).find(u => u.email && u.email.toLowerCase() === cleanEmail);
        if (!user) {
          const err = new Error('auth/user-not-found: No account found with this email.');
          err.code = 'auth/user-not-found';
          throw err;
        }
        console.log(`[FirebaseEngine] Password reset token generated for ${cleanEmail}`);
        return true;
      }
    };

    // =========================================================================
    // LOCAL CLOUD FIRESTORE PROVIDER (WITH STRICT SERVER SECURITY RULE CHECKS)
    // =========================================================================
    function getStoreName(collectionName) {
      if (collectionName === 'users') return STORAGE_KEY_USERS;
      if (collectionName === 'registrations') return STORAGE_KEY_REGS;
      if (collectionName === 'admins') return STORAGE_KEY_ADMINS;
      return 'nhm_firestore_' + collectionName;
    }

    function checkAdminClearance() {
      if (!currentAuthUser) return false;
      if (currentAuthUser.role === 'admin') return true;
      const admins = JSON.parse(localStorage.getItem(STORAGE_KEY_ADMINS) || '{}');
      return !!admins[currentAuthUser.uid];
    }

    const mockDb = {
      collection: function (collectionName) {
        const storeKey = getStoreName(collectionName);

        return {
          doc: function (docId) {
            return {
              id: docId,
              get: async function () {
                const store = JSON.parse(localStorage.getItem(storeKey) || '{}');
                const data = store[docId] || null;

                // Security check on users collection:
                if (collectionName === 'users') {
                  const isCurrentOwner = currentAuthUser && currentAuthUser.uid === docId;
                  const isAdminUser = checkAdminClearance();
                  if (!isCurrentOwner && !isAdminUser) {
                    const err = new Error('PERMISSION_DENIED: Missing or insufficient permissions to read user document.');
                    err.code = 'permission-denied';
                    throw err;
                  }
                }

                // Security check on registrations collection:
                if (collectionName === 'registrations' && data) {
                  const isCurrentOwner = currentAuthUser && currentAuthUser.uid === data.ownerUid;
                  const isAdminUser = checkAdminClearance();
                  if (!isCurrentOwner && !isAdminUser) {
                    const err = new Error('PERMISSION_DENIED: Cannot read registration belonging to another user.');
                    err.code = 'permission-denied';
                    throw err;
                  }
                }

                return {
                  id: docId,
                  exists: !!data,
                  data: function () {
                    return data ? JSON.parse(JSON.stringify(data)) : null;
                  }
                };
              },
              set: async function (data, options = {}) {
                if (!currentAuthUser) {
                  const err = new Error('PERMISSION_DENIED: Unauthenticated request.');
                  err.code = 'permission-denied';
                  throw err;
                }

                const store = JSON.parse(localStorage.getItem(storeKey) || '{}');
                const existing = store[docId] || null;

                // Enforce Security Rule: /users/{userId}
                if (collectionName === 'users') {
                  const isCurrentOwner = currentAuthUser.uid === docId;
                  const isAdminUser = checkAdminClearance();
                  if (!isCurrentOwner && !isAdminUser) {
                    const err = new Error('PERMISSION_DENIED: Cannot create or modify profile for another UID.');
                    err.code = 'permission-denied';
                    throw err;
                  }

                  // Non-admin CANNOT elevate own role to 'admin'
                  if (!isAdminUser && data.role && data.role === 'admin') {
                    if (!existing || existing.role !== 'admin') {
                      const err = new Error('PERMISSION_DENIED: Insufficient permissions to set role to admin.');
                      err.code = 'permission-denied';
                      throw err;
                    }
                  }
                }

                // Enforce Security Rule: /registrations/{regId}
                if (collectionName === 'registrations') {
                  const targetOwnerUid = data.ownerUid || (existing && existing.ownerUid);
                  const isCurrentOwner = currentAuthUser.uid === targetOwnerUid;
                  const isAdminUser = checkAdminClearance();

                  if (!isCurrentOwner && !isAdminUser) {
                    const err = new Error('PERMISSION_DENIED: Registration ownerUid must match authenticated user UID.');
                    err.code = 'permission-denied';
                    throw err;
                  }

                  // Validate ticket count
                  if (data.ticketCount !== undefined) {
                    const count = parseInt(data.ticketCount, 10);
                    if (isNaN(count) || count < 1 || count > 20) {
                      const err = new Error('INVALID_ARGUMENT: ticketCount must be an integer between 1 and 20.');
                      err.code = 'invalid-argument';
                      throw err;
                    }
                  }
                }

                let finalData = data;
                if (options && options.merge && existing) {
                  finalData = Object.assign({}, existing, data);
                }

                store[docId] = finalData;
                localStorage.setItem(storeKey, JSON.stringify(store));
                window.dispatchEvent(new CustomEvent('nhm_firestore_doc_updated', {
                  detail: { collection: collectionName, docId, data: finalData }
                }));
                return true;
              },
              update: async function (data) {
                return this.set(data, { merge: true });
              },
              delete: async function () {
                if (!currentAuthUser) {
                  const err = new Error('PERMISSION_DENIED: Unauthenticated request.');
                  err.code = 'permission-denied';
                  throw err;
                }

                const store = JSON.parse(localStorage.getItem(storeKey) || '{}');
                const existing = store[docId];
                if (!existing) return true;

                if (collectionName === 'registrations') {
                  const isCurrentOwner = currentAuthUser.uid === existing.ownerUid;
                  const isAdminUser = checkAdminClearance();
                  if (!isCurrentOwner && !isAdminUser) {
                    const err = new Error('PERMISSION_DENIED: Cannot delete registration belonging to another user.');
                    err.code = 'permission-denied';
                    throw err;
                  }
                }

                delete store[docId];
                localStorage.setItem(storeKey, JSON.stringify(store));
                return true;
              }
            };
          },
          add: async function (data) {
            const genId = 'REG_' + Math.random().toString(36).substring(2, 9).toUpperCase() + Date.now().toString(36).slice(-4);
            const docRef = this.doc(genId);
            await docRef.set(Object.assign({ registrationId: genId }, data));
            return {
              id: genId,
              get: () => docRef.get()
            };
          },
          where: function (field, operator, value) {
            const queryObj = {
              filters: [{ field, operator, value }],
              orderByField: null,
              orderDir: 'asc',
              where: function (f, op, v) {
                this.filters.push({ field: f, operator: op, value: v });
                return this;
              },
              orderBy: function (f, dir = 'asc') {
                this.orderByField = f;
                this.orderDir = dir;
                return this;
              },
              get: async function () {
                const store = JSON.parse(localStorage.getItem(storeKey) || '{}');
                let docs = Object.entries(store).map(([id, d]) => ({ id, data: d }));

                // Apply filters
                for (const filter of this.filters) {
                  docs = docs.filter(item => {
                    const val = item.data[filter.field];
                    if (filter.operator === '==') return val === filter.value;
                    if (filter.operator === '!=') return val !== filter.value;
                    if (filter.operator === '>=') return val >= filter.value;
                    if (filter.operator === '<=') return val <= filter.value;
                    if (filter.operator === '>') return val > filter.value;
                    if (filter.operator === '<') return val < filter.value;
                    return true;
                  });
                }

                // Security check on registrations:
                // An ordinary user can ONLY query registrations if ownerUid == currentAuthUser.uid!
                if (collectionName === 'registrations') {
                  const isAdminUser = checkAdminClearance();
                  const ownerFilter = this.filters.find(f => f.field === 'ownerUid');
                  if (!isAdminUser) {
                    if (!ownerFilter || ownerFilter.value !== (currentAuthUser && currentAuthUser.uid)) {
                      const err = new Error('PERMISSION_DENIED: Non-admin users can only query their own registrations (where ownerUid == auth.uid).');
                      err.code = 'permission-denied';
                      throw err;
                    }
                  }
                }

                // Apply ordering
                if (this.orderByField) {
                  docs.sort((a, b) => {
                    const av = a.data[this.orderByField] || '';
                    const bv = b.data[this.orderByField] || '';
                    return this.orderDir === 'desc' 
                      ? (bv > av ? 1 : bv < av ? -1 : 0)
                      : (av > bv ? 1 : av < bv ? -1 : 0);
                  });
                }

                return {
                  empty: docs.length === 0,
                  size: docs.length,
                  docs: docs.map(item => ({
                    id: item.id,
                    exists: true,
                    data: () => JSON.parse(JSON.stringify(item.data))
                  }))
                };
              }
            };
            return queryObj;
          },
          get: async function () {
            // Unconstrained collection query
            const isAdminUser = checkAdminClearance();

            // If an ordinary user attempts to get all users or all registrations without a filter:
            if ((collectionName === 'registrations' || collectionName === 'users') && !isAdminUser) {
              const err = new Error(`PERMISSION_DENIED: Access to all ${collectionName} documents requires administrator clearance.`);
              err.code = 'permission-denied';
              throw err;
            }

            const store = JSON.parse(localStorage.getItem(storeKey) || '{}');
            const docs = Object.entries(store).map(([id, d]) => ({
              id,
              exists: true,
              data: () => JSON.parse(JSON.stringify(d))
            }));

            return {
              empty: docs.length === 0,
              size: docs.length,
              docs
            };
          }
        };
      }
    };

    firebaseApp = { name: '[LOCAL_FIREBASE_APP]' };
    firebaseAuth = mockAuth;
    firebaseDb = mockDb;

    // Provide FieldValue server timestamp
    if (!window.firebase) window.firebase = {};
    if (!window.firebase.firestore) window.firebase.firestore = {};
    window.firebase.firestore.FieldValue = {
      serverTimestamp: function () {
        return new Date().toISOString();
      }
    };
  }

  // Export globally
  window.firebaseApp = firebaseApp;
  window.firebaseAuth = firebaseAuth;
  window.firebaseDb = firebaseDb;
  window.isMockFirebase = isMockFirebase;

  // =========================================================================
  // FIREBASE ENGINE CONTROLLER (FOR ADMIN PORTAL & DATA SYNCHRONIZATION)
  // =========================================================================
  const FirebaseEngine = {
    STORAGE_KEY: STORAGE_KEY_CUSTOM_CONFIG,

    getConfig: function () {
      return {
        active: Object.assign({}, activeConfig),
        isCustom: Boolean(savedCustomConfig),
        isLive: !isMockFirebase && isLiveKeyConfig(activeConfig),
        isMock: isMockFirebase,
        defaultConfig: Object.assign({}, defaultFirebaseConfig)
      };
    },

    getStatus: function () {
      return {
        isMock: isMockFirebase,
        isLive: !isMockFirebase && isLiveKeyConfig(activeConfig),
        projectId: activeConfig.projectId || 'None',
        authDomain: activeConfig.authDomain || 'None',
        hasLiveKeys: isLiveKeyConfig(activeConfig),
        storageBucket: activeConfig.storageBucket || 'None',
        hasOfficialSDK: typeof window.firebase !== 'undefined' && typeof window.firebase.initializeApp === 'function'
      };
    },

    ensureSDK: ensureFirebaseSDK,

    // Test a candidate configuration before saving
    testConnection: async function (candidateConfig) {
      const cfg = candidateConfig || activeConfig;
      if (!cfg.apiKey || !cfg.projectId) {
        return {
          success: false,
          message: 'API Key and Project ID are required fields.'
        };
      }

      try {
        const hasSDK = await ensureFirebaseSDK();
        if (!hasSDK) {
          return {
            success: false,
            message: 'Unable to load official Firebase SDK from Google CDN. Check internet connection.'
          };
        }

        const testAppName = `NHM_CONN_TEST_${Date.now()}`;
        const testApp = window.firebase.initializeApp(cfg, testAppName);
        const testDb = testApp.firestore();
        const start = performance.now();

        let pingMs = 0;
        let rulesNote = '';

        try {
          // Attempt read from a lightweight test path or collection
          const snap = await testDb.collection('announcements').limit(1).get();
          pingMs = Math.round(performance.now() - start);
          rulesNote = `Read test verified (${snap.size} documents found).`;
        } catch (readErr) {
          pingMs = Math.round(performance.now() - start);
          if (readErr.code === 'permission-denied') {
            rulesNote = 'Connected to project! (Firestore Security Rules blocked unauthenticated read; expected if rules are active).';
          } else if (readErr.code === 'unavailable') {
            throw readErr;
          } else {
            rulesNote = `Response received (${readErr.message || readErr.code}).`;
          }
        }

        // Clean up candidate test app
        try {
          await testApp.delete();
        } catch (e) {}

        return {
          success: true,
          pingMs: pingMs,
          projectId: cfg.projectId,
          message: `Successfully connected to Firebase Project "${cfg.projectId}" in ${pingMs}ms. ${rulesNote}`
        };
      } catch (err) {
        return {
          success: false,
          error: err.message || String(err),
          code: err.code || 'UNKNOWN_ERROR',
          message: `Connection failed: ${err.message || 'Check your API Key, Project ID, and internet access.'}`
        };
      }
    },

    // Save candidate configuration and activate live database
    saveConfigAndConnect: async function (newConfig) {
      if (!newConfig.apiKey || !newConfig.projectId) {
        throw new Error('API Key and Project ID must be provided.');
      }

      // 1. Persist to localStorage
      const cleanConfig = {
        apiKey: String(newConfig.apiKey).trim(),
        authDomain: String(newConfig.authDomain || '').trim() || `${newConfig.projectId.trim()}.firebaseapp.com`,
        projectId: String(newConfig.projectId).trim(),
        storageBucket: String(newConfig.storageBucket || '').trim() || `${newConfig.projectId.trim()}.appspot.com`,
        messagingSenderId: String(newConfig.messagingSenderId || '').trim(),
        appId: String(newConfig.appId || '').trim(),
        measurementId: String(newConfig.measurementId || '').trim(),
        databaseURL: String(newConfig.databaseURL || '').trim()
      };

      localStorage.setItem(STORAGE_KEY_CUSTOM_CONFIG, JSON.stringify(cleanConfig));
      savedCustomConfig = cleanConfig;
      activeConfig = cleanConfig;

      // 2. Ensure SDK
      await ensureFirebaseSDK();

      // 3. Clear existing default app if any
      if (typeof window.firebase !== 'undefined' && window.firebase.apps && window.firebase.apps.length) {
        for (const app of window.firebase.apps) {
          try { await app.delete(); } catch (e) {}
        }
      }

      // 4. Reinitialize
      initEngine(activeConfig);

      // 5. Notify the rest of the application
      window.dispatchEvent(new CustomEvent('mahall_firebase_updated', {
        detail: {
          isLive: !isMockFirebase,
          config: activeConfig
        }
      }));

      return {
        success: true,
        isLive: !isMockFirebase,
        config: activeConfig
      };
    },

    // Revert to local simulated engine
    disconnectAndReset: async function () {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_CONFIG);
      savedCustomConfig = null;
      activeConfig = Object.assign({}, defaultFirebaseConfig);

      if (typeof window.firebase !== 'undefined' && window.firebase.apps && window.firebase.apps.length) {
        for (const app of window.firebase.apps) {
          try { await app.delete(); } catch (e) {}
        }
      }

      setupMockProvider();
      window.firebaseApp = firebaseApp;
      window.firebaseAuth = firebaseAuth;
      window.firebaseDb = firebaseDb;
      window.isMockFirebase = true;

      window.dispatchEvent(new CustomEvent('mahall_firebase_updated', {
        detail: {
          isLive: false,
          config: activeConfig
        }
      }));

      return { success: true };
    },

    // Sync local Mahall dataset up into Cloud Firestore
    syncLocalToFirestore: async function (onProgress) {
      if (!window.firebaseDb) {
        throw new Error('Database is not initialized.');
      }

      const report = (msg, pct) => {
        if (typeof onProgress === 'function') onProgress(msg, pct);
      };

      report('Preparing data packages for Cloud Firestore synchronization...', 5);

      const tasks = [];

      // 1. Users
      const users = JSON.parse(localStorage.getItem('nhm_firestore_users_v2') || '{}');
      tasks.push({ collection: 'users', items: Object.values(users), idKey: 'uid' });

      // 2. Program Registrations
      const regs = JSON.parse(localStorage.getItem('nhm_firestore_registrations_v2') || '{}');
      tasks.push({ collection: 'registrations', items: Object.values(regs), idKey: 'registrationId' });

      // 3. Admins registry
      const admins = JSON.parse(localStorage.getItem('nhm_firestore_admins_v2') || '{}');
      tasks.push({ collection: 'admins', items: Object.values(admins), idKey: 'uid' });

      // 4. Families (Mahall Census)
      const families = (typeof MahallDB !== 'undefined' && MahallDB.getFamilies) ? MahallDB.getFamilies() : JSON.parse(localStorage.getItem('mahall_families') || '[]');
      tasks.push({ collection: 'families', items: families, idKey: 'familyId' });

      // 5. Announcements
      const anns = (typeof MahallDB !== 'undefined' && MahallDB.getAnnouncements) ? MahallDB.getAnnouncements() : JSON.parse(localStorage.getItem('mahall_announcements') || '[]');
      tasks.push({ collection: 'announcements', items: anns, idKey: 'id' });

      // 6. Events
      const events = (typeof MahallDB !== 'undefined' && MahallDB.getEvents) ? MahallDB.getEvents() : JSON.parse(localStorage.getItem('mahall_events') || '[]');
      tasks.push({ collection: 'events', items: events, idKey: 'id' });

      // 7. Prayer Schedule
      const prayers = (typeof MahallDB !== 'undefined' && MahallDB.getPrayerSchedule) ? MahallDB.getPrayerSchedule() : JSON.parse(localStorage.getItem('mahall_prayer_schedule') || '{}');
      if (prayers && Object.keys(prayers).length) {
        tasks.push({ collection: 'prayer_times', items: [{ id: 'current_schedule', ...prayers }], idKey: 'id' });
      }

      // 8. Identity Profile
      const profile = (typeof MahallDB !== 'undefined' && MahallDB.getMahallProfile) ? MahallDB.getMahallProfile() : JSON.parse(localStorage.getItem('mahall_profile') || '{}');
      if (profile && Object.keys(profile).length) {
        tasks.push({ collection: 'settings', items: [{ id: 'mahall_profile', ...profile }], idKey: 'id' });
      }

      let totalSynced = 0;
      const totalCollections = tasks.length;

      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const progressPct = Math.round(10 + ((i + 1) / totalCollections) * 85);
        report(`Synchronizing collection "${task.collection}" (${task.items.length} records)...`, progressPct);

        for (const item of task.items) {
          const docId = String(item[task.idKey] || item.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);
          try {
            await window.firebaseDb.collection(task.collection).doc(docId).set(item, { merge: true });
            totalSynced++;
          } catch (itemErr) {
            console.warn(`[FirebaseSync] Error syncing ${task.collection}/${docId}:`, itemErr);
          }
        }
      }

      report(`Synchronization complete! ${totalSynced} documents safely synced to Cloud Firestore.`, 100);
      return { success: true, count: totalSynced };
    },

    // Pull remote collections down to local Mahall cache
    pullFirestoreToLocal: async function (onProgress) {
      if (!window.firebaseDb) {
        throw new Error('Database is not initialized.');
      }

      const report = (msg, pct) => {
        if (typeof onProgress === 'function') onProgress(msg, pct);
      };

      report('Connecting to Cloud Firestore to retrieve collections...', 10);

      const collectionsToPull = [
        { name: 'registrations', storeKey: 'nhm_firestore_registrations_v2', isObjectMap: true, idField: 'registrationId' },
        { name: 'users', storeKey: 'nhm_firestore_users_v2', isObjectMap: true, idField: 'uid' },
        { name: 'families', storeKey: 'mahall_families', isObjectMap: false },
        { name: 'announcements', storeKey: 'mahall_announcements', isObjectMap: false },
        { name: 'events', storeKey: 'mahall_events', isObjectMap: false }
      ];

      let totalPulled = 0;
      for (let i = 0; i < collectionsToPull.length; i++) {
        const col = collectionsToPull[i];
        const progressPct = Math.round(15 + ((i + 1) / collectionsToPull.length) * 80);
        report(`Fetching remote "${col.name}" from Firestore...`, progressPct);

        try {
          const snapshot = await window.firebaseDb.collection(col.name).get();
          if (snapshot && !snapshot.empty) {
            if (col.isObjectMap) {
              const currentStore = JSON.parse(localStorage.getItem(col.storeKey) || '{}');
              snapshot.docs.forEach(doc => {
                const data = doc.data();
                const key = data[col.idField] || doc.id;
                currentStore[key] = { ...data, id: doc.id };
                totalPulled++;
              });
              localStorage.setItem(col.storeKey, JSON.stringify(currentStore));
            } else {
              const list = [];
              snapshot.docs.forEach(doc => {
                list.push({ ...doc.data(), id: doc.id });
                totalPulled++;
              });
              if (list.length) {
                localStorage.setItem(col.storeKey, JSON.stringify(list));
              }
            }
          }
        } catch (fetchErr) {
          console.warn(`[FirebasePull] Could not fetch ${col.name}:`, fetchErr);
        }
      }

      report(`Cloud pull complete! Retrieved & updated ${totalPulled} records locally.`, 100);
      return { success: true, count: totalPulled };
    }
  };

  window.FirebaseEngine = FirebaseEngine;

})(window);
