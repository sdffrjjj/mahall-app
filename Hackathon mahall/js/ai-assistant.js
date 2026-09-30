/**
 * NOORUL HUDA MAHALL - AI ASSISTANT & KNOWLEDGE ENGINE
 * Trained on verified Mahall community records, prayer schedules,
 * administration, madrasa, welfare, zakat, geography, and certificate services.
 */

const MahallAI = {
  // Knowledge Base covering the entire website
  answerQuery: function(userQuery, lang = 'en') {
    if (!userQuery) return '';
    const q = userQuery.toLowerCase().trim();

    // Auto-detect language if query is written in Malayalam or Arabic script
    const hasMalayalam = /[\u0D00-\u0D7F]/.test(q);
    const hasArabic = /[\u0600-\u06FF]/.test(q);
    const activeLang = hasMalayalam ? 'ml' : hasArabic ? 'ar' : (lang || 'en');

    // =========================================================================
    // 1. PRAYER TIMES & DAILY SCHEDULE
    // =========================================================================
    if (
      (q.includes('prayer') || q.includes('namaz') || q.includes('salah') || q.includes('time') || q.includes('azan') || q.includes('iqamah') || q.includes('offset') || q.includes('fajr') || q.includes('dhuhr') || q.includes('asr') || q.includes('maghrib') || q.includes('isha') || q.includes('നിസ്കാരം') || q.includes('നമസ്കാരം') || q.includes('സമയം') || q.includes('ബാങ്ക്') || q.includes('ഇഖാമത്ത്') || q.includes('صلاة') || q.includes('أوقات') || q.includes('أذان') || q.includes('إقامة')) &&
      !q.includes('jumua') && !q.includes('jumu\'ah') && !q.includes('friday') && !q.includes('eid')
    ) {
      if (activeLang === 'ml') {
        return `🕌 **നൂറുൽ ഹുദാ സെൻട്രൽ മസ്ജിദ് - ഇന്നത്തെ നിസ്കാര സമയങ്ങൾ**:\n` +
          `• **സുബ്ഹ് (Fajr)**: ബാങ്ക് 05:12 AM | ഇഖാമത്ത് 05:30 AM\n` +
          `• **സൂര്യോദയം (Sunrise)**: 06:21 AM\n` +
          `• **ളുഹ്ർ (Dhuhr)**: ബാങ്ക് 12:28 PM | ഇഖാമത്ത് 12:45 PM\n` +
          `• **അസ്വർ (Asr)**: ബാങ്ക് 03:45 PM | ഇഖാമത്ത് 04:00 PM\n` +
          `• **മഗ്‌രിബ് (Maghrib)**: ബാങ്ക് 06:34 PM | ഇഖാമത്ത് 06:45 PM\n` +
          `• **ഇശാഅ് (Isha)**: ബാങ്ക് 07:48 PM | ഇഖാമത്ത് 08:05 PM\n\n` +
          `📍 കോഴിക്കോട് (Calicut, Kerala) സമയം അടിസ്ഥാനമാക്കി കൃത്യമായി ചിട്ടപ്പെടുത്തിയത്.\n` +
          `👉 [മുഴുവൻ നിസ്കാര വിവരങ്ങൾ കാണുക](prayer.html#todays-times)`;
      } else if (activeLang === 'ar') {
        return `🕌 **مواقيت الصلاة اليومية - جامع نور الهدى المركزي**:\n` +
          `• **الفجر**: الأذان 05:12 ص | الإقامة 05:30 ص\n` +
          `• **الشروق**: 06:21 ص\n` +
          `• **الظهر**: الأذان 12:28 م | الإقامة 12:45 م\n` +
          `• **العصر**: الأذان 03:45 م | الإقامة 04:00 م\n` +
          `• **المغرب**: الأذان 06:34 م | الإقامة 06:45 م\n` +
          `• **العشاء**: الأذان 07:48 م | الإقامة 08:05 م\n\n` +
          `👉 [عرض جدول الصلاة كاملاً](prayer.html#todays-times)`;
      } else {
        return `🕌 **Daily Congregational Prayer Times (Noorul Huda Central Masjid)**:\n` +
          `• **Fajr**: Adhan 05:12 AM | Iqamah 05:30 AM\n` +
          `• **Sunrise**: 06:21 AM\n` +
          `• **Dhuhr**: Adhan 12:28 PM | Iqamah 12:45 PM\n` +
          `• **Asr**: Adhan 03:45 PM | Iqamah 04:00 PM\n` +
          `• **Maghrib**: Adhan 06:34 PM | Iqamah 06:45 PM\n` +
          `• **Isha**: Adhan 07:48 PM | Iqamah 08:05 PM\n\n` +
          `📍 All times synchronized with automated audio Adhan & digital display at Central Masjid.\n` +
          `👉 [Open Full Prayer Timetable](prayer.html#todays-times)`;
      }
    }

    // =========================================================================
    // 2. JUMU'AH PRAYER & KHUTBAH
    // =========================================================================
    if (q.includes('jumua') || q.includes('jumu\'ah') || q.includes('friday prayer') || q.includes('khutbah') || q.includes('khatib') || q.includes('വെള്ളിയാഴ്ച') || q.includes('ജുമുഅ') || q.includes('ഖുതുബ') || q.includes('ഖത്തീബ്') || q.includes('الجمعة') || q.includes('خطبة') || q.includes('خطيب')) {
      if (activeLang === 'ml') {
        return `🕌 **വെള്ളിയാഴ്ച ജുമുഅ നിസ്കാരം & ഖുതുബ വിവരങ്ങൾ**:\n` +
          `• **ആദ്യ ബാങ്ക്**: 12:15 PM\n` +
          `• **മലയാളം ഉദ്ബോധനം**: 12:45 PM\n` +
          `• **അറബിക് ഖുതുബ & ജുമുഅ ഫർള് നിസ്കാരം**: 01:15 PM\n` +
          `• **മുഖ്യ ഖത്തീബ്**: മൗലാനാ അബ്ദുൽ റഷീദ് ഫൈസി (Chief Imam)\n` +
          `• **ഈ ആഴ്ചയിലെ വിഷയം**: "സാമൂഹിക സഹവർത്തിത്വവും കുടുംബ ഭദ്രതയും"\n` +
          `• **സൗകര്യങ്ങൾ**: 2-ാം നിലയിൽ സ്ത്രീകൾക്ക് പ്രത്യേകം പ്രവേശന കവാടത്തോടു കൂടിയ നിസ്കാര ഹാൾ (Gate 2).\n\n` +
          `👉 [ജുമുഅ സമയക്രമവും പഴയ ഖുതുബകളും കാണുക](prayer.html#jumua)`;
      } else if (activeLang === 'ar') {
        return `🕌 **جدول صلاة الجمعة والخطبة المباركة**:\n` +
          `• **الأذان الأول**: 12:15 م\n` +
          `• **الموعظة التوجيهية**: 12:45 م\n` +
          `• **خطبة الجمعة وصلاة الفرض**: 01:15 م\n` +
          `• **الخطيب والمدرس**: فضيلة الشيخ مولانا عبد الرشيد فايزي\n` +
          `• **موضوع الأسبوع**: "التراحم في الحياة المجتمعية وحسن الجوار"\n\n` +
          `👉 [صفحة الجمعة والخطب الأرشيفية](prayer.html#jumua)`;
      } else {
        return `🕌 **Friday Jumu'ah Prayer & Khutbah Schedule**:\n` +
          `• **First Adhan**: 12:15 PM\n` +
          `• **Pre-Khutbah Guidance (Malayalam)**: 12:45 PM\n` +
          `• **Arabic Khutbah & Congregational Salah**: 01:15 PM\n` +
          `• **Chief Khateeb**: Usthad Maulana Abdul Rasheed Faizy\n` +
          `• **Topic of the Week**: "Compassion in Community Living & Mutual Respect"\n` +
          `• **Facilities**: Dedicated second-floor Ladies' Sanctuary accessible via Gate 2 with elevator and separate wudhu plaza.\n\n` +
          `👉 [Explore Full Jumu'ah Details](prayer.html#jumua)`;
      }
    }

    // =========================================================================
    // 3. RAMADAN TIMETABLE & TARAWEEH
    // =========================================================================
    if (q.includes('ramadan') || q.includes('ramzan') || q.includes('sehri') || q.includes('suhoor') || q.includes('iftar') || q.includes('tarawih') || q.includes('taraweeh') || q.includes('റമദാൻ') || q.includes('ഇഫ്താർ') || q.includes('അത്താഴം') || q.includes('തറാവീഹ്') || q.includes('رمضان') || q.includes('إفطار') || q.includes('سحور') || q.includes('تراويح')) {
      if (activeLang === 'ml') {
        return `🌙 **റമദാൻ 1447 സമയക്രമം - നൂറുൽ ഹുദാ മഹല്ല്**:\n` +
          `• **ഇംസാക് (അത്താഴം അവസാനം)**: 05:02 AM\n` +
          `• **ഇഫ്താർ (മഗ്‌രിബ് ബാങ്ക്)**: 06:35 PM\n` +
          `• **തറാവീഹ് നിസ്കാരം**: ദിവസവും ഇശാഅ് നിസ്കാര ശേഷം 08:20 PM ന് (20 റക്അത്ത് ഖുർആൻ ഖത്മ്).\n` +
          `• **ഇഫ്താർ വിതരണം**: ദിവസവും മഹല്ല് സെൻട്രൽ പള്ളിയിൽ 600 പേർക്കുള്ള സമൂഹ നോമ്പുതുറ.\n` +
          `• **അവസാന പത്ത് തഹജ്ജുദ്**: രാത്രി 03:00 AM ന്.\n\n` +
          `👉 [റമദാൻ കലണ്ടർ ഡൗൺലോഡ് ചെയ്യുക](prayer.html#ramadan)`;
      } else {
        return `🌙 **Ramadan 1447 Timetable & Arrangements**:\n` +
          `• **Imsak (Suhoor Cutoff)**: 05:02 AM\n` +
          `• **Iftar (Sunset)**: 06:35 PM\n` +
          `• **Taraweeh Salah**: Daily at 08:20 PM after Isha (20 Raka'at with full Qur'an Khatm led by Hafiz Bilal).\n` +
          `• **Community Iftar**: Daily free community Iftar organized at the Mosque Dining Plaza serving 600+ fasting worshippers.\n` +
          `• **Qiyam al-Layl (Tahajjud)**: Nightly at 03:00 AM during the last ten blessed nights.\n\n` +
          `👉 [View Ramadan Calendar](prayer.html#ramadan)`;
      }
    }

    // =========================================================================
    // 4. EID PRAYER & CELEBRATIONS
    // =========================================================================
    if (q.includes('eid') || q.includes('perunnal') || q.includes('eidgah') || q.includes('പെരുന്നാൾ') || q.includes('ഈദ്') || q.includes('ഈദ്ഗാഹ്') || q.includes('عيد') || q.includes('مصلى العيد')) {
      if (activeLang === 'ml') {
        return `🎉 **ഈദ് നമസ്കാരം (പെരുന്നാൾ നിസ്കാരം) വിവരങ്ങൾ**:\n` +
          `• **നിസ്കാര സമയം**: രാവിലെ കൃത്യം 07:30 AM\n` +
          `• **സ്ഥലം**: നൂറുൽ ഹുദാ സെൻട്രൽ ഈദ്ഗാഹ് ഗ്രൗണ്ട് (മഴയുണ്ടായാൽ സെൻട്രൽ ജുമാ മസ്ജിദ് മെയിൻ ഹാളിൽ).\n` +
          `• **ഇമാം**: മൗലാനാ അബ്ദുൽ റഷീദ് ഫൈസി.\n` +
          `• സ്ത്രീകൾക്കും കുട്ടികൾക്കും പ്രത്യേക സൗകര്യം ഒരുക്കിയിട്ടുണ്ട്.\n\n` +
          `👉 [കൂടുതൽ വിവരങ്ങൾ അറിയുക](prayer.html#eid-prayer)`;
      } else {
        return `🎉 **Eid Prayer & Eid Gah Arrangements**:\n` +
          `• **Timing**: Sharp at 07:30 AM (Both Eid-ul-Fitr and Eid-ul-Adha).\n` +
          `• **Location**: Central Eid Gah Ground (Weather backup: Central Juma Masjid 3 floors).\n` +
          `• **Led by**: Chief Imam Usthad Maulana Abdul Rasheed Faizy.\n` +
          `• Dedicated prayer sectors and monitored parking for families and women.\n\n` +
          `👉 [View Eid Arrangements](prayer.html#eid-prayer)`;
      }
    }

    // =========================================================================
    // 5. ABOUT MAHALL, HISTORY & FOUNDERS
    // =========================================================================
    if (q.includes('history') || q.includes('about mahall') || q.includes('established') || q.includes('founded') || q.includes('1968') || q.includes('bava') || q.includes('ചരിത്രം') || q.includes('തുടക്കം') || q.includes('സ്ഥാപകൻ') || q.includes('മഹല്ല് വിവരങ്ങൾ') || q.includes('تاريخ') || q.includes('تأسيس') || q.includes('عن المحلة')) {
      if (activeLang === 'ml') {
        return `🏛️ **നൂറുൽ ഹുദാ മഹല്ല് ജമാഅത്ത് - ചരിത്രവും പാരമ്പര്യവും**:\n` +
          `• **സ്ഥാപിതം**: 1968 (58 വർഷത്തെ സമർപ്പിത സേവന പാരമ്പര്യം).\n` +
          `• **സ്ഥാപക നേതാക്കൾ**: മർഹൂം ഹാജി കെ. വി. മുഹമ്മദ് കോയ, സയ്യിദ് അലവി തങ്ങൾ.\n` +
          `• **നാഴികക്കല്ലുകൾ**:\n` +
          `  - 1968: പുല്ലുമേഞ്ഞ ആദ്യ നിസ്കാര പന്തൽ 40 കുടുംബങ്ങളുമായി ആരംഭിച്ചു.\n` +
          `  - 1982: ആദ്യ മിനാരവും നൂറുൽ ഹുദാ പ്രൈമറി മദ്റസയും സ്ഥാപിച്ചു.\n` +
          `  - 1996: 3 നിലകളോടു കൂടിയ ആധുനിക സെൻട്രൽ മസ്ജിദ് സമുച്ചയം.\n` +
          `  - 2012: കമ്മ്യൂണിറ്റി ഓഡിറ്റോറിയവും 24/7 ആംബുലൻസ് സർവീസും.\n` +
          `  - 2026: സമ്പൂർണ്ണ ഡിജിറ്റൽ സ്മാർട്ട് മഹല്ല് പോർട്ടൽ.\n` +
          `• **ഇന്നത്തെ കണക്കുകൾ**: 642 കുടുംബങ്ങൾ, 2,840 അംഗങ്ങൾ, 8 വാർഡുകൾ.\n\n` +
          `👉 [മഹല്ല് ചരിത്രം പൂർണ്ണമായി വായിക്കുക](about.html#history)`;
      } else {
        return `🏛️ **About Noorul Huda Mahall Jama'ath (Estd. 1968)**:\n` +
          `• **Founding**: Established in monsoon of 1968 by 40 visionary families led by late Haji K. V. Mohammed Koya and Sayyid Alavi Thangal.\n` +
          `• **58-Year Legacy**:\n` +
          `  - 1968: First thatched community prayer hall on donated ancestral land.\n` +
          `  - 1982: First grand minaret & primary Islamic Madrasa academy.\n` +
          `  - 1996: 3-tier architectural landmark sanctuary with capacity of 2,500.\n` +
          `  - 2012: Noorul Huda Memorial Auditorium and Community Relief Trust.\n` +
          `  - 2026: Next-generation Digital Smart Mahall Management platform.\n` +
          `• **Current Scale**: 642 registered families, 2,840 verified residents across 8 democratic wards.\n\n` +
          `👉 [Read Mahall Heritage & Timeline](about.html#history)`;
      }
    }

    // =========================================================================
    // 6. MOSQUE ARCHITECTURE & FACILITIES (LADIES HALL, SOLAR, CAPACITY)
    // =========================================================================
    if (q.includes('mosque') || q.includes('masjid') || q.includes('capacity') || q.includes('ladies') || q.includes('women') || q.includes('solar') || q.includes('parking') || q.includes('facilities') || q.includes('പള്ളി') || q.includes('സ്ത്രീകൾ') || q.includes('സൗകര്യം') || q.includes('ശേഷി') || q.includes('പാർക്കിംഗ്') || q.includes('مسجد') || q.includes('جامع') || q.includes('مصلى النساء')) {
      if (activeLang === 'ml') {
        return `🕌 **സെൻട്രൽ ജുമാ മസ്ജിദ് സൗകര്യങ്ങൾ**:\n` +
          `• **ശേഷി (Capacity)**: 2,500 ആളുകൾക്ക് ഒരേസമയം നിസ്കരിക്കാം (3 നിലകൾ).\n` +
          `• **വനിതാ നിസ്കാര ഹാൾ**: 2-ാം നിലയിൽ പ്രത്യേക വുളൂഅ് സൗകര്യത്തോടും ലിഫ്റ്റ് സൗകര്യത്തോടും കൂടിയ പ്രാർത്ഥനാ ഹാൾ (പ്രവേശനം: Gate 2).\n` +
          `• **സോളാർ പവർ**: 40 kW ഓൺ-ഗ്രിഡ് ഗ്രീൻ സോളാർ പ്ലാന്റ്.\n` +
          `• **വുളൂഅ് പ്ലാസ**: ഒരേസമയം 120 പേർക്ക് അംഗശുദ്ധി വരുത്താം.\n` +
          `• **പാർക്കിംഗ്**: 120 കാറുകൾക്കും 250 ഇരുചക്രവാഹനങ്ങൾക്കും നിരീക്ഷിത പാർക്കിംഗ് പ്ലാസ.\n\n` +
          `👉 [പള്ളി സൗകര്യങ്ങൾ പരിശോധിക്കുക](about.html#about-mosque)`;
      } else {
        return `🕌 **Central Juma Masjid Architecture & Features**:\n` +
          `• **Capacity**: 2,500 worshippers across 3 spacious, well-ventilated floors.\n` +
          `• **Ladies' Prayer Sanctuary**: Dedicated air-conditioned floor with private entrance at Gate 2, audio-video khutbah relay, and separate ablution plaza.\n` +
          `• **Green Eco-Mosque**: 40 kW grid-tied solar canopy generating 100% clean energy.\n` +
          `• **Ablution Facility**: Modern granite wudhu plaza accommodating 120 worshippers concurrently with purified RO water.\n` +
          `• **Monitored Parking**: East Ground Plaza with capacity for 120 cars & 250 two-wheelers.\n\n` +
          `👉 [Explore Mosque Architecture](about.html#about-mosque)`;
      }
    }

    // =========================================================================
    // 7. IMAM, KHATEEB & SCHOLARS
    // =========================================================================
    if (q.includes('imam') || q.includes('khateeb') || q.includes('faizy') || q.includes('scholar') || q.includes('bilal') || q.includes('മുസ്ലിയാർ') || q.includes('ഇമാം') || q.includes('ഫൈസി') || q.includes('ഉസ്താദ്') || q.includes('إمام') || q.includes('عالم') || q.includes('علماء')) {
      if (activeLang === 'ml') {
        return `👳 **മഹല്ല് പണ്ഡിത നിര & നേതൃത്വം**:\n` +
          `• **ചീഫ് ഇമാം & ഖത്തീബ്**: മൗലാനാ അബ്ദുൽ റഷീദ് ഫൈസി (16 വർഷമായി മഹല്ലിന്റെ ആത്മീയ മാർഗ്ഗദർശി; ഫോൺ: +91 98471 22334).\n` +
          `• **ചീഫ് മുഅദ്ദിൻ & ഹിഫ്ള് അധ്യാപകൻ**: ഹാഫിള് മുഹമ്മദ് ബിലാൽ.\n` +
          `• **കുടുംബ കൗൺസിലർ**: സയ്യിദ് മുനവ്വറലി ശിഹാബ്.\n` +
          `ആത്മീയ സംശയങ്ങൾക്കും മതപരമായ മാർഗ്ഗനിർദ്ദേശങ്ങൾക്കും ദിവസവും അസ്വർ നിസ്കാര ശേഷം ഓഫീസിൽ ബന്ധപ്പെടാം.\n\n` +
          `👉 [പണ്ഡിത പ്രൊഫൈലുകൾ കാണുക](about.html#imam-khateeb)`;
      } else {
        return `👳 **Scholarly & Spiritual Leadership**:\n` +
          `• **Chief Imam & Khateeb**: Usthad Maulana Abdul Rasheed Faizy — Renowned Islamic jurisprudence scholar with 16 years of community service (Phone: +91 98471 22334).\n` +
          `• **Assistant Imam & Chief Mu'azzin**: Hafiz Muhammad Bilal — Lead Qari and Hifz instructor.\n` +
          `• **Youth Counselor**: Sayyid Munawwarali Shihab — Family & ethical life mentor.\n` +
          `• Inquiries regarding Fatawa, Nikah consultation, and spiritual counseling can be scheduled directly at the Imam's desk.\n\n` +
          `👉 [Meet the Imams & Scholars](about.html#imam-khateeb)`;
      }
    }

    // =========================================================================
    // 8. COMMITTEE & GOVERNANCE (OFFICERS, SECRETARY, PRESIDENT)
    // =========================================================================
    if (q.includes('committee') || q.includes('president') || q.includes('secretary') || q.includes('treasurer') || q.includes('abdurahman') || q.includes('ഭാരവാഹികൾ') || q.includes('പ്രസിഡന്റ്') || q.includes('സെക്രട്ടറി') || q.includes('കമ്മിറ്റി') || q.includes('لجنة') || q.includes('رئيس') || q.includes('سكرتير') || q.includes('أمين')) {
      if (activeLang === 'ml') {
        return `👥 **മഹല്ല് എക്സിക്യൂട്ടീവ് കമ്മിറ്റി ഭാരവാഹികൾ (2024–2027)**:\n` +
          `• **പ്രസിഡന്റ്**: ഹാജി സി. കെ. ബാവ\n` +
          `• **ജനറൽ സെക്രട്ടറി**: പി. കെ. അബ്ദുറഹ്‌മാൻ (ഫോൺ: +91 94470 12345)\n` +
          `• **ട്രഷറർ**: കെ. വി. മൊയ്തീൻ കുട്ടി\n` +
          `• **വൈസ് പ്രസിഡന്റുമാർ**: വി. ടി. കുഞ്ഞഹമ്മദ് ഹാജി, എം. കെ. കുഞ്ഞിമൊയ്തീൻ\n` +
          `• **ജോയിന്റ് സെക്രട്ടറിമാർ**: കെ. പി. ഷരീഫ്, ടി. വി. മുസ്തഫ\n` +
          `• **ഓഡിറ്റർ**: കെ. പി. ഫാറൂഖ് CA\n` +
          `എല്ലാ 3 വർഷം കൂടുമ്പോഴും 8 വാർഡുകളിൽ നിന്നുമുള്ള ജനറൽ ബോഡി ബാലറ്റിലൂടെയാണ് കമ്മിറ്റിയെ തെരഞ്ഞെടുക്കുന്നത്.\n\n` +
          `👉 [പൂർണ്ണ കമ്മിറ്റി പട്ടിക കാണുക](about.html#committee)`;
      } else {
        return `👥 **Mahall Executive Governing Council (2024–2027)**:\n` +
          `• **President**: Haji C. K. Bava\n` +
          `• **General Secretary**: P. K. Abdurahman (Mobile: +91 94470 12345)\n` +
          `• **Treasurer**: K. V. Moideen Kutty\n` +
          `• **Vice Presidents**: V. T. Kunhammed Haji & M. K. Kunjimoideen\n` +
          `• **Joint Secretaries**: K. P. Shareef & T. V. Musthafa\n` +
          `• **Internal Auditor**: K. P. Farooq CA\n` +
          `Elected triennially via democratic general body elections across all 8 wards.\n\n` +
          `👉 [View Executive Committee Directory](about.html#committee)`;
      }
    }

    // =========================================================================
    // 9. CERTIFICATES (MARRIAGE NOC, RESIDENCE, CHARACTER)
    // =========================================================================
    if (q.includes('certificate') || q.includes('marriage') || q.includes('nikah') || q.includes('noc') || q.includes('residence') || q.includes('character') || q.includes('document') || q.includes('സർട്ടിഫിക്കറ്റ്') || q.includes('നിക്കാഹ്') || q.includes('വിവാഹം') || q.includes('താമസം') || q.includes('شهادة') || q.includes('عقد زواج') || q.includes('إثبات سكن')) {
      if (activeLang === 'ml') {
        return `🧾 **മഹല്ല് സർട്ടിഫിക്കറ്റ് അപേക്ഷിക്കുന്ന വിധം**:\n` +
          `ലഭ്യമായ സർട്ടിഫിക്കറ്റുകൾ:\n` +
          `1. **വിവാഹ NOC (Marriage NOC)**: ഗവണ്മെന്റ് മാര്യേജ് രജിസ്ട്രേഷനും നിക്കാഹിനും.\n` +
          `2. **മഹല്ല് മെമ്പർഷിപ്പ് & റെസിഡൻസ് സർട്ടിഫിക്കറ്റ്**.\n` +
          `3. **സ്വഭാവ സർട്ടിഫിക്കറ്റ് (Character Certificate)**.\n` +
          `4. **ആശ്വാസ ധനസഹായ സർട്ടിഫിക്കറ്റ് (Welfare Aid Proof)**.\n\n` +
          `📝 **എങ്ങനെ അപേക്ഷിക്കാം?**:\n` +
          `• 'More' മെനുവിലെ **Certificate Requests** പേജിൽ പോയി 4-സ്റ്റെപ്പ് ഫോം പൂരിപ്പിക്കുക.\n` +
          `• അല്ലെങ്കിൽ **My Mahall** റസിഡന്റ് പോർട്ടലിൽ ലോഗിൻ ചെയ്ത് ആവശ്യപ്പെടുക.\n` +
          `• ജനറൽ സെക്രട്ടറി പരിശോധിച്ച് 24 മണിക്കൂറിനകം ഡിജിറ്റൽ QR സീലോട് കൂടിയ സർട്ടിഫിക്കറ്റ് ഡൗൺലോഡ് ചെയ്യാം.\n\n` +
          `👉 [സർട്ടിഫിക്കറ്റിനായി അപേക്ഷിക്കുക](services.html#certificate-requests)`;
      } else {
        return `🧾 **Official Mahall Certificates & Issuance Guide**:\n` +
          `Types of Certificates Available:\n` +
          `1. **Marriage NOC / Nikah Certificate**: Mandatory for marriage registrar & official nikah record.\n` +
          `2. **Mahall Membership & Residence Verification**.\n` +
          `3. **Character & Conduct Certificate** (for passport, visa, admission).\n` +
          `4. **Financial Aid / Orphan / Widow Status Certificate**.\n\n` +
          `📝 **How to Apply Online**:\n` +
          `• Visit the **Certificate Requests** section under 'More' or log into **My Mahall**.\n` +
          `• Fill the 4-step interactive application and upload applicant ID proof.\n` +
          `• Verified and digitally approved by the General Secretary within **24 hours** with tamper-proof QR code.\n\n` +
          `👉 [Open Certificate Application Wizard](services.html#certificate-requests)`;
      }
    }

    // =========================================================================
    // 10. EDUCATION, MADRASA, DARS & QURAN CLASSES
    // =========================================================================
    if (q.includes('madrasa') || q.includes('education') || q.includes('class') || q.includes('teacher') || q.includes('usthad') || q.includes('tajweed') || q.includes('arabic') || q.includes('syllabus') || q.includes('dars') || q.includes('മദ്റസ') || q.includes('പഠനം') || q.includes('ക്ലാസ്') || q.includes('അധ്യാപകർ') || q.includes('ദർസ്') || q.includes('അറബിക്') || q.includes('المدرسة') || q.includes('تعليم') || q.includes('تجويد')) {
      if (activeLang === 'ml') {
        return `🎓 **നൂറുൽ ഹുദാ ഇസ്ലാമിക് അക്കാദമി (മദ്റസ & ദർസ്)**:\n` +
          `• **അംഗീകാരം**: കേരള ഇസ്ലാമിക് എജ്യുക്കേഷൻ ബോർഡ് (KIEB).\n` +
          `• **വിദ്യാർത്ഥികൾ**: 480 കുട്ടികൾ (1 മുതൽ 10 വരെ ക്ലാസുകൾ).\n` +
          `• **സമയം**: എല്ലാ ദിവസവും രാവിലെ 07:00 AM മുതൽ 08:30 AM വരെ.\n` +
          `• **അധ്യാപകർ**: 14 അംഗീകൃത ഉസ്താദുമാർ.\n` +
          `• **പ്രത്യേക കോഴ്സുകൾ**:\n` +
          `  - ശരിഅത്ത് ദർസ് അക്കാദമി (ഉന്നത മതപഠനം)\n` +
          `  - മുതിർന്നവർക്കുള്ള വാരാന്ത്യ ഖുർആൻ തജ്‌വീദ് ക്ലാസ്\n` +
          `  - സ്പോക്കൺ അറബിക് ഡിപ്ലോമ\n` +
          `  - വനിതാ ഇസ്ലാമിക് സ്റ്റഡീസ്\n` +
          `• വിദ്യാർത്ഥികളുടെ മാർക്കും ഹാജരും ഓൺലൈനിൽ പരിശോധിക്കാം.\n\n` +
          `👉 [വിദ്യാഭ്യാസ വിഭാഗം സന്ദർശിക്കുക](education.html#madrasa)`;
      } else {
        return `🎓 **Noorul Huda Islamic Academy (Madrasa & Dars)**:\n` +
          `• **Affiliation**: Kerala Islamic Education Board (KIEB).\n` +
          `• **Scale**: 480 enrolled students across 12 smart classrooms and 14 dedicated Usthads.\n` +
          `• **Timing**: Daily morning session from 07:00 AM to 08:30 AM.\n` +
          `• **Curriculum**: Qur'an Tajweed, Fiqh (Shafi'i), Aqeedah, Akhlaq, Tarikh, and Classical Arabic.\n` +
          `• **Higher Programs**:\n` +
          `  - Dars Academy for advanced Islamic Jurisprudence\n` +
          `  - Weekend Adult Tajweed circles for working professionals\n` +
          `  - Spoken Arabic Evening Diploma\n` +
          `• Check student attendance, exam report cards, and syllabus notes on the Education portal.\n\n` +
          `👉 [Open Education & Madrasa Portal](education.html#madrasa)`;
      }
    }

    // =========================================================================
    // 11. EMERGENCY, AMBULANCE & BLOOD DONORS
    // =========================================================================
    if (q.includes('blood') || q.includes('ambulance') || q.includes('emergency') || q.includes('hospital') || q.includes('doctor') || q.includes('dialysis') || q.includes('രക്തം') || q.includes('ആംബുലൻസ്') || q.includes('അടിയന്തിരം') || q.includes('ഡയാലിസിസ്') || q.includes('تبرع بالدم') || q.includes('إسعاف') || q.includes('طوارئ')) {
      if (activeLang === 'ml') {
        return `🚨 **അടിയന്തിര സഹായം & ജീവകാരുണ്യ വിഭാഗം**:\n` +
          `• **24/7 ആംബുലൻസ് ഹെൽപ്പ്‌ലൈൻ**: **+91 98460 99999** (പള്ളി ഗേറ്റ് 1 ലെ എമർജൻസി ബേയിൽ സദാ സജ്ജം).\n` +
          `• **മഹല്ല് അടിയന്തിര ഫോൺ**: **+91 94470 12345**\n` +
          `• **രക്തദാന ഡയറക്ടറി**: 145 ൽ പരം യുവ രക്തദാതാക്കൾ സദാ സന്നദ്ധർ (A+, B+, O+, AB+, A-, B-, O-, AB-).\n` +
          `• **ഡയാലിസിസ് പെൻഷൻ**: വൃക്കരോഗികൾക്ക് പ്രതിമാസം ₹5,000 ധനസഹായം.\n` +
          `• **പ്രതിമാസ റേഷൻ കിറ്റ്**: 85 നിർദ്ധന കുടുംബങ്ങൾക്ക് പ്രതിമാസ ഭക്ഷ്യധാന്യ കിറ്റുകൾ.\n\n` +
          `👉 [രക്തദാതാക്കളെ കണ്ടെത്തുക](community.html#blood-donors)`;
      } else {
        return `🚨 **24/7 Emergency, Ambulance & Medical Relief Desk**:\n` +
          `• **24/7 Community Ambulance**: **+91 98460 99999** (Stationed at Gate 1 Emergency Bay with oxygen support).\n` +
          `• **Emergency Mahall Helpline**: **+91 94470 12345**\n` +
          `• **Blood Donor Directory**: 145+ verified resident youth donors available for instant emergency calls.\n` +
          `• **Dialysis Patient Support**: Monthly ₹5,000 allowance for chronic kidney patients.\n` +
          `• **Monthly Ration Sponsorship**: 85 destitute families supported on the 1st of every month.\n\n` +
          `👉 [Search Blood Donor Directory](community.html#blood-donors)`;
      }
    }

    // =========================================================================
    // 12. AUDITORIUM / COMMUNITY HALL BOOKING
    // =========================================================================
    if (q.includes('auditorium') || q.includes('hall') || q.includes('booking') || q.includes('rent') || q.includes('ഓഡിറ്റോറിയം') || q.includes('ഹാൾ') || q.includes('വാടക') || q.includes('ബുക്കിംഗ്') || q.includes('قاعة') || q.includes('حجز')) {
      if (activeLang === 'ml') {
        return `🏛️ **നൂറുൽ ഹുദാ മെമ്മോറിയൽ കമ്മ്യൂണിറ്റി ഹാൾ ബുക്കിംഗ്**:\n` +
          `• **സവിശേഷതകൾ**: 800 സീറ്റുകളുള്ള സെൻട്രലൈസ്ഡ് A/C ഹാൾ, 450 പേർക്ക് ഒരേസമയം ഭക്ഷണം കഴിക്കാവുന്ന ഡൈനിംഗ് ഹാൾ.\n` +
          `• **ഉപയോഗങ്ങൾ**: നിക്കാഹ്, വിവാഹ സൽക്കാരങ്ങൾ, ഇസ്ലാമിക സമ്മേളനങ്ങൾ, വിദ്യാഭ്യാസ സെമിനാറുകൾ.\n` +
          `• **സൗകര്യങ്ങൾ**: മുഴുവൻ സമയ ജനറേറ്റർ ബാക്കപ്പ്, വിപുലമായ പാർക്കിംഗ്, വിഐപി ഡ്രസ്സിംഗ് റൂമുകൾ.\n` +
          `• **ബുക്കിംഗ്**: 'Community' ടാബിൽ നിന്നോ മഹല്ല് ഓഫീസിൽ നേരിട്ടോ ബുക്ക് ചെയ്യാം.\n\n` +
          `👉 [ഓഡിറ്റോറിയം ലഭ്യതയും ബുക്കിംഗും](community.html#auditorium)`;
      } else {
        return `🏛️ **Noorul Huda Memorial Community Auditorium Booking**:\n` +
          `• **Capacity**: 800-seat fully air-conditioned main banquet auditorium with 450-seat dining area.\n` +
          `• **Suitable for**: Nikah ceremonies, wedding receptions, educational seminars, and community conferences.\n` +
          `• **Amenities**: 100% heavy-duty generator backup, separate bride & groom green rooms, monitored parking for 120 cars.\n` +
          `• **Reservations**: Check availability online under 'Community' or contact Mahall Office Secretary.\n\n` +
          `👉 [Check Auditorium Availability](community.html#auditorium)`;
      }
    }

    // =========================================================================
    // 13. CONTRIBUTIONS, SUBSCRIPTION & DUES
    // =========================================================================
    if (q.includes('subscription') || q.includes('dues') || q.includes('contribution') || q.includes('250') || q.includes('fee') || q.includes('വരിസംഖ്യ') || q.includes('ഫീസ്') || q.includes('പണം') || q.includes('اشتراك') || q.includes('مساهمة') || q.includes('رسوم')) {
      if (activeLang === 'ml') {
        return `💳 **മഹല്ല് പ്രതിമാസ വരിസംഖ്യ (Mahall Subscription)**:\n` +
          `• **നിരക്ക്**: ഒരു കുടുംബത്തിന് പ്രതിമാസം ₹250.\n` +
          `• **ഉദ്ദേശ്യം**: പള്ളി പരിപാലനം, മദ്റസ അധ്യാപകരുടെ വേതനം, ശുചിത്വ പരിപാലനം.\n` +
          `• **അടയ്ക്കാനുള്ള വഴികൾ**:\n` +
          `  - UPI QR കോഡ് (Google Pay, PhonePe, Paytm വഴി തത്സമയം അടയ്ക്കാം).\n` +
          `  - നെറ്റ് ബാങ്കിംഗ് അല്ലെങ്കിൽ നേരിട്ട് ഓഫീസിൽ.\n` +
          `• അടച്ചയുടൻ QR കോഡോട് കൂടിയ ഡിജിറ്റൽ രസീത് ഡൗൺലോഡ് ചെയ്യാം.\n\n` +
          `👉 [വരിസംഖ്യ ഓൺലൈനായി അടയ്ക്കുക](contributions.html#subscription)`;
      } else {
        return `💳 **Monthly Mahall Subscription & Dues**:\n` +
          `• **Rate**: ₹250 per family per month.\n` +
          `• **Allocation**: Mosque upkeep, electricity, staff honorariums, and madrasa operational expenses.\n` +
          `• **Payment Modes**:\n` +
          `  - Instant UPI QR Scan (Google Pay, PhonePe, Paytm, BHIM).\n` +
          `  - Direct Net Banking or Cash at the Mahall Administrative Desk.\n` +
          `• Instant official digital tax/donation receipts with QR verification are generated immediately upon payment.\n\n` +
          `👉 [Pay Monthly Subscription Online](contributions.html#subscription)`;
      }
    }

    // =========================================================================
    // 14. ZAKAT & SADAQAH
    // =========================================================================
    if (q.includes('zakat') || q.includes('sadaqah') || q.includes('nisab') || q.includes('charity') || q.includes('gold') || q.includes('സകാത്ത്') || q.includes('സ്വദഖ') || q.includes('നിസ്വാബ്') || q.includes('ദാനം') || q.includes('زكاة') || q.includes('صدقة') || q.includes('نصاب')) {
      if (activeLang === 'ml') {
        return `💰 **സകാത്ത് & സ്വദഖ മാർഗ്ഗനിർദ്ദേശങ്ങൾ**:\n` +
          `• **സകാത്ത് നിരക്ക്**: മിച്ചമുള്ള സമ്പത്തിന്റെ 2.5%.\n` +
          `• **നിസ്വാബ് പരിധി**: 85 ഗ്രാം സ്വർണ്ണം അല്ലെങ്കിൽ 595 ഗ്രാം വെള്ളി.\n` +
          `• സ്വർണ്ണം, ബാങ്ക് നിക്ഷേപം, ബിസിനസ് ചരക്കുകൾ എന്നിവയ്ക്ക് ബാധകമായ കടങ്ങൾ കിഴിച്ച് സകാത്ത് കണക്കാക്കാം.\n` +
          `• മഹല്ല് സകാത്ത് ഫണ്ട് വഴി അർഹരായ നിർദ്ധനർക്ക് കൃത്യമായി വിതരണം ചെയ്യുന്നു.\n\n` +
          `👉 [തത്സമയ സകാത്ത് കാൽക്കുലേറ്റർ ഉപയോഗിക്കുക](contributions.html#zakat)`;
      } else {
        return `💰 **Zakat & Sadaqah Guidance and Calculator**:\n` +
          `• **Rate**: 2.5% on qualifying net wealth held for one lunar year (Hawl).\n` +
          `• **Nisab Threshold**: Equivalent to 85 grams of 24K Gold or 595 grams of Silver.\n` +
          `• **Calculation**: (Cash + Bank Savings + Gold Value + Business Inventory - Immediate Debts) × 2.5%.\n` +
          `• Distributed transparently to the 8 Shari'ah-ordained categories (Asnaf) within our community.\n\n` +
          `👉 [Open Live Zakat Calculator](contributions.html#zakat)`;
      }
    }

    // =========================================================================
    // 15. MAHALL MAP & GEOGRAPHY (WARDS, BOUNDARY, CEMETERY)
    // =========================================================================
    if (q.includes('map') || q.includes('ward') || q.includes('boundary') || q.includes('cemetery') || q.includes('qabarstan') || q.includes('grave') || q.includes('മാപ്പ്') || q.includes('വാർഡ്') || q.includes('ഖബർസ്ഥാൻ') || q.includes('അതിർത്തി') || q.includes('خريطة') || q.includes('مقبرة')) {
      if (activeLang === 'ml') {
        return `🗺️ **നൂറുൽ ഹുദാ മഹല്ല് മാപ്പും വാർഡുകളും**:\n` +
          `മഹല്ല് മാപ്പ് ഒരു പ്രത്യേക സിംഗിൾ പേജായി ക്രമീകരിച്ചിരിക്കുന്നു:\n` +
          `• **8 വാർഡുകൾ**: 1-നോർത്ത് ബീച്ച്, 2-ബസാർ, 3-മസ്ജിദ് വാർഡ്, 4-ഈസ്റ്റ് കനാൽ, 5-സൗത്ത് ഹിൽ, 6-ഗാർഡൻ കോളനി, 7-സ്റ്റേഡിയം റോഡ്, 8-വെസ്റ്റ് ഗേറ്റ്.\n` +
          `• **പ്രധാന 6 സോണുകൾ**: സെൻട്രൽ മസ്ജിദ്, മഹല്ല് അതിർത്തി, 8 വാർഡുകൾ, മദ്റസ അക്കാദമി, ഖബർസ്ഥാൻ (സെക്ടർ A, B, C, D), കമ്മ്യൂണിറ്റി ഹാൾ.\n` +
          `• **ജി.പി.എസ് കോർഡിനേറ്റ്സ്**: 11.2588° N, 75.7804° E.\n\n` +
          `👉 [മഹല്ല് മാപ്പ് പേജ് തുറക്കുക](map.html)`;
      } else {
        return `🗺️ **Interactive Mahall Map & Geography (Single Page)**:\n` +
          `The Mahall Map is available on a dedicated single page featuring:\n` +
          `• **6 Key Zones**: Central Juma Masjid, Mahall Boundary, 8 Electoral Wards (642 families), Noorul Huda Madrasa, Mahall Qabarstan (Sectors A-D), and Community Auditorium.\n` +
          `• **8 Wards**: Ward 1 North Beach, Ward 2 Bazar Road, Ward 3 Masjid Ward, Ward 4 East Canal, Ward 5 South Hill, Ward 6 Garden Colony, Ward 7 Stadium Road, Ward 8 West Gate.\n` +
          `• **GPS Coordinates**: 11.2588° N, 75.7804° E (Calicut, Kerala).\n\n` +
          `👉 [Explore Interactive Mahall Map](map.html)`;
      }
    }

    // =========================================================================
    // 16. ANNOUNCEMENTS & FUNERAL / JANAZAH NOTICES
    // =========================================================================
    if (q.includes('announcement') || q.includes('notice') || q.includes('janazah') || q.includes('funeral') || q.includes('mayyath') || q.includes('അറിയിപ്പ്') || q.includes('മയ്യത്ത്') || q.includes('നോട്ടീസ്') || q.includes('ജനാസ') || q.includes('إعلان') || q.includes('جنازة')) {
      if (activeLang === 'ml') {
        return `📢 **മഹല്ല് ഔദ്യോഗിക അറിയിപ്പുകളും മയ്യത്ത് വിവരങ്ങളും**:\n` +
          `• **മയ്യത്ത് അറിയിപ്പ്**: മർഹൂം വി. പി. ആലവി ഹാജി (78, ബൈത്തുൽ നൂർ) വഫാത്തായി. ജനാസ നിസ്കാരം ഇന്ന് അസ്വർ നമസ്കാര ശേഷം സെൻട്രൽ ജുമാ മസ്ജിദ് അങ്കണത്തിൽ. ഖബറടക്കം മഹല്ല് ഖബർസ്ഥാനിൽ.\n` +
          `• **ജനറൽ ബോഡി യോഗം**: വരുന്ന ഞായറാഴ്ച രാവിലെ 10:30 ന് കമ്മ്യൂണിറ്റി ഹാളിൽ.\n` +
          `• **മദ്റസ പരീക്ഷ**: അർദ്ധവാർഷിക പരീക്ഷാ ടൈംടേബിൾ പ്രസിദ്ധീകരിച്ചു.\n\n` +
          `👉 [എല്ലാ അറിയിപ്പുകളും വായിക്കുക](announcements.html#all-announcements)`;
      } else {
        return `📢 **Official Announcements & Janazah Notices**:\n` +
          `• **Active Janazah Notice**: Marhum V. P. Alavi Haji (78, Baitul Noor) passed away. Janazah prayer today after Asr at Central Juma Masjid courtyard. Burial at Mahall Qabarstan.\n` +
          `• **General Body Meeting**: Coming Sunday at 10:30 AM at Community Hall.\n` +
          `• **Examination Schedule**: Half-yearly madrasa exam timetable published.\n\n` +
          `👉 [View All Announcements & Notices](announcements.html#all-announcements)`;
      }
    }

    // =========================================================================
    // 17. EVENTS, CALENDAR & WEEKLY CIRCLES
    // =========================================================================
    if (q.includes('event') || q.includes('program') || q.includes('calendar') || q.includes('majlis') || q.includes('gathering') || q.includes('പരിപാടി') || q.includes('കലണ്ടർ') || q.includes('മജ്‌ലിസ്') || q.includes('സംഗമം') || q.includes('فعاليات') || q.includes('تقويم')) {
      if (activeLang === 'ml') {
        return `📅 **മഹല്ലിലെ പ്രധാന പരിപാടികളും ആത്മീയ സംഗമങ്ങളും**:\n` +
          `1. **ആത്മീയ മജ്‌ലിസും ഖുർആൻ ക്ലാസും**: എല്ലാ വെള്ളിയാഴ്ചയും മഗ്‌രിബിന് ശേഷം.\n` +
          `2. **യുവജന കരിയർ & സിവിൽ സർവീസ് സെമിനാർ**: ഡോ. കെ. എം. ഷബീർ നയിക്കുന്നു.\n` +
          `3. **വനിതാ കുടുംബാരോഗ്യ ശില്പശാല**: ലേഡീസ് വിംഗ് ഹാളിൽ.\n` +
          `4. **കുട്ടികളുടെ ഖുർആൻ പാരായണ മത്സരം**: മദ്റസ സെൻട്രൽ സ്റ്റേജിൽ.\n` +
          `5. **മാർച്ച് 2026 ഇവന്റ് കലണ്ടർ** ലഭ്യമാണ്.\n\n` +
          `👉 [പരിപാടികൾ കാണാനും രജിസ്റ്റർ ചെയ്യാനും](events.html#upcoming-events)`;
      } else {
        return `📅 **Upcoming Events, Gatherings & Calendar**:\n` +
          `1. **Weekly Spiritual Majlis & Qur'an Circle**: Every Friday evening after Maghrib in the Main Sanctuary.\n` +
          `2. **Youth Civil Service Guidance Conclave**: Led by Dr. K. M. Shabeer.\n` +
          `3. **Women's Health & Positive Parenting Workshop**: Ladies' Wing Hall.\n` +
          `4. **Children's Adhan & Recitation Fest**: Sub-juniors, Juniors & Seniors.\n` +
          `5. **Interactive March 2026 Event Calendar**: Sync directly with your phone.\n\n` +
          `👉 [Open Events & Programs Portal](events.html#upcoming-events)`;
      }
    }

    // =========================================================================
    // 18. SULHU / DISPUTE RESOLUTION / COUNSELING
    // =========================================================================
    if (q.includes('sulhu') || q.includes('dispute') || q.includes('mediation') || q.includes('counseling') || q.includes('family issue') || q.includes('തർക്കം') || q.includes('സുൽഹു') || q.includes('കൗൺസിലിംഗ്') || q.includes('صلح') || q.includes('تحكيم') || q.includes('استشارة')) {
      if (activeLang === 'ml') {
        return `🤝 **സുൽഹു (Sulhu) കുടുംബ മധ്യസ്ഥ സമിതി**:\n` +
          `മഹല്ല് ഖാസി, ജനറൽ സെക്രട്ടറി, ലീഗൽ അഡ്വൈസർ എന്നിവരടങ്ങുന്ന സമിതി രഹസ്യമായി നടത്തുന്ന ഒത്തുതീർപ്പ് വേദി.\n` +
          `• കുടുംബ പ്രശ്നങ്ങൾ, ദാമ്പത്യ തർക്കങ്ങൾ, വസ്തു തർക്കങ്ങൾ എന്നിവ കോടതിയിൽ പോകാതെ സൗഹാർദ്ദപരമായി പരിഹരിക്കാം.\n` +
          `• 'My Mahall' പോർട്ടൽ വഴി അതീവ രഹസ്യമായി പരാതിയോ കൗൺസിലിംഗ് അപേക്ഷയോ സമർപ്പിക്കാം.\n` +
          `• എല്ലാ വിവരങ്ങളും പൂർണ്ണമായും രഹസ്യമായി സൂക്ഷിക്കപ്പെടുന്നു.\n\n` +
          `👉 [സുൽഹു അപേക്ഷ സമർപ്പിക്കുക](my-mahall.html#confidential-sulhu)`;
      } else {
        return `🤝 **Mahall Sulhu & Dispute Mediation Desk**:\n` +
          `A confidential Islamic arbitration and family reconciliation council chaired by the Chief Qazi, General Secretary, and community legal counselor.\n` +
          `• Amicable resolution of marital, inheritance, and neighborhood matters adhering to Shari'ah principles without court litigation.\n` +
          `• Residents can submit encrypted, strictly confidential petitions directly via the **My Mahall** resident portal.\n` +
          `• Meetings held privately in the council chambers every Tuesday evening.\n\n` +
          `👉 [File Confidential Sulhu Petition](my-mahall.html#confidential-sulhu)`;
      }
    }

    // =========================================================================
    // 19. MY MAHALL RESIDENT PORTAL & DIGITAL ID
    // =========================================================================
    if (q.includes('my mahall') || q.includes('resident') || q.includes('family id') || q.includes('card') || q.includes('പോർട്ടൽ') || q.includes('റസിഡന്റ്') || q.includes('ഐഡി') || q.includes('بوابة المقيم') || q.includes('بطاقة العائلة')) {
      if (activeLang === 'ml') {
        return `🏠 **My Mahall റസിഡന്റ് പോർട്ടൽ**:\n` +
          `മഹല്ല് കുടുംബങ്ങൾക്കായുള്ള പേഴ്സണലൈസ്ഡ് ഡിജിറ്റൽ സ്പേസ്:\n` +
          `• **സ്മാർട്ട് ഫാമിലി ഐഡി (Smart Family ID)**: ഉദാ: W02-F005.\n` +
          `• കുടുംബാംഗങ്ങളുടെ പേരുകൾ, രക്തഗ്രൂപ്പ്, വിവരങ്ങൾ.\n` +
          `• വരിസംഖ്യ അടയ്ക്കലും ഡിജിറ്റൽ രസീതുകളും.\n` +
          `• സർട്ടിഫിക്കറ്റ് അപേക്ഷാ സ്റ്റാറ്റസ് പരിശോധിക്കൽ.\n` +
          `• രഹസ്യ സുൽഹു കൗൺസിലിംഗ് അപേക്ഷ.\n\n` +
          `👉 [My Mahall പോർട്ടലിലേക്ക് പോകുക](my-mahall.html)`;
      } else {
        return `🏠 **My Mahall Resident Portal**:\n` +
          `A dedicated digital dashboard for registered Mahall families:\n` +
          `• **Smart Digital Family ID**: (e.g. W02-F005) with QR verification.\n` +
          `• Verified family members directory with blood groups and records.\n` +
          `• Track and pay monthly subscription dues with instant PDF receipts.\n` +
          `• Real-time tracking of certificate applications.\n` +
          `• Access confidential Sulhu family mediation desk.\n\n` +
          `👉 [Go to My Mahall Resident Portal](my-mahall.html)`;
      }
    }

    // =========================================================================
    // 20. CONTACT, OFFICE HOURS & HELPLINES
    // =========================================================================
    if (q.includes('contact') || q.includes('phone') || q.includes('email') || q.includes('office hour') || q.includes('address') || q.includes('ഫോൺ') || q.includes('ഓഫീസ് സമയം') || q.includes('വിലാസം') || q.includes('ബന്ധപ്പെടുക') || q.includes('اتصال') || q.includes('هاتف') || q.includes('ساعات العمل')) {
      if (activeLang === 'ml') {
        return `📞 **നൂറുൽ ഹുദാ മഹല്ല് ഓഫീസ് വിവരങ്ങൾ**:\n` +
          `• **വിലാസം**: സെൻട്രൽ മസ്ജിദ് റോഡ്, വാർഡ് 02, കോഴിക്കോട്, കേരളം - 673004.\n` +
          `• **ഓഫീസ് സമയം**: തിങ്കൾ മുതൽ ശനി വരെ രാവിലെ 09:00 AM - 01:00 PM & വൈകുന്നേരം 04:30 PM - 08:30 PM. (ഞായർ രാവിലെ മാത്രം).\n` +
          `• **ഓഫീസ് ഫോൺ**: **+91 495 2724800**\n` +
          `• **ജനറൽ സെക്രട്ടറി (മൊബൈൽ)**: **+91 94470 12345**\n` +
          `• **24/7 ആംബുലൻസ് സർവീസ്**: **+91 98460 99999**\n` +
          `• **ഇമെയിൽ**: office@noorulhudamahall.org\n\n` +
          `👉 [ഓഫീസുമായി ബന്ധപ്പെടുക](about.html#contact-us)`;
      } else {
        return `📞 **Mahall Office Contacts & Hours**:\n` +
          `• **Address**: Central Mosque Road, Ward 02, Calicut, Kerala - 673004 (Registration: KL-KZK/1968/42).\n` +
          `• **Working Hours**: Monday to Saturday: 09:00 AM - 01:00 PM & 04:30 PM - 08:30 PM (Sunday: Morning only).\n` +
          `• **Office Tele**: **+91 495 2724800**\n` +
          `• **General Secretary Mobile**: **+91 94470 12345**\n` +
          `• **24/7 Emergency Ambulance**: **+91 98460 99999**\n` +
          `• **Email**: office@noorulhudamahall.org\n\n` +
          `👉 [Open Contact & Help Page](about.html#contact-us)`;
      }
    }

    // =========================================================================
    // 21. PHOTO & VIDEO GALLERY
    // =========================================================================
    if (q.includes('gallery') || q.includes('photo') || q.includes('video') || q.includes('picture') || q.includes('ചിത്രം') || q.includes('ഫോട്ടോ') || q.includes('വീഡിയോ') || q.includes('ഗാലറി') || q.includes('صور') || q.includes('فيديو') || q.includes('معرض')) {
      if (activeLang === 'ml') {
        return `🖼️ **ഫോട്ടോ & വീഡിയോ ഗാലറി**:\n` +
          `മഹല്ലിന്റെ സുപ്രധാന ഓർമ്മകളും ദൃശ്യങ്ങളും 'Gallery' പേജിൽ ലഭ്യമാണ്:\n` +
          `• പള്ളി വാസ്തുശില്പ ഭംഗി\n` +
          `• മദ്റസ വാർഷിക കലാമേളകൾ\n` +
          `• റമദാൻ ഇഫ്താർ സംഗമങ്ങൾ\n` +
          `• പെരുന്നാൾ നമസ്കാര ദൃശ്യങ്ങൾ\n` +
          `• ഫുൾസ്ക്രീൻ ലൈറ്റ്ബോക്സ് വ്യൂവർ സൗകര്യം.\n\n` +
          `👉 [ഗാലറി കാണുക](gallery.html#photos)`;
      } else {
        return `🖼️ **Photo & Video Gallery**:\n` +
          `Explore high-definition visual records of our community:\n` +
          `• Central Mosque architectural brilliance\n` +
          `• Madrasa talent fests & study circles\n` +
          `• Blessed Ramadan community Iftar gatherings\n` +
          `• Eid-ul-Fitr & Eid-ul-Adha morning congregational celebrations\n` +
          `• Interactive fullscreen photo lightbox viewer.\n\n` +
          `👉 [Browse Media Gallery](gallery.html#photos)`;
      }
    }

    // =========================================================================
    // 22. BANK ACCOUNT, UPI & DONATION METHODS
    // =========================================================================
    if (q.includes('bank') || q.includes('upi') || q.includes('account') || q.includes('ifsc') || q.includes('qr') || q.includes('transfer') || q.includes('ബാങ്ക്') || q.includes('അക്കൗണ്ട്') || q.includes('حساب بنكي')) {
      if (activeLang === 'ml') {
        return `🏦 **മഹല്ല് ഔദ്യോഗിക ബാങ്ക് അക്കൗണ്ട് വിവരങ്ങൾ**:\n` +
          `• **അക്കൗണ്ട് പേര്**: Noorul Huda Mahall Jama'ath\n` +
          `• **ബാങ്ക്**: State Bank of India (SBI), Calicut Main Branch\n` +
          `• **അക്കൗണ്ട് നമ്പർ**: 38920192831\n` +
          `• **IFSC കോഡ്**: SBIN0001234\n` +
          `• **UPI ID**: \`noorulhudamahall@sbi\`\n` +
          `• എല്ലാ സംഭാവനകൾക്കും 80G ടാക്സ് ഇളവ് ലഭിക്കുന്ന ഡിജിറ്റൽ രസീത് ലഭ്യമാണ്.\n\n` +
          `👉 [ബാങ്ക് & സംഭാവന പേജ് കാണുക](contributions.html#bank-details)`;
      } else {
        return `🏦 **Official Mahall Bank & UPI Payment Details**:\n` +
          `• **Account Name**: Noorul Huda Mahall Jama'ath\n` +
          `• **Bank**: State Bank of India (SBI), Calicut Main Branch\n` +
          `• **Account No**: 38920192831\n` +
          `• **IFSC Code**: SBIN0001234\n` +
          `• **UPI Virtual Payment ID**: \`noorulhudamahall@sbi\`\n` +
          `• Instant 80G tax-exempted digital receipt is generated upon confirmation.\n\n` +
          `👉 [View Bank Details & Online Transfer](contributions.html#bank-details)`;
      }
    }

    // =========================================================================
    // 23. DOWNLOADS & OFFICIAL FORMS
    // =========================================================================
    if (q.includes('download') || q.includes('form') || q.includes('pdf') || q.includes('application') || q.includes('ഫോം') || q.includes('ഡൗൺലോഡ്') || q.includes('استمارة') || q.includes('تحميل')) {
      if (activeLang === 'ml') {
        return `📥 **ഔദ്യോഗിക ഫോമുകളും ഡൗൺലോഡുകളും**:\n` +
          `താഴെ പറയുന്ന ഫോമുകൾ സൗജന്യമായി ഡൗൺലോഡ് ചെയ്യാം:\n` +
          `1. **വിവാഹ NOC അപേക്ഷാ ഫോം (PDF)**\n` +
          `2. **മഹല്ല് അംഗത്വ / റസിഡൻസി അപേക്ഷാ ഫോം**\n` +
          `3. **നൂറുൽ ഹുദാ മദ്റസ അഡ്മിഷൻ ഫോം 2026-27**\n` +
          `4. **കമ്മ്യൂണിറ്റി ഓഡിറ്റോറിയം ബുക്കിംഗ് അഗ്രിമെന്റ്**\n` +
          `5. **വാർഷിക ഓഡിറ്റ് റിപ്പോർട്ട് & വരവ് ചെലവ് കണക്കുകൾ (PDF)**\n\n` +
          `👉 [ഫോമുകൾ ഡൗൺലോഡ് ചെയ്യുക](services.html#downloads)`;
      } else {
        return `📥 **Official Forms & Document Downloads**:\n` +
          `Download printable PDF application forms directly:\n` +
          `1. **Marriage NOC Application Form (PDF)**\n` +
          `2. **Mahall Family Membership & Census Form**\n` +
          `3. **Madrasa Admission & Enrollment Form (2026-27)**\n` +
          `4. **Community Auditorium Rental Agreement Form**\n` +
          `5. **Certified Annual Financial Audit Report (PDF)**\n\n` +
          `👉 [Open Downloads & Forms Hub](services.html#downloads)`;
      }
    }

    // =========================================================================
    // 24. YOUTH WING, VOLUNTEERS & SKSSF / SYS
    // =========================================================================
    if (q.includes('youth') || q.includes('volunteer') || q.includes('skssf') || q.includes('sys') || q.includes('യുവജന') || q.includes('വോളണ്ടിയർ') || q.includes('സന്നദ്ധ') || q.includes('شباب') || q.includes('تطوع')) {
      if (activeLang === 'ml') {
        return `💪 **മഹല്ല് യുവജന വിംഗും വോളണ്ടിയർ ഫോഴ്സും**:\n` +
          `• **യൂത്ത് വിംഗ് (SYS & SKSSF)**: മഹല്ലിലെ ജീവകാരുണ്യ പ്രവർത്തനങ്ങൾ, ശുചീകരണം, അടിയന്തിര ദുരന്ത നിവാരണം എന്നിവയിൽ സദാ കർമ്മനിരതർ.\n` +
          `• **വോളണ്ടിയർ ക്യാപ്റ്റൻ**: സഹൽ റഹ്‌മാൻ (ഫോൺ: +91 98472 33445).\n` +
          `• **പ്രവർത്തനങ്ങൾ**: രക്തദാന ക്യാമ്പുകൾ, കരിയർ ഗൈഡൻസ്, ലഹരി വിരുദ്ധ ക്യാമ്പയിനുകൾ, പാവപ്പെട്ടവർക്കുള്ള റേഷൻ വിതരണം.\n` +
          `• താങ്കൾക്ക് വോളണ്ടിയറായി രജിസ്റ്റർ ചെയ്യാൻ 'Community' പേജിലെ ഫോം പൂരിപ്പിക്കാം.\n\n` +
          `👉 [വോളണ്ടിയർ വിംഗിൽ ചേരുക](community.html#volunteers)`;
      } else {
        return `💪 **Mahall Youth Wing & Volunteer Taskforce**:\n` +
          `• **Organizations**: SYS, SKSSF, and Mahall Disaster Response Volunteer Force.\n` +
          `• **Volunteer Captain**: Sahal Rahman (Mobile: +91 98472 33445).\n` +
          `• **Key Initiatives**: Emergency blood donor mobilization, anti-drug community awareness, funeral support team, and food kit distribution.\n` +
          `• Open to all energetic youth aged 16 to 40. Register online through the community portal.\n\n` +
          `👉 [Join the Volunteer Taskforce](community.html#volunteers)`;
      }
    }

    // =========================================================================
    // 25. PALLIATIVE CARE & HOME HEALTHCARE
    // =========================================================================
    if (q.includes('palliative') || q.includes('oxygen') || q.includes('wheelchair') || q.includes('bed') || q.includes('രോഗി') || q.includes('പാലിയേറ്റീവ്') || q.includes('വീൽചെയർ') || q.includes('റعاية ملطفة')) {
      if (activeLang === 'ml') {
        return `🩺 **മഹല്ല് പാലിയേറ്റീവ് കെയർ & സൗജന്യ മെഡിക്കൽ ഉപകരണങ്ങൾ**:\n` +
          `• കിടപ്പിലായ രോഗികൾക്ക് ഡോക്ടർ, നേഴ്സ് എന്നിവരുടെ സൗജന്യ ഹോം കെയർ വിസിറ്റ്.\n` +
          `• **സൗജന്യമായി നൽകുന്ന ഉപകരണങ്ങൾ**:\n` +
          `  - ഓക്സിജൻ കോൺസെൻട്രേറ്ററുകൾ\n` +
          `  - മെഡിക്കൽ എയർ ബെഡുകൾ & ഹോസ്പിറ്റൽ കോട്ടുകൾ\n` +
          `  - വീൽചെയറുകൾ & വാക്കിംഗ് എയ്ഡുകൾ\n` +
          `• **ഹെൽപ്പ്‌ലൈൻ**: +91 98460 99999 (സദാ സജ്ജം).\n\n` +
          `👉 [പാലിയേറ്റീവ് സേവനങ്ങൾ അറിയുക](community.html#palliative)`;
      } else {
        return `🩺 **Mahall Palliative Care & Free Medical Equipment Bank**:\n` +
          `• Dedicated medical team providing free weekly home visits for bedridden and chronically ill patients.\n` +
          `• **Equipment Provided on Free Loan**:\n` +
          `  - High-flow Oxygen Concentrators\n` +
          `  - Hospital Medical Beds & Ripple Air Mattresses\n` +
          `  - Foldable Wheelchairs & Mobility Walkers\n` +
          `• **Medical Desk Hotline**: +91 98460 99999.\n\n` +
          `👉 [Request Palliative Support](community.html#palliative)`;
      }
    }

    // =========================================================================
    // 26. MARRIAGE BUREAU & NIKAH REGISTRATION
    // =========================================================================
    if (q.includes('bureau') || q.includes('matrimonial') || q.includes('proposal') || q.includes('മാട്രിമോണി') || q.includes('വിവാഹ ബ്യൂറോ') || q.includes('പോർട്ടൽ') || q.includes('خطبة')) {
      if (activeLang === 'ml') {
        return `💍 **നൂറുൽ ഹുദാ മാട്രിമോണിയൽ & നിക്കാഹ് രജിസ്ട്രേഷൻ**:\n` +
          `• മഹല്ലിലെ യുവതീയുവാക്കൾക്കായി പൂർണ്ണമായും സൗജന്യവും വിശ്വസനീയവുമായ വിവാഹ അന്വേഷണ വേദി.\n` +
          `• യാതൊരുവിധ സ്ത്രീധന ഇടപാടുകളും അനുവദിക്കില്ല; സുന്നി പാരമ്പര്യത്തിൽ ഉറച്ച ആലോചനകൾ.\n` +
          `• മഹല്ല് ചീഫ് ഇമാമിന്റെ മേൽനോട്ടത്തിൽ മുൻകൂട്ടി നിക്കാഹ് രജിസ്റ്റർ ചെയ്യാം.\n\n` +
          `👉 [വിവാഹ ബ്യൂറോയിൽ രജിസ്റ്റർ ചെയ്യുക](community.html#matrimonial)`;
      } else {
        return `💍 **Noorul Huda Matrimonial Desk & Nikah Service**:\n` +
          `• Verified, zero-brokerage, dowry-free matchmaking desk for community members.\n` +
          `• Strictly confidential profiles screened with parental consent.\n` +
          `• Advance Nikah registration with the Chief Registrar for solemnization at the Central Mosque.\n\n` +
          `👉 [Explore Matrimonial Desk](community.html#matrimonial)`;
      }
    }

    // =========================================================================
    // 27. ADMINISTRATION, FINANCIAL AUDITS & ELECTIONS
    // =========================================================================
    if (q.includes('admin') || q.includes('audit') || q.includes('election') || q.includes('vote') || q.includes('balance sheet') || q.includes('ഭരണം') || q.includes('ഓഡിറ്റ്') || q.includes('തെരഞ്ഞെടുപ്പ്') || q.includes('വോട്ട്') || q.includes('إدارة') || q.includes('انتخابات')) {
      if (activeLang === 'ml') {
        return `⚖️ **ഭരണ സുതാര്യത, ഓഡിറ്റ് & തെരഞ്ഞെടുപ്പ് വിവരങ്ങൾ**:\n` +
          `• **ഓഡിറ്റ്**: എല്ലാ സാമ്പത്തിക വർഷത്തെയും വരവ് ചെലവ് കണക്കുകൾ ചാർട്ടേഡ് അക്കൗണ്ടന്റ് പരിശോധിച്ചു ജനറൽ ബോഡിയിൽ അവതരിപ്പിക്കുന്നു.\n` +
          `• **തെരഞ്ഞെടുപ്പ്**: 3 വർഷത്തിലൊരിക്കൽ 8 വാർഡുകളിലെയും 18 വയസ്സ് തികഞ്ഞ മഹല്ല് അംഗങ്ങളുടെ സമ്മതിദാനാവകാശത്തിലൂടെ കമ്മിറ്റി രൂപീകരണം.\n` +
          `• ഭരണ സമിതി മിനിറ്റ്സുകളും പ്രമേയങ്ങളും ഡിജിറ്റൽ ആർക്കൈവിൽ ലഭ്യമാണ്.\n\n` +
          `👉 [ഭരണവിഭാഗം & ഓഡിറ്റ് പരിശോധിക്കുക](ADMIN/index.html)`;
      } else {
        return `⚖️ **Administration, Chartered Audits & Democratic Governance**:\n` +
          `• **Financial Transparency**: Annual balance sheets, audit reports, and expense statements audited by external Chartered Accountants.\n` +
          `• **Electoral Franchise**: Democratic triennial general body elections held across all 8 wards for every verified adult family member.\n` +
          `• Resolution archives and executive circulars maintained in the central administrative register.\n\n` +
          `👉 [View Administration Portal](ADMIN/index.html)`;
      }
    }

    // =========================================================================
    // 22. DEFAULT SMART GUIDANCE FALLBACK
    // =========================================================================
    if (activeLang === 'ml') {
      return `അസ്സലാമു അലൈക്കും! ഞാൻ **നൂറുൽ ഹുദാ മഹല്ല് AI അസിസ്റ്റന്റാണ്** 🌙.\n` +
        `നിങ്ങൾക്ക് മഹല്ല് വെബ്സൈറ്റിലെ ഏത് സേവനത്തെക്കുറിച്ചും എന്നോട് ചോദിക്കാം:\n\n` +
        `• 🕌 **നിസ്കാര സമയവും ജുമുഅ വിവരങ്ങളും**\n` +
        `• 🧾 **വിവാഹ NOC / സർട്ടിഫിക്കറ്റ് അപേക്ഷകൾ**\n` +
        `• 🎓 **മദ്റസ, ദർസ് & ഖുർആൻ ക്ലാസുകൾ**\n` +
        `• 💳 **പ്രതിമാസ വരിസംഖ്യ & സകാത്ത് കാൽക്കുലേറ്റർ**\n` +
        `• 🚨 **24/7 ആംബുലൻസ് & രക്തദാന ഡയറക്ടറി**\n` +
        `• 🗺️ **മഹല്ല് മാപ്പും 8 വാർഡുകളും**\n` +
        `• 🏛️ **കമ്മ്യൂണിറ്റി ഓഡിറ്റോറിയം ബുക്കിംഗ്**\n` +
        `• 🤝 **സുൽഹു കുടുംബ മധ്യസ്ഥ സമിതി**\n\n` +
        `താങ്കളുടെ സംശയം ചുരുങ്ങിയ വാക്കുകളിൽ ഇവിടെ ടൈപ്പ് ചെയ്യുക.`;
    } else if (activeLang === 'ar') {
      return `السلام عليكم ورحمة الله وبركاته! أنا **المساعد الذكي لجماعة نور الهدى للمحلّة** 🌙.\n` +
        `يمكنني إجابتكم فوراً عن جميع خدمات موقع المحلّة:\n\n` +
        `• 🕌 **مواقيت الصلوات الخمس وخطبة الجمعة**\n` +
        `• 🧾 **استخراج شهادات الزواج وعضوية المحلّة**\n` +
        `• 🎓 **أوقات المدرسة القرآنية والدراسات الإسلامية**\n` +
        `• 💳 **دفع الاشتراكات الشهرية وحساب الزكاة**\n` +
        `• 🚨 **خدمة الإسعاف المتواصلة 24/7 ودليل المتبرعين بالدم**\n` +
        `• 🗺️ **خريطة المحلّة التفاعلية والدوائر الثمانية**\n` +
        `• 🏛️ **حجز قاعة المناسبات وصندوق التكافل الاجتماعي**\n\n` +
        `تفضلوا بكتابة سؤالكم وسأجيبكم بكل سرور.`;
    } else {
      return `Assalamu Alaikum! I am the **Noorul Huda Mahall AI Assistant** 🌙.\n` +
        `I am trained on the complete knowledge base of our entire website. You can ask me about:\n\n` +
        `• 🕌 **Prayer Times & Friday Jumu'ah Schedule**\n` +
        `• 🧾 **Marriage NOC & Certificate Applications**\n` +
        `• 🎓 **Madrasa, Dars & Qur'an Study Circles**\n` +
        `• 💳 **Monthly Subscription (₹250) & Zakat Calculator**\n` +
        `• 🚨 **24/7 Ambulance (+91 98460 99999) & Blood Donors**\n` +
        `• 🗺️ **Mahall Map, 8 Wards & Cemetery Sectors**\n` +
        `• 🏛️ **Auditorium Booking & Community Welfare**\n` +
        `• 🤝 **Confidential Sulhu Family Mediation**\n` +
        `• 👥 **Committee Members & Office Visiting Hours**\n\n` +
        `Feel free to type your question above or click one of the quick topic chips!`;
    }
  },

  // Admin AI Announcement Formatter
  generateAnnouncement: function(topic, keyPoints, targetAudience = 'all') {
    const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return {
      en: {
        title: `Official Notice: ${topic}`,
        body: `📢 **OFFICIAL ANNOUNCEMENT - NOORUL HUDA MAHALL JAMA'ATH**\n\nDate: ${todayStr}\nTarget: ${targetAudience === 'all' ? 'All Mahall Residents & Families' : targetAudience}\n\nRespected Community Members,\n\nAssalamu Alaikum wa Rahmatullahi wa Barakatuhu.\n\nPlease be informed regarding **${topic}**:\n\n${keyPoints}\n\nWe kindly request all families and members to take note of this notice and extend their active cooperation.\n\n*By Order of the Executive Committee,*\n**P. K. Abdurahman**\nGeneral Secretary, Noorul Huda Mahall`
      },
      ml: {
        title: `പ്രധാന അറിയിപ്പ്: ${topic}`,
        body: `📢 **നൂറുൽ ഹുദാ മഹല്ല് ജമാഅത്ത് ഔദ്യോഗിക അറിയിപ്പ്**\n\nതീയതി: ${todayStr}\nലക്ഷ്യം: മഹല്ല് നിവാസികൾ\n\nബഹുമാനപ്പെട്ട മഹല്ല് നിവാസികളെ,\nഅസ്സലാമു അലൈക്കും വരഹ്‌മത്തുല്ലാഹി വബറകാതുഹു.\n\n**${topic}** സംബന്ധിച്ച താഴെ പറയുന്ന വിവരങ്ങൾ ശ്രദ്ധിക്കുക:\n\n${keyPoints}\n\nഎല്ലാ മഹല്ല് അംഗങ്ങളും ഈ അറിയിപ്പ് ശ്രദ്ധയിൽ കൊള്ളണമെന്നും സഹകരിക്കണമെന്നും വിനീതമായി അഭ്യർത്ഥിക്കുന്നു.\n\n*എക്സിക്യൂട്ടീവ് കമ്മിറ്റിയുടെ ഉത്തരവ് പ്രകാരം,*\n**പി. കെ. അബ്ദുറഹ്‌മാൻ**\nജനറൽ സെക്രട്ടറി, നൂറുൽ ഹുദാ മഹല്ല് ജമാഅത്ത്`
      },
      ar: {
        title: `إعلان رسمي: ${topic}`,
        body: `📢 **إعلان رسمي - جماعة نور الهدى للمحلّة**\n\nالتاريخ: ${todayStr}\nالفئة المستهدفة: أهالي المحلّة الكرام\n\nالسلام عليكم ورحمة الله وبركاته،،،\n\nنلفت عناية عموم أهالي المحلّة الكرام بخصوص **${topic}**:\n\n${keyPoints}\n\nنرجو من الجميع التفضل بالإحاطة وحسن التعاون مع لجان المحلّة القائمة على خدمة المجتمع.\n\n*صادر عن الهيئة الإدارية للمحلّة،*\n**بي. كي. عبد الرحمن**\nالأمين العام، جماعة نور الهدى للمحلّة`
      }
    };
  },

  // HTML Markup Generator for the Floating Chatbot Widget
  getWidgetHTML: function() {
    return `
  <!-- FLOATING MAHALL AI ASSISTANT CHAT WIDGET (ALL PAGES) -->
  <div id="mahall-floating-chat-container" class="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-[80] font-sans">
    <!-- Floating Trigger Button -->
    <button onclick="if(window.app && window.app.toggleAIChat){window.app.toggleAIChat();}else{MahallAI.toggle();}"
      id="ai-chat-floating-btn"
      aria-label="Open Mahall AI Assistant"
      title="Ask Mahall AI Assistant"
      class="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-600 text-white shadow-2xl border-2 border-amber-400 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group relative">
      <i data-lucide="bot" class="w-7 h-7 text-amber-300 group-hover:rotate-12 transition-transform"></i>
      <span class="absolute -top-1 -right-1 flex h-4 w-4">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] font-black text-slate-950 items-center justify-center shadow">AI</span>
      </span>
    </button>

    <!-- Interactive Chat Drawer -->
    <div id="ai-chat-drawer"
      class="absolute bottom-16 right-0 w-[340px] sm:w-[400px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col hidden transition-all duration-300 z-[90]">
      
      <!-- Chat Header -->
      <div class="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-4 flex items-center justify-between shadow-md">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold text-base shadow">
            🌙
          </div>
          <div>
            <h4 class="font-bold text-sm leading-tight flex items-center gap-1.5">
              Mahall AI Assistant
              <span class="text-[9px] bg-emerald-600/80 px-1.5 py-0.2 rounded-full font-medium text-emerald-100">Live</span>
            </h4>
            <p class="text-[11px] text-emerald-200">Full website guide & community assistant</p>
          </div>
        </div>
        <button onclick="if(window.app && window.app.toggleAIChat){window.app.toggleAIChat();}else{MahallAI.toggle();}"
          class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-bold transition">&times;</button>
      </div>

      <!-- Quick Suggestion Chips -->
      <div class="p-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        <button onclick="MahallAI.handleChipClick('When is Jumu\'ah prayer and Khutbah?')"
          class="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 whitespace-nowrap hover:border-emerald-600 hover:text-emerald-700 transition">
          🕌 Jumu'ah
        </button>
        <button onclick="MahallAI.handleChipClick('How can I get a Marriage NOC certificate?')"
          class="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 whitespace-nowrap hover:border-emerald-600 hover:text-emerald-700 transition">
          🧾 Marriage NOC
        </button>
        <button onclick="MahallAI.handleChipClick('Tell me about Noorul Huda Madrasa timings')"
          class="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 whitespace-nowrap hover:border-emerald-600 hover:text-emerald-700 transition">
          📖 Madrasa
        </button>
        <button onclick="MahallAI.handleChipClick('Emergency ambulance number and blood donors')"
          class="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 whitespace-nowrap hover:border-emerald-600 hover:text-emerald-700 transition">
          🚑 Ambulance
        </button>
        <button onclick="MahallAI.handleChipClick('How to pay Mahall monthly subscription dues?')"
          class="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 whitespace-nowrap hover:border-emerald-600 hover:text-emerald-700 transition">
          💳 Pay ₹250
        </button>
        <button onclick="MahallAI.handleChipClick('Tell me the history of Noorul Huda Mahall')"
          class="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 whitespace-nowrap hover:border-emerald-600 hover:text-emerald-700 transition">
          🏛️ History
        </button>
      </div>

      <!-- Chat Messages Container -->
      <div id="ai-chat-messages" class="p-4 h-72 sm:h-80 overflow-y-auto space-y-3 text-slate-800 dark:text-slate-200">
        <div class="flex items-start gap-2">
          <div class="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow">
            🌙
          </div>
          <div class="chat-bubble-ai text-xs md:text-sm px-4 py-2.5 max-w-[88%] border border-slate-200/80 dark:border-slate-700 shadow-sm leading-relaxed">
            Assalamu Alaikum! I am the <strong>Noorul Huda Mahall AI Assistant</strong>. Ask me anything about prayer times, marriage NOC, madrasa, ambulance, Zakat, or community services across our entire website!
          </div>
        </div>
      </div>

      <!-- Chat Input Field -->
      <div class="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
        <input id="ai-chat-input" onkeydown="if(event.key==='Enter') MahallAI.sendMessage()" type="text"
          placeholder="Ask anything about our Mahall..."
          class="flex-grow text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 transition" />
        <button onclick="MahallAI.sendMessage()" class="btn-primary p-2.5 rounded-xl shadow hover:scale-105 transition" aria-label="Send Message">
          <i data-lucide="send" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  </div>`;
  },

  // Helper to toggle chat widget
  toggle: function() {
    let drawer = document.getElementById('ai-chat-drawer');
    if (!drawer) {
      MahallAI.initWidget();
      drawer = document.getElementById('ai-chat-drawer');
    }
    if (!drawer) return;
    drawer.classList.toggle('hidden');
    if (!drawer.classList.contains('hidden')) {
      const input = document.getElementById('ai-chat-input');
      if (input) input.focus();
    }
  },

  // Helper when user clicks preset chip
  handleChipClick: function(text) {
    if (window.app && window.app.sendAIChatMessage) {
      window.app.sendAIChatMessage(text);
    } else {
      MahallAI.sendMessage(text);
    }
  },

  // Send message and format response with interactive HTML
  sendMessage: function(presetText = null) {
    const input = document.getElementById('ai-chat-input');
    const text = presetText || (input ? input.value.trim() : '');
    if (!text) return;

    if (input && !presetText) input.value = '';

    const messagesBox = document.getElementById('ai-chat-messages');
    if (!messagesBox) return;

    // Render User bubble
    messagesBox.innerHTML += `
      <div class="flex justify-end mb-3">
        <div class="chat-bubble-user text-xs md:text-sm px-4 py-2.5 max-w-[80%] shadow-sm">
          ${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        </div>
      </div>
    `;
    messagesBox.scrollTop = messagesBox.scrollHeight;

    // Determine current language
    const currentLang = (window.app && window.app.currentLang) ? window.app.currentLang : 'en';

    // Simulate thinking with typing indicator
    setTimeout(() => {
      const rawResponse = MahallAI.answerQuery(text, currentLang);
      
      // Parse markdown-like tags (**bold**, [link](url), line breaks)
      let formatted = rawResponse
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-amber-600 dark:text-amber-400 font-bold underline hover:text-emerald-600">$1 &rarr;</a>')
        .replace(/\n/g, '<br/>');

      messagesBox.innerHTML += `
        <div class="flex items-start gap-2 mb-3">
          <div class="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow">
            🌙
          </div>
          <div class="chat-bubble-ai text-xs md:text-sm px-4 py-2.5 max-w-[88%] border border-slate-200/80 dark:border-slate-700 shadow-sm leading-relaxed">
            ${formatted}
          </div>
        </div>
      `;
      messagesBox.scrollTop = messagesBox.scrollHeight;
      if (window.lucide) lucide.createIcons();
    }, 350);
  },

  // Self-mounting initializer: injects widget if not present on current page
  initWidget: function() {
    if (document.getElementById('mahall-floating-chat-container') || document.getElementById('ai-chat-drawer')) {
      // Ensure icons are created
      if (window.lucide) lucide.createIcons();
      return;
    }

    // Insert widget markup right before body close
    document.body.insertAdjacentHTML('beforeend', MahallAI.getWidgetHTML());
    if (window.lucide) {
      lucide.createIcons();
    }
  }
};

// Automatically mount widget when DOM is ready on ANY page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MahallAI.initWidget());
} else {
  MahallAI.initWidget();
}
