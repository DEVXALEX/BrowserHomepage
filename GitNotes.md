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

### Check Configuration
```powershell
git config list
```
*   **Why:** Shows all your Git settings (user name, email, credentials, etc.).

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

### Create New Remote Branch
```powershell
git push -u origin <branch-name>
```
*   **When:** You created a branch locally (`git checkout -b`) and want it on GitHub.
*   **Action:** Uploads your branch logic to GitHub AND links them together.

#### Q: What if I don't use `-u`?
*   **Result:** The branch is created on GitHub successfully.
*   **The Annoyance:** Your local git won't know they are connected. Next time you type `git pull`, it will scream: *"There is no tracking information for the current branch."*
*   **The Fix:** You'd have to run `git branch --set-upstream-to=origin/branch-name`. Just use `-u` at the start to avoid this pain.




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

### Q: What if I don't delete the branch?
*   **Technically:** Nothing breaks. The code stays there forever.
*   **The Problem:** Your generic "messy desk". If you have 50 old branches, finding the *active* one is hard.
*   **The Risk:** You might accidentally checkout `feature-login` from 3 months ago, write new code, and realize you are working on an outdated version of the app.
*   **Best Practice:** Keep your branch list clean. Only keep what you are *currently* working on.

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

#### How to Create a Pull Request (PR):
1.  **Push your branch:**
    ```powershell
    git push -u origin feature-name
    ```
2.  **Go to GitHub:** Open your repository in the browser.
3.  **Click Banner:** You will usually see a yellow banner: "bug/searchbar had recent pushes... Compare & pull request". Click it.
    *   *Alternative:* Go to "Pull requests" tab > "New pull request" > Select your branch.
4.  **Fill Details:** Write a title and description of your changes.
5.  **Create:** Click "Create pull request".

#### After Merging (Back to Local):
Now that GitHub has the new code on `main`, your computer is behind!
1.  **Switch to Main:**
    ```powershell
    git checkout main
    ```
2.  **Download Updates:**
    ```powershell
    git pull origin main
    ```
3.  **Delete Old Branch:**
    ```powershell
    git branch -d feature-name
    ```
    *(If it complains, use `-D` to force it).*

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

    *   **Result:** Git combines them and creates a specific "Merge Commit" to join the two paths.

### `git pull --rebase` (Pro Move)
*   **Concept:** Rewrites history to make it look like a straight line.
*   **Action:** Unplugs your local commits, updates "origin", then replugs your work on top.
*   **Why:** Avoids "Merge branch 'main'" spaghetti history.
*   **Rule:** Only use on commits you haven't pushed yet.

### Strategy: When to specific Merge vs. Rebase?
| Feature | Merge (`git pull`) | Rebase (`git pull --rebase`) |
| :--- | :--- | :--- |
| **History** | Creates a loop (Diamond shape). Honest chronology. | Straight line. Rewrites history. |
| **Safety** | 100% Safe. | Risky on **shared** branches. |
| **Use Case** | **Merging a Feature:** When "Finishing" a big task and bringing it to main. | **Syncing Daily Work:** When you just want to catch up with the team. |
| **Decision** | "I want to preserve the fact that this feature was developed separately." | "I just want my latest commit to be on top of the latest code." |

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

## 9. Advanced Concepts: The "Diamond" Merge
**Scenario:**
1.  You made a commit locally (e.g., `docs`).
2.  Simultaneously, a Pull Request was merged on GitHub (e.g., `mass changes`).
3.  **Result:** Your history "Diverged". Two different features grew from the same stem.

**The Fix (git pull):**
When you ran `git pull`, Git did the following:
1.  **Fetched** the remote changes.
2.  **Detected** that your local branch and the remote branch had split.
3.  **Created a "Merge Commit"**: This is a special commit that has **two parents**. It ties the two separate paths back together.

**Visualizing it (The Diamond Shape):**
```
      A --- B  (Local Work)
     /       \
... D         M  (Merge Commit)
     \       /
      X --- Y  (Remote Work)
```
*   **D**: The shared, common history.
*   **A, B**: Your local work.
*   **X, Y**: The work done on GitHub.
*   **M**: The "Merge Commit" that brings them all together.

## 10. The "Git Pull" Logic Flow
**User Rule:** "If I have changes and GitHub has changes, `git pull` combines them."

**Is this correct?**
**YES.** Git attempts to do this automatically.

**The Process:**
1.  **Download:** Git fetches the remote commits.
2.  **Compare:** Git looks at your files vs. their files.
3.  **Combine:**
    *   **Scenario A (Clean):** They changed `header.js`, you changed `footer.js`. **Git auto-merges** and creates the new commit for you.
    *   **Scenario B (Conflict):** You BOTH changed line 10 of `header.js`. **Git stops** and asks you to choose. ("Merge Conflict").

## 11. The Panic Room (Mistake Management)
**Scenario:** "I just messed up. How do I go back?"

### Option A: The "Oops, I typed the message wrong" (Amend)
*   **Goal:** Change the message of the LAST commit.
*   **Command:** `git commit --amend -m "New better message"`
*   **Condition:** You haven't pushed yet.

### Option B: The "I forgot a file in the commit" (Amend)
*   **Goal:** Add a forgotten file to the previous commit without making a new "oops" commit.
*   **Steps:**
    1. `git add forgotten_file.js`
    2. `git commit --amend --no-edit`

### Option C: The "Undo Button" (Soft Reset)
*   **Goal:** Undo the commit, but **KEEP** your file changes (so you can fix them).
*   **Command:** `git reset --soft HEAD~1`
*   **Translation:** "Go back 1 step in history, but keep my work in the staging area."

### Option D: The "Discard Changes" (Restore)
*   **Goal:** You modified a file but hate the changes. You want the last committed version back.
*   **Command:** `git restore filename` (for one file)
*   **Command:** `git restore .` (for ALL files - careful!)
*   **Translation:** "Throw away my changes to this file."

### Option E: The "Unstage" (Restore Staged)
*   **Goal:** You ran `git add`, but you didn't mean to properly stage that file yet.
*   **Command:** `git restore --staged filename`
*   **Translation:** "Take this file out of the staging area, but keep the changes in the file."

### Option F: The "Nuke Button" (Hard Reset)
*   **Goal:** Destroy the commit AND destroy the file changes.
*   **Command:** `git reset --hard HEAD~1`
*   **Translation:** "Go back 1 step and delete everything I did since then."

### Option G: The "Public Undo" (Revert)
*   **Goal:** You already **pushed** the mistake to GitHub.
*   **Command:** `git revert <commit-hash>`
*   **Translation:** "Make a NEW commit that does the exact opposite of the bad commit."
*   **Why:** You never rewrite history that others might have downloaded.

### 🛑 Undo Cheat Sheet

| Situation | Command |
| :--- | :--- |
| **Changes in file are bad** | `git restore <file>` |
| **Staged a file by mistake** | `git restore --staged <file>` |
| **Wrong commit message** | `git commit --amend -m "..."` |
| **Forgot to add a file** | `git add <file>` then `git commit --amend` |
| **Undo commit, keep code** | `git reset --soft HEAD~1` |
| **Undo commit, destroy code** | `git reset --hard HEAD~1` |
| **Undo PUSHED commit** | `git revert <hash>` |



## 12. Spring Cleaning (Deleting Branches)
**Question:** "Is it safe to delete this branch?"

### Step 1: The Safety Check
```powershell
git branch --merged
```
*   **Result:** Lists all branches that have been successfully combined into your current branch.
*   **Verdict:** If your branch name (e.g., `feature-login`) appears in this list, it is **100% SAFE** to delete.

### Step 2: Delete Locally
```powershell
git branch -d branch-name
```
*   **Note:** Use lowercase `-d`. Git will protect you. It acts like a "Are you sure?" dialog.
*   **Force Delete:** If you try to delete an unmerged branch, Git will scream. To force it (if you truly want to trash the work), use `-D`.

### Step 3: Delete from GitHub (Remote)
```powershell
git push origin --delete branch-name
```
*   **Why:** Just because you deleted it on your laptop doesn't mean it's gone from the cloud.

### Troubleshooting: "Git says it's not merged!"
*   **Error:** `error: the branch '...' is not fully merged`
*   **Context:** This often happens after a "Diamond Merge". Git sees that your local feature branch has some "bookkeeping" history that isn't on the server, even though the **code** is safe in `main`.
*   **The Check:** If the error says `merged to HEAD`, you are safe.
*   **The Fix:** Use the Uppercase D (Force Delete):
    ```powershell
    git branch -D branch-name
    ```

### Checking History & File Tracking
- `git log -n 5 --stat` : View the last 5 commits with a list of modified files.
- `git ls-files <filename>` : Check if a specific file is being tracked by Git.
- `git diff --stat` : See a summary of currently uncommitted changes.

## 13. Advanced History & Branch Investigation
Used when you need to know "How did I get here?" or "Where did this branch start?"

### Visualizing the Branch Graph
```powershell
git log --oneline --graph --decorate --all -n 20
```
*   **`--graph`**: Draws a text-based map of your branches.
*   **`--all`**: Shows ALL branches, not just the current one.
*   **`--decorate`**: Shows labels (like branch names) next to commits.
*   **Why:** Essential for finding the **Parent** of a branch or seeing split-points.

### Finding the Origin Story (Reflog)
```powershell
git reflog show <branch-name>
```
*   **What it does:** Shows every time your HEAD (the pointer) moved.
*   **Why:** If you aren't sure where a branch came from, look at the last line in the reflog. It will say "checkout: moving from [parent] to [branch]".
*   **Analogy:** The "Black Box" of your Git repository. It records everything, even if you delete a branch or a commit.
