// Abstract interfaces for platform-agnostic implementation

export interface CreateIssueParams {
  title: string;
  body: string;
  labels?: string[];
}

export interface IssueResult {
  number: number;
  url: string;
}

export interface GitHubClient {
  createIssue(params: CreateIssueParams): Promise<IssueResult>;
}

export interface Logger {
  info(message: string): void;
  debug(message: string): void;
  error(message: string): void;
}
