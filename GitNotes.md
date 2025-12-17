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

## 3. The Golden Rule of Workflow
**Question:** "Do I make changes first, or create the branch first?"
**Answer:** **ALWAYS create the branch FIRST.**

*   **Why?** If you make changes on `main` and then try to switch, Git might stop you or carry your changes over weirdly.
*   **Analogy:** Put on your safety gear *before* you enter the construction zone.

## 4. Daily Workflow (The Loop)
The commands you will use 99% of the time.

### Start New Work (Branching)
```powershell
git checkout -b feature-name
```
*   **When:** BEFORE you start writing any new code.
*   **Why:** Creates a new "sandbox" (branch) AND switches you into it immediately.
*   **Composition:** It combines `git branch feature-name` (create) + `git checkout feature-name` (switch).

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


### Finish Work (Merging)
*   **Context:** You are happy with your feature and want to bring it into the main app.
1.  **Switch to Main:**
    ```powershell
    git checkout main
    ```
2.  **Merge the Feature:**
    ```powershell
    git merge feature-name
    ```
3.  **Delete Branch (Optional):**
    ```powershell
    git branch -d feature-name
    ```

## 5. Troubleshooting & Scenarios


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

### Scenario: "I created a mess while syncing" (Abort Rebase)
```powershell
git rebase --abort
```
*   **Context:** You started a rebase/pull and hit too many conflicts.
*   **Action:** COMPLETELY UNDOES the operation. Returns you to the state before you ran the command.
*   **Analogy:** The "Eject" button.

## 6. Learning Roadmap (What Next?)

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

## 7. Updating Content (Syncing)
There are two ways to get updates from GitHub (Remote) to your Computer (Local).

### `git fetch` (Safe Mode)
*   **Analogy:** Checking your email inbox but not opening the messages.
*   **Action:** Downloads new commits from GitHub to a hidden area.
*   **Result:** Updates `origin/main` pointer, but **DOES NOT** touch your actual code files.
*   **Use Case:** When you want to see what others have done before merging it into your work.

### `git pull` (Action Mode)
*   **Analogy:** Downloading an attachment and opening it immediately.
*   **Action:** Runs `git fetch` AND then immediately `git merge`.
*   **Result:** Updates your files with the new code.
*   **Risk:** Can cause conflicts if you have unsaved work.

#### Two Ways `pull` Updates History
1.  **Fast-Forward (Clean):**
    *   **Scenario:** You have no local changes, you are just behind.
    *   **Result:** Git simply slides your history forward. No new merge commit is created.
2.  **Merge Commit (Mixed):**
    *   **Scenario:** You gathered changes locally AND the server has new changes.
    *   **Result:** Git combines them and creates a specific "Merge Commit" to join the two paths.

    *   **Result:** Git combines them and creates a specific "Merge Commit" to join the two paths.

### `git pull --rebase` (Pro Move)
*   **Concept:** Rewrites history to make it look like a straight line.
*   **Action:** Unplugs your local commits, updates "origin", then replugs your work on top.
*   **Why:** Avoids "Merge branch 'main'" spaghetti history.
*   **Rule:** Only use on commits you haven't pushed yet.
### `git push -u origin main` (Setting Upstream)
*   **Concept:** "Link my local branch to this remote branch forever."
*   **Why:** So you can just type `git push` later without arguments.
*   **Flags:** `-u` is short for `--set-upstream`.
*   **When:** The VERY first time you push a new branch.

### `git branch -vv` (Verbose Mode)
*   **Concept:** "Tell me everything about my branches."
*   **Output:** Shows branch name, current hash, commit message, and **upstream connection**.
*   **Use Case:** "Am I ahead? Am I behind? Is my `main` actually connected to `origin/main`?"
To check for changes on a GitHub repository without applying them to your local working directory:
1.  **Update local database (Safe):**
    ```powershell
    git fetch origin
    ```
    *This downloads updates to your local `.git` folder but does **not** touch your working files.*
2.  **See list of new commits:**
    ```powershell
    # Detailed list
    git log HEAD..origin/main
    # One-line summary
    git log --oneline HEAD..origin/main
    ```
3.  **See actual code changes (Diff):**
    ```powershell
    git diff HEAD..origin/main
    ```
4.  **Check status:**
    ```powershell
    git status
    ```

### Check History
```powershell
git log -n 5 --oneline
```
*   **`-n 5`**: Limit to the last 5 commits (keeps it short).
*   **`--oneline`**: Condense each commit to a single line (Hash + Message).
*   **Why:** "Show me a quick summary of what just happened."



## 8. Understanding Git Pointers
When you see `(HEAD -> main, origin/main, origin/HEAD)`, here is what it means:

### `HEAD -> main`
*   **HEAD:** YOU. Where you are currently standing.
*   **-> main:** You are on the `main` branch.

### `origin/main`
*   **origin:** GitHub (the remote server).
*   **main:** The branch on the server.
*   **Meaning:** This is a bookmark on your computer that says "Last time I checked, GitHub was at this commit."

### `origin/HEAD`
*   The default branch on GitHub (usually `main`).
