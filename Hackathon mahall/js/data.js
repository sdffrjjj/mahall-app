/**
 * NOORUL HUDA MAHALL DATA STORE
 * Realistic Kerala Mahall Community Management Dataset
 */

const MAHALL_DATA = {
  profile: {
    name: "Noorul Huda Mahall Jama'ath",
    nameMl: "നൂറുൽ ഹുദാ മഹല്ല് ജമാഅത്ത്",
    nameAr: "جماعة نور الهدى للمحلّة",
    tagline: "Connecting our community through faith, service, and unity",
    taglineMl: "വിശ്വാസം, സേവനം, ഐക്യം - നമ്മുടെ സമൂഹത്തിന്റെ കരുത്ത്",
    taglineAr: "ربط مجتمعنا من خلال الإيمان والخدمة والوحدة",
    regNo: "KL-KZK/1968/42",
    foundedYear: 1968,
    address: "Central Mosque Road, Ward 02, Calicut, Kerala - 673004",
    phone: "+91 495 2724800",
    emergencyContact: "+91 94470 12345",
    ambulanceContact: "+91 98460 99999",
    email: "office@noorulhudamahall.org",
    imam: {
      name: "Usthad Maulana Abdul Rasheed Faizy",
      role: "Chief Imam & Qatib",
      experience: "16 Years of Spiritual Leadership",
      phone: "+91 98471 22334"
    },
    muazzin: {
      name: "Hafiz Muhammad Bilal",
      role: "Chief Mu'azzin & Madrasa Teacher"
    },
    stats: {
      families: 1250,
      members: 5430,
      wards: 3,
      mosqueActivities: 24,
      monthlyContributions: 342000,
      pendingRequests: 18,
      upcomingEvents: 7,
      madrasaStudents: 480,
      bloodDonors: 145
    }
  },

  prayerSchedule: {
    coordinates: { lat: 11.2588, lng: 75.7804 }, // Calicut, Kerala
    jumua: {
      firstAzan: "12:15 PM",
      khutbah: "12:45 PM",
      prayer: "01:15 PM",
      khatib: "Usthad Maulana Abdul Rasheed Faizy",
      topic: "Compassion in Community Living & Mutual Respect"
    },
    prayers: [
      { id: "fajr", name: "Fajr", nameMl: "സുബ്ഹ്", nameAr: "الفجر", adhan: "05:12 AM", iqamah: "05:30 AM" },
      { id: "sunrise", name: "Sunrise", nameMl: "സൂര്യോദയം", nameAr: "الشروق", adhan: "06:21 AM", iqamah: "--" },
      { id: "dhuhr", name: "Dhuhr", nameMl: "ളുഹ്ർ", nameAr: "الظهر", adhan: "12:28 PM", iqamah: "12:45 PM" },
      { id: "asr", name: "Asr", nameMl: "അസ്വർ", nameAr: "العصر", adhan: "03:45 PM", iqamah: "04:00 PM" },
      { id: "maghrib", name: "Maghrib", nameMl: "മഗ്രിബ്", nameAr: "المغرب", adhan: "06:34 PM", iqamah: "06:45 PM" },
      { id: "isha", name: "Isha", nameMl: "ഇശാഅ്", nameAr: "العشاء", adhan: "07:48 PM", iqamah: "08:05 PM" }
    ],
    ramadan: {
      imsak: "05:02 AM",
      iftar: "06:35 PM",
      taraweeh: "08:20 PM",
      dailyIftarPorters: "Ward 02 Volunteer Team"
    }
  },

  announcements: [
    {
      id: "ann-1",
      title: "Janazah Announcement: Marhum V. P. Alavi Haji (78)",
      titleMl: "മയ്യത്ത് അറിയിപ്പ്: വി. പി. ആലവി ഹാജി (78) വഫാത്തായി",
      titleAr: "إعلان جنازة: المرحوم الحاج علوي (78 عاماً)",
      category: "JANAZAH",
      priority: "CRITICAL",
      date: "Today",
      time: "Janazah Prayer at 04:30 PM",
      details: "Janazah prayer will be held at Noorul Huda Central Juma Masjid courtyard today after Asr prayer. Burial at Mahall Qabarstan.",
      location: "Central Juma Masjid",
      contact: "+91 98470 54321",
      downloadable: false,
      actionType: "janazah",
      deceased: "Marhum V. P. Alavi Haji (78 Yrs, Baitul Noor, Ward 01)",
      prayerTime: "Today at 04:30 PM (After Asr)",
      burialSite: "Noorul Huda Mahall Qabarstan"
    },
    {
      id: "ann-2",
      title: "Quarterly Mahall General Body Meeting",
      titleMl: "മഹല്ല് ജനറൽ ബോഡി യോഗം ഈ വരുന്ന ഞായറാഴ്ച",
      titleAr: "اجتماع الجمعية العمومية الفصلي للمحلّة",
      category: "GENERAL",
      priority: "HIGH",
      date: "Coming Sunday",
      time: "10:30 AM",
      details: "All registered family heads are requested to attend the quarterly financial review and upcoming centenary project updates at the Community Hall.",
      location: "Community Hall",
      downloadable: false,
      actionType: "meeting",
      agenda: [
        "1. Quarterly Financial Audit & Statement Review (Q1 2026)",
        "2. Centenary Memorial Madrasa Renovation & Expansion Progress",
        "3. Destitute Healthcare Subsidy & Orphan Welfare Distribution",
        "4. Open Forum & Ward Family Heads Suggestions"
      ]
    },
    {
      id: "ann-3",
      title: "Madrasa Half-Yearly Examination Schedule Released",
      titleMl: "മദ്റസ അർദ്ധവാർഷിക പരീക്ഷാ ടൈംടേബിൾ പ്രസിദ്ധീകരിച്ചു",
      titleAr: "إعلان جدول امتحانات المدرسة النصف سنوية",
      category: "EDUCATION",
      priority: "NORMAL",
      date: "From Sep 20",
      time: "07:00 AM - 09:00 AM",
      details: "Syllabus and hall tickets for Classes 1 to 10 are distributed through respective class teachers.",
      location: "Noorul Huda Madrasa",
      downloadable: true,
      actionType: "download_pdf",
      pdfName: "Noorul_Huda_Madrasa_Exam_Schedule_2026.pdf",
      downloadLabel: "Download Timetable (PDF)"
    },
    {
      id: "ann-4",
      title: "Urgent O+ Blood Requirement for Dialysis Patient",
      titleMl: "അടിയന്തിര രക്ത ആവശ്യം: O+ പോസിറ്റീവ് രക്തം ആവശ്യമുണ്ട്",
      titleAr: "نداء عاجل للتبرع بالدم من فصيلة O+",
      category: "EMERGENCY",
      priority: "HIGH",
      date: "Today",
      time: "Immediate",
      details: "Patient admitted at Calicut Medical College. Interested donors please contact Mahall Relief Desk immediately.",
      location: "Calicut Medical College Hospital",
      contact: "+91 94470 12345",
      downloadable: false,
      actionType: "emergency",
      bloodGroup: "O+",
      patientLocation: "Calicut Medical College Hospital, Ward 4 Dialysis Unit"
    }
  ],

  events: [
    {
      id: "evt-1",
      title: "Friday Spiritual Majlis & Quran Study Circle",
      titleMl: "വെള്ളിയാഴ്ച ആത്മീയ മജ്‌ലിസും ഖുർആൻ പഠന ക്ലാസും",
      titleAr: "حلقة الذكر الأسبوعية وتدارس القرآن الكريم",
      category: "QURAN_PROGRAM",
      date: "Every Friday",
      time: "07:00 PM - 08:30 PM",
      venue: "Main Prayer Hall, 1st Floor",
      speaker: "Usthad Maulana Abdul Rasheed Faizy",
      description: "Tafseer of Surah Al-Kahf followed by spiritual reflection, open Q&A, and collective Dua.",
      seatsLeft: 45
    },
    {
      id: "evt-2",
      title: "Youth Career & Civil Service Guidance Seminar",
      titleMl: "യുവജന കരിയർ & സിവിൽ സർവീസ് മാർഗ്ഗനിർദ്ദേശ സെമിനാർ",
      titleAr: "ندوة التوجيه المهني وإعداد الكوادر للشباب",
      category: "YOUTH",
      date: "Next Saturday, Sep 20",
      time: "09:30 AM - 01:00 PM",
      venue: "Noorul Huda Community Auditorium",
      speaker: "Dr. K. M. Shabeer (IAS Trainer & Educator)",
      description: "Interactive roadmap for students from 10th standard onwards regarding scholarship, competitive exams, and modern career paths.",
      seatsLeft: 22
    },
    {
      id: "evt-3",
      title: "Women's Family Health & Parenting Workshop",
      titleMl: "വനിതാ കുടുംബാരോഗ്യ & പേരന്റിംഗ് ശില്പശാല",
      titleAr: "ورشة عمل المرأة: صحة الأسرة والتربية الإيجابية",
      category: "WOMEN",
      date: "Sunday, Sep 28",
      time: "02:00 PM - 04:30 PM",
      venue: "Women's Wing Hall (Private Entrance)",
      speaker: "Dr. Fathima Zahra (MBBS, DGO)",
      description: "Holistic session on healthy living, adolescent psychology, and islamic family values.",
      seatsLeft: 30
    },
    {
      id: "evt-4",
      title: "Children's Quran & Adhan Recitation Fest",
      titleMl: "കുട്ടികളുടെ ഖുർആൻ പാരായണ-ബാങ്ക് വിളി മത്സരം",
      titleAr: "مسابقة تلاوة القرآن الكريم والأذان للأشبال",
      category: "CHILDREN",
      date: "First Sunday of next month",
      time: "08:30 AM - 12:30 PM",
      venue: "Madrasa Central Stage",
      speaker: "Madrasa Board Judges Panel",
      description: "Prizes in 3 age groups: Sub-juniors (Classes 1-4), Juniors (Classes 5-7), Seniors (Classes 8-10).",
      seatsLeft: 60
    }
  ],

  families: [
    {
      familyId: "W01-F001",
      userId: "W01-F001",
      password: "1968",
      pin: "1968",
      head: "K. P. Musthafa Haji",
      ward: "Ward 01 (East Bazar)",
      houseNo: "14/230",
      houseName: "Baitul Noor",
      phone: "+91 98471 10001",
      occupation: "Merchant / Retired",
      bloodGroup: "A+",
      membersCount: 6,
      monthlyStatus: "PAID",
      lastContribution: "₹250 on 05-Sep-2026",
      members: [
        { name: "K. P. Musthafa Haji", relation: "Head", age: 67, blood: "A+", occ: "Merchant" },
        { name: "Amina K. P.", relation: "Spouse", age: 61, blood: "A+", occ: "Homemaker" },
        { name: "Suhail K. P.", relation: "Son", age: 34, blood: "O+", occ: "IT Engineer" },
        { name: "Rizwana K. P.", relation: "Daughter-in-law", age: 29, blood: "B+", occ: "Teacher" },
        { name: "Ayan Suhail", relation: "Grandson", age: 6, blood: "O+", occ: "Student (Class 1)" },
        { name: "Zoya Suhail", relation: "Granddaughter", age: 3, blood: "B+", occ: "Infant" }
      ]
    },
    {
      familyId: "W02-F005", // DEMO RESIDENT LOGGED-IN ACCOUNT
      userId: "W02-F005",
      password: "1968",
      pin: "1968",
      head: "Ahmed Koya P. K.",
      ward: "Ward 02 (Masjid Central)",
      houseNo: "22/115",
      houseName: "Al-Falah Villa",
      phone: "+91 94472 88990",
      occupation: "Accountant & Social Worker",
      bloodGroup: "O+",
      membersCount: 5,
      monthlyStatus: "PENDING",
      pendingAmount: 250,
      lastContribution: "₹250 on 12-Aug-2026",
      members: [
        { name: "Ahmed Koya P. K.", relation: "Head of Family", age: 52, blood: "O+", occ: "Senior Accountant" },
        { name: "Zainaba Ahmed", relation: "Spouse", age: 46, blood: "B+", occ: "Teacher" },
        { name: "Faheem Ahmed", relation: "Son", age: 24, blood: "O+", occ: "Software Developer" },
        { name: "Nidha Fathima", relation: "Daughter", age: 20, blood: "O+", occ: "College Student (BSc)" },
        { name: "Mariyam P. K.", relation: "Mother", age: 76, blood: "A+", occ: "Senior Citizen" }
      ]
    },
    {
      familyId: "W02-F012",
      userId: "W02-F012",
      password: "1968",
      pin: "1968",
      head: "Dr. T. K. Ibrahim",
      ward: "Ward 02 (Masjid Central)",
      houseNo: "22/304",
      houseName: "Darul Aman",
      phone: "+91 98470 33445",
      occupation: "Physician (MD General Medicine)",
      bloodGroup: "B+",
      membersCount: 4,
      monthlyStatus: "PAID",
      lastContribution: "₹500 on 01-Sep-2026",
      members: [
        { name: "Dr. T. K. Ibrahim", relation: "Head", age: 58, blood: "B+", occ: "Doctor" },
        { name: "Fathima Suhra", relation: "Spouse", age: 52, blood: "AB+", occ: "Homemaker" },
        { name: "Dr. Rayan Ibrahim", relation: "Son", age: 27, blood: "B+", occ: "Dentist" },
        { name: "Hiba Ibrahim", relation: "Daughter", age: 22, blood: "B+", occ: "Architecture Student" }
      ]
    },
    {
      familyId: "W03-F008",
      userId: "W03-F008",
      password: "1968",
      pin: "1968",
      head: "C. H. Abdul Jabbar",
      ward: "Ward 03 (River Valley)",
      houseNo: "08/412",
      houseName: "Gulshan House",
      phone: "+91 94471 77665",
      occupation: "Building Contractor",
      bloodGroup: "AB+",
      membersCount: 4,
      monthlyStatus: "PAID",
      lastContribution: "₹250 on 02-Sep-2026",
      members: [
        { name: "C. H. Abdul Jabbar", relation: "Head", age: 49, blood: "AB+", occ: "Contractor" },
        { name: "Safia Jabbar", relation: "Spouse", age: 44, blood: "O+", occ: "Tailoring" },
        { name: "Shameem Jabbar", relation: "Son", age: 21, blood: "AB+", occ: "Automobile Trainee" },
        { name: "Shahana Jabbar", relation: "Daughter", age: 17, blood: "A+", occ: "Plus Two Student" }
      ]
    },
    {
      familyId: "W01-F044",
      userId: "W01-F044",
      password: "1968",
      pin: "1968",
      head: "M. M. Basheer",
      ward: "Ward 01 (East Bazar)",
      houseNo: "14/089",
      houseName: "Rehmath Cottage",
      phone: "+91 98475 22110",
      occupation: "Auto Driver",
      bloodGroup: "O-",
      membersCount: 5,
      monthlyStatus: "PENDING",
      pendingAmount: 250,
      lastContribution: "₹250 on 10-Jul-2026",
      members: [
        { name: "M. M. Basheer", relation: "Head", age: 43, blood: "O-", occ: "Driver" },
        { name: "Jameela Basheer", relation: "Spouse", age: 39, blood: "O+", occ: "Homemaker" },
        { name: "Bilal Basheer", relation: "Son", age: 16, blood: "O-", occ: "Class 10 Student" },
        { name: "Anas Basheer", relation: "Son", age: 12, blood: "O+", occ: "Class 7 Student" },
        { name: "Hafsa Basheer", relation: "Daughter", age: 8, blood: "O+", occ: "Class 3 Student" }
      ]
    }
  ],

  certificatesList: [
    {
      id: "CERT-2026-881",
      familyId: "W02-F005",
      applicant: "Ahmed Koya P. K.",
      type: "Marriage NOC / Nikah Verification",
      reason: "Marriage registration of son Faheem Ahmed",
      dateApplied: "12-Sep-2026",
      status: "APPROVED",
      issueDate: "14-Sep-2026",
      referenceNo: "NHM/CERT/2026/0881",
      issuedBy: "P. K. Abdurahman (Mahall General Secretary)"
    },
    {
      id: "CERT-2026-904",
      familyId: "W02-F005",
      applicant: "Ahmed Koya P. K.",
      type: "Mahall Residence Certificate",
      reason: "Passport renewal address proof",
      dateApplied: "14-Sep-2026",
      status: "PENDING",
      referenceNo: "NHM/CERT/2026/0904"
    },
    {
      id: "CERT-2026-750",
      familyId: "W01-F001",
      applicant: "K. P. Musthafa Haji",
      type: "Membership & Good Standing Certificate",
      reason: "Hajj & Umrah travel authority documentation",
      dateApplied: "01-Aug-2026",
      status: "APPROVED",
      issueDate: "03-Aug-2026",
      referenceNo: "NHM/CERT/2026/0750",
      issuedBy: "P. K. Abdurahman (Mahall General Secretary)"
    }
  ],

  sulhuRegistrations: [
    {
      id: "SLH-2026-03",
      filingType: "Family Mediation & Counseling",
      familyWard: "Ward 02",
      parties: "Confidential - Case #03/2026",
      submittedDate: "10-Sep-2026",
      assignedMediators: "Usthad Maulana Abdul Rasheed Faizy & Adv. K. M. Shareef",
      status: "IN_HEARING",
      nextSessionDate: "22-Sep-2026, 04:30 PM",
      privacyClause: "Strictly confidential under Mahall Sulhu Board Charter."
    }
  ],

  bloodDonors: [
    { name: "Faheem Ahmed", group: "O+", ward: "Ward 02", phone: "+91 94472 88991", age: 24, available: true, lastDonation: "4 months ago" },
    { name: "Suhail K. P.", group: "O+", ward: "Ward 01", phone: "+91 98471 10002", age: 34, available: true, lastDonation: "6 months ago" },
    { name: "M. M. Basheer", group: "O-", ward: "Ward 01", phone: "+91 98475 22110", age: 43, available: true, lastDonation: "2 months ago" },
    { name: "Dr. Rayan Ibrahim", group: "B+", ward: "Ward 02", phone: "+91 98470 33446", age: 27, available: true, lastDonation: "3 months ago" },
    { name: "Shameem Jabbar", group: "AB+", ward: "Ward 03", phone: "+91 94471 77666", age: 21, available: true, lastDonation: "1 month ago" },
    { name: "Rashid Ali", group: "A+", ward: "Ward 03", phone: "+91 98477 44321", age: 29, available: false, lastDonation: "2 weeks ago" },
    { name: "Junaid P.", group: "B-", ward: "Ward 02", phone: "+91 94461 55667", age: 31, available: true, lastDonation: "5 months ago" },
    { name: "Salman Faris", group: "AB-", ward: "Ward 01", phone: "+91 98952 33441", age: 26, available: true, lastDonation: "8 months ago" }
  ],

  education: {
    name: "Noorul Huda Islamic Dars & Madrasa",
    affiliation: "Kerala Islamic Education Board (Reg #642)",
    classes: [
      { class: "Class 1", timing: "07:00 AM - 08:30 AM", teacher: "Usthad Hafiz Bilal", subjects: "Qur'an Recitation, Thareekh, Fiqh Basics", students: 42 },
      { class: "Class 5", timing: "07:00 AM - 08:45 AM", teacher: "Usthad Sayyid Munawwar", subjects: "Thajweed, Akhlaq, Fiqh, Nahw (Arabic Grammar)", students: 38 },
      { class: "Class 10", timing: "06:45 AM - 08:45 AM", teacher: "Usthad Maulana Abdul Rasheed Faizy", subjects: "Tafseer, Hadeeth Studies, Islamic Ethics, Dawa", students: 34 }
    ],
    studentDemo: {
      studentName: "Ayan Suhail",
      admissionNo: "NHM-2024-118",
      class: "Class 1 - Section A",
      attendance: "94%",
      halfYearlyScore: "92/100 (A+ Grade)",
      teacherRemark: "Outstanding recitation and diligent adherence to Islamic manners."
    }
  },

  historyMilestones: [
    { year: 1968, title: "Foundation & First Prayer Shed", desc: "Established under the leadership of Janab K. V. Moideen Haji with 45 pioneering community families." },
    { year: 1984, title: "Madrasa & Dars Inauguration", desc: "Formally registered educational wing offering traditional Islamic curriculum to 120 students." },
    { year: 1999, title: "Grand Masjid Reconstruction", desc: "Current architectural structure with twin 120-ft minarets, central dome, and modern ablution facilities built." },
    { year: 2012, title: "Community Welfare & Dialysis Unit", desc: "Inaugurated free medical dispensary and financial aid endowment for underprivileged families." },
    { year: 2024, title: "Digital Mahall & Smart Portal", desc: "Transitioned community records to high-security digital registry, digital ID, and instant services." }
  ],

  campusMapPoints: [
    { id: "masjid", title: "Central Juma Masjid", desc: "Main prayer hall (capacity 2,500), women prayer wing, and ablution pond.", x: 48, y: 40, icon: "mosque" },
    { id: "madrasa", title: "Noorul Huda Madrasa", desc: "12 air-ventilated classrooms, library, and Usthad staff quarters.", x: 25, y: 35, icon: "book-open" },
    { id: "cemetery", title: "Mahall Qabarstan", desc: "Historic shaded burial grounds with paved walkways and lighting.", x: 75, y: 30, icon: "cross" },
    { id: "hall", title: "Community Auditorium", desc: "Air-conditioned 600-seater hall for marriages, general body, and seminars.", x: 30, y: 70, icon: "home" },
    { id: "office", title: "Mahall Secretarial Office", desc: "Executive admin desk, digital document counter, and Sulhu mediation chamber.", x: 62, y: 65, icon: "file-text" },
    { id: "clinic", title: "Community Health & Dialysis Aid", desc: "Charitable pharmacy, medical consultation, and ambulance dock.", x: 80, y: 72, icon: "activity" }
  ]
};
