// Integration test fixtures for end-to-end pipeline testing
// These fixtures represent real-world data scenarios from the Python job-search-automation library

import { DigestResult } from "../../src/types";

// Real-world scenario: Daily job search run with mixed results
export const realWorldDigestResult: DigestResult = {
  query: {
    keywords: "senior software engineer python",
    location: "Remote",
    job_title: "Senior Software Engineer",
    date_range: "24hours",
    additional_filters: {
      salary_min: 100000,
      experience_level: "senior",
      remote_only: true,
    },
  },
  summary: {
    total_jobs_found: 15,
    new_jobs: 8,
    updated_jobs: 3,
    duplicates_removed: 12,
    processing_time_seconds: 45.67,
    sources_queried: [
      "LinkedIn",
      "Indeed",
      "Stack Overflow",
      "AngelList",
      "Glassdoor",
    ],
    date_range_processed: "2025-07-30 to 2025-07-31",
    filters_applied: {
      min_match_score: 0.7,
      excluded_companies: ["Meta", "Amazon"],
      max_commute_distance: 0,
    },
  },
  jobs: [
    {
      id: "linkedin-12345",
      title: "Senior Python Engineer - AI/ML Focus",
      company: "TechVision AI",
      location: "Remote (US)",
      salary: "$140,000 - $180,000",
      description:
        "Join our cutting-edge AI team building the next generation of machine learning platforms. We're looking for a senior Python engineer with deep expertise in distributed systems, data engineering, and ML infrastructure. You'll work on large-scale data pipelines processing millions of records daily, design robust APIs for ML model deployment, and collaborate with world-class data scientists and engineers.",
      requirements:
        "7+ years Python development, Experience with Django/Flask, AWS/GCP cloud platforms, Docker/Kubernetes, Machine Learning frameworks (TensorFlow, PyTorch), Strong background in distributed systems",
      benefits:
        "Unlimited PTO, Health/Dental/Vision, $5k learning budget, Remote-first culture, Stock options, Flexible hours",
      url: "https://linkedin.com/jobs/view/12345",
      source: "LinkedIn",
      posted_date: "2025-07-31T06:30:00Z",
      application_deadline: "2025-08-30T23:59:59Z",
      job_type: "full-time",
      experience_level: "senior",
      remote_option: true,
      tags: ["python", "ai", "ml", "aws", "kubernetes", "remote"],
      match_score: 0.95,
      match_reasons: [
        "Perfect salary match",
        "Senior level requirement",
        "Remote work available",
        "Python expertise focus",
        "AI/ML specialization",
      ],
    },
    {
      id: "stackoverflow-67890",
      title: "Staff Software Engineer - Platform Engineering",
      company: "DevTools Inc",
      location: "Remote Worldwide",
      salary: "$160,000 - $220,000 + equity",
      description:
        "Lead the development of our developer platform serving 50M+ developers worldwide. Build scalable infrastructure, design elegant APIs, and mentor junior engineers. Our stack includes Python, Go, PostgreSQL, Redis, and runs on Kubernetes.",
      requirements:
        "8+ years software engineering experience, Strong Python and Go skills, Experience with large-scale distributed systems, Leadership experience mentoring teams, Database design and optimization experience",
      benefits:
        "4-day work week, Unlimited PTO, Top-tier health insurance, $10k equipment budget, Conference attendance, Stock options with high growth potential",
      url: "https://stackoverflow.com/jobs/67890",
      source: "Stack Overflow",
      posted_date: "2025-07-31T10:15:00Z",
      job_type: "full-time",
      experience_level: "staff",
      remote_option: true,
      tags: ["python", "go", "platform", "leadership", "kubernetes"],
      match_score: 0.92,
      match_reasons: [
        "Above target salary range",
        "Staff level opportunity",
        "Global remote policy",
        "Platform engineering focus",
        "Leadership component",
      ],
    },
    {
      id: "indeed-45612",
      title: "Senior Backend Engineer",
      company: "FinTech Innovations",
      location: "New York, NY (Remote OK)",
      salary: "$130,000 - $165,000",
      description:
        "Build secure, scalable financial services infrastructure. Work with payment processing, real-time fraud detection, and regulatory compliance systems. Heavy focus on Python microservices architecture.",
      requirements:
        "5+ years Python development, Financial services experience preferred, Microservices architecture, Security-first mindset, Experience with payment systems",
      benefits:
        "Health insurance, 401k matching, Flexible PTO, Learning stipend, Hybrid remote options",
      url: "https://indeed.com/jobs/view/45612",
      source: "Indeed",
      posted_date: "2025-07-30T14:22:00Z",
      application_deadline: "2025-08-15T23:59:59Z",
      job_type: "full-time",
      experience_level: "senior",
      remote_option: true,
      tags: ["python", "fintech", "microservices", "security", "payments"],
      match_score: 0.88,
      match_reasons: [
        "Strong salary match",
        "Remote flexibility",
        "Python-focused role",
        "Senior level position",
      ],
    },
    {
      id: "angellist-78901",
      title: "Founding Engineer - Python/Data",
      company: "DataStream Startup",
      location: "San Francisco, CA / Remote",
      salary: "$120,000 - $150,000 + 0.5% equity",
      description:
        "Join as employee #5 at a fast-growing data analytics startup. Build our core data processing engine from the ground up. Opportunity to shape technology decisions and company culture.",
      requirements:
        "4+ years Python development, Startup experience preferred, Data engineering background, Self-motivated and entrepreneurial, Comfortable with ambiguity",
      benefits:
        "Significant equity upside, Flexible schedule, Health insurance, Learning budget, Ground floor opportunity",
      url: "https://angel.co/company/datastream/jobs/78901",
      source: "AngelList",
      posted_date: "2025-07-31T08:45:00Z",
      job_type: "full-time",
      experience_level: "mid-senior",
      remote_option: true,
      tags: ["python", "startup", "data", "founding", "equity"],
      match_score: 0.85,
      match_reasons: [
        "High equity potential",
        "Remote option available",
        "Python specialization",
        "Data engineering focus",
      ],
    },
    {
      id: "glassdoor-23456",
      title: "Senior Software Engineer - DevOps",
      company: "CloudScale Systems",
      location: "Austin, TX (Remote Friendly)",
      salary: "$125,000 - $155,000",
      description:
        "Build and maintain CI/CD pipelines, infrastructure as code, and monitoring systems. Python automation scripts, Terraform, and Kubernetes expertise required.",
      requirements:
        "6+ years software engineering, Strong DevOps/Infrastructure experience, Python scripting expertise, Terraform and Kubernetes required, Cloud platforms (AWS/Azure/GCP)",
      benefits:
        "Comprehensive health benefits, 401k with matching, Professional development fund, Flexible work arrangements, Team retreats",
      url: "https://glassdoor.com/job/23456",
      source: "Glassdoor",
      posted_date: "2025-07-30T16:30:00Z",
      job_type: "full-time",
      experience_level: "senior",
      remote_option: true,
      tags: ["python", "devops", "kubernetes", "terraform", "automation"],
      match_score: 0.82,
      match_reasons: [
        "Good salary range",
        "Remote friendly policy",
        "Python automation focus",
        "Senior level match",
      ],
    },
  ],
  metadata: {
    generated_at: "2025-07-31T12:00:00Z",
    version: "2.1.4",
    config_snapshot: {
      user_preferences: {
        keywords: ["python", "senior", "remote"],
        locations: ["Remote", "San Francisco", "New York", "Austin"],
        salary_range: { min: 100000, max: 200000 },
        company_blacklist: ["Meta", "Amazon"],
      },
      scraper_settings: {
        max_pages_per_source: 5,
        request_delay_seconds: 2,
        user_agent_rotation: true,
      },
    },
    errors: [],
    warnings: [
      "Rate limit warning for LinkedIn API",
      "Some job descriptions were truncated due to length",
    ],
  },
};

// Edge case: High-volume job market (100+ results)
export const highVolumeDigestResult: DigestResult = {
  query: {
    keywords: "software engineer",
    location: "San Francisco Bay Area",
    date_range: "7days",
  },
  summary: {
    total_jobs_found: 147,
    new_jobs: 89,
    updated_jobs: 31,
    duplicates_removed: 203,
    processing_time_seconds: 127.89,
    sources_queried: ["LinkedIn", "Indeed", "Glassdoor", "AngelList", "Dice"],
    date_range_processed: "2025-07-24 to 2025-07-31",
  },
  jobs: Array.from({ length: 147 }, (_, i) => ({
    id: `bulk-job-${i + 1}`,
    title: `Software Engineer ${i + 1}`,
    company: `Tech Company ${String.fromCharCode(65 + (i % 26))}`,
    location: i % 3 === 0 ? "Remote" : "San Francisco, CA",
    salary: `$${90000 + i * 1000} - $${120000 + i * 1000}`,
    description: `Join our engineering team to build innovative solutions. Role ${
      i + 1
    } focuses on modern web technologies and scalable architecture.`,
    url: `https://example.com/jobs/${i + 1}`,
    source: ["LinkedIn", "Indeed", "Glassdoor"][i % 3],
    posted_date: `2025-07-${25 + (i % 6)}T${8 + (i % 12)}:00:00Z`,
    job_type: "full-time",
    experience_level: ["junior", "mid", "senior"][i % 3],
    remote_option: i % 4 === 0,
    match_score: 0.6 + (i % 40) / 100, // Scores from 0.6 to 0.99
    match_reasons: ["Location match", "Experience level", "Technology stack"],
  })),
  metadata: {
    generated_at: "2025-07-31T12:00:00Z",
    version: "2.1.4",
    warnings: ["Large result set may impact performance"],
    errors: [],
  },
};

// Error scenario: Partial failures with mixed success
export const partialFailureDigestResult: DigestResult = {
  query: {
    keywords: "blockchain developer",
    location: "Remote",
    date_range: "3days",
  },
  summary: {
    total_jobs_found: 3,
    new_jobs: 3,
    updated_jobs: 0,
    duplicates_removed: 1,
    processing_time_seconds: 89.45,
    sources_queried: ["CryptoJobs", "AngelList", "LinkedIn"],
    date_range_processed: "2025-07-28 to 2025-07-31",
  },
  jobs: [
    {
      id: "crypto-12345",
      title: "Senior Blockchain Engineer",
      company: "DeFi Protocol",
      location: "Remote",
      salary: "$150,000 - $200,000 + tokens",
      description:
        "Build the next generation of decentralized finance protocols. Smart contract development, tokenomics design, and cross-chain integration.",
      requirements:
        "5+ years Solidity development, DeFi protocol experience, Web3 expertise, Understanding of tokenomics",
      url: "https://cryptojobs.com/12345",
      source: "CryptoJobs",
      posted_date: "2025-07-31T09:00:00Z",
      job_type: "full-time",
      experience_level: "senior",
      remote_option: true,
      tags: ["blockchain", "solidity", "defi", "web3"],
      match_score: 0.91,
      match_reasons: [
        "Blockchain specialization",
        "Remote work",
        "High compensation",
        "Senior level",
      ],
    },
    {
      id: "angel-67890",
      title: "Web3 Full Stack Developer",
      company: "NFT Marketplace",
      location: "Remote",
      salary: "$120,000 - $160,000",
      description:
        "Full stack development for NFT marketplace platform. React frontend, Node.js backend, smart contract integration.",
      requirements:
        "3+ years full stack development, React/Node.js expertise, Smart contract integration experience, Web3 libraries (ethers.js, web3.js)",
      url: "https://angel.co/nft-marketplace/67890",
      source: "AngelList",
      posted_date: "2025-07-30T15:30:00Z",
      job_type: "full-time",
      experience_level: "mid",
      remote_option: true,
      tags: ["web3", "react", "nodejs", "nft"],
      match_score: 0.84,
      match_reasons: [
        "Full stack match",
        "Remote available",
        "Web3 focus",
        "Good salary range",
      ],
    },
    {
      id: "linkedin-11111",
      title: "Blockchain Research Engineer",
      company: "Crypto Research Lab",
      location: "Remote",
      salary: "Competitive + research grants",
      description:
        "Conduct cutting-edge research in blockchain scalability, consensus mechanisms, and cryptographic protocols. Publish papers and implement research prototypes.",
      requirements:
        "PhD in Computer Science or related field, Strong cryptography background, Research publication history, Protocol design experience",
      url: "https://linkedin.com/jobs/11111",
      source: "LinkedIn",
      posted_date: "2025-07-29T11:00:00Z",
      job_type: "full-time",
      experience_level: "senior",
      remote_option: true,
      tags: ["blockchain", "research", "cryptography", "protocols"],
      match_score: 0.76,
      match_reasons: [
        "Research focus",
        "Remote work",
        "Advanced blockchain tech",
        "Academic environment",
      ],
    },
  ],
  metadata: {
    generated_at: "2025-07-31T12:00:00Z",
    version: "2.1.4",
    warnings: [
      "CryptoJobs API returned partial results",
      "Some salary information incomplete",
    ],
    errors: [
      "Failed to fetch from RemoteOK: Connection timeout",
      "Indeed blocked request: Rate limit exceeded",
    ],
  },
};

// Success story: Perfect match scenario
export const perfectMatchDigestResult: DigestResult = {
  query: {
    keywords: "senior python django remote",
    location: "Remote",
    job_title: "Senior Python Developer",
    date_range: "1day",
    additional_filters: {
      salary_min: 120000,
      remote_only: true,
      experience_level: "senior",
    },
  },
  summary: {
    total_jobs_found: 2,
    new_jobs: 2,
    updated_jobs: 0,
    duplicates_removed: 0,
    processing_time_seconds: 12.34,
    sources_queried: ["Stack Overflow", "Python.org Jobs"],
    date_range_processed: "2025-07-31 to 2025-07-31",
    filters_applied: {
      min_match_score: 0.8,
      salary_threshold: 120000,
      remote_required: true,
    },
  },
  jobs: [
    {
      id: "python-dream-job",
      title: "Senior Python Engineer - Django Specialist",
      company: "Django Software Foundation",
      location: "100% Remote",
      salary: "$140,000 - $170,000",
      description:
        "Join the core Django team to work on the framework used by millions of developers worldwide. Contribute to Django's evolution, work on performance optimizations, and shape the future of web development in Python.",
      requirements:
        "8+ years Python/Django development, Core contributor experience preferred, Strong understanding of web frameworks, Database optimization expertise, Open source contribution history",
      benefits:
        "100% remote work, Flexible hours across time zones, Conference speaking opportunities, Direct impact on global developer community, Comprehensive health benefits, Professional development budget",
      url: "https://www.djangoproject.com/jobs/senior-engineer",
      source: "Python.org Jobs",
      posted_date: "2025-07-31T08:00:00Z",
      application_deadline: "2025-08-31T23:59:59Z",
      job_type: "full-time",
      experience_level: "senior",
      remote_option: true,
      tags: ["python", "django", "open-source", "remote", "web-framework"],
      match_score: 0.98,
      match_reasons: [
        "Perfect Django specialization match",
        "100% remote position",
        "Salary exceeds requirements",
        "Senior level alignment",
        "Python framework focus",
        "Open source contribution opportunity",
      ],
    },
    {
      id: "stackoverflow-python-role",
      title: "Staff Python Engineer - Platform Team",
      company: "Stack Overflow",
      location: "Remote (US/EU timezones)",
      salary: "$160,000 - $200,000 + equity",
      description:
        "Help build and scale the platform that serves 100 million developers monthly. Work on high-performance Python services, data pipelines, and developer tools that power the world's largest developer community.",
      requirements:
        "7+ years Python development experience, Large-scale system design, Performance optimization expertise, Experience with developer tools, Strong communication skills for distributed team",
      benefits:
        "Unlimited PTO, Top-tier health insurance, Home office setup budget, Annual company retreats, Stock options, Professional development fund, Access to Stack Overflow's internal tools and data",
      url: "https://stackoverflow.com/company/careers/staff-python-engineer",
      source: "Stack Overflow",
      posted_date: "2025-07-31T10:30:00Z",
      job_type: "full-time",
      experience_level: "staff",
      remote_option: true,
      tags: ["python", "platform", "scale", "developer-tools", "community"],
      match_score: 0.96,
      match_reasons: [
        "Staff level opportunity",
        "Python platform specialization",
        "Remote-first culture",
        "Above target salary range",
        "Developer community impact",
        "High-scale system experience",
      ],
    },
  ],
  metadata: {
    generated_at: "2025-07-31T12:00:00Z",
    version: "2.1.4",
    config_snapshot: {
      user_preferences: {
        target_companies: ["Django Software Foundation", "Stack Overflow"],
        preferred_frameworks: ["django", "flask"],
        career_goals: ["open-source", "developer-tools", "platform"],
      },
    },
    errors: [],
    warnings: [],
  },
};

// Minimal case: Single job found
export const singleJobDigestResult: DigestResult = {
  query: {
    keywords: "rust systems programming",
    location: "Remote",
    date_range: "1day",
  },
  summary: {
    total_jobs_found: 1,
    new_jobs: 1,
    updated_jobs: 0,
    duplicates_removed: 0,
    processing_time_seconds: 5.67,
    sources_queried: ["Rust Jobs"],
    date_range_processed: "2025-07-31 to 2025-07-31",
  },
  jobs: [
    {
      id: "rust-systems-role",
      title: "Systems Engineer - Rust",
      company: "Performance Computing Inc",
      location: "Remote",
      salary: "$130,000 - $160,000",
      description:
        "Build high-performance systems software in Rust. Work on distributed computing, memory safety, and concurrent programming challenges.",
      requirements:
        "4+ years systems programming, Strong Rust experience, Understanding of memory management, Concurrent programming expertise",
      url: "https://rustjobs.dev/rust-systems-role",
      source: "Rust Jobs",
      posted_date: "2025-07-31T07:15:00Z",
      job_type: "full-time",
      experience_level: "senior",
      remote_option: true,
      tags: ["rust", "systems", "performance", "concurrent"],
      match_score: 0.89,
      match_reasons: [
        "Rust specialization",
        "Systems programming focus",
        "Remote work available",
        "Good salary match",
      ],
    },
  ],
  metadata: {
    generated_at: "2025-07-31T12:00:00Z",
    version: "2.1.4",
    errors: [],
    warnings: [],
  },
};

// Export all integration test fixtures
export const integrationFixtures = {
  realWorldDigest: realWorldDigestResult,
  highVolumeDigest: highVolumeDigestResult,
  partialFailureDigest: partialFailureDigestResult,
  perfectMatchDigest: perfectMatchDigestResult,
  singleJobDigest: singleJobDigestResult,
};
