# Protected Code Registry
**Project:** Gridline AI - Production Weekly Analyzer  
**Last Updated:** 12/12/2025
**Current Version:** 2.0 (Post Phase 1 Completion)

---

## Overview
This document lists all files containing critical business logic that must NOT be modified by the Build agent without explicit user approval. These files have been extensively tested and achieve 95%+ accuracy.

---

## Protected Files

### 1. constants.ts
**Protected Sections:**
- `PROMPT_PROJECT_EXTRACTION` (entire prompt string)
- `PROMPT_CONTACT_INDEXING` (entire prompt string)

**Why Protected:**
- Prompt tested on 30+ projects across 3 different PDF editions
- Achieves 98% consistency on core dataset (20/11/2025, 8 projects)
- Achieves 85% consistency on stress test (06/11/2025, 20 projects)
- Contains critical business logic:
  - Quarter date parsing (Q1-Q4 conversion)
  - Agent extraction from user input (not PDF)
  - SPV exclusion rules
  - Sales agent filtering
  - Acronym whitelist (BBC, MGM, HBO, etc.)
  - Status derivation logic (Pre-Production/Filming)

**Known Issues (Pending Phase 2):**
- Multi-country extraction incomplete (40% accuracy on multi-country projects)
- Company completeness variance (5-10% of companies dropped)

**Change Protocol:**
1. Create backup copy of current prompt
2. Test new prompt on reference PDFs:
   - 20/11/2025 (8 projects) - expect 98%+ consistency
   - 06/11/2025 (20 projects) - expect 85%+ consistency
3. Run 5 identical extractions to measure variance
4. Compare accuracy before/after
5. Only deploy if accuracy maintained or improved

---

### 2. types.ts
**Protected Sections:**
- `ProjectData` interface (all 15 fields)
- `ContactDetails` interface (10 fields, pending Phase 3 expansion)

**Why Protected:**
- ProjectData schema matches PROMPT_PROJECT_EXTRACTION JSON output exactly
- ContactDetails schema matches PROMPT_CONTACT_INDEXING output
- Any mismatch causes TypeScript errors or runtime crashes

**Dependencies:**
- `constants.ts` (prompt output schemas)
- `DataGrid.tsx` (column rendering)
- `TSVModal.tsx` (export logic)
- `geminiService.ts` (API response parsing)

**Change Protocol:**
1. If adding/removing fields:
   - Update PROMPT_PROJECT_EXTRACTION schema in constants.ts
   - Update DataGrid.tsx column headers + cells
   - Update TSVModal.tsx headers + data mapping
   - Test TSV export matches grid
2. Always maintain backward compatibility (old data should still load)

---

### 3. DataGrid.tsx
**Protected Sections:**
- Column structure (15 columns, fixed order)
- Header cell array (lines ~130-145)
- Row cell mapping (lines ~150-200)

**Why Protected:**
- Column order is strict business requirement (matches user's CRM import format)
- TSV export depends on this exact column sequence
- User muscle memory for click-to-copy workflow

**Current Column Order:**
1. Issue Date
2. Project Name
3. Primary Agent
4. Secondary Agents
5. Type
6. Status
7. Start Date
8. Primary Company
9. Additional Companies
10. City Locations
11. Country Locations
12. Distributor
13. Director
14. Producers
15. Search URL

**Change Protocol:**
1. Never reorder columns without user approval
2. If adding column: insert at end, update TSVModal.tsx
3. If removing column: update types.ts + constants.ts + TSVModal.tsx
4. Test grid rendering + click-to-copy after changes

---

### 4. TSVModal.tsx
**Protected Sections:**
- Headers array (must match DataGrid column order)
- Data mapping function (lines ~25-40)

**Why Protected:**
- TSV output is user's backup/export format
- Excel/Google Sheets import depends on strict column order
- Headers must match DataGrid exactly

**Change Protocol:**
1. Always sync with DataGrid.tsx changes
2. Test TSV export opens correctly in Excel
3. Verify no tabs in data (breaks TSV format)

---

### 5. geminiService.ts
**Protected Sections:**
- `temperature: 0` setting (lines ~35, ~60)
- Model ID: `gemini-3-pro-preview` (do not change)
- API call structure

**Why Protected:**
- Temperature=0 provides deterministic outputs (variance minimization)
- gemini-3-pro-preview is required for complex extraction tasks
- API structure tested and working

**Change Protocol:**
1. Do not modify temperature without testing variance impact
2. Do not change model without accuracy comparison
3. Test API calls after any changes

---

## Testing Reference Data

### Primary Test Dataset (20/11/2025 PDF)
**Projects:** 8 (Bunker, The Good Samaritan, Indiana and the Otter's Legend, A Man of the World, The Secret Diary of Adrian Mole, Stargate, The System, Top of the Rock)

**Expected Accuracy:** 98-99% consistency across 5 runs

**Critical Test Cases:**
- Bunker: Q4 2025 → "01/10/2025" + "Filming" status
- The Good Samaritan: Secondary agent "ZH" correctly parsed
- Stargate: Country inferred from distributor (Prime Video → United States)
- All: Amazon MGM Studios casing preserved

**Input File Location:** /mnt/project/3a_PDF_Sample.pdf  
**Target List:** /mnt/project/3b_Input_User_List.txt  
**Expected Output:** /mnt/project/3c_current_output.tsv

---

### Stress Test Dataset (06/11/2025 PDF)
**Projects:** 20 (larger, more complex dataset)

**Expected Accuracy:** 85%+ consistency (pending Phase 2 fixes)

**Known Issues:**
- Multi-country projects: 40% accuracy (needs Fix 1)
- Company completeness: 85-90% accuracy (needs Fix 2)

**Improvement Target (Phase 2):** 95%+ consistency

---

## Agent Interaction Protocol

### When Requesting Changes from Build Agent

**Always start your prompt with:**
```
Before implementing, check PROTECTED_CODE.md for protected files. If your changes affect any protected files, describe the changes in natural language first and wait for my approval.
```

**For Protected File Changes:**
```
I need to update [FILE NAME]. This is a protected file.

Proposed changes:
1. [Description of change 1]
2. [Description of change 2]

Please confirm these changes won't break:
- Data extraction accuracy
- TypeScript type safety
- UI rendering
- TSV export

Then wait for my explicit approval before implementing.
```

---

## Change Log

### Phase 1 Completion (Current State)
**Date:** [Today's Date]

**Changes Made:**
1. Added quarter date parsing (Q1-Q4 → specific dates)
2. Removed showrunner field (reduced from 16 to 15 columns)
3. Enhanced golden examples in prompt
4. Added acronym whitelist (BBC, MGM, HBO, FX, etc.)
5. Set temperature=0 for deterministic outputs

**Accuracy Achieved:**
- 20/11/2025: 98-99% consistency ✅
- 06/11/2025: 85% consistency ⚠️ (needs Phase 2)

**Files Modified:**
- constants.ts (PROMPT_PROJECT_EXTRACTION updated)
- types.ts (showrunner removed from ProjectData)
- DataGrid.tsx (showrunner column removed)
- TSVModal.tsx (showrunner removed from headers + mapping)
- geminiService.ts (temperature=0 added)

---

### Pending (Phase 2)
**Target Date:** [After API quota reset]

**Planned Changes:**
1. Multi-country extraction logic (Fix 1)
2. Company completeness enhancement (Fix 2)
3. Edge case testing

**Expected Outcome:** 95%+ consistency on 06/11/2025 dataset

---

## Emergency Rollback

### If Agent Breaks Something

**Immediate Actions:**
1. Check browser console for errors
2. Identify which file changed (compare to backup)
3. Revert file to last known good version
4. Test extraction on 20/11/2025 PDF
5. If still broken, check GitHub backup (if available)

**File Backup Locations:**
- Local: [Your backup folder path]
- GitHub: [Repo URL if configured]
- Build: Previous versions in Build's history (check interface)

---

## Contact for Questions
**Project Owner:** [Your Name]  
**Last Tested By:** [Your Name]  
**Testing Date:** [Today's Date]

---

## Appendix: Acronym Whitelist (Reference)

**Broadcasters/Networks:**  
BBC, ITV, HBO, FX, ABC, NBC, CBS, AMC, ESPN, CNN, PBS, TNT, TBS, USA, SKY

**Studios/Agencies:**  
MGM, WME, UTA, CAA, ICM

**Usage:** These must stay uppercase in all Title Case normalization

---

**END OF PROTECTED CODE REGISTRY**
```