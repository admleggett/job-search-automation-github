// Core type definitions for the Job Search Automation system

export interface SearchQuery {
  keywords: string;
  location?: string;
  job_title?: string;
  company?: string;
  date_range?: string;
  additional_filters?: Record<string, any>;
}

export interface JobSummary {
  total_jobs_found: number;
  new_jobs: number;
  updated_jobs: number;
  duplicates_removed: number;
  processing_time_seconds: number;
  sources_queried: string[];
  date_range_processed?: string;
  filters_applied?: Record<string, any>;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location?: string;
  salary?: string;
  description: string;
  requirements?: string;
  benefits?: string;
  url: string;
  source: string;
  posted_date: string;
  application_deadline?: string;
  job_type?: string;
  experience_level?: string;
  remote_option?: boolean;
  tags?: string[];
  match_score?: number;
  match_reasons?: string[];
}

export interface ProcessingMetadata {
  generated_at: string;
  version?: string;
  config_snapshot?: Record<string, any>;
  errors?: string[];
  warnings?: string[];
}

export interface DigestResult {
  query: SearchQuery;
  summary: JobSummary;
  jobs: JobListing[];
  metadata: ProcessingMetadata;
}

export interface IssueContent {
  title: string;
  body: string;
}

// GitHub Action specific types
export interface ActionInputs {
  digestData: string;
  githubToken: string;
}

export interface ActionOutputs {
  issueNumber: string;
  issueUrl: string;
}
