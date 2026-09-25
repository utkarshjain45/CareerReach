export interface RoleTemplate {
  id: string;
  role: string;
  category: 'Engineering' | 'Infrastructure' | 'AI & Data' | 'Mobile' | 'Leadership & Product' | 'Early Career';
  badge: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  tags: string[];
  suggestedAudience: string;
}

export const ROLE_CATEGORIES = [
  'All Roles',
  'Engineering',
  'Infrastructure',
  'AI & Data',
  'Mobile',
  'Leadership & Product',
  'Early Career',
] as const;

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'role-fullstack-dev',
    role: 'Full Stack Engineer',
    category: 'Engineering',
    badge: 'High Response Rate',
    name: 'Full Stack Engineer - System Impact & Speed',
    description: 'Balanced pitch demonstrating modern frontend execution, backend scaling, and production reliability.',
    subject: 'Full Stack Engineer (React & Node.js) interested in {{company}} engineering',
    body: `Hi {{name}},

I saw {{company}}'s recent engineering growth and wanted to reach out directly regarding full stack engineering opportunities.

I build resilient, user-centric web applications with end-to-end ownership. My core stack centers on React, TypeScript, Node.js, and cloud databases—taking ideas from database schema design to high-converting user interfaces.

A few quick references on my technical work:
• GitHub & Open Source: {{github}}
• Technical problem solving & algorithms: {{leetcode}}
• Portfolio & interactive demos: {{portfolio}}

I would love to learn more about the challenges {{company}} is tackling and share how I can contribute immediately to your product roadmap. Do you have 10 minutes next week for a brief conversation?

Best regards,`,
    tags: ['React', 'TypeScript', 'Node.js', 'Full Stack'],
    suggestedAudience: 'Engineering Managers, Founders, Tech Recruiters',
  },
  {
    id: 'role-frontend-eng',
    role: 'Frontend Engineer',
    category: 'Engineering',
    badge: 'Portfolio Driven',
    name: 'Frontend & UI/UX Engineer - Web Vitals & Polish',
    description: 'Tailored for UI/UX-focused developers highlighting performance, responsiveness, and clean design system architecture.',
    subject: "Frontend / React Engineer interested in {{company}}'s product design & UI",
    body: `Hi {{name}},

I’ve been following {{company}}'s product releases and really admire the polish and attention to detail in your user experience.

As a Frontend Engineer specializing in React, Next.js, and modern CSS architecture, I focus on building pixel-perfect, accessible interfaces that maintain 95+ Core Web Vitals scores and delightful micro-interactions.

Here are examples of interfaces and component systems I've engineered:
• Interactive Portfolio: {{portfolio}}
• Code repository & components: {{github}}

I'd be thrilled to bring this dedication to user delight and frontend performance to {{company}}. Are you open to a quick 10-minute chat regarding upcoming frontend needs?

Warmly,`,
    tags: ['React', 'Next.js', 'UI/UX', 'Performance'],
    suggestedAudience: 'Design Engineers, Frontend Leads, Product Teams',
  },
  {
    id: 'role-backend-systems',
    role: 'Backend Engineer',
    category: 'Engineering',
    badge: 'Infrastructure Focus',
    name: 'Backend & Distributed Systems - Concurrency & Scale',
    description: 'Aimed at systems, API, and platform engineers focused on throughput, database optimization, and high availability.',
    subject: "Backend Systems Engineer interested in {{company}}'s distributed infrastructure",
    body: `Hi {{name}},

I noticed {{company}}'s engineering team is scaling its platform infrastructure, and I'd love to connect regarding backend engineering roles.

My focus is on architecting high-throughput distributed systems, event-driven pipelines (Kafka / RabbitMQ), and performant relational & NoSQL databases. I prioritize sub-millisecond response times, zero-downtime migrations, and rigorous test coverage.

You can audit my code architecture and algorithmic problem solving here:
• GitHub projects & system designs: {{github}}
• Algorithmic solutions: {{leetcode}}

I would welcome the opportunity to discuss how my backend background can help {{company}} scale its services reliably. Would you have 10 minutes for a brief chat this week?

Thanks,`,
    tags: ['Go / Java / Python', 'Distributed Systems', 'PostgreSQL', 'APIs'],
    suggestedAudience: 'Backend Leads, Staff Engineers, Infrastructure Directors',
  },
  {
    id: 'role-devops-sre',
    role: 'DevOps & SRE',
    category: 'Infrastructure',
    badge: 'Reliability First',
    name: 'DevOps / SRE - Cloud Automation & Zero Downtime',
    description: 'Focused on Kubernetes, Infrastructure as Code, CI/CD automation, and cloud cost efficiency.',
    subject: 'DevOps / SRE Engineer exploring cloud infrastructure roles at {{company}}',
    body: `Hi {{name}},

I am reaching out because of {{company}}'s impressive product uptime and rapid release velocity.

As a DevOps / Platform Engineer, I specialize in automating resilient cloud infrastructure (AWS/GCP), container orchestration with Kubernetes, and robust CI/CD pipelines that turn 45-minute builds into 5-minute zero-downtime deployments. I treat infrastructure as code (Terraform) with rigorous security and observability (Prometheus/Grafana).

You can review my Terraform modules, Docker setups, and CI scripts on GitHub:
• GitHub: {{github}}

If {{company}} is looking to scale cloud reliability or developer velocity, I’d love to connect for 10 minutes. When might be a good time for you?

Best,`,
    tags: ['AWS / GCP', 'Kubernetes', 'Terraform', 'CI/CD'],
    suggestedAudience: 'DevOps Leads, Platform Directors, VP of Engineering',
  },
  {
    id: 'role-aiml-engineer',
    role: 'AI & ML Engineer',
    category: 'AI & Data',
    badge: 'Cutting Edge',
    name: 'AI / Machine Learning Engineer - LLMs & Production ML',
    description: 'Highlights practical model fine-tuning, RAG pipelines, data workflows, and low-latency inference.',
    subject: "Machine Learning / AI Engineer interested in {{company}}'s data & ML team",
    body: `Hi {{name}},

{{company}}'s work leveraging intelligent automation and AI is exciting, and I am reaching out to see if you have openings on your AI/ML or Data team.

I develop practical machine learning pipelines and modern LLM workflows (fine-tuning, RAG architectures, vector search, and model evaluation). My focus is on turning raw datasets and foundation models into low-latency, production-ready inference endpoints that solve concrete customer problems.

You can inspect my notebooks, model evaluations, and research code here:
• GitHub & Model Implementations: {{github}}
• Technical demonstrations & case studies: {{portfolio}}

I would appreciate the chance to discuss how I can help accelerate {{company}}'s AI roadmap. Would you be open to a quick introductory call?

Best regards,`,
    tags: ['PyTorch', 'LLMs & RAG', 'Python', 'Vector DBs'],
    suggestedAudience: 'Head of AI, Data Science Managers, ML Leads',
  },
  {
    id: 'role-mobile-app',
    role: 'Mobile Engineer',
    category: 'Mobile',
    badge: 'App Store Polish',
    name: 'Mobile App Engineer - Native & Cross-Platform',
    description: 'Emphasizes smooth 60fps UX, offline-first architectures, memory management, and cross-platform speed.',
    subject: 'Mobile App Engineer interested in {{company}} mobile products',
    body: `Hi {{name}},

I love using {{company}}'s mobile app and wanted to reach out regarding engineering roles on your mobile team.

I specialize in building performant, crash-free mobile applications (iOS / Swift / Flutter / React Native). I place heavy emphasis on offline-first caching, fluid 60fps animations, modular clean architecture, and streamlined App Store / Google Play release pipelines.

A few highlights of apps and code I've published:
• Published apps & design portfolio: {{portfolio}}
• GitHub repositories: {{github}}

I would love to help {{company}} build next-generation mobile experiences. Do you have a few minutes for a quick chat next week?

Warm regards,`,
    tags: ['iOS / Swift', 'Flutter', 'React Native', 'Mobile UX'],
    suggestedAudience: 'Mobile Leads, Product Managers, Engineering Managers',
  },
  {
    id: 'role-intern-newgrad',
    role: 'Intern / New Grad',
    category: 'Early Career',
    badge: 'High Energy',
    name: 'Intern & New Grad - Hunger, Algorithms & Fundamentals',
    description: 'Perfect for students and recent graduates highlighting quick ramp-up time, CS fundamentals, and project grit.',
    subject: '{{position}} Application – CS Graduate / Software Engineer interested in {{company}}',
    body: `Hi {{name}},

I am writing to express my strong interest in {{position}} opportunities at {{company}}.

As a motivated Computer Science graduate with hands-on project and hackathon experience, I have developed a strong foundation in data structures, algorithms, and full-stack software development. I pride myself on learning codebases quickly, asking insightful questions, and shipping clean, well-tested code from day one.

You can explore my problem solving track record and projects:
• LeetCode (ranked problem-solving solutions): {{leetcode}}
• GitHub (full-stack projects & contributions): {{github}}
• Personal Portfolio: {{portfolio}}

I would love the opportunity to contribute my energy and problem-solving skills to the team at {{company}}. Would you be available for a brief 10-minute chat?

Thank you for your time and consideration,`,
    tags: ['CS Fundamentals', 'Algorithms', 'Fast Learner', 'Intern / Junior'],
    suggestedAudience: 'University Recruiters, Hiring Managers, Early Career Leads',
  },
  {
    id: 'role-techlead-em',
    role: 'Engineering Manager',
    category: 'Leadership & Product',
    badge: 'Leadership',
    name: 'Engineering Manager & Tech Lead - Team Velocity & Architecture',
    description: 'Tailored for senior leaders balancing technical architecture, sprint execution, and developer mentorship.',
    subject: "Engineering Leadership / Tech Lead exploring {{company}}'s scaling journey",
    body: `Hi {{name}},

I've been closely following {{company}}'s technical growth and would love to connect regarding engineering leadership opportunities.

Over the past years, I've led cross-functional engineering pods, scaled distributed cloud architectures, and fostered collaborative developer cultures that consistently hit quarterly milestones without sacrificing code quality or team health.

A sample of my technical writing, architecture talks, and public work:
• Technical portfolio & writings: {{portfolio}}
• Open-source contributions: {{github}}

I would welcome a confidential conversation to learn more about {{company}}'s engineering leadership priorities and see where my experience might align. Are you available for a brief discussion this week?

Best regards,`,
    tags: ['Tech Lead', 'Mentorship', 'Agile Velocity', 'Architecture'],
    suggestedAudience: 'VPs of Engineering, CTOs, Founders',
  },
  {
    id: 'role-product-manager',
    role: 'Product Manager',
    category: 'Leadership & Product',
    badge: 'Impact Driven',
    name: 'Product Manager - Discovery & Measurable Growth',
    description: 'Designed for technical PMs who bridge customer research, engineering roadmaps, and measurable business outcomes.',
    subject: 'Product Manager interested in product innovation at {{company}}',
    body: `Hi {{name}},

I’ve been using {{company}} and am consistently impressed by how intuitively your team solves core user workflows.

As a Product Manager with a strong technical background, I specialize in defining clear product requirements, partnering closely with engineering and design to ship iterative features, and measuring impact through quantitative analytics and qualitative customer feedback loops.

You can view case studies of product launches I’ve driven:
• Product Portfolio & Case Studies: {{portfolio}}

I would love to learn more about {{company}}’s upcoming product challenges and discuss how my background can help drive key retention and growth metrics. Would you have 10 minutes for an introductory conversation?

Best,`,
    tags: ['Product Discovery', 'Metrics', 'Roadmaps', 'UX Research'],
    suggestedAudience: 'Head of Product, CPO, Product Directors',
  },
  {
    id: 'role-informational-chat',
    role: 'Networking & Culture',
    category: 'Engineering',
    badge: 'Highest Response Rate',
    name: '10-Minute Informational Chat - Team & Culture Discovery',
    description: 'Polite, low-friction networking request that opens doors by asking for advice rather than demanding a job.',
    subject: 'Quick 10-min chat regarding engineering culture at {{company}}?',
    body: `Hi {{name}},

I hope you're having a great week!

I’ve been following the engineering culture and product work coming out of {{company}}, and I have a great deal of respect for what your team is building.

I am an engineer currently exploring my next career step. Rather than a formal pitch, I would genuinely love to ask you a couple of brief questions about your experience at {{company}} and what qualities thrive most on your engineering team.

If you have 10 minutes for a quick virtual coffee sometime next week, I would be very grateful for your insights. Completely understand if your schedule is packed!

Either way, keep up the fantastic work at {{company}}.

Warmly,`,
    tags: ['Informational Interview', 'Networking', 'Low Friction'],
    suggestedAudience: 'Senior Engineers, Team Leads, Alumni',
  },
];
