import {
  DigestResult,
  IssueContent,
  JobListing,
  JobSummary,
  ProcessingMetadata,
} from "../types";

/**
 * Formats digest data into GitHub issue content
 */
export class IssueFormatter {
  /**
   * Format digest into GitHub issue title and body
   */
  format(digest: DigestResult): IssueContent {
    const jobCount = digest.summary.total_jobs_found;
    const title = this.formatTitle(jobCount, digest.summary.new_jobs);
    const body = this.formatBody(digest);

    return { title, body };
  }

  /**
   * Format issue title based on job count
   */
  private formatTitle(totalJobs: number, newJobs: number): string {
    if (totalJobs === 0) {
      return "📭 No New Job Opportunities Today";
    } else if (totalJobs === 1) {
      return "🎯 1 New Job Opportunity";
    } else {
      const newJobsText = newJobs > 0 ? ` (${newJobs} new)` : "";
      return `🎯 ${totalJobs} Job Opportunities${newJobsText}`;
    }
  }

  /**
   * Format issue body with job listings and metadata
   */
  private formatBody(digest: DigestResult): string {
    const { summary, jobs, metadata } = digest;
    const timestamp = new Date(metadata.generated_at).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    let body = `# Job Search Results - ${timestamp}\n\n`;

    // Summary section
    body += this.formatSummarySection(summary);

    // Handle empty results
    if (jobs.length === 0) {
      body += this.formatEmptyResultsSection();
      return body;
    }

    // Job listings section
    body += this.formatJobListingsSection(jobs);

    // Next steps section
    body += this.formatNextStepsSection(jobs.length);

    // Footer
    body += this.formatFooter(metadata);

    return body;
  }

  /**
   * Format summary section with statistics
   */
  private formatSummarySection(summary: JobSummary): string {
    let section = `## 📊 Summary\n\n`;
    section += `- **Total Jobs:** ${summary.total_jobs_found}`;

    if (summary.new_jobs > 0) {
      section += ` (${summary.new_jobs} new since last run)`;
    }

    section += `\n- **Sources:** ${summary.sources_queried.join(", ")}`;
    section += `\n- **Processing Time:** ${summary.processing_time_seconds.toFixed(
      2
    )}s`;

    if (summary.duplicates_removed > 0) {
      section += `\n- **Duplicates Removed:** ${summary.duplicates_removed}`;
    }

    section += `\n\n`;

    return section;
  }

  /**
   * Format section for when no jobs are found
   */
  private formatEmptyResultsSection(): string {
    let section = `## 🔍 No Jobs Found\n\n`;
    section += `No jobs matched your current search criteria today. Consider:\n\n`;
    section += `- 🔄 **Broadening search keywords** - try related terms or technologies\n`;
    section += `- 📍 **Expanding location preferences** - include remote or nearby cities\n`;
    section += `- 💰 **Adjusting salary expectations** - consider a wider range\n`;
    section += `- 📅 **Checking search date range** - extend to include older postings\n\n`;
    section += `The system will continue monitoring and notify you when new opportunities are found.\n\n`;

    return section;
  }

  /**
   * Format job listings section
   */
  private formatJobListingsSection(jobs: JobListing[]): string {
    let section = `## 💼 Job Opportunities\n\n`;

    // Sort jobs by match score (highest first), then by posted date (newest first)
    const sortedJobs = jobs.sort((a, b) => {
      const scoreA = a.match_score || 0;
      const scoreB = b.match_score || 0;

      if (scoreA !== scoreB) {
        return scoreB - scoreA; // Higher score first
      }

      // If scores are equal, sort by date (newer first)
      return (
        new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime()
      );
    });

    sortedJobs.forEach((job, index) => {
      section += this.formatJobListing(job, index + 1);

      // Add separator between jobs (but not after the last one)
      if (index < sortedJobs.length - 1) {
        section += "\n---\n\n";
      }
    });

    section += "\n\n";

    return section;
  }

  /**
   * Format individual job listing
   */
  private formatJobListing(job: JobListing, index: number): string {
    let listing = `### ${index}. ${job.title} at **${job.company}**\n\n`;

    // Add job metadata badges
    const metadata = [];
    if (job.location) metadata.push(`📍 ${job.location}`);
    if (job.salary) metadata.push(`💰 ${job.salary}`);
    if (job.job_type) metadata.push(`⏰ ${job.job_type}`);
    if (job.experience_level) metadata.push(`👨‍💼 ${job.experience_level}`);
    if (job.remote_option) metadata.push(`🏠 Remote Available`);
    if (job.match_score)
      metadata.push(`🎯 ${Math.round(job.match_score * 100)}% match`);

    if (metadata.length > 0) {
      listing += `${metadata.join(" • ")}\n\n`;
    }

    // Add description (truncated for readability)
    const description = this.truncateDescription(job.description, 300);
    listing += `${description}\n\n`;

    // Add requirements if available
    if (job.requirements) {
      const requirements = this.truncateDescription(job.requirements, 200);
      listing += `**Requirements:** ${requirements}\n\n`;
    }

    // Add match reasons if available
    if (job.match_reasons && job.match_reasons.length > 0) {
      listing += `**✨ Why this matches:** ${job.match_reasons.join(", ")}\n\n`;
    }

    // Add posted date
    const postedDate = this.formatDate(job.posted_date);
    listing += `**Posted:** ${postedDate}\n\n`;

    // Add action buttons
    listing += this.formatActionButtons(job);

    return listing;
  }

  /**
   * Format action buttons for job listing
   */
  private formatActionButtons(job: JobListing): string {
    const companySearchQuery = encodeURIComponent(
      `${job.company} company review salary culture`
    );
    const roleSearchQuery = encodeURIComponent(
      `${job.title} ${job.company} interview questions`
    );

    let buttons = `**🚀 Actions:**\n`;
    buttons += `- [**Apply Now**](${job.url}) 📝\n`;
    buttons += `- [Research Company](https://www.google.com/search?q=${companySearchQuery}) 🔍\n`;
    buttons += `- [Interview Prep](https://www.google.com/search?q=${roleSearchQuery}) 🎯\n`;

    return buttons;
  }

  /**
   * Format next steps section
   */
  private formatNextStepsSection(jobCount: number): string {
    let section = `## 🎯 Next Steps\n\n`;

    if (jobCount === 1) {
      section += `Ready to apply? Click the "Apply Now" button above to get started!\n\n`;
    } else {
      section += `Found ${jobCount} opportunities! Here's how to proceed:\n\n`;
      section += `1. **Review** each job listing above\n`;
      section += `2. **Research** companies that interest you\n`;
      section += `3. **Click "Apply Now"** to start the application process\n`;
      section += `4. **Prepare** for interviews using the interview prep links\n\n`;
    }

    section += `💡 **Tip:** Jobs with higher match scores (🎯) align better with your preferences.\n\n`;

    return section;
  }

  /**
   * Format footer with metadata
   */
  private formatFooter(metadata: ProcessingMetadata): string {
    let footer = `---\n\n`;
    footer += `<details>\n`;
    footer += `<summary>🤖 System Information</summary>\n\n`;
    footer += `- **Generated:** ${metadata.generated_at}\n`;

    if (metadata.version) {
      footer += `- **Version:** ${metadata.version}\n`;
    }

    if (metadata.warnings && metadata.warnings.length > 0) {
      footer += `- **Warnings:** ${metadata.warnings.length}\n`;
    }

    if (metadata.errors && metadata.errors.length > 0) {
      footer += `- **Errors:** ${metadata.errors.length}\n`;
    }

    footer += `\n*This digest was generated automatically by the Job Search Automation system.*\n`;
    footer += `</details>`;

    return footer;
  }

  /**
   * Truncate description to specified length with ellipsis
   */
  private truncateDescription(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }

    // Find the last space before the max length to avoid cutting words
    const truncated = text.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(" ");

    if (lastSpaceIndex > maxLength * 0.8) {
      return truncated.substring(0, lastSpaceIndex) + "...";
    }

    return truncated + "...";
  }

  /**
   * Format date string for display
   */
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffInDays === 0) {
        return "Today";
      } else if (diffInDays === 1) {
        return "Yesterday";
      } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    } catch (error) {
      return dateString; // Fallback to original string if parsing fails
    }
  }
}
