---
trigger: always_on
---

# 🛑 End of Session Protocol
**Trigger Phrase:** "Done for today", "That's all", "Wrap it up".
When the session ends, **ALWAYS** perform the following 3 actions before signing off:
## 1. Update Feature History
*   **File:** `FEATURE_HISTORY.md`
*   **Action:** Add a new section for the day's work.
*   **Include:**
    *   **Date & Time** of the session.
    *   What features/fixes were added.
    *   Do not add a details related to git and github learning because its already have different file.
    *   What files were modified.
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
    *   Key Learnings
    *   File Changes
    *   Next Steps