# Git Commands Reference Guide

## 🚀 Initial Setup
```bash
# Initialize new repository
git init

# Clone existing repository
git clone <repository-url>

# Configure user
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 📝 Basic Commands
```bash
# Check status
git status

# Add files to staging
git add <filename>     # Add specific file
git add .             # Add all files

# Commit changes
git commit -m "Your commit message"

# Push changes
git push origin <branch-name>

# Pull changes
git pull origin <branch-name>
```

## 🌿 Branch Management
```bash
# List branches
git branch                    # Local branches
git branch -r                # Remote branches
git branch -a                # All branches

# Create new branch
git branch <branch-name>
git checkout -b <branch-name>  # Create and switch

# Switch branches
git checkout <branch-name>

# Delete branch
git branch -d <branch-name>    # Local branch
git push origin --delete <branch-name>  # Remote branch
```

## 🔄 Syncing Changes
```bash
# Update local with remote changes
git fetch origin
git pull origin <branch-name>

# Push branch first time
git push -u origin <branch-name>

# Merge branch
git checkout main
git merge <branch-name>
```

## ↩️ Undo Changes
```bash
# Undo staged changes
git reset <file>

# Undo commits
git reset HEAD~1           # Keep changes
git reset --hard HEAD~1    # Discard changes

# Discard local changes
git checkout -- <file>
git restore <file>
```

## 💡 Best Practices
1. Create new branch for each feature/fix
2. Write clear commit messages
3. Pull before starting new work
4. Regularly push your changes
5. Keep branches up to date with main

## ⚠️ Common Issues
```bash
# Fix merge conflicts
git status                 # Check conflicted files
# Edit files to resolve conflicts
git add .                  # Mark as resolved
git commit -m "Resolved conflicts"

# Stash changes temporarily
git stash                  # Save changes
git stash pop             # Restore changes
```

## 🔍 Viewing History
```bash
# View commit history
git log
git log --oneline         # Compact view
git log --graph           # Graphical view

# View changes
git diff                  # Unstaged changes
git diff --staged        # Staged changes
```