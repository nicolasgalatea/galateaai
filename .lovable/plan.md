
# Plan: Sincronización Total del Research Dashboard

## Current State Analysis

After reading the full codebase, here is the exact state of each piece:

**Already implemented (no changes needed):**
- `useResearchProject` hook with full Supabase Realtime subscription on `research_projects`
- `N8nResearchChat` with the correct webhook URL already set
- Three layout views (Early/Mid/Late) based on `current_phase`
- `PhaseStepper` with `Progress` bar from shadcn
- `fetchProject` exposed for manual refetch

**Missing pieces to implement:**
1. `GoldenRulesModal` component — does not exist yet
2. Inline editing with `onBlur` for Title/Research Question in `DashboardHeader`
3. Structured data detection in `N8nResearchChat` (metadata/phase_data in n8n response)
4. Progress bar percentage text + animated transition

---

## Files to Create / Modify

### 1. NEW: `src/components/research/GoldenRulesModal.tsx`

A `Dialog` from shadcn that appears when `!project` (idle state, no project yet). Contains the 5 Golden Rules checklist. The "Acepto y Comenzar" button:
- Closes the modal
- Sends `{ message: "Acepto", project_id: "e8233417-...", current_phase: 0 }` to the n8n chat webhook
- Then reveals the project creation form

**Logic flow:**
```
Idle state → GoldenRulesModal auto-opens
User clicks "Acepto" → POST to n8n → modal closes → form appears
User fills Title + Question → creates project → dashboard activates
```

### 2. MODIFY: `src/components/ResearchDashboard.tsx`

**Two targeted changes:**

**A) `DashboardHeader` — make Title + Research Question inline-editable:**

Currently `DashboardHeader` is a static component that takes no props. It will be upgraded to receive `project`, `onSaveTitle`, and `onSaveQuestion` callbacks. Fields become `<input>` / `<textarea>` elements with:
- `onBlur` → fires `supabase.from('research_projects').update({ [field]: value }).eq('id', project.id)` directly
- A 2-second "Guardado ✓" badge displayed after successful save
- Pencil icon visible on hover to signal editability
- A `savingField` state to show a mini spinner on the specific field being saved

**B) `PhaseStepper` — percentage text + animated progress:**

Current bar: `<Progress value={(currentPhase / 10) * 100} className="h-2" />`

Will add:
- Percentage text to the right: `{Math.round((currentPhase / 10) * 100)}%` with `text-primary font-bold` styling
- `framer-motion` `AnimatePresence` on the percentage number so it animates when the value changes (y: -4 → 0, opacity 0 → 1)
- The phase label row below will highlight the current phase name in `font-bold text-primary`

**C) `GoldenRulesModal` integration in the idle state:**

The `if (!project)` block currently shows a plain form. It will also render `<GoldenRulesModal>` and manage its open/close state with `useState<boolean>(true)`. The form only becomes interactive after the modal is dismissed.

**D) Thread `project` and edit callbacks into `DashboardHeader`:**

The three call sites for `<DashboardHeader />` (in EarlyPhaseView, MidPhaseView, LatePhaseView renders) will each pass the project and the `handleFieldUpdate` function.

### 3. MODIFY: `src/components/research/N8nResearchChat.tsx`

**Add structured data detection + optional `onStructuredData` prop:**

```typescript
interface N8nResearchChatProps {
  // ... existing props
  onStructuredData?: (data: StructuredUpdate) => void; // new optional
}

interface StructuredUpdate {
  type: 'PHASE_UPDATE' | 'FIELD_UPDATE';
  current_phase?: number;
  data?: Record<string, unknown>;
  field?: string;
  value?: unknown;
}
```

After parsing the n8n response body (before calling `extractResponseText`), the code will inspect the raw object for:
```typescript
if (responseBody?.metadata || responseBody?.phase_data || responseBody?.current_phase) {
  onStructuredData?.({
    type: 'PHASE_UPDATE',
    current_phase: responseBody.current_phase ?? responseBody.metadata?.current_phase,
    data: responseBody.phase_data,
  });
  onRefetch(); // already called below, but structured data gets priority refetch
}
```

In `ResearchDashboard`, the `N8nResearchChat` call sites will pass:
```typescript
onStructuredData={(update) => {
  console.log('[Dashboard] Structured update from n8n:', update);
  fetchProject(); // re-sync dashboard
}}
```

---

## Summary of Changes

```text
CREATE  src/components/research/GoldenRulesModal.tsx
MODIFY  src/components/ResearchDashboard.tsx
          - DashboardHeader: static → editable with onBlur Supabase save
          - PhaseStepper: add % text + framer-motion animation
          - Idle state: integrate GoldenRulesModal (auto-opens)
          - All 3 N8nResearchChat usages: add onStructuredData prop
MODIFY  src/components/research/N8nResearchChat.tsx
          - Add optional onStructuredData prop + type
          - Detect metadata/phase_data/current_phase in raw n8n response
          - Call onStructuredData before extracting text
```

**No database migrations needed.** The `research_projects` table already has `title`, `research_question`, and `current_phase` columns with the correct RLS policies (anyone can update). The `set_user_edits_for_phase` RPC handles phase field edits; direct `.update()` handles title/question saves.
