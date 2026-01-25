export const projects = [
  {
    title: "YAMWA (Yet Another Mobile Web App)",
    problemStatement: "A comprehensive mobile-first web app for students to manage their academic life, integrating timetables, event schedules, and exam details into a single, intuitive interface. This flagship project aimed to solve the disorganization students face when using multiple apps.",
    systemArchitecture: "A progressive web app (PWA) built with a React frontend. The backend is a set of microservices for handling user data, timetables, and notifications, communicating via a REST API. Real-time updates are pushed using WebSockets.",
    technologyStack: ["React", "Next.js", "PWA", "Node.js", "Express", "MongoDB", "WebSockets", "Tailwind CSS"],
    lessonsLearned: "Mastered the development of PWAs for a native-like experience, including offline support with service workers. Gained extensive experience in designing complex, stateful frontends and real-time backend systems.",
    imageId: "project-1",
  },
  {
    title: "Automated Financial Transaction Tracker",
    problemStatement: "Developed a system to automatically track and categorize financial transactions by processing SMS alerts from banks. It uses Natural Language Processing (NLP) to parse transaction details and provides users with budgeting insights.",
    systemArchitecture: "A serverless architecture using AWS Lambda to process incoming SMS messages forwarded via a service. NLP is handled by a custom model, and transaction data is stored in a secure SQL database. A React dashboard displays budgeting information.",
    technologyStack: ["Python", "NLTK", "AWS Lambda", "React", "PostgreSQL", "Twilio (for SMS)", "Docker"],
    lessonsLearned: "Gained practical experience in NLP for information extraction from unstructured text. Learned to build and deploy serverless applications, and developed a deeper understanding of personal finance and budgeting logic.",
    imageId: "project-2",
  },
  {
    title: "Secure Student Course Management API",
    problemStatement: "Designed and built a secure RESTful API for managing student course enrollments. The project included a simple UI for interaction and focused heavily on implementing robust authentication and authorization.",
    systemArchitecture: "A monolithic API built with Node.js and Express, using JWT for stateless authentication. It follows a standard CRUD pattern for course and student management. The accompanying UI is a simple single-page application.",
    technologyStack: ["Node.js", "Express", "JWT", "PostgreSQL", "React", "Docker", "Mocha", "Chai"],
    lessonsLearned: "Acquired in-depth knowledge of API security, specifically JWT-based authentication flows and role-based access control. Honed skills in creating well-documented, testable, and secure backend services from scratch.",
    imageId: "project-3",
  },
  {
    title: "E-Voting System Security Review",
    problemStatement: "Conducted a comprehensive security audit of a conceptual electronic voting system. The goal was to identify potential vulnerabilities, from the frontend interface to the backend database, and propose effective mitigation strategies.",
    systemArchitecture: "The review involved static and dynamic code analysis, penetration testing of the web interface and API endpoints, and a review of the cryptographic protocols used for vote casting and storage.",
    technologyStack: ["OWASP Top 10", "Burp Suite", "Nmap", "Cryptography", "Threat Modeling", "Static Analysis Tools"],
    lessonsLearned: "Developed a security-first mindset and gained hands-on experience with industry-standard penetration testing tools and methodologies. Learned to identify and articulate security risks and provide actionable recommendations.",
    imageId: "project-4",
  },
  {
    title: "Network Traffic Simulation & Analysis",
    problemStatement: "Created a simulation to model and analyze network traffic patterns in a corporate environment. The project focused on identifying bottlenecks and optimizing network performance through data analysis and visualization.",
    systemArchitecture: "A Python-based simulation using discrete-event simulation libraries. The generated data was processed and analyzed using Pandas and NumPy, with results visualized in a Jupyter Notebook and a simple web dashboard.",
    technologyStack: ["Python", "SimPy", "Pandas", "NumPy", "Matplotlib", "Jupyter", "Flask"],
    lessonsLearned: "Gained a strong foundation in simulation modeling and data analysis techniques. Learned to translate raw simulation output into meaningful insights and effectively communicate findings through data visualization.",
    imageId: "project-5",
  },
];

export const skills = {
  "Languages": ["JavaScript", "TypeScript", "Python", "SQL", "HTML5", "CSS3"],
  "Frameworks": ["React", "Next.js", "Node.js", "Express", "Flask", "Tailwind CSS"],
  "Data & ML": ["Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PostgreSQL", "MongoDB"],
  "Security": ["OAuth 2.0", "JWT", "OWASP Top 10", "Penetration Testing", "Cryptography"],
  "Dev Tools": ["Git", "Docker", "Kubernetes", "Jenkins", "Webpack", "Vite"],
};
