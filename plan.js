/* Plan: 26 Nov 2026 to 15 Feb 2027 (82 days). Daily timetable plus the resources for every day.
   Every resource is placed on at least one day (checked by the coverage test). */
const PLAN_DAYS = 82;
const TTL = (name, url) => (url ? name + ": " + url : name);

/* Weekday timetable from your time allocation (AI 5 hrs incl. maths, Finance/Supply chain 2, Case prep 1,
   Website 2, Core 2, Gym 1, Dinner/walk/calls 1, Sleep 4). Same template every day. */
const WEEKDAY_TIMETABLE = [
  ["06:00", "06:30", "routine", "Wake up, water, review today's checklist"],
  ["06:30", "07:30", "core", "Core subject: block 1"],
  ["07:30", "08:00", "break", "Breakfast"],
  ["08:00", "09:00", "web", "Web development: build block 1"],
  ["09:00", "10:00", "core", "Core subject: block 2"],
  ["10:00", "10:15", "break", "Short break"],
  ["10:15", "11:15", "ai", "AI engineering: learn"],
  ["11:15", "12:15", "ai", "AI engineering: practise and build"],
  ["12:15", "13:15", "break", "Lunch and rest"],
  ["13:15", "14:15", "maths", "Maths for AI"],
  ["14:15", "15:15", "ai", "AI engineering: build"],
  ["15:15", "16:15", "ai", "AI engineering: notes and review"],
  ["16:15", "17:15", "fin", "Finance (Mon, Wed, Fri) or supply chain (Tue, Thu, Sat, Sun): block 1"],
  ["17:15", "17:30", "break", "Short break"],
  ["17:30", "18:30", "fin", "Finance or supply chain: block 2"],
  ["18:30", "19:30", "case", "Case prep and product"],
  ["19:30", "20:30", "web", "Web development: build block 2"],
  ["20:30", "21:30", "gym", "Gym: 1 hour"],
  ["21:30", "22:30", "walk", "Dinner, walk, calls and messages"],
  ["22:30", "02:00", "buffer", "Buffer: catch-up, revision and PYQ practice"],
  ["02:00", "06:00", "sleep", "Sleep: 4 hours"]
];

/* AI engineering (your 25 resources, plus the Karpathy intro, and common practice) */
const AI_ITEMS = [
  TTL("Intro to Large Language Models (Karpathy)", "https://www.youtube.com/watch?v=zjkBMFhNj_g"),
  TTL("Data Analyst Bootcamp: SQL, Excel, Power BI, Python, Pandas (#02)", "https://youtu.be/PSNXoAs2FtQ"),
  TTL("SQL practice: SQLBolt (common)", "https://sqlbolt.com"),
  TTL("SQL practice: LeetCode database problems (common)", "https://leetcode.com/problemset/database/"),
  TTL("SQL practice: StrataScratch (common)", "https://www.stratascratch.com"),
  TTL("SQL practice: DataLemur (common)", "https://datalemur.com"),
  TTL("Machine Learning Playlist (#03)", "https://youtube.com/playlist?list=PLKnIA16_Rmvbr7zKYQuBfsVkjoLcJgxHH"),
  TTL("ML practice: Kaggle Learn, Intro to Machine Learning (common)", "https://www.kaggle.com/learn/intro-to-machine-learning"),
  TTL("Chain-of-Thought Prompting (paper)", "https://arxiv.org/abs/2201.11903"),
  TTL("Prompt Engineering Guide", "https://www.promptingguide.ai/"),
  TTL("Deep Learning Playlist (#04)", "https://youtube.com/playlist?list=PLKnIA16_RmvYuZauWaPlRTC54KxSNLtNn"),
  TTL("NLP and Transformer Architecture (#06)", "https://youtu.be/3bPhDUSAUYI"),
  TTL("Build GPT from Scratch (#11)", "https://youtu.be/kCc8FmEb1nY"),
  TTL("Generative AI Playlist (#05)", "https://youtube.com/playlist?list=PLKnIA16_RmvaTbihpo4MtzVm4XOQa0ER0"),
  TTL("Retrieval-Augmented Generation Explained (#12)", "https://youtu.be/X0btK9X0Xnk"),
  TTL("Top 10 RAG Frameworks on GitHub (#13)", "https://florinelchis.medium.com/top-10-rag-frameworks-on-github-by-stars-january-2026-e6edff1e0d91"),
  TTL("FastAPI Playlist (#14)", "https://youtube.com/playlist?list=PLKnIA16_RmvZ41tjbKB2ZnwchfniNsMuQ"),
  TTL("Agentic AI Playlist (#07)", "https://youtube.com/playlist?list=PLKnIA16_RmvYsvB8qkUQuJmJNuiCUJFPL"),
  TTL("Model Context Protocol Playlist (#10)", "https://youtube.com/playlist?list=PLKnIA16_Rmva_oZ9F4ayUu9qcWgF7Fyc0"),
  TTL("Agentic Coding with Claude Code (#09)", "https://youtu.be/K_KIQA849cs"),
  TTL("LLM Evaluation Playlist (#15)", "https://youtu.be/6W92_t9FveA"),
  TTL("LLM Operations, LLMOps (#16)", "https://youtu.be/NuWRAiYnjxw"),
  TTL("LLM Gateway with LiteLLM (#17)", "https://youtu.be/RN3baOpNA6w"),
  TTL("LLM Gateway with Mesh API (#18)", "https://youtu.be/yAczx0_NtyU"),
  TTL("AI Guardrails and Security (#19)", "https://youtu.be/rQE3w8Qjx98"),
  TTL("Tracing and Observability with Arize AI (#20)", "https://youtu.be/fHGSxOhWO-g"),
  TTL("Loop Engineering and Harness Engineering (#21)", "https://youtu.be/3uO6V05LBjU"),
  TTL("Forward Deployed Engineer roadmap (#22)", "https://youtu.be/SOU28VT-Ns4"),
  TTL("GCP Zero to Hero (#23)", "https://youtu.be/N5rXROueKhw"),
  TTL("Azure Zero to Hero (#24)", "https://youtu.be/10jm7Waan8M"),
  TTL("AWS Zero to Hero (#25)", "https://youtu.be/GkKNxyLp_V0"),
  TTL("Practical AI Projects Playlist (#08)", "https://youtu.be/pEiq3sI8dYQ"),
  TTL("Capstone practice: build a RAG Q&A API and write its evaluation report", "")
];

/* Python basics first (AI engineering starts here), from your AI list and the Data Science roadmap */
const PYTHON_ITEMS = [
  TTL("Python Learning Playlist (#01, satyaexplains)", "https://youtube.com/playlist?list=PLKnIA16_Rmvb1RYR-iTA_hzckhdONtSW4"),
  TTL("Python for Beginners, Programming with Mosh (DS roadmap)", RES_SEARCH("Programming with Mosh Python for Beginners")),
  TTL("Python Basics, freeCodeCamp (DS roadmap)", RES_SEARCH("freeCodeCamp Python Basics")),
  TTL("Python practice: W3Schools (DS roadmap)", "https://www.w3schools.com/python/"),
  TTL("NumPy Tutorial, freeCodeCamp (DS roadmap)", RES_SEARCH("freeCodeCamp NumPy Tutorial")),
  TTL("Pandas Tutorial, Data School playlist (DS roadmap)", RES_SEARCH("Data School Pandas tutorial playlist")),
  TTL("Pandas official tutorials (DS roadmap)", "https://pandas.pydata.org/docs/getting_started/index.html"),
  TTL("Python practice: HackerRank Python challenges (DS roadmap)", "https://www.hackerrank.com/domains/python"),
  TTL("Python practice: Kaggle Python course (DS roadmap)", "https://www.kaggle.com/learn/python"),
  TTL("Python practice: Exercism Python track (DS roadmap)", "https://exercism.org/tracks/python")
];
/* Days given to Python basics at the start of the plan */
const PY_DAYS = 14;

/* Maths (Data Science roadmap resources, plus common practice) */
const MATHS_ITEMS = [
  TTL("Khan Academy: Linear Algebra", "https://www.khanacademy.org/math/linear-algebra"),
  TTL("Linear Algebra for Data Science (freeCodeCamp)", RES_SEARCH("freeCodeCamp Linear Algebra for Data Science")),
  TTL("3Blue1Brown: Essence of Linear Algebra", "https://www.youtube.com/@3blue1brown"),
  TTL("Khan Academy: Probability Fundamentals", "https://www.khanacademy.org/math/statistics-probability"),
  TTL("Introduction to Probability (HarvardX)", RES_SEARCH("Introduction to Probability HarvardX self-study")),
  TTL("3Blue1Brown: Probability Basics", "https://www.youtube.com/@3blue1brown"),
  TTL("CrashCourse: Statistics", "https://www.youtube.com/@crashcourse"),
  TTL("Statistics for Data Science (freeCodeCamp)", RES_SEARCH("Statistics for Data Science freeCodeCamp")),
  TTL("3Blue1Brown: Essence of Calculus", "https://www.youtube.com/@3blue1brown"),
  TTL("Khan Academy: Differential Calculus", "https://www.khanacademy.org/math/differential-calculus"),
  TTL("Calculus for Machine Learning (Jon Krohn)", RES_SEARCH("Jon Krohn Calculus for Machine Learning")),
  TTL("Maths practice: Khan Academy exercises (common)", "https://www.khanacademy.org/math")
];

/* Web development */
const WEB_ITEMS = [
  TTL("MERN stack tasks (Tute Dude)", "https://upskill.tutedude.com/dashboard/tasks/mernstacktask"),
  TTL("Web Development folder (Drive)", DRIVE_F("1nIsWwF1ZiP1Ng2At-WFtcf2IS3o4CnE9")),
  TTL("Front-end practice: freeCodeCamp (common)", "https://www.freecodecamp.org")
];

/* Finance (Monday, Wednesday, Friday) */
const FIN_ITEMS = [
  TTL("Financial Modelling lecture (Tute Dude)", "https://upskill.tutedude.com/course/lecture-financialmodelling"),
  TTL("Financial Markets (Yale, Coursera)", RES_SEARCH("Financial Markets Yale Coursera")),
  TTL("Introduction to Finance and Accounting (Penn, Coursera)", RES_SEARCH("Introduction to Finance and Accounting Specialization Pennsylvania Coursera")),
  TTL("Introduction to Corporate Finance (Penn, Coursera)", RES_SEARCH("Introduction to Corporate Finance Pennsylvania Coursera")),
  TTL("Introduction to Financial Engineering and Risk Management (Columbia, Coursera)", RES_SEARCH("Financial Engineering and Risk Management Columbia Coursera")),
  TTL("Fundamentals of Financial Planning (Goldman Sachs 10,000 Women)", RES_SEARCH("Fundamentals of Financial Planning Goldman Sachs 10,000 Women")),
  TTL("Behavioral Finance (Duke, Coursera)", RES_SEARCH("Behavioral Finance Duke Coursera")),
  TTL("Fundamentals of Finance (Penn, Coursera)", RES_SEARCH("Fundamentals of Finance Pennsylvania Coursera")),
  TTL("Introduction to Finance: The Basics (Illinois, Coursera)", RES_SEARCH("Introduction to Finance The Basics Illinois Coursera")),
  TTL("Discounted Cash Flow Modeling (Coursera Project Network)", RES_SEARCH("Discounted Cash Flow Modeling Coursera Project Network")),
  TTL("Corporate Finance Fundamentals (Corporate Finance Institute)", RES_SEARCH("Corporate Finance Institute Corporate Finance Fundamentals")),
  TTL("Finance practice: Khan Academy (common)", "https://www.khanacademy.org/economics-finance-domain"),
  TTL("Finance folder (Drive, incl. Zerodha Varsity)", DRIVE_F("1VPqfQszltX5Vetd6up3Jo1fQMPyvigCf"))
];

/* Supply chain (Tuesday, Thursday, Saturday, Sunday): Coursera course, all 24 lecture slides in folder numbering */
const SC_SLIDES = [
  "SCM-1 Introduction (Lect#1)", "SCM-2 Logistics Introduction (Lect#2)", "SCM-3 Performance (Lect#3)",
  "SCM-4 Logistics Performance (Lect#4)", "SCM-5 Drivers of Supply Chain (Lect#5)", "SCM-6 Facility (Lect#6)",
  "SCM-7 Facility (Lect#7)", "SCM-8 Centre of Gravity Method (Lect#8)", "SCM-9 (Lect#9)",
  "SCM-10 Capacity Constraint Model (Lect#10)", "SCM-11 Aggregation of Data (Lect#11)", "SCM-12 Outbound Transportation",
  "SCM-13 VRP (Lect#13)", "SCM-14 Bullwhip Effect (Lect#14)", "SCM-15 Managing Inventory (Lect#14)",
  "SCM-16 Coordination by Discounts (Lect#16)", "SCM-17 K-means Clustering for Customer Segmentation (Lect#17)",
  "SCM-18 Inventory Under Uncertainty (Lect#18)", "SCM-19 Periodic Review System with Case Study",
  "SCM-20 Bullwhip Effect (Lec 20)", "SCM-21 Risk Pooling (Lect#21)", "SCM-22 Inventory Under Uncertainty (#22)",
  "SCM-23 Periodic Review System with Case Study (#23)", "SCM-24 Final Risk Pooling (Lect#24)"
];
const SC_ITEMS = [
  TTL("Supply Chain Management specialization (Coursera)", "https://www.coursera.org/specializations/supply-chain-management"),
  ...SC_SLIDES.map(s => TTL(s + " (SCM slides)", DRIVE_F("12LfUt-L4AFDlVTnHXJenYgbG5MopMi_b"))),
  TTL("B Kay Tech Case Study and questions", DRIVE_F("12LfUt-L4AFDlVTnHXJenYgbG5MopMi_b")),
  TTL("Supply chain practice: Coursera course quizzes (common)", "https://www.coursera.org/specializations/supply-chain-management")
];

/* Case prep and product (every day, 1 hour): Consult case books, product courses and books, practice */
const CASE_ITEMS = [
  TTL("Case Prep Command Centre (Consult)", DRIVE_F("1n7pw8DLDssMJ45shnex-7VqIxNhgr5sF")),
  TTL("ISB Consulting Casebook CO2020", "https://drive.google.com/file/d/1mzB56qEznaY1XYMo4ZVSZUuYXj3bVzte/view"),
  TTL("MDI Gurgaon Consulting Case Book", "https://drive.google.com/file/d/1Brr9o8m6oTx14UbtBIq4jzNKp1YruOfN/view"),
  TTL("IIT Guwahati Consulting Case Book", "https://drive.google.com/file/d/1dkVAXXMRoPz29vz3Sku0kGqBUp7h3Oya/view"),
  TTL("IIM Calcutta CaseBook 2024-25", "https://drive.google.com/file/d/1Tbxa03Eeefr42NMaESWnGf8lztwO6dxp/view"),
  TTL("IIMA Case Study", "https://drive.google.com/file/d/1gRvF9FlLQ0SlLoRUpNlVgPEIITPj_Nsr/view"),
  TTL("SRCC 180DC Case Book", "https://drive.google.com/file/d/1ptwfh3G9ba1wqiyZS96u4iV7Kh3Z-I8D/view"),
  TTL("SRCC 180DC Guesstimates", "https://drive.google.com/file/d/1rdbNfqTJuERkSN0Ru8_k0CRoz0AsSZl8/view"),
  TTL("IIT Kharagpur PM Case Book", "https://drive.google.com/file/d/1miLREaVqgq3dizu7emQ4s9603SmlaPGu/view"),
  TTL("Software Product Management, Course 1: Introduction (course map and glossary)", DRIVE_F("1g5Jn-rTVbj57qILvFsZXMcjcnF9mWB_M")),
  TTL("Software Product Management, Course 2: Software Processes and Agile", DRIVE_F("1g5Jn-rTVbj57qILvFsZXMcjcnF9mWB_M")),
  TTL("Software Product Management, Course 3: Client Needs and Requirements", DRIVE_F("1g5Jn-rTVbj57qILvFsZXMcjcnF9mWB_M")),
  TTL("Software Product Management, Course 4: Agile Planning", DRIVE_F("1g5Jn-rTVbj57qILvFsZXMcjcnF9mWB_M")),
  TTL("Software Product Management, Course 5: Reviews and Metrics", DRIVE_F("1g5Jn-rTVbj57qILvFsZXMcjcnF9mWB_M")),
  TTL("Software Product Management, Course 6: Capstone", DRIVE_F("1g5Jn-rTVbj57qILvFsZXMcjcnF9mWB_M")),
  TTL("The Product Book (Product School)", DRIVE_F("1ROFHZ9kra3DtPuBnFu60kc7p9K8AbMiY")),
  TTL("A Mini Guide to Product Management (Seniors Guide)", DRIVE_F("1r3MX_qzVHfYJgIypsDaHed7sNLTPDnNp")),
  TTL("Product Prep (Seniors Guide)", DRIVE_F("1r3MX_qzVHfYJgIypsDaHed7sNLTPDnNp")),
  TTL("Preparing for Product Interviews (Seniors Guide)", DRIVE_F("1r3MX_qzVHfYJgIypsDaHed7sNLTPDnNp")),
  TTL("Cracking the PM Interview (McDowell, Laakmann, Bavaro)", DRIVE_F("1uxZf8v7mbvmjz4B2Ri731wKnYyHpVcXm")),
  TTL("The Product Manager Interview (Lewis C. Lin, Teng Lu)", DRIVE_F("1uxZf8v7mbvmjz4B2Ri731wKnYyHpVcXm")),
  TTL("Decode and Conquer (Lewis C. Lin)", DRIVE_F("1uxZf8v7mbvmjz4B2Ri731wKnYyHpVcXm")),
  TTL("Swipe to Unlock", DRIVE_F("1uxZf8v7mbvmjz4B2Ri731wKnYyHpVcXm")),
  TTL("IIM Bangalore PM Case Book", DRIVE_F("1aL0V1r4KvrHELT0213kYpfPbR1Usj8lQ")),
  TTL("BITSoM Product Management Case Book", DRIVE_F("1aL0V1r4KvrHELT0213kYpfPbR1Usj8lQ")),
  TTL("IIT Kanpur Product Management Casebook 2024-25", DRIVE_F("1aL0V1r4KvrHELT0213kYpfPbR1Usj8lQ")),
  TTL("Root cause analysis: 5 Whys and fishbone on one product problem", ""),
  TTL("AI Agent Academy for forward-deployed PMs", "https://drive.google.com/file/d/120ukK8ayku34EH55__pQ6twtf9oXkv1s/view"),
  TTL("Case practice: Case Coach (common)", "https://www.casecoach.com"),
  TTL("Product interview practice: Exponent (common)", "https://www.tryexponent.com")
];

/* Spread a list over n days so every item appears (needs list.length <= n) */
function planItemFor(list, k, n) { return list[Math.floor((k * list.length) / n)]; }

/* Daily syllabus rows from the core sequence and the resource lists above */
function buildDefaultSyllabus() {
  const seq = [];
  SUBJECTS.forEach(s => { for (let k = 0; k < s.days; k++) seq.push({ s, n: k + 1 }); });
  const dates = [];
  let d = new Date(PLAN_START + "T00:00:00");
  for (let i = 0; i < PLAN_DAYS; i++) {
    dates.push(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"));
    d.setDate(d.getDate() + 1);
  }
  const isMWF = x => [1, 3, 5].includes(new Date(x + "T00:00:00").getDay());
  const finDays = dates.filter(isMWF).length, scDays = PLAN_DAYS - finDays;
  let fk = 0, sk = 0;
  return dates.map((date, i) => {
    let fin = "", sc = "";
    if (isMWF(date)) { fin = planItemFor(FIN_ITEMS, fk, finDays); fk++; }
    else { sc = planItemFor(SC_ITEMS, sk, scDays); sk++; }
    const cur = seq[i];
    return {
      date,
      core: `${cur.s.name} (${cur.s.sem} sem, ${cur.s.type}, day ${cur.n} of ${cur.s.days}): ${cur.s.url}`,
      ai: i < PY_DAYS ? planItemFor(PYTHON_ITEMS, i, PY_DAYS) : planItemFor(AI_ITEMS, i - PY_DAYS, PLAN_DAYS - PY_DAYS),
      maths: planItemFor(MATHS_ITEMS, i, PLAN_DAYS),
      web: planItemFor(WEB_ITEMS, i, PLAN_DAYS),
      fin, sc,
      case: planItemFor(CASE_ITEMS, i, PLAN_DAYS)
    };
  });
}
