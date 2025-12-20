---
trigger: always_on
---

# 🛑 Start And End of Session Protocol
**Trigger Phrase:** "Done for today", "That's all", "Wrap it up".
Also When I say start or lets beging understand that is starting point of session and all the details from that point should be tracked for feature history session history git notes 
When the session ends, **ALWAYS** perform the following 3 actions before signing off:
## 1. Update Feature History
*   **File:** `FEATURE_HISTORY.md`
*   **Action:** Add a new section for the day's work.
*   **Include:**
    *   **Date & Time** of the session.
    *   Track the time we have put in the project including total time catagory  wise time its also included in session summery use the rule if start message to begin start the tracking of current session
    *   What features/fixes were added.
    *   Do not add a details related to git and github learning because its already have different file.
    *   What files were modified.
    *   Remove the file modified section from this history file and avoid teachnical details here keep it in Session history file instead which we are already linking to features file
    *   Verification status.
    *   **Link** to the detailed session summary file.
    *   for example if we added some feature we make a entry in feature file and there is also seprate file for session history if user want all the details then link for that session file should be there for the session

## 2. Update Knowledge Base
*   **File:** `gitNotes.md` (or other relevant doc)
*   **Action:** Document new concepts learned.
*   **Rule:** If we learned a new command or workflow, it **must** be written down.
*   **Rule:**every single git command used that session or day must be added or present in `gitNotes.md` file.
## 3. Create Session Summary
*   **Location:** `session_summary/session_YYYY-MM-DD.md`
*   **Action:** Create a detailed log of the session.
*   **Content:**
    *   Goals Achieved
    *   Add the details of session start time and end time also how long session lasted to understand the start time I will say track initially you can use that time for start the tracking of       start time and to know its a start of new session
    *   Key Learnings
    *   File Changes
    *   Next Steps