import { DigestResult } from "../types";

/**
 * Processes and validates digest data from the job search library
 */
export class DigestProcessor {
  /**
   * Parse JSON string and validate digest data structure
   */
  parse(jsonData: string): DigestResult {
    try {
      const data = JSON.parse(jsonData);
      this.validate(data);
      return data as DigestResult;
    } catch (error) {
      throw new Error(
        `Invalid digest data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Validate digest data structure and required fields
   */
  private validate(data: any): void {
    // Validate summary
    if (!data.summary || typeof data.summary !== "object") {
      throw new Error("Missing or invalid summary object");
    }

    if (typeof data.summary.total_jobs_found !== "number") {
      throw new Error("Missing or invalid total_jobs_found in summary");
    }

    if (typeof data.summary.new_jobs !== "number") {
      throw new Error("Missing or invalid new_jobs in summary");
    }

    if (!Array.isArray(data.summary.sources_queried)) {
      throw new Error("Missing or invalid sources_queried array in summary");
    }

    // Validate jobs array
    if (!Array.isArray(data.jobs)) {
      throw new Error("Jobs data must be an array");
    }

    // Validate each job has required fields
    for (let i = 0; i < data.jobs.length; i++) {
      const job = data.jobs[i];
      const jobContext = `Job at index ${i}`;

      if (!job.id || typeof job.id !== "string") {
        throw new Error(`${jobContext}: missing or invalid id field`);
      }

      if (!job.title || typeof job.title !== "string") {
        throw new Error(`${jobContext}: missing or invalid title field`);
      }

      if (!job.company || typeof job.company !== "string") {
        throw new Error(`${jobContext}: missing or invalid company field`);
      }

      if (!job.url || typeof job.url !== "string") {
        throw new Error(`${jobContext}: missing or invalid url field`);
      }

      if (!job.description || typeof job.description !== "string") {
        throw new Error(`${jobContext}: missing or invalid description field`);
      }

      if (!job.source || typeof job.source !== "string") {
        throw new Error(`${jobContext}: missing or invalid source field`);
      }

      if (!job.posted_date || typeof job.posted_date !== "string") {
        throw new Error(`${jobContext}: missing or invalid posted_date field`);
      }

      // Validate optional numeric fields
      if (
        job.match_score !== undefined &&
        (typeof job.match_score !== "number" ||
          job.match_score < 0 ||
          job.match_score > 1)
      ) {
        throw new Error(
          `${jobContext}: match_score must be a number between 0 and 1`
        );
      }
    }

    // Validate metadata
    if (!data.metadata || typeof data.metadata !== "object") {
      throw new Error("Missing or invalid metadata object");
    }

    if (
      !data.metadata.generated_at ||
      typeof data.metadata.generated_at !== "string"
    ) {
      throw new Error("Missing or invalid generated_at in metadata");
    }
  }

  /**
   * Get summary statistics for logging/monitoring
   */
  getSummaryStats(digest: DigestResult): {
    totalJobs: number;
    newJobs: number;
    sources: string[];
    avgMatchScore: number;
  } {
    const { summary, jobs } = digest;

    const matchScores = jobs
      .map((job) => job.match_score)
      .filter((score): score is number => typeof score === "number");

    const avgMatchScore =
      matchScores.length > 0
        ? matchScores.reduce((sum, score) => sum + score, 0) /
          matchScores.length
        : 0;

    return {
      totalJobs: summary.total_jobs_found,
      newJobs: summary.new_jobs,
      sources: summary.sources_queried,
      avgMatchScore: Math.round(avgMatchScore * 100) / 100,
    };
  }
}
