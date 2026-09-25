/* ============================================================================
   CONFIG — the only file to edit after delivery.
   - SCRIPT_URL: the Apps Script web app URL (ends with /exec).
     Empty = mock mode (answers stay in this browser). On localhost the mock is always
     used so tests never write to the real Sheet; add ?live=1 to test the real one locally.
   - Placeholder texts ("TODO", "lorem ipsum") and an empty SCRIPT_URL are reported
     as a warning in the browser console (never shown to participants).
   ========================================================================== */
export const CONFIG = {
  SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzDTdpoL5_6mBIXthxlWw5TwwDQQZV3ahH8FeL8g1b0rTMb3lqSg-o_sDfGZLWoC_BqKQ/exec',
  EVENT: 'World Quality Week 2026',
  PROGRAM: 'Quality Powering Performance',   // the programme behind the 4 pillars
  LOGO: 'assets/logo.png',                   // programme visual, shown in full on the home screen
  LOGO_MARK: 'assets/logo-mark.png',         // square crop of the Q, for round medallions (headers, star, PDF)
  MIN_CHARS: 1,
  MAX_CHARS: 2000,
  PILLARS: [
    { id: 1, name: 'Quality as Enabler', icon: 'clapper', question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit?' },
    { id: 2, name: 'Building Trust', icon: 'handshake', question: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?' },
    { id: 3, name: 'Efficiency & Speed', icon: 'bolt', question: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris?' },
    { id: 4, name: 'Quality Driving Innovation', icon: 'bulb', question: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum?' },
  ],
  // Ipsen palette (ipsen.com). The star gold is the only non-Ipsen colour.
  THEME: { primary: '#000e56', accent: '#2797d3', surface: '#edebe4', star: '#e3a900' },
  // Pillar icons available: clapper, handshake, bolt, bulb (see js/icons.js).
  TEXT: {
    // Welcome
    welcomeTitle: 'Get your Quality Passport',
    welcomeSubtitle: 'Four pillars, one question each. Every answer earns a star.',
    emailLabel: 'Your work email',
    emailInvalid: 'Please enter a valid email address.',
    emailNotice: 'Answers are saved with your email and read by the Quality team.',
    continue: 'Start',
    checking: 'Checking your stars…',
    checkingSlow: 'This can take a few seconds.',
    // Question
    pillarLabel: 'Pillar {n} of 4',
    questionIntro: 'No right or wrong answer. Just yours.',
    answerHint: 'Take a moment. Your thoughts matter more than your spelling.',   // placeholder of the answer field
    submit: 'Stamp my passport',
    myPassport: 'Passport',
    // Passport
    passportTitle: 'My Quality Passport',
    count: '{n} of 4',
    starEarned: 'Star earned',
    alreadyStamped: 'Already stamped',
    nextHint: 'Head to the pillar of your choice and scan its QR code.',
    toDiscover: 'To discover',             // a pillar stays hidden until its QR code is scanned
    completeTitle: 'Passport complete',
    completeSubtitle: 'Show this screen to collect your goodies.',
    openPassport: 'Get my Quality Passport',
    // Sending status (the star is lit at once; the answer is sent in the background)
    saving: 'Saving your answer…',
    saved: 'Answer saved',
    waiting: 'Saved on your phone. It will be sent automatically.',
    // Celebration
    celebrationTitle: 'Four pillars. Four stars.',
    celebrationSubtitle: 'Your Quality Passport is complete.',
    editName: 'Edit name',
    holderLabel: 'Name on your passport',
    share: 'Share',
    shareText: 'Four pillars, four stars: my Quality Passport is complete. #WorldQualityWeek',
    copied: 'Copied. Paste it anywhere.',
    download: 'Download my passport',
    saveOrShare: 'Share PDF',
    preparing: 'Preparing…',
    pdfFallback: 'The PDF tool could not load. Your passport was saved as an image instead.',
    close: 'Done',
    // Passport document (PDF and certificate)
    docTitle: 'Quality Passport',
    docCertifies: 'This certifies that',
    docLine: 'has earned the four stars of {program}',
    docCompleted: 'Completed on {date}',
  },
};
