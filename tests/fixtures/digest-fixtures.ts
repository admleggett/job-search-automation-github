// Test fixtures for DigestProcessor tests

import {
  DigestResult,
  JobListing,
  JobSummary,
  ProcessingMetadata,
  SearchQuery,
} from "../../src/types";

export const validSearchQuery: SearchQuery = {
  keywords: "software engineer",
  location: "Remote",
  job_title: "Senior Software Engineer",
  company: "TechCorp",
  date_range: "7days",
  additional_filters: {
    salary_min: 80000,
    experience_level: "senior",
  },
};

export const validJobSummary: JobSummary = {
  total_jobs_found: 3,
  new_jobs: 2,
  updated_jobs: 1,
  duplicates_removed: 0,
  processing_time_seconds: 2.5,
  sources_queried: ["Adzuna", "Stack Overflow"],
  date_range_processed: "2025-07-24 to 2025-07-31",
  filters_applied: {
    min_match_score: 0.6,
    excluded_companies: ["BadCorp"],
  },
};

export const validJobListing: JobListing = {
  id: "job-123",
  title: "Senior Software Engineer",
  company: "TechCorp Inc",
  location: "Remote",
  salary: "$100,000 - $120,000",
  description:
    "We are looking for a senior software engineer to join our team...",
  requirements: "Bachelor's degree in Computer Science, 5+ years experience",
  benefits: "Health insurance, 401k, flexible hours",
  url: "https://example.com/jobs/123",
  source: "Adzuna",
  posted_date: "2025-07-30T10:00:00Z",
  application_deadline: "2025-08-15T23:59:59Z",
  job_type: "full-time",
  experience_level: "senior",
  remote_option: true,
  tags: ["typescript", "react", "node.js"],
  match_score: 0.95,
  match_reasons: ["Remote work available", "Senior level", "Tech stack match"],
};

export const validProcessingMetadata: ProcessingMetadata = {
  generated_at: "2025-07-31T09:00:00Z",
  version: "1.0.0",
  config_snapshot: {
    user_preferences: {
      keywords: ["software engineer"],
      locations: ["Remote"],
    },
  },
  errors: [],
  warnings: ["API rate limit approaching"],
};

export const validDigestResult: DigestResult = {
  query: validSearchQuery,
  summary: validJobSummary,
  jobs: [validJobListing],
  metadata: validProcessingMetadata,
};

export const emptyDigestResult: DigestResult = {
  query: {
    keywords: "rare technology",
    location: "Antarctica",
  },
  summary: {
    total_jobs_found: 0,
    new_jobs: 0,
    updated_jobs: 0,
    duplicates_removed: 0,
    processing_time_seconds: 1.2,
    sources_queried: ["Adzuna", "Stack Overflow"],
  },
  jobs: [],
  metadata: {
    generated_at: "2025-07-31T09:00:00Z",
  },
};

export const multipleJobsDigestResult: DigestResult = {
  query: validSearchQuery,
  summary: {
    ...validJobSummary,
    total_jobs_found: 3,
  },
  jobs: [
    validJobListing,
    {
      ...validJobListing,
      id: "job-456",
      title: "Full Stack Developer",
      company: "StartupCorp",
      salary: "$90,000 - $110,000",
      match_score: 0.87,
      match_reasons: ["Full stack experience", "Startup environment"],
    },
    {
      ...validJobListing,
      id: "job-789",
      title: "Frontend Engineer",
      company: "DesignCorp",
      location: "San Francisco, CA",
      salary: "$95,000 - $115,000",
      remote_option: false,
      match_score: 0.72,
      match_reasons: ["Frontend focus", "Design collaboration"],
    },
  ],
  metadata: validProcessingMetadata,
};

// Invalid data samples for negative testing
export const invalidDigestSamples = {
  invalidJson: "invalid json string {",

  missingSummary: {
    query: validSearchQuery,
    jobs: [],
    metadata: validProcessingMetadata,
  },

  invalidSummaryType: {
    query: validSearchQuery,
    summary: "not an object",
    jobs: [],
    metadata: validProcessingMetadata,
  },

  missingTotalJobsFound: {
    query: validSearchQuery,
    summary: {
      new_jobs: 0,
      sources_queried: ["test"],
    },
    jobs: [],
    metadata: validProcessingMetadata,
  },

  invalidJobsArray: {
    query: validSearchQuery,
    summary: validJobSummary,
    jobs: "not an array",
    metadata: validProcessingMetadata,
  },

  jobMissingRequiredFields: {
    query: validSearchQuery,
    summary: validJobSummary,
    jobs: [
      {
        id: "job-incomplete",
        // Missing title, company, url, description, source, posted_date
      },
    ],
    metadata: validProcessingMetadata,
  },

  invalidMatchScore: {
    query: validSearchQuery,
    summary: validJobSummary,
    jobs: [
      {
        ...validJobListing,
        match_score: 1.5, // Should be between 0 and 1
      },
    ],
    metadata: validProcessingMetadata,
  },
};
