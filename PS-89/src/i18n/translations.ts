export type Language = "en" | "hi" | "kn";

export interface TranslationDict {
  brandName: string;
  tagline: string;
  heroHeadline: string;
  heroSupporting: string;
  findServiceBtn: string;
  joinWorkerBtn: string;
  howItWorks: string;
  services: string;
  forWorkers: string;
  forCooperatives: string;
  trust: string;
  login: string;
  getStarted: string;
  logout: string;
  demoAccount: string;
  emergencyTitle: string;
  emergencySub: string;
  emergencyBtn: string;
  demandForecastHeadline: string;
  demandForecastSub: string;
  coopNetworkTitle: string;
  coopNetworkSub: string;
  searchPlaceholder: string;
  verifiedBadge: string;
  bookNow: string;
  viewDetails: string;
  myBookings: string;
  earnings: string;
  welfareCenter: string;
  availability: string;
  available: string;
  unavailable: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  customerDashboard: string;
  workerDashboard: string;
  adminDashboard: string;
  zone: string;
  rating: string;
  jobsCompleted: string;
  distance: string;
  whyThisWorker: string;
  balanceWorkforce: string;
  applyAllocation: string;
  reviewAllocation: string;
  totalAmount: string;
  cooperativeFee: string;
  netEarnings: string;
  downloadInvoice: string;
}

export const translations: Record<Language, TranslationDict> = {
  en: {
    brandName: "SHRAMCONNECT",
    tagline: "Cooperative Workforce Network",
    heroHeadline: "Skilled people. Right work. Stronger communities.",
    heroSupporting: "ShramConnect connects trusted cooperative workers with the people who need them — while helping cooperatives plan and manage their workforce smarter.",
    findServiceBtn: "Find a Service",
    joinWorkerBtn: "Join as a Worker",
    howItWorks: "How It Works",
    services: "Services",
    forWorkers: "For Workers",
    forCooperatives: "For Cooperatives",
    trust: "Trust & Safety",
    login: "Login",
    getStarted: "Get Started",
    logout: "Logout",
    demoAccount: "Demo Account",
    emergencyTitle: "Need Emergency Assistance?",
    emergencySub: "Verified electricians and plumbers dispatched immediately in under 30 minutes.",
    emergencyBtn: "Request Emergency Service",
    demandForecastHeadline: "Don't wait for demand. Prepare for it.",
    demandForecastSub: "Predictive capacity intelligence enables cooperatives to dynamically balance skilled workers across zones before shortages occur.",
    coopNetworkTitle: "From Gig Marketplace to Cooperative Workforce Network",
    coopNetworkSub: "Workers are not isolated gig laborers. They are certified, protected members of a coordinated cooperative union.",
    searchPlaceholder: "What service do you need today?",
    verifiedBadge: "Cooperative Verified",
    bookNow: "Book Verified Worker",
    viewDetails: "View Details",
    myBookings: "My Bookings",
    earnings: "Worker Earnings",
    welfareCenter: "Welfare & Social Security",
    availability: "Availability",
    available: "Available",
    unavailable: "Unavailable",
    step1: "Choose a service",
    step2: "Find a verified worker",
    step3: "Book and get the work done",
    step4: "Pay, rate and build trust",
    customerDashboard: "Customer Portal",
    workerDashboard: "Worker Workspace",
    adminDashboard: "Cooperative Control Center",
    zone: "Zone",
    rating: "Rating",
    jobsCompleted: "Jobs Done",
    distance: "Distance",
    whyThisWorker: "Why this worker?",
    balanceWorkforce: "Balance Workforce",
    applyAllocation: "Apply AI Allocation",
    reviewAllocation: "Review Allocation",
    totalAmount: "Total Amount",
    cooperativeFee: "Cooperative Contribution (5%)",
    netEarnings: "Net Worker Earnings",
    downloadInvoice: "Download Digital Invoice"
  },
  hi: {
    brandName: "श्रमकनेक्ट",
    tagline: "सहकारी कार्यबल नेटवर्क",
    heroHeadline: "कुशल श्रमिक। सही कार्य। सशक्त समाज।",
    heroSupporting: "श्रमकनेक्ट विश्वसनीय सहकारी श्रमिकों को जरूरतमंद परिवारों से जोड़ता है — और सहकारिताओं को कार्यबल प्रबंधन व अग्रिम योजना में मदद करता है।",
    findServiceBtn: "सेवा खोजें",
    joinWorkerBtn: "श्रमिक के रूप में जुड़ें",
    howItWorks: "कार्यप्रणाली",
    services: "सेवाएं",
    forWorkers: "श्रमिकों के लिए",
    forCooperatives: "सहकारिताओं के लिए",
    trust: "विश्वास व सुरक्षा",
    login: "लॉगिन",
    getStarted: "शुरू करें",
    logout: "लॉगआउट",
    demoAccount: "डेमो खाता",
    emergencyTitle: "आपातकालीन सेवा चाहिए?",
    emergencySub: "सत्यापित इलेक्ट्रीशियन और प्लंबर 30 मिनट के भीतर उपलब्ध।",
    emergencyBtn: "आपातकालीन सेवा बुक करें",
    demandForecastHeadline: "मांग की प्रतीक्षा न करें। पूर्व तैयारी करें।",
    demandForecastSub: "मांग पूर्वानुमान सहकारिताओं को कुशल श्रमिकों की अग्रिम तैनाती करने में सक्षम बनाता है।",
    coopNetworkTitle: "गिग मार्केटप्लेस से सहकारी कार्यबल नेटवर्क की ओर",
    coopNetworkSub: "श्रमिक अकेले नहीं हैं। वे एक संगठित, सामाजिक सुरक्षा प्राप्त सहकारी परिवार के सदस्य हैं।",
    searchPlaceholder: "आज आपको किस सेवा की आवश्यकता है?",
    verifiedBadge: "सहकारी सत्यापित",
    bookNow: "सत्यापित श्रमिक बुक करें",
    viewDetails: "विवरण देखें",
    myBookings: "मेरी बुकिंग्स",
    earnings: "श्रमिक आय",
    welfareCenter: "कल्याण एवं सामाजिक सुरक्षा",
    availability: "उपलब्धता",
    available: "उपलब्ध",
    unavailable: "व्यस्त / अनुपलब्ध",
    step1: "सेवा का चयन करें",
    step2: "सत्यापित श्रमिक चुनें",
    step3: "बुकिंग करें और कार्य पूर्ण कराएं",
    step4: "भुगतान करें, रेटिंग दें और विश्वास बढ़ाएं",
    customerDashboard: "ग्राहक पोर्टल",
    workerDashboard: "श्रमिक वर्कस्पेस",
    adminDashboard: "सहकारी नियंत्रण केंद्र",
    zone: "क्षेत्र (ज़ोन)",
    rating: "रेटिंग",
    jobsCompleted: "पूर्ण कार्य",
    distance: "दूरी",
    whyThisWorker: "यह श्रमिक क्यों?",
    balanceWorkforce: "कार्यबल संतुलित करें",
    applyAllocation: "एलोकेशन लागू करें",
    reviewAllocation: "समीक्षा करें",
    totalAmount: "कुल राशि",
    cooperativeFee: "सहकारी योगदान (5%)",
    netEarnings: "शुद्ध श्रमिक आय",
    downloadInvoice: "डिजिटल इनवॉइस डाउनलोड करें"
  },
  kn: {
    brandName: "ಶ್ರಮಕನೆಕ್ಟ್",
    tagline: "ಸಹಕಾರಿ ಕಾರ್ಮಿಕ ಜಾಲ",
    heroHeadline: "ಕುಶಲ ಕರ್ಮಿಗಳು. ಸರಿಯಾದ ಕೆಲಸ. ಬಲಿಷ್ಠ ಸಮುದಾಯ.",
    heroSupporting: "ಶ್ರಮಕನೆಕ್ಟ್ ವಿಶ್ವಾಸಾರ್ಹ ಸಹಕಾರಿ ಕಾರ್ಮಿಕರನ್ನು ಮನೆ-ಮನಗಳಿಗೆ ಜೋಡಿಸುತ್ತದೆ ಮತ್ತು ಸಹಕಾರ ಸಂಸ್ಥೆಗಳಿಗೆ ಮುಂಚಿತ ಬೇಡಿಕೆ ಅಂದಾಜಿಸಲು ನೆರವಾಗುತ್ತದೆ.",
    findServiceBtn: "ಸೇವೆ ಹುಡುಕಿ",
    joinWorkerBtn: "ಕಾರ್ಮಿಕರಾಗಿ ಸೇರಿ",
    howItWorks: "ಕಾರ್ಯವಿಧಾನ",
    services: "ಸೇವೆಗಳು",
    forWorkers: "ಕಾರ್ಮಿಕರಿಗಾಗಿ",
    forCooperatives: "ಸಹಕಾರಿಗಳಿಗಾಗಿ",
    trust: "ವಿಶ್ವಾಸ ಮತ್ತು ಭದ್ರತೆ",
    login: "ಪ್ರವೇಶಿಸಿ",
    getStarted: "ಪ್ರಾರಂಭಿಸಿ",
    logout: "ನಿರ್ಗಮಿಸಿ",
    demoAccount: "ಡೆಮೊ ಖಾತೆ",
    emergencyTitle: "ತುರ್ತು ನೆರವು ಬೇಕೆ?",
    emergencySub: "ಪರಿಶೀಲಿತ ಎಲೆಕ್ಟ್ರಿಷಿಯನ್ ಮತ್ತು ಪ್ಲಂಬರ್‌ಗಳು 30 ನಿಮಿಷಗಳಲ್ಲಿ ಲಭ್ಯ.",
    emergencyBtn: "ತುರ್ತು ಸೇವೆ ವಿನಂತಿಸಿ",
    demandForecastHeadline: "ಬೇಡಿಕೆಗೆ ಕಾಯಬೇಡಿ. ಮುಂಚಿತವಾಗಿ ಸಿದ್ಧರಾಗಿ.",
    demandForecastSub: "ಮುನ್ಸೂಚನೆಯು ಸಹಕಾರ ಸಂಸ್ಥೆಗಳಿಗೆ ಕಾರ್ಮಿಕರ ಸಾಮರ್ಥ್ಯವನ್ನು ಸಮತೋಲನಗೊಳಿಸಲು ಶಕ್ತಿ ನೀಡುತ್ತದೆ.",
    coopNetworkTitle: "ಗಿಗ್ ಮಾರುಕಟ್ಟೆಯಿಂದ ಸಹಕಾರಿ ಕಾರ್ಮಿಕ ಜಾಲಕ್ಕೆ",
    coopNetworkSub: "ಕಾರ್ಮಿಕರು ಪ್ರತ್ಯೇಕ ವ್ಯಕ್ತಿಗಳಲ್ಲ. ಅವರು ಸಂರಕ್ಷಿತ ಸಹಕಾರಿ ಒಕ್ಕೂಟದ ಸದಸ್ಯರು.",
    searchPlaceholder: "ನಿಮಗೆ ಇಂದು ಯಾವ ಸೇವೆ ಬೇಕು?",
    verifiedBadge: "ಸಹಕಾರಿ ಪರಿಶೀಲಿತ",
    bookNow: "ಪರಿಶೀಲಿತ ಕಾರ್ಮಿಕರನ್ನು ಕಾಯ್ದಿರಿಸಿ",
    viewDetails: "ವಿವರ ನೋಡಿ",
    myBookings: "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು",
    earnings: "ಕಾರ್ಮಿಕರ ಗಳಿಕೆ",
    welfareCenter: "ಕಲ್ಯಾಣ ಮತ್ತು ಸಾಮಾಜಿಕ ಭದ್ರತೆ",
    availability: "ಲಭ್ಯತೆ",
    available: "ಲಭ್ಯವಿದ್ದಾರೆ",
    unavailable: "ಲಭ್ಯವಿಲ್ಲ",
    step1: "ಸೇವೆ ಆಯ್ಕೆಮಾಡಿ",
    step2: "ಪರಿಶೀಲಿತ ಕಾರ್ಮಿಕರನ್ನು ಹುಡುಕಿ",
    step3: "ಕೆಲಸ ಮಾಡಿಸಿಕೊಳ್ಳಿ",
    step4: "ಪಾವತಿಸಿ, ರೇಟಿಂಗ್ ನೀಡಿ",
    customerDashboard: "ಗ್ರಾಹಕ ಪೋರ್ಟಲ್",
    workerDashboard: "ಕಾರ್ಮಿಕರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    adminDashboard: "ಸಹಕಾರಿ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ",
    zone: "ವಲಯ",
    rating: "ರೇಟಿಂಗ್",
    jobsCompleted: "ಪೂರ್ಣಗೊಂಡ ಕೆಲಸಗಳು",
    distance: "ದೂರ",
    whyThisWorker: "ಈ ಕಾರ್ಮಿಕ ಏಕೆ?",
    balanceWorkforce: "ಕಾರ್ಯಪಡೆ ಸರಿದೂಗಿಸಿ",
    applyAllocation: "ನಿಯೋಜನೆ ಅನ್ವಯಿಸಿ",
    reviewAllocation: "ಪರಿಶೀಲಿಸಿ",
    totalAmount: "ಒಟ್ಟು ಮೊತ್ತ",
    cooperativeFee: "ಸಹಕಾರಿ ಕೊಡುಗೆ (5%)",
    netEarnings: "ಕಾರ್ಮಿಕರ ನಿವ್ವಳ ಗಳಿಕೆ",
    downloadInvoice: "ರಸೀದಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ"
  }
};
