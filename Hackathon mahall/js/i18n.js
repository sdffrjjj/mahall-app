/**
 * NOORUL HUDA MAHALL - MULTILINGUAL TRANSLATION & I18N ENGINE
 * Languages: English (en), Malayalam (ml), Arabic (ar)
 * Features: Keypath translations, DOM TreeWalker phrase translation, RTL support, and reactive event broadcasting.
 */

const I18N = {
  // 1. Structured Keypath Dictionary
  en: {
    title: "Noorul Huda Mahall",
    tagline: "Connecting our community through faith, service, and unity",
    nav: {
      home: "Home",
      prayer: "Prayer & Mosque",
      announcements: "Announcements",
      events: "Events & Programs",
      education: "Madrasa / Education",
      community: "Community Support",
      map: "Campus Map",
      gallery: "Gallery",
      history: "History",
      myMahall: "My Mahall",
      admin: "Admin Console"
    },
    hero: {
      welcome: "Welcome to Noorul Huda Mahall",
      subtext: "A vibrant, caring Islamic sanctuary rooted in community, knowledge, and charitable devotion.",
      nextPrayerLabel: "Next Prayer In",
      viewTimetable: "View Prayer Times",
      portalButton: "Access My Mahall Portal",
      emergencyJanazah: "Janazah Announcement"
    },
    prayers: {
      fajr: "Fajr",
      sunrise: "Sunrise",
      dhuhr: "Dhuhr",
      asr: "Asr",
      maghrib: "Maghrib",
      isha: "Isha",
      jumua: "Jumu'ah",
      adhan: "Adhan",
      iqamah: "Iqamah",
      autoLocationNotice: "Calculated for Calicut, Kerala (11.25°N, 75.78°E)",
      khatib: "Khutbah Khatib",
      topic: "Topic"
    },
    member: {
      title: "My Mahall Resident Portal",
      familyId: "Family ID",
      familyHead: "Head of Family",
      houseNo: "House / Ward",
      myFamily: "My Family Members",
      digitalCard: "Digital Mahall ID",
      contributions: "My Mahall Contributions",
      pending: "Pending",
      paid: "Paid Up to Date",
      payNow: "Pay / Contribute",
      certificates: "Certificate & Document Requests",
      applyCert: "Request New Certificate",
      sulhuTitle: "Sulhu Mediation & Family Dispute Desk",
      sulhuDesc: "Confidential filing for marital counseling, reconciliation, or family arbitration with the Mahall Qazi & mediation board.",
      fileSulhu: "Submit Confidential Mediation Request"
    },
    admin: {
      title: "Executive Admin Dashboard",
      familiesCard: "Total Families",
      membersCard: "Total Registered Members",
      collectionsCard: "Monthly Contributions",
      pendingReqs: "Pending Applications",
      eventsCard: "Upcoming Programs",
      aiAssistantStudio: "AI Community Announcement Studio",
      generateWithAI: "Generate Tri-Lingual Notice with AI"
    },
    common: {
      all: "All",
      ward: "Ward",
      status: "Status",
      action: "Action",
      view: "View",
      download: "Download",
      approve: "Approve",
      reject: "Reject",
      close: "Close",
      save: "Save",
      submit: "Submit",
      cancel: "Cancel",
      search: "Search...",
      emergencyPhone: "Emergency Contact",
      ambulance: "Ambulance Desk",
      bloodGroup: "Blood Group",
      contact: "Contact",
      rolePublic: "Public Visitor",
      roleMember: "Resident: Ahmed Koya (Ward 2)",
      roleAdmin: "Admin: Mahall Secretary"
    }
  },

  ml: {
    title: "നൂറുൽ ഹുദാ മഹല്ല്",
    tagline: "വിശ്വാസം, സേവനം, ഐക്യം - നമ്മുടെ സമൂഹത്തിന്റെ കരുത്ത്",
    nav: {
      home: "ഹോം",
      prayer: "നിസ്കാര സമയങ്ങൾ",
      announcements: "അറിയിപ്പുകൾ",
      events: "പരിപാടികൾ",
      education: "മദ്റസ / വിദ്യാഭ്യാസം",
      community: "സാമൂഹ്യ സേവനം",
      map: "മഹല്ല് മാപ്പ്",
      gallery: "ചിത്രശാല",
      history: "ചരിത്രം",
      myMahall: "എന്റെ മഹല്ല്",
      admin: "അഡ്മിൻ പാനൽ"
    },
    hero: {
      welcome: "നൂറുൽ ഹുദാ മഹല്ലിലേക്ക് സ്വാഗതം",
      subtext: "വിശ്വാസവും സാഹോദര്യവും കാരുണ്യവും മുൻനിർത്തി പ്രവർത്തിക്കുന്ന മാതൃകാ മഹല്ല് സമൂഹം.",
      nextPrayerLabel: "അടുത്ത നിസ്കാരത്തിന് ബാക്കി",
      viewTimetable: "നിസ്കാര സമയം കാണുക",
      portalButton: "എന്റെ മഹല്ല് പോർട്ടൽ",
      emergencyJanazah: "മയ്യത്ത് അറിയിപ്പ്"
    },
    prayers: {
      fajr: "സുബ്ഹ്",
      sunrise: "സൂര്യോദയം",
      dhuhr: "ളുഹ്ർ",
      asr: "അസ്വർ",
      maghrib: "മഗ്രിബ്",
      isha: "ഇശാഅ്",
      jumua: "ജുമുഅ",
      adhan: "ബാങ്ക്",
      iqamah: "ഇഖാമത്ത്",
      autoLocationNotice: "കോഴിക്കോട്, കേരള ലൊക്കേഷൻ അടിസ്ഥാനമാക്കിയത്",
      khatib: "ഖുതുബ നിർവ്വഹിക്കുന്നത്",
      topic: "വിഷയം"
    },
    member: {
      title: "എന്റെ മഹല്ല് റെസിഡന്റ് പോർട്ടൽ",
      familyId: "ഫാമിലി ഐഡി",
      familyHead: "കുടുംബനാഥൻ",
      houseNo: "വീട്ടു നമ്പർ / വാർഡ്",
      myFamily: "കുടുംബാംഗങ്ങൾ",
      digitalCard: "ഡിജിറ്റൽ മഹല്ല് തിരിച്ചറിയൽ കാർഡ്",
      contributions: "മഹല്ല് വരിസംഖ്യ / സംഭാവനകൾ",
      pending: "കുടിശ്ശികയുണ്ട്",
      paid: "അടച്ചു തീർത്തത്",
      payNow: "വരിസംഖ്യ അടക്കുക",
      certificates: "സർട്ടിഫിക്കറ്റ് അപേക്ഷകൾ",
      applyCert: "പുതിയ സർട്ടിഫിക്കറ്റിന് അപേക്ഷിക്കുക",
      sulhuTitle: "സുൽഹു (കുടുംബ മധ്യസ്ഥത & കൗൺസിലിംഗ്)",
      sulhuDesc: "കുടുംബ പ്രശ്നങ്ങൾ, ത്വലാഖ് സംബന്ധിച്ച വിവരങ്ങൾ, ഒത്തുതീർപ്പ് ചർച്ചകൾക്കായി മഹല്ല് ഖാസി ബോർഡിലേക്ക് രഹസ്യമായി അപേക്ഷിക്കാം.",
      fileSulhu: "മധ്യസ്ഥതക്കായി അപേക്ഷിക്കുക"
    },
    admin: {
      title: "മഹല്ല് അഡ്മിൻ ഡാഷ്‌ബോർഡ്",
      familiesCard: "ആകെ കുടുംബങ്ങൾ",
      membersCard: "ആകെ അംഗങ്ങൾ",
      collectionsCard: "പ്രതിമാസ വരവ്",
      pendingReqs: "തീർപ്പുകൽപ്പിക്കാനുള്ള അപേക്ഷകൾ",
      eventsCard: "വരാനിരിക്കുന്ന പരിപാടികൾ",
      aiAssistantStudio: "AI അറിയിപ്പ് നിർമ്മാതാവ്",
      generateWithAI: "AI വഴി 3 ഭാഷകളിലും തയ്യാറാക്കുക"
    },
    common: {
      all: "എല്ലാം",
      ward: "വാർഡ്",
      status: "സ്റ്റാറ്റസ്",
      action: "നടപടി",
      view: "കാണുക",
      download: "ഡൗൺലോഡ്",
      approve: "അംഗീകരിക്കുക",
      reject: "നിരസിക്കുക",
      close: "അടക്കുക",
      save: "സൂക്ഷിക്കുക",
      submit: "സമർപ്പിക്കുക",
      cancel: "റദ്ദാക്കുക",
      search: "തിരയുക...",
      emergencyPhone: "അടിയന്തിര നമ്പർ",
      ambulance: "ആംബുലൻസ് ഡെസ്ക്",
      bloodGroup: "രക്തഗ്രൂപ്പ്",
      contact: "ഫോൺ",
      rolePublic: "സന്ദർശകൻ",
      roleMember: "അംഗം: അഹമ്മദ് കോയ (വാർഡ് 2)",
      roleAdmin: "അഡ്മിൻ: മഹല്ല് സെക്രട്ടറി"
    }
  },

  ar: {
    title: "جماعة نور الهدى للمحلّة",
    tagline: "ربط مجتمعنا من خلال الإيمان والخدمة والوحدة",
    nav: {
      home: "الرئيسية",
      prayer: "مواقيت الصلاة",
      announcements: "الإعلانات",
      events: "الفعاليات والبرامج",
      education: "المدرسة والتعليم",
      community: "الخدمة الاجتماعية",
      map: "خريطة المحلّة",
      gallery: "معرض الصور",
      history: "التاريخ والتأسيس",
      myMahall: "محلّتي",
      admin: "لوحة الإدارة"
    },
    hero: {
      welcome: "مرحباً بكم في جماعة نور الهدى",
      subtext: "صرح إسلامي متميز يجمع بين العبادة والعلم والتكافل الاجتماعي الخيّر.",
      nextPrayerLabel: "الوقت المتبقي للصلاة القادمة",
      viewTimetable: "عرض مواقيت الصلاة",
      portalButton: "الدخول إلى بوابة محلّتي",
      emergencyJanazah: "إعلان صلاة الجنازة"
    },
    prayers: {
      fajr: "الفجر",
      sunrise: "الشروق",
      dhuhr: "الظهر",
      asr: "العصر",
      maghrib: "المغرب",
      isha: "العشاء",
      jumua: "الجمعة",
      adhan: "الأذان",
      iqamah: "الإقامة",
      autoLocationNotice: "محسوبة وفق توقيت كيرلا، الهند",
      khatib: "خطيب الجمعة",
      topic: "الموضوع"
    },
    member: {
      title: "بوابة المقيم - محلّتي",
      familyId: "رقم العائلة",
      familyHead: "رب الأسرة",
      houseNo: "المنزل / الجناح",
      myFamily: "أفراد العائلة",
      digitalCard: "البطاقة الذكية للمحلّة",
      contributions: "الاشتراكات والتبرعات",
      pending: "مستحق الدفع",
      paid: "مسدد بالكامل",
      payNow: "سداد الاشتراك",
      certificates: "طلبات الشهادات والوثائق",
      applyCert: "طلب شهادة جديدة",
      sulhuTitle: "لجنة الصلح والتوفيق الأسري",
      sulhuDesc: "تقديم طلبات الوساطة الزوجية والإصلاح الأسري بسرية تامة لدى قاضي المحلّة ولجنة الصلح.",
      fileSulhu: "تقديم طلب وساطة سري"
    },
    admin: {
      title: "لوحة التحكم الإدارية",
      familiesCard: "إجمالي العائلات",
      membersCard: "إجمالي الأعضاء",
      collectionsCard: "التحصيلات الشهرية",
      pendingReqs: "الطلبات المعلقة",
      eventsCard: "الأنشطة القادمة",
      aiAssistantStudio: "استوديو الإعلانات الذكي (AI)",
      generateWithAI: "صياغة إعلان بالذكاء الاصطناعي"
    },
    common: {
      all: "الكل",
      ward: "الجناح",
      status: "الحالة",
      action: "الإجراء",
      view: "عرض",
      download: "تحميل",
      approve: "موافقة",
      reject: "رفض",
      close: "إغلاق",
      save: "حفظ",
      submit: "إرسال",
      cancel: "إلغاء",
      search: "بحث...",
      emergencyPhone: "طوارئ المحلّة",
      ambulance: "الإسعاف",
      bloodGroup: "فصيلة الدم",
      contact: "الاتصال",
      rolePublic: "زائر عام",
      roleMember: "عضو: أحمد كويا (الجناح 2)",
      roleAdmin: "مسؤول: سكرتير المحلّة"
    }
  },

  // 2. Comprehensive Phrase Translation Dictionary for Full Webpage Elements
  phrases: {
    // Identity & Top Header
    "Noorul Huda Mahall Jama'ath": { ml: "നൂറുൽ ഹുദാ മഹല്ല് ജമാഅത്ത്", ar: "جماعة جامع نور الهدى" },
    "Noorul Huda": { ml: "നൂറുൽ ഹുദാ", ar: "نور الهدى" },
    "Mahall Jama'ath • Estd 1968": { ml: "മഹല്ല് ജമാഅത്ത് • സ്ഥാപിതം 1968", ar: "جماعة المحلّة • تأسست ١٩٦٨" },
    "Office: +91 495 2724800": { ml: "ഓഫീസ്: +91 495 2724800", ar: "المكتب: +91 495 2724800" },
    "Ask Mahall AI": { ml: "മഹല്ല് AI ചോദിക്കുക", ar: "اسأل ذكاء المحلّة" },

    // Main Navigation Links
    "Home": { ml: "ഹോം", ar: "الرئيسية" },
    "About Mahall": { ml: "മഹല്ലിനെക്കുറിച്ച്", ar: "عن المحلّة" },
    "Prayer & Mosque": { ml: "നിസ്കാരവും പള്ളിയും", ar: "الصلاة والمسجد" },
    "Announcements": { ml: "അറിയിപ്പുകൾ", ar: "الإعلانات" },
    "Events & Programs": { ml: "പരിപാടികൾ", ar: "الفعاليات والبرامج" },
    "Education": { ml: "വിദ്യാഭ്യാസം", ar: "التعليم" },
    "Community": { ml: "സാമൂഹ്യ സേവനം", ar: "المجتمع" },
    "Gallery": { ml: "ചിത്രശാല", ar: "معرض الصور" },
    "Contributions": { ml: "സംഭാവനകൾ", ar: "التبرعات" },
    "More": { ml: "കൂടുതൽ", ar: "المزيد" },

    // Submenu Items
    "Mahall History": { ml: "മഹല്ല് ചരിത്രം", ar: "تاريخ المحلّة" },
    "About Mosque": { ml: "പള്ളിയെക്കുറിച്ച്", ar: "عن المسجد" },
    "Imam & Khateeb": { ml: "ഇമാമും ഖത്തീബും", ar: "الإمام والخطيب" },
    "Executive Committee": { ml: "ഭരണസമിതി", ar: "اللجنة التنفيذية" },
    "Vision & Mission": { ml: "ലക്ഷ്യവും ദർശനവും", ar: "الرؤية والرسالة" },
    "Mahall Map": { ml: "മഹല്ല് മാപ്പ്", ar: "خريطة المحلّة" },
    "Prayer Timetable": { ml: "നിസ്കാര സമയക്രമം", ar: "جدول مواقيت الصلاة" },
    "Ramadan Schedule": { ml: "റമദാൻ കലണ്ടർ", ar: "جدول شهر رمضان" },
    "Khutbah & Sermons": { ml: "ഖുതുബ പ്രഭാഷണങ്ങൾ", ar: "خطب الجمعة" },
    "Live Adhan": { ml: "തത്സമയ ബാങ്ക്", ar: "الأذان الحي" },
    "Mosque Facilities": { ml: "പള്ളി സൗകര്യങ്ങൾ", ar: "مرافق المسجد" },
    "All Announcements": { ml: "എല്ലാ അറിയിപ്പുകളും", ar: "كافة الإعلانات" },
    "Mosque Notices": { ml: "പള്ളി അറിയിപ്പുകൾ", ar: "تعاميم المسجد" },
    "Emergency Alerts": { ml: "അടിയന്തര മുന്നറിയിപ്പുകൾ", ar: "تنبيهات الطوارئ" },
    "Funeral / Janazah": { ml: "മയ്യത്ത് നമസ്കാരം", ar: "صلاة الجنازة" },
    "Janazah Demise Board": { ml: "മയ്യത്ത് നോട്ടീസ് ബോർഡ്", ar: "لوحة إعلانات الجنائز" },
    "Press Releases": { ml: "വാർത്താക്കുറിപ്പുകൾ", ar: "بيانات صحفية" },
    "Islamic Academy / Madrasa": { ml: "ഇസ്ലാമിക് അക്കാദമി / മദ്റസ", ar: "الأكاديمية الإسلامية / المدرسة" },
    "Madrasa Academy": { ml: "മദ്റസ അക്കാദമി", ar: "أكاديمية المدرسة" },
    "Qur'an Classes": { ml: "ഖുർആൻ ക്ലാസുകൾ", ar: "حلقات القرآن الكريم" },
    "Arabic Language Courses": { ml: "അറബിക് ഭാഷാ കോഴ്സുകൾ", ar: "دورات اللغة العربية" },
    "Arabic Classes": { ml: "അറബിക് ക്ലാസുകൾ", ar: "دروس اللغة العربية" },
    "Islamic Studies": { ml: "ഇസ്ലാമിക് സ്റ്റഡീസ്", ar: "الدراسات الإسلامية" },
    "Class Schedule": { ml: "ക്ലാസ് സമയവിവരം", ar: "جدول الحصص الدراسية" },
    "Faculty Directory": { ml: "അധ്യാപക ഡയറക്ടറി", ar: "دليل المدرسين" },
    "Teachers Directory": { ml: "അധ്യാപക വിവരങ്ങൾ", ar: "دليل المعلمين" },
    "Study Materials": { ml: "പഠന സാമഗ്രികൾ", ar: "المواد التعليمية" },
    "Baitulmal Fund": { ml: "ബൈത്തുൽമാൽ ഫണ്ട്", ar: "صندوق بيت المال" },
    "Blood Donors Registry": { ml: "രക്തദാന ഡയറക്ടറി", ar: "سجل المتبرعين بالدم" },
    "Youth Wing": { ml: "യൂത്ത് വിംഗ്", ar: "جناح الشباب" },
    "Elderly Care": { ml: "വയോജന സംരക്ഷണം", ar: "رعاية كبار السن" },
    "Women's Forum": { ml: "വനിതാ വേദി", ar: "منتدى المرأة" },
    "Volunteer Brigade": { ml: "വളണ്ടിയർ സേന", ar: "فريق المتطوعين" },
    "Campus Map": { ml: "കാമ്പസ് ഭൂപടം", ar: "خريطة المجمع" },
    "Auditorium Booking": { ml: "ഓഡിറ്റോറിയം ബുക്കിംഗ്", ar: "حجز القاعة" },
    "Funeral Services": { ml: "മയ്യത്ത് പരിപാലനം", ar: "خدمات الجنائز والتجهيز" },
    "Job Cell": { ml: "തൊഴിൽ സഹായ വേദി", ar: "مكتب التوظيف" },
    "Download Forms": { ml: "ഫോമുകൾ ഡൗൺലോഡ്", ar: "تحميل النماذج" },
    "My Mahall Portal": { ml: "എന്റെ മഹല്ല് പോർട്ടൽ", ar: "بوابة محلّتي" },
    "Admin Console": { ml: "അഡ്മിൻ കൺസോൾ", ar: "لوحة الإدارة" },
    "Executive Admin": { ml: "എക്സിക്യൂട്ടീവ് അഡ്മിൻ", ar: "الإدارة التنفيذية" },
    "Admin Login": { ml: "അഡ്മിൻ ലോഗിൻ", ar: "دخول الإدارة" },

    // Announcements Page Hero & Subheaders
    "OFFICIAL NOTICE BOARD • VERIFIED BROADCASTS": { ml: "ഔദ്യോഗിക അറിയിപ്പ് ബോർഡ് • സ്ഥിരീകരിച്ച വിവരങ്ങൾ", ar: "لوحة الإعلانات الرسمية • بلاغات معتمدة" },
    "Mahall Announcements": { ml: "മഹല്ല് അറിയിപ്പുകൾ", ar: "إعلانات المحلّة" },
    "Stay updated with verified circulars signed by the President & General Secretary, mosque timings adjustments, community welfare notices, emergency advisories, and Janazah alerts.": {
      ml: "പ്രസിഡന്റും ജനറൽ സെക്രട്ടറിയും ഒപ്പിട്ട ഔദ്യോഗിക സർക്കുലറുകൾ, പള്ളി സമയ മാറ്റങ്ങൾ, മയ്യത്ത് അറിയിപ്പുകൾ, അടിയന്തര ജാഗ്രത നിർദ്ദേശങ്ങൾ എന്നിവ തത്സമയം അറിയുക.",
      ar: "ابق على اطلاع دائم بالتعاميم الرسمية المعتمدة ومواقيت الصلاة وإعلانات الجنائز وتنبيهات الطوارئ للمحلّة."
    },
    "REAL-TIME BULLETIN": { ml: "തത്സമയ അറിയിപ്പുകൾ", ar: "نشرة مباشرة" },
    "Real-Time Bulletin": { ml: "തത്സമയ അറിയിപ്പുകൾ", ar: "نشرة مباشرة" },
    "All Announcements Feed": { ml: "എല്ലാ അറിയിപ്പുകളും", ar: "كافة الإعلانات المباشرة" },
    "All Feed": { ml: "എല്ലാം", ar: "الكل" },
    "Mosque": { ml: "പള്ളി", ar: "المسجد" },
    "Community": { ml: "സാമൂഹികം", ar: "المجتمع" },
    "Emergency": { ml: "അടിയന്തിരം", ar: "الطوارئ" },
    "Janazah": { ml: "മയ്യത്ത്", ar: "الجنائز" },
    "All": { ml: "എല്ലാം", ar: "الكل" },

    // Section 1: All Announcements Feed Cards
    "Mosque Notice": { ml: "പള്ളി അറിയിപ്പ്", ar: "إعلان المسجد" },
    "Community Notice": { ml: "സാമൂഹിക അറിയിപ്പ്", ar: "إعلان المجتمع" },
    "Emergency Alert": { ml: "അടിയന്തര മുന്നറിയിപ്പ്", ar: "تنبيه طوارئ" },
    "Food Security": { ml: "ഭക്ഷ്യ സുരക്ഷ", ar: "الأمن الغذائي" },
    "Digital Census": { ml: "ഡിജിറ്റൽ സെൻസസ്", ar: "التعداد الرقمي" },

    // Section 2: Mosque Notices & Circulars
    "CONGREGATIONAL DIRECTIVES": { ml: "ജമാഅത്ത് നിർദ്ദേശങ്ങൾ", ar: "توجيهات جماعية" },
    "Congregational Directives": { ml: "ജമാഅത്ത് നിർദ്ദേശങ്ങൾ", ar: "توجيهات جماعية" },
    "Mosque Notices & Circulars": { ml: "പള്ളി സർക്കുലറുകളും അറിയിപ്പുകളും", ar: "تعاميم وتوجيهات المسجد" },
    "Download PDF": { ml: "PDF ഡൗൺലോഡ്", ar: "تحميل PDF" },
    "Routine Service": { ml: "പതിവ് സേവനം", ar: "خدمة اعتيادية" },
    "Mandatory": { ml: "നിർബന്ധം", ar: "إلزامي" },

    // Section 4: High Priority Alerts - Emergency & Disaster Notices
    "HIGH PRIORITY ALERTS": { ml: "അടിയന്തര മുന്നറിയിപ്പ്", ar: "تنبيهات عالية الأولوية" },
    "High Priority Alerts": { ml: "അടിയന്തര മുന്നറിയിപ്പ്", ar: "تنبيهات عالية الأولوية" },
    "Emergency & Disaster Notices": { ml: "ദുരന്ത നിവാരണ & അത്യാഹിത അറിയിപ്പുകൾ", ar: "إعلانات الطوارئ والكوارث" },
    "Active Alert System": { ml: "തത്സമയ മുന്നറിയിപ്പ് സംവിധാനം", ar: "نظام التنبيه النشط" },
    "Emergency Rescue Control": { ml: "അടിയന്തര രക്ഷാപ്രവർത്തന കൺട്രോൾ", ar: "غرفة عمليات الإنقاذ والطوارئ" },
    "Coastal Monsoon High Waves Advisory": { ml: "തീരദേശ കാലവർഷം & ശക്തമായ കടലാക്രമണ ജാഗ്രത", ar: "تحذير من الرياح الموسمية والأمواج العالية" },
    "Kerala State Disaster Management Warning for Beach Wards": { ml: "തീരദേശ വാർഡുകൾക്ക് സംസ്ഥാന ദുരന്ത നിവാരണ അതോറിറ്റിയുടെ ജാഗ്രതാ നിർദ്ദേശം", ar: "تحذير هيئة إدارة الكوارث في كيرلا لأحياء الشاطئ" },
    "No Active Disaster or High Priority Emergency Alerts": { ml: "അടിയന്തര മുന്നറിയിപ്പുകളോ ദുരന്ത നിവാരണ അറിയിപ്പുകളോ നിലവിലില്ല", ar: "لا توجد تنبيهات طوارئ أو كوارث نشطة حالياً" },
    "Normal coastal and weather conditions reported across all Mahall beach sectors and residential wards.": {
      ml: "എല്ലാ മഹല്ല് തീരദേശ വാർഡുകളിലും സാധാരണ കാലാവസ്ഥയാണ് റിപ്പോർട്ട് ചെയ്തിട്ടുള്ളത്.",
      ar: "الأحوال الجوية والبحرية مستقرة وطبيعية في كافة قطاعات وأحياء المحلّة."
    },

    // Section 5: Funeral / Janazah Notices
    "BEREAVEMENT & CEMETERY": { ml: "മയ്യത്ത് & ഖബർസ്ഥാൻ", ar: "الجنائز والمقبرة" },
    "Bereavement & Cemetery": { ml: "മയ്യത്ത് & ഖബർസ്ഥാൻ", ar: "الجنائز والمقبرة" },
    "Funeral / Janazah Notices": { ml: "മയ്യത്ത് അറിയിപ്പുകൾ", ar: "إعلانات صلاة الجنازة" },
    "Active Janazah Notice Board": { ml: "തത്സമയ മയ്യത്ത് ബോർഡ്", ar: "لوحة إعلانات الجنائز النشطة" },
    "DEMISE ANNOUNCEMENT": { ml: "മരണ അറിയിപ്പ്", ar: "إعلان وفاة" },
    "Demise Announcement": { ml: "മരണ അറിയിപ്പ്", ar: "إعلان وفاة" },
    "GHUSL & BEREAVEMENT SQUAD": { ml: "മയ്യത്ത് പരിപാലന വിംഗ്", ar: "فريق تغسيل وتجهيز الجنائز" },
    "24/7 Rapid Response Squad": { ml: "24/7 ദ്രുതകർമ്മ സേന", ar: "فريق الاستجابة السريعة على مدار الساعة" },

    // Action Buttons & Links
    "Share Notice": { ml: "ഷെയർ ചെയ്യുക", ar: "مشاركة الإعلان" },
    "Janazah Info": { ml: "മയ്യത്ത് വിവരങ്ങൾ", ar: "معلومات الجنازة" },
    "View Agenda": { ml: "അജണ്ട കാണുക", ar: "جدول الأعمال" },
    "Remind": { ml: "ഓർമ്മപ്പെടുത്തുക", ar: "تذكير" },
    "Call Now": { ml: "വിളിക്കുക", ar: "اتصل الآن" },
    "Call": { ml: "വിളിക്കുക", ar: "اتصال" },
    "Contact": { ml: "ബന്ധപ്പെടുക", ar: "تواصل" },
    "Share": { ml: "ഷെയർ", ar: "مشاركة" },
    "Share Blood Appeal": { ml: "രക്തദാന അഭ്യർത്ഥന ഷെയർ ചെയ്യുക", ar: "مشاركة نداء التبرع بالدم" },
    "Details →": { ml: "വിശദാംശങ്ങൾ →", ar: "التفاصيل ←" },
    "Notice PDF": { ml: "നോട്ടീസ് PDF", ar: "ملف PDF" },
    "Add to Calendar": { ml: "കലണ്ടറിലേക്ക് ചേർക്കുക", ar: "إضافة إلى التقويم" },
    "Search notices...": { ml: "അറിയിപ്പുകൾ തിരയുക...", ar: "البحث في الإعلانات..." },
    "Search...": { ml: "തിരയുക...", ar: "بحث..." },
    "Search prayer times, services, certificates...": { ml: "നിസ്കാര സമയം, സേവനങ്ങൾ തിരയുക...", ar: "البحث في مواقيت الصلاة والخدمات..." },
    "Search announcements, circulars, janazah...": { ml: "അറിയിപ്പുകൾ, സർക്കുലറുകൾ, മയ്യത്ത്...", ar: "البحث في الإعلانات والتعاميم والجنائز..." },

    // Homepage & Prayers
    "Welcome to Noorul Huda Mahall": { ml: "നൂറുൽ ഹുദാ മഹല്ലിലേക്ക് സ്വാഗതം", ar: "مرحباً بكم في جماعة نور الهدى" },
    "A vibrant, caring Islamic sanctuary rooted in community, knowledge, and charitable devotion.": {
      ml: "വിശ്വാസവും സാഹോദര്യവും കാരുണ്യവും മുൻനിർത്തി പ്രവർത്തിക്കുന്ന മാതൃകാ മഹല്ല് സമൂഹം.",
      ar: "صرح إسلامي متميز يجمع بين العبادة والعلم والتكافل الاجتماعي الخيّر."
    },
    "Next Prayer In": { ml: "അടുത്ത നിസ്കാരത്തിന് ബാക്കി", ar: "الوقت المتبقي للصلاة القادمة" },
    "Next Prayer": { ml: "അടുത്ത നിസ്കാരം", ar: "الصلاة القادمة" },
    "View Prayer Times": { ml: "നിസ്കാര സമയം കാണുക", ar: "عرض مواقيت الصلاة" },
    "Access My Mahall Portal": { ml: "എന്റെ മഹല്ല് പോർട്ടൽ", ar: "الدخول إلى بوابة محلّتي" },
    "Janazah Announcement": { ml: "മയ്യത്ത് അറിയിപ്പ്", ar: "إعلان صلاة الجنازة" },
    "JANAZAH NOTICE": { ml: "മയ്യത്ത് അറിയിപ്പ്", ar: "إعلان جنازة" },
    "View Details & Location →": { ml: "വിശദാംശങ്ങളും ലൊക്കേഷനും കാണുക →", ar: "عرض التفاصيل والموقع ←" },
    "Daily Congregational Timetable": { ml: "പ്രതിദിന ജമാഅത്ത് സമയക്രമം", ar: "جدول الصلوات الجماعية اليومية" },
    "Fajr": { ml: "സുബ്ഹ്", ar: "الفجر" },
    "Sunrise": { ml: "സൂര്യോദയം", ar: "الشروق" },
    "Dhuhr": { ml: "ളുഹ്ർ", ar: "الظهر" },
    "Asr": { ml: "അസ്വർ", ar: "العصر" },
    "Maghrib": { ml: "മഗ്രിബ്", ar: "المغرب" },
    "Isha": { ml: "ഇശാഅ്", ar: "العشاء" },
    "Jumu'ah": { ml: "ജുമുഅ", ar: "الجمعة" },
    "Adhan": { ml: "ബാങ്ക്", ar: "الأذان" },
    "Iqamah": { ml: "ഇഖാമത്ത്", ar: "الإقامة" },
    "Upcoming Events & Community Calendar": { ml: "വരാനിരിക്കുന്ന പരിപാടികൾ & കലണ്ടർ", ar: "الفعاليات القادمة وجدول المجتمع" },
    "Upcoming Events": { ml: "വരാനിരിക്കുന്ന പരിപാടികൾ", ar: "الفعاليات القادمة" },
    "Register / RSVP": { ml: "രജിസ്റ്റർ ചെയ്യുക", ar: "حجز مقعد / تسجيل" },
    "Seats Left": { ml: "സീറ്റുകൾ ബാക്കി", ar: "مقاعد متبقية" },
    "Housefull": { ml: "പൂർണ്ണമായി", ar: "مكتمل العدد" },
    "Registered": { ml: "രജിസ്റ്റർ ചെയ്തു", ar: "تم التسجيل" },
    "View Pass": { ml: "പാസ് കാണുക", ar: "عرض البطاقة" },
    "Chief Guest": { ml: "മുഖ്യാതിഥി", ar: "ضيف الشرف" },
    "Verified Blood Donors": { ml: "രക്തദാന സന്നദ്ധ പ്രവർത്തകർ", ar: "المتبرعون المعتمدون بالدم" },
    "Call Donor": { ml: "ദാതാവിനെ വിളിക്കുക", ar: "الاتصال بالمتبرع" },
    "Available: Yes": { ml: "ലഭ്യമാണ്: അതെ", ar: "متوفر: نعم" },
    "Close": { ml: "അടക്കുക", ar: "إغلاق" },
    "Cancel": { ml: "റദ്ദാക്കുക", ar: "إلغاء" },
    "Submit": { ml: "സമർപ്പിക്കുക", ar: "إرسال" },
    "Save": { ml: "സൂക്ഷിക്കുക", ar: "حفظ" }
  },

  // 3. Helper to get keypath translation
  get: function(path, lang) {
    if (!lang) lang = localStorage.getItem('nhm_lang') || 'en';
    const keys = path.split('.');
    let current = this[lang] || this.en;
    for (const k of keys) {
      if (!current || current[k] === undefined) {
        current = this.en[k];
      } else {
        current = current[k];
      }
    }
    return current || '';
  },

  // 4. Smart Phrase Matching
  getPhrase: function(text, lang) {
    if (!text || lang === 'en') return null;
    const clean = text.trim();
    if (!clean) return null;

    // Direct match
    if (this.phrases[clean] && this.phrases[clean][lang]) {
      return this.phrases[clean][lang];
    }

    // Case-insensitive lookup
    const lower = clean.toLowerCase();
    for (const phrase in this.phrases) {
      if (phrase.toLowerCase() === lower && this.phrases[phrase][lang]) {
        return this.phrases[phrase][lang];
      }
    }

    // Match with emoji prefix (e.g. "📢 All Feed", "🕌 Mosque", "⚠️ Emergency", "🚩 Janazah")
    const emojiMatch = clean.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\uD83C-\uD83E][\uDC00-\uDFFF]|\uFE0F|\s)+/);
    if (emojiMatch) {
      const prefix = emojiMatch[0];
      const rest = clean.slice(prefix.length).trim();
      const transRest = this.getPhrase(rest, lang);
      if (transRest) {
        return prefix.trim() + ' ' + transRest;
      }
    }

    // Match with trailing arrow or symbol (e.g. "Details →", "View Details & Location →", "Details &rarr;")
    if (clean.endsWith('→') || clean.endsWith('->') || clean.endsWith('&rarr;')) {
      const base = clean.replace(/(\s*(→|->|&rarr;)\s*)$/, '').trim();
      const trans = this.getPhrase(base, lang);
      if (trans) {
        return lang === 'ar' ? trans + ' ←' : trans + ' →';
      }
    }

    // Match with trailing ellipsis (e.g. "Search notices...")
    if (clean.endsWith('...')) {
      const base = clean.slice(0, -3).trim();
      const trans = this.getPhrase(base, lang);
      if (trans) {
        return trans + '...';
      }
    }

    // Match with trailing colon (e.g. "Next Prayer:")
    if (clean.endsWith(':')) {
      const base = clean.slice(0, -1).trim();
      const trans = this.getPhrase(base, lang);
      if (trans) {
        return trans + ':';
      }
    }

    return null;
  },

  // 5. DOM TreeWalker Translation
  walkAndTranslate: function(rootNode, lang) {
    if (!rootNode) return;

    const walker = document.createTreeWalker(
      rootNode,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toUpperCase();
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'CODE' || tag === 'PRE' || tag === 'NOSCRIPT') {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.closest && parent.closest('.no-translate, select#lang-select, select.lang-select, #admin-login-screen')) {
            return NodeFilter.FILTER_REJECT;
          }
          if (!node.nodeValue || !node.nodeValue.trim()) {
            return NodeFilter.FILTER_SKIP;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    nodes.forEach(node => {
      const raw = node.nodeValue;
      const trimmed = raw.trim();
      if (!trimmed) return;

      // Keep original English text saved permanently on the text node
      if (node._nhmOriginal === undefined) {
        node._nhmOriginal = trimmed;
      }

      const orig = node._nhmOriginal;

      if (lang === 'en') {
        if (node.nodeValue !== raw.replace(trimmed, orig)) {
          node.nodeValue = raw.replace(trimmed, orig);
        }
        return;
      }

      const translated = I18N.getPhrase(orig, lang);
      if (translated) {
        node.nodeValue = raw.replace(trimmed, translated);
      }
    });

    // Translate input placeholders
    rootNode.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(input => {
      if (input.closest && input.closest('.no-translate, #admin-login-screen')) return;
      if (input._nhmOrigPlaceholder === undefined) {
        input._nhmOrigPlaceholder = input.placeholder.trim();
      }
      const orig = input._nhmOrigPlaceholder;
      if (lang === 'en') {
        input.placeholder = orig;
      } else {
        const trans = I18N.getPhrase(orig, lang);
        if (trans) input.placeholder = trans;
      }
    });

    // Translate title attributes
    rootNode.querySelectorAll('[title]').forEach(el => {
      if (el.closest && el.closest('.no-translate, select#lang-select, select.lang-select')) return;
      if (el._nhmOrigTitle === undefined) {
        el._nhmOrigTitle = (el.getAttribute('title') || '').trim();
      }
      const orig = el._nhmOrigTitle;
      if (!orig) return;
      if (lang === 'en') {
        el.setAttribute('title', orig);
      } else {
        const trans = I18N.getPhrase(orig, lang);
        if (trans) el.setAttribute('title', trans);
      }
    });
  },

  // 6. Master Full-Page Translation Routine
  translatePage: function(lang) {
    if (!lang) lang = localStorage.getItem('nhm_lang') || 'en';
    localStorage.setItem('nhm_lang', lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    if (document.body) {
      document.body.classList.remove('lang-en', 'lang-ml', 'lang-ar');
      document.body.classList.add('lang-' + lang);
    }

    // 1. Sync all language dropdown selects
    document.querySelectorAll('select#lang-select, select.lang-select').forEach(sel => {
      sel.value = lang;
    });

    // 2. Sync all current-lang-text labels
    const langLabels = { en: 'English', ml: 'മലയാളം', ar: 'العربية' };
    document.querySelectorAll('#current-lang-text, .current-lang-text').forEach(el => {
      el.textContent = langLabels[lang] || 'English';
    });

    // 3. Translate [data-i18n] elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const path = el.getAttribute('data-i18n');
      const text = I18N.get(path, lang);
      if (text) el.textContent = text;
    });

    // 4. Translate text nodes using phrase dictionary
    if (document.body) {
      I18N.walkAndTranslate(document.body, lang);
    }

    // 5. Fire custom event for any listening reactive components
    window.dispatchEvent(new CustomEvent('mahall_lang_changed', { detail: { lang: lang } }));

    // 6. Refresh Lucide icons if any
    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }
  }
};

// Global translation hooks accessible everywhere
window.I18N = I18N;
window.changeLanguage = function(lang) {
  if (window.app && typeof window.app.changeLanguage === 'function') {
    window.app.changeLanguage(lang);
  } else {
    I18N.translatePage(lang);
  }
};
window.applyLanguage = window.changeLanguage;

// Immediate pre-render language setup on script load
(function() {
  const savedLang = localStorage.getItem('nhm_lang');
  if (savedLang && savedLang !== 'en') {
    document.documentElement.lang = savedLang;
    document.documentElement.dir = (savedLang === 'ar') ? 'rtl' : 'ltr';
  }
})();

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('nhm_lang') || 'en';
  I18N.translatePage(savedLang);
});
