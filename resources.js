/* Resource guide, styled after ai-agent-academy.html. Each track is a phase with a premise, an outcome,
   a project to ship, and resource cards. Items without a verified direct link open a search for that title.
   Descriptions are short summaries from the titles and the notes in your Drive folders. */
const RES_SEARCH = q => "https://www.google.com/search?q=" + encodeURIComponent(q);
const DRIVE_F = id => "https://drive.google.com/drive/folders/" + id;

const RESOURCE_TRACKS = [
  {
    id: "ai", title: "AI engineering", weeks: "26 Nov to 15 Feb", verb: "Build",
    premise: "Start with Python basics, then data and maths, then how models work and how to build with them.",
    outcome: "Explain how LLMs, RAG and agents work, and build and evaluate one end-to-end app.",
    ship: "Capstone: a deployed RAG question-answering API with an evaluation report.",
    items: [
      { t: "Python Learning Playlist (#01)", src: "YouTube playlist", type: "video", url: "https://youtube.com/playlist?list=PLKnIA16_Rmvb1RYR-iTA_hzckhdONtSW4", desc: "An ordered Python course for programming fundamentals.", why: "Start here: every later step uses Python." },
      { t: "Python for Beginners (Programming with Mosh)", src: "YouTube · Data Science roadmap", type: "video", url: RES_SEARCH("Programming with Mosh Python for Beginners"), desc: "Variables, loops, functions, error handling and OOP.", why: "A clear first pass through Python." },
      { t: "Python Basics (freeCodeCamp)", src: "YouTube · Data Science roadmap", type: "video", url: RES_SEARCH("freeCodeCamp Python Basics"), desc: "Syntax, loops, functions and small exercises.", why: "Logic-building practice." },
      { t: "NumPy Tutorial (freeCodeCamp)", src: "YouTube · Data Science roadmap", type: "video", url: RES_SEARCH("freeCodeCamp NumPy Tutorial"), desc: "Arrays, indexing, broadcasting and maths operations.", why: "Foundation for numerical work." },
      { t: "Pandas Tutorial (Data School playlist)", src: "YouTube · Data Science roadmap", type: "video", url: RES_SEARCH("Data School Pandas tutorial playlist"), desc: "Series, DataFrames, filtering, grouping and merging.", why: "Data handling for the analytics work." },
      { t: "Python practice: HackerRank (common)", src: "HackerRank", type: "course", url: "https://www.hackerrank.com/domains/python", desc: "Python challenges to build problem-solving.", why: "Daily practice." },
      { t: "Python practice: Kaggle Python course", src: "Kaggle", type: "course", url: "https://www.kaggle.com/learn/python", desc: "Interactive Python notebooks for data tasks.", why: "Practice on data-style problems." },
      { t: "Python practice: Exercism Python track (common)", src: "Exercism", type: "course", url: "https://exercism.org/tracks/python", desc: "Mentored Python exercises.", why: "Improves code quality." },
      { t: "Intro to Large Language Models", src: "Andrej Karpathy · YouTube · 1 hr", type: "video", core: true, url: "https://www.youtube.com/watch?v=zjkBMFhNj_g", desc: "What an LLM is, how it is pre-trained and fine-tuned, and the 'LLM as operating system' idea.", learn: ["Pre-training vs fine-tuning", "Why models hallucinate", "The LLM-OS mental model"], why: "Watch first. It frames everything after it." },
      { t: "Essence of Linear Algebra", src: "3Blue1Brown · YouTube", type: "video", url: "https://www.youtube.com/@3blue1brown", desc: "Animated walkthrough of vectors, matrices and linear transformations.", why: "Builds the intuition behind PCA and neural network layers." },
      { t: "Chain-of-Thought Prompting", src: "Wei et al., 2022 · arXiv", type: "paper", url: "https://arxiv.org/abs/2201.11903", desc: "Shows that asking a model to reason step by step improves math and logic performance.", learn: ["Why step-by-step reasoning helps", "How to read a paper"], why: "A short, foundational first paper." },
      { t: "Prompt Engineering Guide", src: "DAIR.AI · promptingguide.ai", type: "guide", url: "https://www.promptingguide.ai/", desc: "Reference for prompting techniques: few-shot, chain-of-thought, ReAct and RAG prompting.", why: "Read it as a catalogue of failure modes." },
      { t: "Data Analyst Bootcamp (SQL, Excel, Power BI, Python, Pandas)", src: "YouTube · long-form bootcamp", type: "video", url: "https://youtu.be/PSNXoAs2FtQ", desc: "Covers SQL, Excel, Tableau, Power BI, Python and Pandas with projects.", why: "Use the SQL and Pandas sections for the data phase." },
      { t: "Machine Learning Playlist (#03)", src: "YouTube playlist", type: "video", url: "https://youtube.com/playlist?list=PLKnIA16_Rmvbr7zKYQuBfsVkjoLcJgxHH", desc: "Core machine-learning concepts, workflows and implementation.", why: "The classical ML phase." },
      { t: "Intro to Machine Learning (Kaggle)", src: "Kaggle · free course", type: "course", url: "https://www.kaggle.com/learn/intro-to-machine-learning", desc: "Hands-on house-price prediction with decision trees and random forests.", why: "Code along on a real dataset." },
      { t: "Deep Learning Playlist (#04)", src: "YouTube playlist", type: "video", url: "https://youtube.com/playlist?list=PLKnIA16_RmvYuZauWaPlRTC54KxSNLtNn", desc: "Neural-network foundations, training concepts and practical AI understanding.", why: "Deep learning phase." },
      { t: "NLP and Transformer Architecture (#06)", src: "YouTube", type: "video", url: "https://youtu.be/3bPhDUSAUYI", desc: "Self-attention, positional encoding, encoder-decoder blocks and decoding.", why: "Needed before GPT and RAG." },
      { t: "Build GPT from Scratch (#11)", src: "Andrej Karpathy · YouTube", type: "video", url: "https://youtu.be/kCc8FmEb1nY", desc: "Builds a small GPT-style Transformer in code: tokenization, attention, training and generation.", learn: ["Tokenization", "Attention in code", "Training a small model"], why: "The best way to understand a transformer." },
      { t: "Deep Learning Specialization (Andrew Ng)", src: "Coursera · audit free", type: "course", url: "https://www.coursera.org/specializations/deep-learning", desc: "Neural network architectures, loss functions and forward and backward passes.", why: "Structured course with coding exercises." },
      { t: "Generative AI Playlist (#05)", src: "YouTube playlist", type: "video", url: "https://youtube.com/playlist?list=PLKnIA16_RmvaTbihpo4MtzVm4XOQa0ER0", desc: "LLM applications, prompting, RAG, agents and modern development workflows.", why: "Start of the LLM applications phase." },
      { t: "Retrieval-Augmented Generation Explained (#12)", src: "YouTube", type: "video", url: "https://youtu.be/X0btK9X0Xnk", desc: "Indexing, retrieval, augmentation and generation.", why: "The pattern behind the capstone." },
      { t: "Top 10 RAG Frameworks on GitHub (#13)", src: "Medium · Florin Elchis", type: "blog", url: "https://florinelchis.medium.com/top-10-rag-frameworks-on-github-by-stars-january-2026-e6edff1e0d91", desc: "Ranking of open-source RAG frameworks and when to use each.", why: "Choose a framework for the capstone." },
      { t: "FastAPI Playlist (#14)", src: "YouTube playlist", type: "video", url: "https://youtube.com/playlist?list=PLKnIA16_RmvZ41tjbKB2ZnwchfniNsMuQ", desc: "Production Python APIs: validation, authentication and deployment.", why: "To serve the capstone as an API." },
      { t: "Agentic AI Playlist (#07)", src: "YouTube playlist", type: "video", url: "https://youtube.com/playlist?list=PLKnIA16_RmvYsvB8qkUQuJmJNuiCUJFPL", desc: "AI agents: tools, reasoning workflows, orchestration and implementations.", why: "Agent phase." },
      { t: "Model Context Protocol Playlist (#10)", src: "YouTube playlist", type: "video", url: "https://youtube.com/playlist?list=PLKnIA16_Rmva_oZ9F4ayUu9qcWgF7Fyc0", desc: "Connecting models and coding agents to external tools and data.", why: "Connects the agent to real tools." },
      { t: "Agentic Coding with Claude Code (#09)", src: "YouTube", type: "video", url: "https://youtu.be/K_KIQA849cs", desc: "AI-assisted development: agentic workflows, testing and deployment.", why: "How to build the capstone quickly." },
      { t: "LLM Evaluation Playlist (#15)", src: "YouTube", type: "video", url: "https://youtu.be/6W92_t9FveA", desc: "Systematic evaluation of model quality, RAG, agents and safety.", why: "Needed for the capstone evaluation report." },
      { t: "LLM Operations (LLMOps) (#16)", src: "YouTube", type: "video", url: "https://youtu.be/NuWRAiYnjxw", desc: "Quality monitoring, guardrails, latency and cost control in production.", why: "After the capstone, before deployment." },
      { t: "Practical AI Projects Playlist (#08)", src: "YouTube", type: "video", url: "https://youtu.be/pEiq3sI8dYQ", desc: "Turning AI concepts into working, portfolio-ready applications.", why: "Extra project ideas." }
    ]
  },
  {
    id: "maths", title: "Maths for data science", weeks: "Alongside AI", verb: "Understand",
    premise: "The maths behind models: vectors, probability, statistics and calculus. Use the Data Science roadmap resources.",
    outcome: "Explain the linear algebra, probability and calculus used in ML models.",
    ship: "Notebook: implement matrix operations and a gradient calculation in NumPy.",
    items: [
      { t: "Linear Algebra (Khan Academy)", src: "Khan Academy · free", type: "course", url: "https://www.khanacademy.org/math/linear-algebra", desc: "Structured lessons, quizzes and visuals.", why: "Step-by-step foundations." },
      { t: "Linear Algebra for Data Science (freeCodeCamp)", src: "YouTube · Data Science roadmap", type: "video", url: RES_SEARCH("freeCodeCamp Linear Algebra for Data Science YouTube"), desc: "Matrix maths in Python with NumPy and real use cases.", why: "Mixes maths with code." },
      { t: "Probability Fundamentals (Khan Academy)", src: "Khan Academy · free", type: "course", url: "https://www.khanacademy.org/math/statistics-probability", desc: "Independence, Bayes' theorem and distributions.", why: "Clear introduction to probability." },
      { t: "Introduction to Probability (HarvardX)", src: "HarvardX · self-study", type: "course", url: RES_SEARCH("Introduction to Probability HarvardX self-study Blitzstein Hwang"), desc: "Rigorous university course with notes and problem sets.", why: "Go deeper than the basics." },
      { t: "Probability Basics (3Blue1Brown)", src: "YouTube", type: "video", url: "https://www.youtube.com/@3blue1brown", desc: "Visual explanation of probability, combinations and random variables.", why: "Intuition before formulas." },
      { t: "CrashCourse Statistics", src: "YouTube", type: "video", url: "https://www.youtube.com/@crashcourse", desc: "Mean, median, variance, distributions and z-scores.", why: "Quick statistics review." },
      { t: "Statistics for Data Science (freeCodeCamp)", src: "YouTube · 3 hr", type: "video", url: RES_SEARCH("Statistics for Data Science freeCodeCamp YouTube"), desc: "Full statistics course with Python implementation.", why: "Theory with code." },
      { t: "Khan Academy Differential Calculus", src: "Khan Academy · free", type: "course", url: "https://www.khanacademy.org/math/differential-calculus", desc: "From 'What is a derivative?' to applications.", why: "Needed for gradients." },
      { t: "Calculus for Machine Learning (Jon Krohn)", src: "YouTube", type: "video", url: RES_SEARCH("Jon Krohn Calculus for Machine Learning YouTube"), desc: "Derivatives and gradients in neural networks and optimisation.", why: "Connects calculus to deep learning." }
    ]
  },
  {
    id: "web", title: "Web development", weeks: "Daily, 2 hrs", verb: "Build",
    premise: "Ship full-stack apps with the MERN stack, following the Tute Dude tasks.",
    outcome: "Build and deploy a MERN app with a REST API and a database.",
    ship: "Deployed full-stack app, plus the portfolio website.",
    items: [
      { t: "MERN Stack tasks (Tute Dude)", src: "Tute Dude · Upskill", type: "course", url: "https://upskill.tutedude.com/dashboard/tasks/mernstacktask", desc: "Hands-on MERN stack tasks: React, Node, Express and MongoDB.", why: "Your main course for this track." },
      { t: "Web Development folder", src: "Your Drive folder", type: "folder", url: DRIVE_F("1nIsWwF1ZiP1Ng2At-WFtcf2IS3o4CnE9"), desc: "Your web development notes and files.", why: "Keep your work here." }
    ]
  },
  {
    id: "fin", title: "Finance", weeks: "Mon, Wed, Fri", verb: "Model",
    premise: "Read financial statements, value companies and build a valuation model in Excel.",
    outcome: "Build a DCF valuation and explain its key assumptions.",
    ship: "Netflix valuation case study with a DCF model and write-up.",
    items: [
      { t: "Financial Modelling lecture (Tute Dude)", src: "Tute Dude · Upskill", type: "course", url: "https://upskill.tutedude.com/course/lecture-financialmodelling", desc: "Financial modelling in Excel.", why: "Start here for the valuation project." },
      { t: "Financial Markets", src: "Yale University · Coursera · 1 to 3 months", type: "course", url: RES_SEARCH("Financial Markets Yale Coursera Robert Shiller"), desc: "How markets work, from primary and secondary markets to market makers.", why: "Market foundations." },
      { t: "Introduction to Finance and Accounting Specialization", src: "University of Pennsylvania · Coursera · 3 to 6 months", type: "course", url: RES_SEARCH("Introduction to Finance and Accounting Specialization Pennsylvania Coursera"), desc: "Accounting and finance essentials for decision-making.", why: "Reading financial statements." },
      { t: "Introduction to Corporate Finance", src: "University of Pennsylvania · Coursera · 1 to 4 weeks", type: "course", url: RES_SEARCH("Introduction to Corporate Finance Pennsylvania Coursera"), desc: "Investment and financing decisions in companies.", why: "Core corporate finance." },
      { t: "Introduction to Financial Engineering and Risk Management", src: "Columbia University · Coursera · 1 to 3 months", type: "course", url: RES_SEARCH("Introduction to Financial Engineering and Risk Management Columbia Coursera"), desc: "Derivatives, risk and financial engineering basics.", why: "Risk measures for the valuation work." },
      { t: "Fundamentals of Financial Planning (Goldman Sachs 10,000 Women)", src: "Goldman Sachs · Coursera · 1 to 4 weeks", type: "course", url: RES_SEARCH("Fundamentals of Financial Planning Goldman Sachs 10,000 Women Coursera"), desc: "Personal and business financial planning.", why: "Short and practical." },
      { t: "Behavioral Finance", src: "Duke University · Coursera · 1 to 4 weeks", type: "course", url: RES_SEARCH("Behavioral Finance Duke Coursera"), desc: "Cognitive biases and how they affect investing.", why: "Judgement in valuation." },
      { t: "Fundamentals of Finance", src: "University of Pennsylvania · Coursera · 1 to 3 months", type: "course", url: RES_SEARCH("Fundamentals of Finance Pennsylvania Coursera"), desc: "Core finance concepts and tools.", why: "Broad foundations." },
      { t: "Introduction to Finance: The Basics", src: "University of Illinois Urbana-Champaign · Coursera · 1 to 4 weeks", type: "course", url: RES_SEARCH("Introduction to Finance The Basics Illinois Coursera"), desc: "The basic principles of finance.", why: "Short refresher." },
      { t: "Discounted Cash Flow Modeling", src: "Coursera Project Network · under 2 hours", type: "course", url: RES_SEARCH("Discounted Cash Flow Modeling Coursera Project Network"), desc: "Build a DCF model step by step.", why: "Directly needed for the project." },
      { t: "Corporate Finance Fundamentals", src: "Corporate Finance Institute · 1 to 3 months", type: "course", url: RES_SEARCH("Corporate Finance Institute Corporate Finance Fundamentals"), desc: "Corporate finance concepts for practitioners.", why: "Practitioner view." },
      { t: "Finance Drive folder (incl. Zerodha Varsity)", src: "Your Drive folder", type: "folder", url: DRIVE_F("1VPqfQszltX5Vetd6up3Jo1fQMPyvigCf"), desc: "Finance course list image and the Zerodha Varsity folder.", why: "Your finance files." }
    ]
  },
  {
    id: "sc", title: "Supply chain", weeks: "Tue, Thu, Sat, Sun", verb: "Analyse",
    premise: "Logistics, inventory, risk and network design, using the lecture slides and the Coursera course.",
    outcome: "Analyse an inventory and distribution problem and recommend a decision.",
    ship: "Supply chain case study and portfolio piece.",
    items: [
      { t: "Supply Chain Management specialization", src: "Coursera", type: "course", url: "https://www.coursera.org/specializations/supply-chain-management", desc: "Supply chain strategy, operations and analytics.", why: "Structured course." },
      { t: "SCM Slides folder", src: "Your Drive folder · 24 lecture slide decks", type: "folder", url: DRIVE_F("12LfUt-L4AFDlVTnHXJenYgbG5MopMi_b"), desc: "Lecture slides SCM-1 to SCM-24 with their original numbering.", why: "Open the lecture that matches the day." },
      { t: "SCM-1 Introduction (Lect#1)", src: "Lecture slides", type: "slides", url: DRIVE_F("12LfUt-L4AFDlVTnHXJenYgbG5MopMi_b"), desc: "What a supply chain is and why it matters.", why: "Start here." },
      { t: "SCM-2 Logistics Introduction (Lect#2)", src: "Lecture slides", type: "slides", url: DRIVE_F("12LfUt-L4AFDlVTnHXJenYgbG5MopMi_b"), desc: "Logistics basics.", why: "Next lecture." },
      { t: "SCM-3 and SCM-4 Performance (Lect#3, #4)", src: "Lecture slides", type: "slides", url: DRIVE_F("12LfUt-L4AFDlVTnHXJenYgbG5MopMi_b"), desc: "Measuring logistics performance.", why: "Metrics for the case study." },
      { t: "SCM-5 Drivers of Supply Chain (Lect#5)", src: "Lecture slides", type: "slides", url: DRIVE_F("12LfUt-L4AFDlVTnHXJenYgbG5MopMi_b"), desc: "Drivers that shape supply chain performance.", why: "Framework." },
      { t: "SCM-6 and SCM-7 Facility (Lect#6, #7)", src: "Lecture slides", type: "slides", url: DRIVE_F("12LfUt-L4AFDlVTnHXJenYgbG5MopMi_b"), desc: "Facility location decisions.", why: "Network design." },
      { t: "SCM-8 Centre of Gravity Method (Lect#8)", src: "Lecture slides", type: "slides", url: DRIVE_F("12LfUt-L4AFDlVTnHXJenYgbG5MopMi_b"), desc: "Locating a facility by weighted distance.", why: "Worked method." },
      { t: "SCM-9 to SCM-11 (Lect#9, #10, #11)", src: "Lecture slides", type: "slides", url: DRIVE_F("12LfUt-L4AFDlVTnHXJenYgbG5MopMi_b"), desc: "Capacity constraints and data aggregation.", why: "Capacity planning." },
      { t: "SCM-12 and SCM-13 Transport (Lect#12, #13)", src: "Lecture slides", type: "slides", url: DRIVE_F("12LfUt-L4AFDlVTnHXJenYgbG5MopMi_b"), desc: "Outbound transportation and vehicle routing.", why: "Routing." },
      { t: "SCM-14 to SCM-16 Bullwhip and Discounts (Lect#14, #15, #16)", src: "Lecture slides", type: "slides", url: DRIVE_F("12LfUt-L4AFDlVTnHXJenYgbG5MopMi_b"), desc: "Bullwhip effect, managing inventory and coordination by discounts.", why: "Demand distortion." },
      { t: "SCM-17 and SCM-18 Uncertainty (Lect#17, #18)", src: "Lecture slides", type: "slides", url: DRIVE_F("12LfUt-L4AFDlVTnHXJenYgbG5MopMi_b"), desc: "Customer segmentation, K-means and inventory under uncertainty.", why: "Inventory decisions." },
      { t: "SCM-19 and SCM-23 Periodic Review (Lect#19, #23)", src: "Lecture slides", type: "slides", url: DRIVE_F("12LfUt-L4AFDlVTnHXJenYgbG5MopMi_b"), desc: "Periodic review system with a case study.", why: "Case practice." },
      { t: "SCM-20 to SCM-24 Risk Pooling (Lect#20 to #24)", src: "Lecture slides", type: "slides", url: DRIVE_F("12LfUt-L4AFDlVTnHXJenYgbG5MopMi_b"), desc: "Risk pooling and final review.", why: "Wrap-up." },
      { t: "B Kay Tech Case Study and questions", src: "Case study folder", type: "slides", url: DRIVE_F("12LfUt-L4AFDlVTnHXJenYgbG5MopMi_b"), desc: "Case study with questions.", why: "Apply the frameworks." }
    ]
  },
  {
    id: "case", title: "Case prep (Consult)", weeks: "Daily, 1 hr", verb: "Solve",
    premise: "Structure and solve business cases using the IIM and ISB case books, plus guesstimates.",
    outcome: "Structure an unseen case in 5 minutes and recommend a decision.",
    ship: "One written case write-up per week.",
    items: [
      { t: "Case Prep Command Centre", src: "Your Drive folder (HTML)", type: "guide", url: DRIVE_F("1n7pw8DLDssMJ45shnex-7VqIxNhgr5sF"), desc: "Your case prep command centre.", why: "Start here each day." },
      { t: "ISB Consulting Casebook (CO2020)", src: "Indian School of Business · PDF", type: "book", url: "https://drive.google.com/file/d/1mzB56qEznaY1XYMo4ZVSZUuYXj3bVzte/view", desc: "Consulting cases from ISB.", why: "Practice cases." },
      { t: "MDI Gurgaon Consulting Case Book", src: "MDI · PDF", type: "book", url: "https://drive.google.com/file/d/1Brr9o8m6oTx14UbtBIq4jzNKp1YruOfN/view", desc: "Consulting cases.", why: "Practice cases." },
      { t: "IIT Guwahati Consulting Case Book", src: "IIT Guwahati · PDF", type: "book", url: "https://drive.google.com/file/d/1dkVAXXMRoPz29vz3Sku0kGqBUp7h3Oya/view", desc: "Consulting cases.", why: "Practice cases." },
      { t: "IIM Calcutta CaseBook 2024-25", src: "IIM Calcutta · PDF", type: "book", url: "https://drive.google.com/file/d/1Tbxa03Eeefr42NMaESWnGf8lztwO6dxp/view", desc: "Cases from IIM Calcutta.", why: "Latest cases." },
      { t: "IIMA Case Study", src: "IIM Ahmedabad · PDF", type: "book", url: "https://drive.google.com/file/d/1gRvF9FlLQ0SlLoRUpNlVgPEIITPj_Nsr/view", desc: "Case study from IIMA.", why: "Practice cases." },
      { t: "SRCC 180DC Case Book", src: "SRCC · PDF", type: "book", url: "https://drive.google.com/file/d/1ptwfh3G9ba1wqiyZS96u4iV7Kh3Z-I8D/view", desc: "Case book.", why: "Practice cases." },
      { t: "SRCC 180DC Guesstimates", src: "SRCC · PDF", type: "book", url: "https://drive.google.com/file/d/1rdbNfqTJuERkSN0Ru8_k0CRoz0AsSZl8/view", desc: "Market sizing and estimation questions.", why: "Guesstimate practice." },
      { t: "IIT Kharagpur PM Case Book", src: "IIT Kharagpur · PDF", type: "book", url: "https://drive.google.com/file/d/1miLREaVqgq3dizu7emQ4s9603SmlaPGu/view", desc: "Product and consulting cases.", why: "Crossover practice." }
    ]
  },
  {
    id: "prod", title: "Product management", weeks: "Daily, 1 hr", verb: "Define",
    premise: "Think like a product manager: frameworks, metrics, root cause analysis, and interview practice.",
    outcome: "Write a PRD, pick a metric and run a root cause analysis on a product problem.",
    ship: "PRD for an AI feature, plus one product case answer.",
    items: [
      { t: "Software Product Management, Course 1 (Introduction)", src: "Course map and glossary", type: "course", url: DRIVE_F("1g5Jn-rTVbj57qILvFsZXMcjcnF9mWB_M"), desc: "Introduction to software product management and the glossary.", why: "Vocabulary first." },
      { t: "Course 2: Software Processes and Agile Practices", src: "Course map", type: "course", url: DRIVE_F("1g5Jn-rTVbj57qILvFsZXMcjcnF9mWB_M"), desc: "Agile practice in product teams.", why: "Delivery process." },
      { t: "Course 3: Client Needs and Software Requirements", src: "Course map", type: "course", url: DRIVE_F("1g5Jn-rTVbj57qILvFsZXMcjcnF9mWB_M"), desc: "Eliciting needs and writing requirements.", why: "Needed for the PRD." },
      { t: "Course 4: Agile Planning for Software Products", src: "Course map", type: "course", url: DRIVE_F("1g5Jn-rTVbj57qILvFsZXMcjcnF9mWB_M"), desc: "Planning and prioritising work.", why: "Roadmaps." },
      { t: "Course 5: Reviews and Metrics", src: "Course map", type: "course", url: DRIVE_F("1g5Jn-rTVbj57qILvFsZXMcjcnF9mWB_M"), desc: "Metrics for software improvement.", why: "Measuring success." },
      { t: "Course 6: Software Product Management Capstone", src: "Course map", type: "course", url: DRIVE_F("1g5Jn-rTVbj57qILvFsZXMcjcnF9mWB_M"), desc: "Capstone project.", why: "Apply all six courses." },
      { t: "The Product Book (Product School)", src: "Product School · Drive", type: "book", url: DRIVE_F("1ROFHZ9kra3DtPuBnFu60kc7p9K8AbMiY"), desc: "Practical product management guide.", why: "Core reading." },
      { t: "A Mini Guide to Product Management", src: "Seniors Guide · Drive", type: "guide", url: DRIVE_F("1r3MX_qzVHfYJgIypsDaHed7sNLTPDnNp"), desc: "Short guide to product management.", why: "Quick read." },
      { t: "Cracking the PM Interview", src: "McDowell, Laakmann, Bavaro · Books To Read", type: "book", url: DRIVE_F("1uxZf8v7mbvmjz4B2Ri731wKnYyHpVcXm"), desc: "Product manager interview preparation.", why: "Interview prep." },
      { t: "The Product Manager Interview", src: "Lewis C. Lin, Teng Lu · Books To Read", type: "book", url: DRIVE_F("1uxZf8v7mbvmjz4B2Ri731wKnYyHpVcXm"), desc: "Product manager interview questions and answers.", why: "Interview practice." },
      { t: "Decode and Conquer", src: "Lewis C. Lin · Books To Read", type: "book", url: DRIVE_F("1uxZf8v7mbvmjz4B2Ri731wKnYyHpVcXm"), desc: "Answers to product management interview questions.", why: "Interview practice." },
      { t: "Swipe to Unlock", src: "Parth Detroja and others · Books To Read", type: "book", url: DRIVE_F("1uxZf8v7mbvmjz4B2Ri731wKnYyHpVcXm"), desc: "Primer on technology and business strategy.", why: "Strategy basics." },
      { t: "IIM Bangalore PM Case Book", src: "Product Management > Case Prep", type: "book", url: DRIVE_F("1aL0V1r4KvrHELT0213kYpfPbR1Usj8lQ"), desc: "Product management cases.", why: "Practice cases." },
      { t: "BITSoM Product Management Case Book", src: "Product Management > Case Prep", type: "book", url: DRIVE_F("1aL0V1r4KvrHELT0213kYpfPbR1Usj8lQ"), desc: "Product management cases.", why: "Practice cases." },
      { t: "IIT Kanpur Product Management Casebook 2024-25", src: "Product Management > Case Prep", type: "book", url: DRIVE_F("1aL0V1r4KvrHELT0213kYpfPbR1Usj8lQ"), desc: "Product management cases.", why: "Latest cases." },
      { t: "Preparing for Product Interviews", src: "Seniors Guide · Drive", type: "guide", url: DRIVE_F("1r3MX_qzVHfYJgIypsDaHed7sNLTPDnNp"), desc: "Preparing for product interviews.", why: "Interview prep." },
      { t: "AI Agent Academy for forward-deployed PMs", src: "Your Drive · ai-agent-academy.html", type: "guide", url: "https://drive.google.com/file/d/120ukK8ayku34EH55__pQ6twtf9oXkv1s/view", desc: "Phase-based AI agent curriculum for product managers.", why: "Shows the AI track for PMs." }
    ]
  },
  {
    id: "core", title: "Core metallurgy", weeks: "Daily, 2 hrs", verb: "Study",
    premise: "Each core subject has its own Drive folder with lectures, PYQs and assignments. Open the folder for the day's subject.",
    outcome: "Pass the core subjects and use the Gate syllabus as the target.",
    ship: "Solve the PYQs for each subject before its last day.",
    items: [
      { t: "Gate 2027 syllabus (MT)", src: "Core > Gate", type: "guide", url: "https://drive.google.com/file/d/1uWnJahhVTGdAjofktkO112TBt1h4Slm9/view", desc: "Metallurgy Gate 2027 syllabus.", why: "The target for every subject." },
      { t: "Previous Year folder (3rd to 6th sem)", src: "Core > Previous Year", type: "folder", url: DRIVE_F("1jDOmaZiHR2BUkEgsYNApCFFuf1Wj4lsg"), desc: "Semester folders with subjects, PYQs and labs.", why: "Find the subject folder here." },
      { t: "3rd sem: Metallurgical Thermodynamics", src: "Core folder", type: "folder", url: DRIVE_F("1Bv5ICqX2YNJSZzzBAVfpFSwH5wzyExX5"), desc: "Lectures, PYQs, assignments, textbook and solution manual.", why: "Largest subject folder." },
      { t: "3rd sem: Engineering Materials", src: "Core folder", type: "folder", url: DRIVE_F("17ImnzwDft9ZQ885OBgy73lzeF1OJoc5k"), desc: "Books, lecture notes and PYQs.", why: "Subject folder." },
      { t: "4th sem: Deformation", src: "Core folder", type: "folder", url: DRIVE_F("1ucCXZj-Yhh4_HQUhxYzoiu2UipAIAaQf"), desc: "Subject folder.", why: "Subject folder." },
      { t: "4th sem: Materials Processing", src: "Core folder", type: "folder", url: DRIVE_F("19JJPBg6OSg_CC1nS4wbDF3IvBozOga4r"), desc: "Subject folder.", why: "Subject folder." },
      { t: "4th sem: Transport Phenomena", src: "Core folder", type: "folder", url: DRIVE_F("1Tz9pMY_uRP8LZ5szYp6hM_lxl3fQ6OxC"), desc: "Subject folder.", why: "Subject folder." },
      { t: "4th sem: CAMP", src: "Core folder", type: "folder", url: DRIVE_F("1pYikAQeVjRES9ekhx4UT2cpHD7rnrxgT"), desc: "Subject folder.", why: "Subject folder." },
      { t: "4th sem: PYQs", src: "Core folder", type: "folder", url: DRIVE_F("1XG0KUwFCiNpFIUs4Py_mbOj165C5A0mX"), desc: "Previous year questions.", why: "Practice papers." },
      { t: "5th sem: Heat Treatment and Phase Transformations", src: "Core folder", type: "folder", url: DRIVE_F("1Lye8UyEKHqcomPwYNjkAXYmGe9b6aeQA"), desc: "Subject folder.", why: "Subject folder." },
      { t: "5th sem: Extractive Metallurgy", src: "Core folder", type: "folder", url: DRIVE_F("1zq8OOLpKE5D37_xQ65x_ywmNH4JLqkHV"), desc: "Subject folder.", why: "Subject folder." },
      { t: "5th sem: Corrosion", src: "Core folder", type: "folder", url: DRIVE_F("1p-dl1-NTM-W4DDFtrNRBk1OMJdE7_b3-"), desc: "Subject folder.", why: "Subject folder." },
      { t: "5th sem: Mechanical Working of Materials", src: "Core folder", type: "folder", url: DRIVE_F("1GiiyYMQEQvGe20N8xcFpH7GD-_iCvTu4"), desc: "Subject folder.", why: "Subject folder." },
      { t: "5th sem: Creep, Fatigue and Failure", src: "Core folder", type: "folder", url: DRIVE_F("1btInCBS-v7eh_ppo2BeDjSxzMeJnmQV3"), desc: "Subject folder.", why: "Subject folder." },
      { t: "6th sem: XRD and TEM (KD)", src: "Core folder", type: "folder", url: DRIVE_F("1z12OVc_ali08PxoDaACqDPo4jMswP9-n"), desc: "Subject folder.", why: "Subject folder." },
      { t: "6th sem: IMSM (GGR)", src: "Core folder", type: "folder", url: DRIVE_F("1RAY0clvkWmkIums4WIHTYxMCI27a0Wop"), desc: "Subject folder.", why: "Subject folder." },
      { t: "6th sem: POM (Sankha)", src: "Core folder", type: "folder", url: DRIVE_F("1p5m_No-OWLpYVgO-nnBLbFHNupVE8-Qo"), desc: "Subject folder.", why: "Subject folder." },
      { t: "6th sem: ENFM-CRB", src: "Core folder", type: "folder", url: DRIVE_F("1rPQjWpjBzrV5MSrG8Ku7ZJ8oHysb5m1z"), desc: "Subject folder.", why: "Subject folder." },
      { t: "6th sem: Material Characterization (JD)", src: "Core folder", type: "folder", url: DRIVE_F("17OKy6_HcOYwtXkareCF_gmCLjC4-2WNm"), desc: "Subject folder.", why: "Subject folder." }
    ]
  }
];
