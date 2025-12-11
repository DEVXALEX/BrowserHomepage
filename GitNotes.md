# Git & GitHub Field Guide

## 1. Concepts
- **Git**: The tool on your computer that tracks changes (like a time machine).
- **GitHub**: The website where you store backup copies of your code.
- **Repository (Repo)**: A project folder that is being watched by Git.
- **Commit**: A snapshot of your files at a specific moment.
- **Remote (Origin)**: The "Cloud" version of your repo (GitHub).

## 2. Setup Commands (One-Time)
Used to start a project or link it to GitHub.

### Check Installation
```powershell
git --version
```
*   **Why:** verify Git is installed.

### Initialize Repository
```powershell
git init
```
*   **Why:** Tells Git to start watching the current folder. Creates the hidden `.git` folder.

### Link to GitHub
```powershell
git remote add origin https://github.com/USERNAME/REPO.git
```
*   **Why:** Saves the URL so you don't have to type it every time. `origin` is just a nickname.

### Rename Branch
```powershell
git branch -M main
```
*   **Why:** Modern standard naming. Renames `master` to `main`.

## 3. Daily Workflow (The Loop)
The commands you will use 99% of the time.

### Check Status
```powershell
git status
```
*   **When:** ANY time you are unsure.
*   **Why:** Shows which files are changed, staged, or untracked.

### Stage Files
```powershell
git add .
```
*   **When:** You are ready to save.
*   **Why:** "Prepare" all files for the snapshot. (You can use `git add filename` for single files).

### Save Snapshot (Commit)
```powershell
git commit -m "Description of work"
```
*   **When:** A unit of work is done.
*   **Why:** Permanently saves the snapshot to your local history.

### Upload (Push)
```powershell
git push
```
*   **When:** You want to backup to GitHub or share code.
*   **Why:** Sends your commits to the server.
*   **Note:** The VERY first time, use `git push -u origin main`.

## 4. Troubleshooting & Scenarios

### Scenario: "I want to overwrite the server" (Force Push)
```powershell
git push -u origin main --force
```
*   **Context:** You have a new history locally, and the server has old junk.
*   **Danger:** This **DELETES** the history on the server and replaces it with yours. Use with caution.

### Scenario: "Did it work?" (Verification)
```powershell
git remote show origin
```
*   **Context:** You want to confirm your connection to GitHub is healthy.
*   **Look for:** `main pushes to main (up to date)`.

### Warning: "LF will be replaced by CRLF"
*   **Meaning:** Windows uses different line-endings (CRLF) than Linux/Mac (LF). Git is automatically converting them for compatibility.
*   **Action:** Ignore it. It is normal.

## 5. Learning Roadmap (What Next?)

### A. Level 2: Isolation (Branching)
currently, you work on `main`. If you break `main`, your app is broken.
*   **Goal:** Learn to create "sandboxes" for every new feature.
*   **Commands:** `git checkout -b feature-name`, `git switch`.

### B. Level 3: Undo Button (Restoring)
Everyone makes mistakes.
*   **Goal:** Learn how to go back 10 minutes, 1 hour, or 1 day.
*   **Commands:** `git restore`, `git reset`, `git revert`.

### C. Level 4: Collaboration (Pull Requests)
How real teams work.
*   **Goal:** Instead of merging yourself, you ask GitHub to merge it for you (allowing for code review).
*   **Concept:** "Pull Request" (PR) flow on GitHub.com.

### D. Level 5: Disaster Management (Conflicts)
What happens when two people check the same line of code?
*   **Goal:** Learn to manually resolve conflicts without panicking.

