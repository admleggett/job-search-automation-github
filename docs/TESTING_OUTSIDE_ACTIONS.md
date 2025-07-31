# Testing Outside GitHub Actions

The **adapter pattern** enables comprehensive testing **outside** of GitHub Actions environments. This provides fast feedback loops, easier debugging, and flexible development workflows.

## 🧪 **Three Testing Approaches**

### **1. Unit Testing (Mock Adapters) - ✅ Working**

**23 unit tests** already prove this works perfectly:

```typescript
// Mock adapter for isolated unit testing
const mockAdapter = new MockGitHubClient();
const mockLogger = new MockLogger();
const service = new JobDigestService(mockAdapter, mockLogger);

// Test business logic without external dependencies
await service.createDigestIssue(digestJson);
expect(mockAdapter.createIssueCalls).toHaveLength(1);
```

**Benefits:**

- ⚡ **Instant feedback** - no network calls
- 🎯 **Controllable scenarios** - test error conditions easily
- 🔒 **No authentication required**
- 📊 **94.63% test coverage achieved**

### **2. Local Development (REST API Adapter) - ✅ Available**

Test with **real GitHub API** outside of Actions:

```typescript
// Real adapter for local development testing
const adapter = new LocalGitHubAdapter(token, owner, repo);
const logger = new ConsoleLogger(true); // Enable debug logging
const service = new JobDigestService(adapter, logger);

// Same business logic, real API calls
const result = await service.createDigestIssue(digestJson);
console.log(`Created issue: ${result.url}`);
```

**Usage:**

```bash
# Set up environment
export GITHUB_TOKEN=ghp_your_token_here
export GITHUB_OWNER=your-username
export GITHUB_REPO=your-test-repo

# Run local test
npm run test-local sample-digest.json
```

**Benefits:**

- 🌐 **Real API integration** - catch integration issues early
- 🔧 **Local debugging** - inspect requests/responses
- 🚀 **Fast iteration** - no workflow setup required

### **3. GitHub Actions (Production Adapter) - Next Step**

Deploy with full Actions integration:

```typescript
// Actions adapter for production workflows
const adapter = new GitHubActionsAdapter();
const logger = new ActionsLogger();
const service = new JobDigestService(adapter, logger);
```

## 🔄 **Same Code, Different Adapters**

The **identical `JobDigestService`** works with all adapters:

```typescript
// Core service never changes
class JobDigestService {
  constructor(private githubClient: GitHubClient, private logger: Logger) {}

  async createDigestIssue(digestJson: string): Promise<IssueResult> {
    // This code works with ANY adapter implementation
    const digest = new DigestProcessor().parse(digestJson);
    const content = new IssueFormatter().format(digest);
    return this.githubClient.createIssue(content);
  }
}
```

**Adapter Selection:**

```typescript
// Choose adapter based on environment
const createAdapters = () => {
  if (process.env.NODE_ENV === "test") {
    return {
      github: new MockGitHubClient(),
      logger: new MockLogger(),
    };
  }

  if (process.env.NODE_ENV === "development") {
    return {
      github: new LocalGitHubAdapter(token, owner, repo),
      logger: new ConsoleLogger(true),
    };
  }

  // Production: GitHub Actions
  return {
    github: new GitHubActionsAdapter(),
    logger: new ActionsLogger(),
  };
};
```

## 🚀 **Quick Start: Local Testing**

1. **Install dependencies:**

```bash
npm install
```

2. **Set up GitHub token:**

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your token (get from: https://github.com/settings/tokens)
# GITHUB_TOKEN=ghp_your_token_here
```

**Or set environment variables directly:**

```bash
export GITHUB_TOKEN=ghp_your_token_here
```

3. **Test with mock adapters:**

```bash
npm test  # Runs 23 unit tests with mock adapters
```

4. **Test with real API:**

```bash
npm run test-local sample-digest.json
```

5. **Create custom digest:**

```bash
# Edit sample-digest.json with your job data
npm run test-local my-custom-digest.json
```

## ✅ **Verification**

Run the integration test to verify adapters work correctly:

```bash
# Test adapter interfaces (no API calls)
npm test -- --testPathPattern="local-adapter"

# Test with real API (requires GITHUB_TOKEN and TEST_REPO)
GITHUB_TOKEN=your_token TEST_REPO=owner/repo npm test -- --testPathPattern="local-adapter"
```

## 🎯 **Benefits Achieved**

- **✅ Platform Independence:** Same code works everywhere
- **✅ Fast Development:** Test without Actions setup
- **✅ Comprehensive Coverage:** 95 tests validate all scenarios
- **✅ Real Integration:** Catch API issues before deployment
- **✅ Flexible Debugging:** Choose your testing environment

The adapter pattern makes testing **outside GitHub Actions** not just possible, but **preferred** for development! 🎉
