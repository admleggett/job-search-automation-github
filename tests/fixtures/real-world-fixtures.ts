// Real-world sample digest for integration testing
// This is a working digest that successfully creates GitHub issues

import { DigestResult } from "../../src/types";

export const realWorldSampleDigest: DigestResult = {
  query: {
    keywords: "software engineer",
    location: "Remote",
  },
  summary: {
    total_jobs_found: 2,
    new_jobs: 1,
    updated_jobs: 0,
    duplicates_removed: 0,
    processing_time_seconds: 3.2,
    sources_queried: ["Adzuna", "Stack Overflow"],
    date_range_processed: "2025-07-24 to 2025-07-31",
  },
  jobs: [
    {
      id: "adzuna-123456",
      title: "Senior TypeScript Developer",
      company: "TechCorp Solutions",
      location: "Remote",
      salary: "$90,000 - $120,000",
      url: "https://example.com/jobs/senior-typescript-developer",
      description:
        "Join our team to build scalable web applications using TypeScript, Node.js, and React. We're looking for someone with 5+ years of experience in modern web development.",
      requirements:
        "5+ years TypeScript/JavaScript experience, Node.js and React expertise, Experience with REST APIs, Remote work experience preferred",
      posted_date: "2025-07-30",
      source: "Adzuna",
      match_score: 0.95,
    },
    {
      id: "stackoverflow-789012",
      title: "Full Stack Engineer - JavaScript Focus",
      company: "StartupXYZ",
      location: "San Francisco, CA (Hybrid)",
      salary: "$85,000 - $110,000",
      url: "https://example.com/jobs/full-stack-engineer",
      description:
        "We're seeking a full stack engineer to help build our next-generation platform using modern JavaScript technologies.",
      requirements:
        "Strong JavaScript/TypeScript skills, Experience with React and Node.js, Understanding of database design, Startup experience a plus",
      posted_date: "2025-07-29",
      source: "Stack Overflow",
      match_score: 0.88,
    },
  ],
  metadata: {
    generated_at: "2025-07-31T10:30:00Z",
    version: "1.0.0",
    config_snapshot: {
      user_preferences: {
        keywords: ["typescript", "javascript"],
        locations: ["Remote"],
      },
    },
    errors: [],
    warnings: [],
  },
};

// JSON string version for testing string parsing
export const realWorldSampleDigestJson = JSON.stringify(
  realWorldSampleDigest,
  null,
  2
);
