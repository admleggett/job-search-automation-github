# Job Search Automation - GitHub Integration

A TypeScript-based GitHub integration service that automatically creates GitHub issues from job search digest data. Built with clean architecture principles using the adapter pattern for maximum flexibility and testability.

## 🌟 Features

- **Clean Architecture**: Dependency injection with abstract interfaces
- **Multiple Adapters**: Mock (testing), Local (development), GitHub Actions (production)
- **Comprehensive Testing**: 103 tests with real-world fixtures and GitHub API integration
- **Environment Management**: Secure `.env` configuration with example templates
- **TypeScript**: Full type safety with strict mode enabled
- **Real-World Validated**: Tested with actual GitHub API and working sample data

## 🏗️ Architecture

### Adapter Pattern Implementation

```
GitHubClient Interface
├── MockGitHubClient (Unit Testing)
├── LocalGitHubAdapter (Local Development)
└── GitHubActionsAdapter (Production - Future)

Logger Interface
├── ConsoleLogger (Local Development)
└── GitHubActionsLogger (Production - Future)
```

### Core Services

- **DigestProcessor**: Transforms job digest data into GitHub-ready format
- **IssueFormatter**: Generates markdown content with job listings and metadata
- **JobDigestService**: Main orchestrator coordinating all components

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- GitHub Personal Access Token (for local testing)
- TypeScript knowledge

### Installation

```bash
# Clone the repository
git clone https://github.com/admleggett/job-search-automation.git
cd job-search-automation-github

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your GitHub credentials
```

### Environment Configuration

Create a `.env` file from the example:

```bash
# GitHub Configuration
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_test_repository_name

# Optional: Logging Configuration
LOG_LEVEL=info
DEBUG_GITHUB_API=false
```

See [Environment Setup Guide](docs/ENVIRONMENT_SETUP.md) for detailed configuration instructions.

## 🧪 Testing

### Run All Tests
```bash
npm test
```

**Results**: 103 tests passing
- Unit tests: 91 tests
- Integration tests: 12 tests (includes real GitHub API calls)

### Local Development Testing
```bash
npm run test-local [digest-file.json]
```

If no digest file is provided, uses built-in real-world sample fixture.

### Test Coverage
```bash
npm run test:coverage
```

View coverage report: `coverage/index.html`

## 📊 Usage Examples

### Basic Usage with Sample Data

```typescript
import { JobDigestService } from './src/services/job-digest.service';
import { LocalGitHubAdapter } from './src/adapters/local-github.adapter';
import { ConsoleLogger } from './src/adapters/console-logger.adapter';

const githubClient = new LocalGitHubAdapter();
const logger = new ConsoleLogger();
const service = new JobDigestService(githubClient, logger);

const result = await service.createDigestIssue(digestData);
console.log(`Created issue: ${result.url}`);
```

### Real-World Integration

The service processes job digest data like this:

```json
{
  "summary": {
    "total_jobs_found": 2,
    "new_jobs": 1,
    "sources_queried": ["Adzuna", "Stack Overflow"],
    "processing_time_seconds": 3.2
  },
  "jobs": [
    {
      "title": "Senior TypeScript Developer",
      "company": "TechCorp Solutions",
      "location": "Remote",
      "salary": "$90,000 - $120,000",
      "match_score": 0.95
    }
  ]
}
```

And creates formatted GitHub issues with:
- 📊 Executive summary with statistics
- 💼 Detailed job listings with match scores
- 🚀 Quick action links (Apply, Research, Interview Prep)
- 🎯 Next steps guidance

## 📁 Project Structure

```
src/
├── adapters/           # Implementation adapters
│   ├── local-github.adapter.ts    # Local development with REST API
│   └── console-logger.adapter.ts  # Console logging implementation
├── interfaces/         # Abstract interfaces
│   ├── github-client.interface.ts
│   └── logger.interface.ts
├── services/          # Core business logic
│   ├── job-digest.service.ts      # Main orchestrator
│   ├── digest-processor.ts        # Data transformation
│   └── issue-formatter.ts         # Markdown generation
└── types/             # TypeScript type definitions

tests/
├── fixtures/          # Test data fixtures
│   ├── real-world-fixtures.ts     # Working sample converted
│   ├── integration-fixtures.ts    # Integration scenarios
│   └── digest-fixtures.ts         # Unit test data
├── unit/              # Unit tests (91 tests)
└── integration/       # Integration tests (12 tests)
```

## 🔧 Development

### Available Scripts

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test-local    # Test local GitHub integration
npm run build         # Build TypeScript
npm run lint          # Run ESLint
npm run format        # Format with Prettier
```

### Adding New Adapters

1. Implement the interface:
```typescript
export class MyAdapter implements GitHubClient {
  async createIssue(data: IssueData): Promise<IssueResult> {
    // Your implementation
  }
}
```

2. Add tests in `tests/unit/adapters/`
3. Update the service to use your adapter

## 📚 Documentation

- [Environment Setup Guide](docs/ENVIRONMENT_SETUP.md) - Detailed `.env` configuration
- [Testing Outside Actions](docs/TESTING_OUTSIDE_ACTIONS.md) - Local development guide
- [Technical Design](docs/TECHNICAL_DESIGN.md) - Architecture decisions
- [Implementation Tasks](docs/IMPLEMENTATION_TASKS.md) - Development roadmap

## 🌍 Integration with Python Core

This TypeScript service is designed to work with the [Job Search Automation Core Library](../job-search-automation/) Python project:

1. Python core generates digest JSON files
2. This service processes them into GitHub issues
3. Can be triggered via GitHub Actions or run locally

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Ensure all tests pass (`npm test`)
5. Submit a pull request

## 📄 License

This project is part of the Job Search Automation suite. See LICENSE for details.

---

**Built with ❤️ using TypeScript, Jest, and clean architecture principles.**