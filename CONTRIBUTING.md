# Contributing to GitEasy

Thank you for your interest in contributing to GitEasy! We welcome contributions from developers of all skill levels. This guide will help you get started.

## 🎯 Project Overview

GitEasy is a beginner-friendly Git utility that streamlines discovering and contributing to beginner-friendly GitHub issues. It's built with React, TypeScript, and Tailwind CSS, using Vite as the build tool.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 16 or higher)
- **npm** or **yarn**
- **Git**

### Setting Up the Development Environment

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub or use GitHub CLI
   gh repo fork TridentifyIshaan/giteasy_Ishaan
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/giteasy_Ishaan.git
   cd giteasy_Ishaan
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to see the application running.

## 🛠️ Development Workflow

### Making Changes

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-fix-name
   ```

2. **Make your changes**
   - Follow the existing code style and patterns
   - Write clear, descriptive commit messages
   - Test your changes thoroughly

3. **Run linting**
   ```bash
   npm run lint
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your descriptive commit message"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your branch and provide a clear description

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard component
│   ├── GitHubAuth.tsx   # GitHub authentication
│   ├── LandingPage.tsx  # Landing page component
│   └── RepositorySelector.tsx
├── hooks/               # Custom React hooks
│   └── useGitHub.ts     # GitHub API hook
├── services/            # API and external services
│   └── github.ts        # GitHub service functions
├── types/               # TypeScript type definitions
│   └── index.ts         # Shared types
├── App.tsx              # Main App component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## 🎨 Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Define proper types in `src/types/index.ts`
- Avoid using `any` type

### React Components
- Use functional components with hooks
- Follow the existing component structure
- Use descriptive component and prop names

### Styling
- Use Tailwind CSS for styling
- Follow the existing design patterns
- Ensure responsive design principles

### Commit Messages
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

## 🐛 Reporting Issues

When reporting issues, please include:
- A clear description of the problem
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots (if applicable)
- Your environment details (OS, Node.js version, browser)

## 🌟 What Can You Contribute?

### For Beginners
- Fix typos in documentation
- Improve error messages
- Add missing type definitions
- Enhance accessibility features
- Write tests for existing components

### For Intermediate Developers
- Implement new UI components
- Optimize performance
- Add new filtering options
- Improve the search algorithm
- Enhance mobile responsiveness

### For Advanced Developers
- Architect new features
- Optimize the build process
- Implement advanced GitHub API features
- Add comprehensive testing suite
- Set up CI/CD workflows

## 🚦 Pull Request Guidelines

### Before Submitting
- [ ] Code follows the project's style guidelines
- [ ] Self-review of your own code
- [ ] Descriptive commit messages
- [ ] No merge conflicts with main branch
- [ ] All linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)

### Pull Request Template
```markdown

## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (please describe)

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots to help explain your changes
```

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md)

## 📞 Getting Help

- **GitHub Discussions**: Ask questions and discuss ideas
- **Issues**: Report bugs or request features

## 🎉 Recognition

Contributors will be:
- Listed in the project's README

## 📄 License

By contributing to GitEasy, you agree that your contributions will be licensed under the same BSD 3-Clause License that covers the project.

---

**Happy Contributing! 🚀**

Made with ❤️ by the GitEasy community