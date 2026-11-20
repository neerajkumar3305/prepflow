/* PrepFlow data: plan 26 Nov 2026 to 15 Feb 2027. Everything can be edited inside the app. */
const PLAN_START = "2026-11-26";
const PLAN_END = "2027-02-15";
const SYLLABUS_VERSION = 7;

/* Daily domains (columns). Keys are stored in the syllabus rows. */
const DOMAINS = [
  { key: "core", label: "Core Subject" },
  { key: "ai", label: "AI Engineering" },
  { key: "maths", label: "Maths" },
  { key: "web", label: "Web Development" },
  { key: "fin", label: "Finance" },
  { key: "sc", label: "Supply Chain" },
  { key: "case", label: "Case Prep and Product" }
];
const TASK_DOMAINS = [...DOMAINS.map(d => d.label), "Fitness", "Budget", "Other"];
const GOAL_CATEGORIES = ["Projects", "Practice", "Certifications", "Coursework", "Fitness", "Finance", "Competitions", "Other"];
const DEFAULT_CATEGORIES = ["Food", "Travel", "Rent", "Bills", "Study", "Fitness", "Shopping", "Entertainment", "Other"];
const REASONS = ["", "Sick", "Travel", "Exams or heavy study", "Planned rest", "Forgot", "Other"];

const F = id => "https://drive.google.com/drive/folders/" + id;

/* Core subjects: days are provisional. Change them in Goals or by editing this list. */
const SUBJECTS = [
  { name: "Engineering Materials", sem: "3rd", type: "Theory", days: 5, url: F("17ImnzwDft9ZQ885OBgy73lzeF1OJoc5k") },
  { name: "Metallurgical Thermodynamics", sem: "3rd", type: "Theory", days: 8, url: F("1Bv5ICqX2YNJSZzzBAVfpFSwH5wzyExX5") },
  { name: "Laboratory", sem: "3rd", type: "Lab", days: 2, url: F("1W8XQl87yxUSe4Gp_0b55INZgigjsRIC4") },
  { name: "Deformation", sem: "4th", type: "Theory", days: 5, url: F("1ucCXZj-Yhh4_HQUhxYzoiu2UipAIAaQf") },
  { name: "Materials Processing", sem: "4th", type: "Theory", days: 5, url: F("19JJPBg6OSg_CC1nS4wbDF3IvBozOga4r") },
  { name: "CAMP", sem: "4th", type: "Theory", days: 2, url: F("1pYikAQeVjRES9ekhx4UT2cpHD7rnrxgT") },
  { name: "Camp Lab", sem: "4th", type: "Lab", days: 2, url: F("1vecYVKTihmSr1L4lOVdMpmyQ__gAa1uW") },
  { name: "MP Lab", sem: "4th", type: "Lab", days: 2, url: F("14SgAo1HkOPfUbbwD-8MoA9tI0YHAAZUg") },
  { name: "Transport Phenomena", sem: "4th", type: "Theory", days: 5, url: F("1Tz9pMY_uRP8LZ5szYp6hM_lxl3fQ6OxC") },
  { name: "Heat Treatment and Phase Transformations", sem: "5th", type: "Theory", days: 5, url: F("1Lye8UyEKHqcomPwYNjkAXYmGe9b6aeQA") },
  { name: "Heat Treatment Lab", sem: "5th", type: "Lab", days: 2, url: F("1DNE7YDJU2TqEYwKIFt6aJQCM-Xar4Tqn") },
  { name: "Extractive Metallurgy", sem: "5th", type: "Theory", days: 5, url: F("1zq8OOLpKE5D37_xQ65x_ywmNH4JLqkHV") },
  { name: "Corrosion", sem: "5th", type: "Theory", days: 5, url: F("1p-dl1-NTM-W4DDFtrNRBk1OMJdE7_b3-") },
  { name: "Metal Working Lab", sem: "5th", type: "Lab", days: 2, url: F("1M-QaB0uhcHnfX7jw6OCLIja2_bRZGQTH") },
  { name: "Mechanical Working of Materials", sem: "5th", type: "Theory", days: 2, url: F("1GiiyYMQEQvGe20N8xcFpH7GD-_iCvTu4") },
  { name: "Creep, Fatigue and Failure", sem: "5th", type: "Theory", days: 5, url: F("1btInCBS-v7eh_ppo2BeDjSxzMeJnmQV3") },
  { name: "XRD & TEM (KD)", sem: "6th", type: "Theory", days: 5, url: F("1z12OVc_ali08PxoDaACqDPo4jMswP9-n") },
  { name: "XRD Lab", sem: "6th", type: "Lab", days: 2, url: F("1DiAtcSdYRLONoLOVHEIi00PvphHbbsgZ") },
  { name: "IMSM (GGR)", sem: "6th", type: "Theory", days: 2, url: F("1RAY0clvkWmkIums4WIHTYxMCI27a0Wop") },
  { name: "POM (Sankha)", sem: "6th", type: "Theory", days: 3, url: F("1p5m_No-OWLpYVgO-nnBLbFHNupVE8-Qo") },
  { name: "ENFM-CRB", sem: "6th", type: "Theory", days: 3, url: F("1rPQjWpjBzrV5MSrG8Ku7ZJ8oHysb5m1z") },
  { name: "Material Characterization (JD)", sem: "6th", type: "Theory", days: 3, url: F("17OKy6_HcOYwtXkareCF_gmCLjC4-2WNm") },
  { name: "MAT CHAR LAB", sem: "6th", type: "Lab", days: 2, url: F("1mebqhCjYzvD83Avk7KGQ43W80XapgnVP") }
];

/* Projects from the Projects_By_Domain sheet (all 48, now placed in Goals) */
const PROJECTS = [
  ["Web Development", "Mini backend project"], ["Web Development", "Full-stack project 1 (deployed)"], ["Web Development", "Project 2 (second full-stack build)"], ["Web Development", "Portfolio website"], ["Web Development", "Containerized web app (Docker)"], ["Web Development", "Project 3 (third full-stack build)"], ["Web Development", "FDE-style client demo app"],
  ["Data Analytics", "Messy dataset clean + analyze"], ["Data Analytics", "Analytics dashboard project"], ["Data Analytics", "Portfolio dataset #2"], ["Data Analytics", "Analytics portfolio packaging"], ["Data Analytics", "Real-time dashboard basics"], ["Data Analytics", "Second dataset end-to-end"], ["Data Analytics", "FDE-style data pipeline"],
  ["Core Tech / FDE", "System design: URL shortener"], ["Core Tech / FDE", "System design: rate limiter"], ["Core Tech / FDE", "Data modeling exercise"], ["Core Tech / FDE", "Docker containerization exercise"], ["Core Tech / FDE", "CI/CD pipeline"], ["Core Tech / FDE", "Rapid prototyping drills"], ["Core Tech / FDE", "Unfamiliar codebase exercise"], ["Core Tech / FDE", "ETL practice"], ["Core Tech / FDE", "Final system design mock"], ["Core Tech / FDE", "Full mock FDE technical day"],
  ["Agentic AI", "LangChain agent with custom tools"], ["Agentic AI", "CrewAI multi-agent demo"], ["Agentic AI", "AutoGen + MCP integration demo"], ["Agentic AI", "Agentic AI capstone"],
  ["Finance", "Netflix valuation case study"], ["Finance", "Reading company financials"], ["Finance", "Advanced valuation case v2"], ["Finance", "Finance case study portfolio piece"],
  ["Supply Chain", "Supply chain case study"], ["Supply Chain", "Advanced supply chain case study"], ["Supply Chain", "Supply chain portfolio piece"],
  ["Product & Consult", "PRD for an AI feature"], ["Product & Consult", "AI-PM model evaluation framework"], ["Product & Consult", "Mock FDE client call"], ["Product & Consult", "FDE STAR project stories"], ["Product & Consult", "Consulting case write-up"], ["Product & Consult", "Full mock FDE day"], ["Product & Consult", "Final mock FDE interview"],
  ["DSA", "Timed contest practice"], ["DSA", "Mock technical interviews"], ["DSA", "Final mock interviews"],
  ["Data Science / AI", "Titanic / house price prediction"], ["Data Science / AI", "Sentiment analysis tool"], ["Data Science / AI", "Document Q&A system (RAG)"]
];

/* Default goals: all projects from the sheet, practice targets, fitness and expense tracking */
function buildDefaultGoals() {
  let n = 0;
  const mk = o => Object.assign({ id: "g" + (++n) + "x" + Date.now().toString(36), value: 0, auto: null, domain: "", unit: "", type: "count", due: "" }, o);
  const projectGoals = PROJECTS.map(([d, name]) => mk({ cat: "Projects", type: "check", target: 1, name, domain: d }));
  const countGoals = [
    { cat: "Coursework", name: "Core subject days completed", target: 82, unit: "days" },
    { cat: "Practice", name: "LeetCode problems", target: 205 },
    { cat: "Practice", name: "Consulting cases solved", target: 30 },
    { cat: "Practice", name: "Mock interviews", target: 10 },
    { cat: "Certifications", name: "Finance courses completed", target: 11 },
    { cat: "Fitness", name: "Gym sessions (1 hr)", target: 82, auto: "gym", unit: "days" },
    { cat: "Fitness", name: "Walks (1 hr)", target: 82, auto: "cardio", unit: "days" },
    { cat: "Fitness", name: "Diet followed", target: 82, auto: "diet", unit: "days" },
    { cat: "Finance", name: "Days expenses logged", target: 82, auto: "logdays", unit: "days" }
  ].map(o => mk(o));
  return projectGoals.concat(countGoals);
}

/* Google OAuth Web client ID for Drive sync. Create one in Google Cloud Console (see README) and paste it here. */
const GOOGLE_CLIENT_ID = "602264513912-36nji283sn7hr3adffe90qgrkrbvtigs.apps.googleusercontent.com";
