# 🏗️ KWQ8 AI BUILDER BLUEPRINT
## Complete Technical Specification Based on Competitor Analysis
### Lovable + v0 + Bolt + Cursor → KWQ8 Arabic-First AI Builder

**Version:** 3.0  
**Date:** December 27, 2025  
**Status:** READY FOR DEVELOPMENT

---

# PART 1: ARCHITECTURE DECISIONS

## 1.1 What We're Taking From Each Competitor

| Feature | Source | Why |
|---------|--------|-----|
| Design-First Approach | Lovable | Forces consistent, beautiful output |
| GenerateDesignInspiration Tool | v0 | Automated design brief before coding |
| Brief Planning (2-4 lines) | Bolt | Fast, clear execution path |
| Agent Autonomy | Cursor | Resolve fully before returning to user |
| Line-Replace Editing | Lovable + Cursor | Surgical edits, not full rewrites |
| Parallel Tool Calls | v0 | 40-60% faster responses |
| Semantic Tokens Only | All | Consistent design system |
| "Never Re-Read" Rule | All | Token efficiency |

## 1.2 KWQ8 Unique Additions

| Feature | Description |
|---------|-------------|
| Arabic-First Detection | Auto-detect Arabic → RTL + Arabic fonts |
| GCC Market Recognition | Detect business type → VAT, payments, locale |
| Gemini Orchestrator | Analyze + Ask + Validate (not just generate) |
| DeepSeek Generator | Cost-effective code generation |
| Dual-AI Validation | Gemini validates DeepSeek output |

---

# PART 2: FIRST MESSAGE PROTOCOL

## 2.1 KWQ8 First Message Flow (Hybrid Approach)

```
┌─────────────────────────────────────────────────────────────────┐
│                    KWQ8 FIRST MESSAGE FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  USER MESSAGE RECEIVED                                           │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────┐                    │
│  │  STEP 1: GEMINI PARAMETER EXTRACTION    │                    │
│  │  (Parallel with Step 2)                 │                    │
│  │                                         │                    │
│  │  Extract:                               │                    │
│  │  • Language (AR/EN/Bilingual)           │                    │
│  │  • Direction (RTL/LTR)                  │                    │
│  │  • Business Type                        │                    │
│  │  • GCC Country (if detected)            │                    │
│  │  • Services/Products mentioned          │                    │
│  │  • Styling preferences                  │                    │
│  │  • Functionality requirements           │                    │
│  └─────────────────────────────────────────┘                    │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────┐                    │
│  │  STEP 2: CHECK COMPLETENESS             │                    │
│  │                                         │                    │
│  │  Required Parameters:                   │                    │
│  │  □ Business type known?                 │                    │
│  │  □ Primary features clear?              │                    │
│  │  □ Target audience understood?          │                    │
│  │                                         │                    │
│  │  If ANY missing → Ask clarifying Qs     │                    │
│  │  If ALL present → Proceed to design     │                    │
│  └─────────────────────────────────────────┘                    │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────┐                    │
│  │  STEP 3: GENERATE DESIGN INSPIRATION    │ ← v0 pattern       │
│  │  (Arabic Design Brief)                  │                    │
│  │                                         │                    │
│  │  Output:                                │                    │
│  │  • Design theme/mood                    │                    │
│  │  • Color palette (3-5 colors HSL)       │                    │
│  │  • Typography (Arabic fonts)            │                    │
│  │  • Layout structure                     │                    │
│  │  • Animation suggestions                │                    │
│  │  • Cultural elements (if GCC)           │                    │
│  └─────────────────────────────────────────┘                    │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────┐                    │
│  │  STEP 4: BRIEF PLANNING (2-4 lines)     │ ← Bolt pattern     │
│  │                                         │                    │
│  │  "I'll build your [X] with:             │                    │
│  │  1. [Component 1]                       │                    │
│  │  2. [Component 2]                       │                    │
│  │  3. [Component 3]                       │                    │
│  │  Let's start."                          │                    │
│  └─────────────────────────────────────────┘                    │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────┐                    │
│  │  STEP 5: DESIGN SYSTEM FIRST            │ ← Lovable pattern  │
│  │  (CRITICAL - Before any code)           │                    │
│  │                                         │                    │
│  │  1. Edit tailwind.config.ts             │                    │
│  │  2. Edit index.css with CSS variables   │                    │
│  │  3. Set semantic tokens                 │                    │
│  │  4. Configure Arabic fonts              │                    │
│  │  5. Set RTL as default (if Arabic)      │                    │
│  └─────────────────────────────────────────┘                    │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────┐                    │
│  │  STEP 6: GENERATE CODE                  │                    │
│  │  (DeepSeek via structured prompt)       │                    │
│  │                                         │                    │
│  │  Include:                               │                    │
│  │  • Design system reference              │                    │
│  │  • RTL rules                            │                    │
│  │  • Arabic typography                    │                    │
│  │  • Component structure                  │                    │
│  │  • Supabase patterns                    │                    │
│  └─────────────────────────────────────────┘                    │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────┐                    │
│  │  STEP 7: VALIDATE OUTPUT                │ ← Dual-AI          │
│  │  (Gemini validates DeepSeek)            │                    │
│  │                                         │                    │
│  │  Check:                                 │                    │
│  │  □ RTL correct?                         │                    │
│  │  □ Semantic tokens used?                │                    │
│  │  □ No explicit colors?                  │                    │
│  │  □ Arabic fonts applied?                │                    │
│  │  □ Functional?                          │                    │
│  │  □ GCC compliant?                       │                    │
│  │                                         │                    │
│  │  If FAIL → Fix and re-validate          │                    │
│  │  If PASS → Send to preview              │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 2.2 First Message Prompt Template (Gemini)

```markdown
# FIRST MESSAGE PROTOCOL

This is the first message of the conversation. The codebase hasn't been edited yet.

## STEP 1: ANALYZE USER REQUEST

Extract the following from the user's message:

### Language & Direction
- **Language:** [Arabic/English/Bilingual]
- **Direction:** [RTL/LTR] - Default RTL if Arabic detected
- **Locale:** [Country code if GCC mentioned]

### Business Parameters
- **Business Type:** [Restaurant/Salon/E-commerce/Corporate/Portfolio/etc.]
- **Services/Products:** [List what they're selling/offering]
- **Target Audience:** [Who are the customers]

### Design Parameters
- **Colors mentioned:** [Any color preferences]
- **Style mentioned:** [Modern/Traditional/Luxury/Minimal/etc.]
- **Inspiration mentioned:** [Any references provided]

### Functionality Parameters
- **Features requested:** [Booking/Payment/Contact/etc.]
- **Integrations needed:** [WhatsApp/Social/etc.]

## STEP 2: CHECK COMPLETENESS

Required for generation:
- [ ] Business type is clear
- [ ] At least one primary feature is understood
- [ ] Target audience can be inferred

If ANY required parameter is missing, ASK ONE clarifying question in Arabic (if Arabic detected) or English.

## STEP 3: IF COMPLETE - GENERATE DESIGN INSPIRATION

Create a design brief including:
1. **Theme/Mood:** [e.g., "Professional with warmth, trustworthy"]
2. **Color Palette:** (3-5 colors in HSL format)
   - Primary: hsl(X, X%, X%)
   - Secondary: hsl(X, X%, X%)
   - Accent: hsl(X, X%, X%)
   - Background: hsl(X, X%, X%)
   - Foreground: hsl(X, X%, X%)
3. **Typography:**
   - Heading: [Arabic font - Tajawal/Cairo/Amiri]
   - Body: [Arabic font]
4. **Layout:** [Description of structure]
5. **Cultural Elements:** [GCC-specific if applicable]

## STEP 4: BRIEF PLAN (2-4 lines max)

"I'll build your [X] with:
1. [Main component/page]
2. [Key feature]
3. [Secondary feature]

Let's start."

## STEP 5: IMPLEMENT DESIGN SYSTEM FIRST (CRITICAL)

Before ANY component code:
1. Edit `tailwind.config.ts` with semantic colors
2. Edit `src/index.css` with CSS variables
3. Set Arabic fonts
4. Configure RTL default

## STEP 6: GENERATE COMPONENTS

Use semantic tokens ONLY. Never use:
- text-white, text-black
- bg-blue-500, bg-red-600
- Any explicit color classes

Always use:
- text-foreground, text-primary-foreground
- bg-primary, bg-secondary, bg-accent
- Semantic tokens from design system
```

---

# PART 3: TOOL DEFINITIONS

## 3.1 Complete Tool Schema for KWQ8

Based on competitor analysis, KWQ8 needs these tools:

### Core Tools (12 Total)

```json
{
  "tools": [
    {
      "name": "ExtractParameters",
      "description": "Extract business, design, and functionality parameters from user message",
      "parameters": {
        "user_message": {
          "type": "string",
          "description": "The user's message to analyze"
        }
      },
      "returns": {
        "language": "AR|EN|BILINGUAL",
        "direction": "RTL|LTR",
        "locale": "KW|SA|AE|QA|BH|OM|null",
        "business_type": "string|null",
        "services": "string[]",
        "features": "string[]",
        "styling": "object|null",
        "completeness": {
          "is_complete": "boolean",
          "missing": "string[]"
        }
      }
    },
    {
      "name": "GenerateDesignInspiration",
      "description": "Generate Arabic-first design brief before coding. MUST be called before any code generation on first message.",
      "parameters": {
        "goal": {
          "type": "string",
          "description": "High-level product/feature or UX goal"
        },
        "context": {
          "type": "string",
          "description": "Optional design cues, brand adjectives, constraints"
        },
        "locale": {
          "type": "string",
          "description": "GCC country code for cultural customization"
        },
        "direction": {
          "type": "string",
          "enum": ["RTL", "LTR"],
          "default": "RTL"
        }
      },
      "returns": {
        "theme": "string",
        "color_palette": {
          "primary": "hsl()",
          "secondary": "hsl()",
          "accent": "hsl()",
          "background": "hsl()",
          "foreground": "hsl()"
        },
        "typography": {
          "heading_font": "string",
          "body_font": "string"
        },
        "layout_structure": "string",
        "cultural_elements": "string[]",
        "animations": "string[]"
      }
    },
    {
      "name": "CreateFile",
      "description": "Create a new file with content",
      "parameters": {
        "file_path": {
          "type": "string",
          "description": "Path to the file to create"
        },
        "file_contents": {
          "type": "string",
          "description": "Contents of the file"
        }
      }
    },
    {
      "name": "UpdateFile",
      "description": "Update specific lines in a file. Prefer over full rewrite for surgical edits.",
      "parameters": {
        "file_path": {
          "type": "string",
          "description": "Path to file"
        },
        "updates": {
          "type": "array",
          "items": {
            "line_start": "number",
            "line_end": "number",
            "new_content": "string"
          },
          "description": "List of line ranges to update"
        }
      }
    },
    {
      "name": "ReplaceInFile",
      "description": "Replace exact string matches in a file. Use when you know the exact text to replace.",
      "parameters": {
        "file_path": {
          "type": "string"
        },
        "old_string": {
          "type": "string",
          "description": "Exact string to find (must be unique in file)"
        },
        "new_string": {
          "type": "string",
          "description": "String to replace with"
        }
      }
    },
    {
      "name": "DeleteFile",
      "description": "Delete a file from the project",
      "parameters": {
        "file_path": {
          "type": "string"
        }
      }
    },
    {
      "name": "ReadFile",
      "description": "Read file contents. Only use if file is NOT already in context.",
      "parameters": {
        "file_path": {
          "type": "string"
        }
      }
    },
    {
      "name": "SearchFiles",
      "description": "Search for files by name or content pattern",
      "parameters": {
        "query": {
          "type": "string",
          "description": "Search query (filename or content pattern)"
        },
        "file_pattern": {
          "type": "string",
          "description": "Glob pattern to filter files (e.g., '*.tsx')"
        }
      }
    },
    {
      "name": "RunTerminal",
      "description": "Execute terminal command",
      "parameters": {
        "command": {
          "type": "string"
        },
        "timeout_ms": {
          "type": "number",
          "default": 30000
        }
      }
    },
    {
      "name": "GetConsoleLogs",
      "description": "Get browser console logs for debugging",
      "parameters": {
        "log_type": {
          "type": "string",
          "enum": ["all", "error", "warn", "info"],
          "default": "error"
        },
        "limit": {
          "type": "number",
          "default": 50
        }
      }
    },
    {
      "name": "TakeScreenshot",
      "description": "Capture screenshot of current preview for visual debugging",
      "parameters": {
        "viewport": {
          "type": "string",
          "enum": ["desktop", "tablet", "mobile"],
          "default": "desktop"
        }
      }
    },
    {
      "name": "ValidateOutput",
      "description": "Validate generated code against design system and RTL rules",
      "parameters": {
        "file_paths": {
          "type": "array",
          "items": { "type": "string" }
        },
        "checks": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "rtl_correct",
              "semantic_tokens",
              "no_explicit_colors",
              "arabic_fonts",
              "supabase_rls",
              "accessibility"
            ]
          }
        }
      },
      "returns": {
        "passed": "boolean",
        "failures": [
          {
            "file": "string",
            "line": "number",
            "issue": "string",
            "fix": "string"
          }
        ]
      }
    }
  ]
}
```

## 3.2 Tool Usage Rules

```markdown
# TOOL USAGE RULES

## PARALLEL TOOL CALLS
You CAN call multiple tools in parallel when they don't depend on each other:

✅ CORRECT (Parallel):
[Call ExtractParameters AND SearchFiles simultaneously]

❌ WRONG (Sequential when could be parallel):
[Call ExtractParameters]
[Wait for result]
[Call SearchFiles]

## READ FILE RULE
NEVER re-read a file that is already in your context.
- If file contents were provided in the conversation → Use that content
- If you just created/edited a file → You know its content
- Only use ReadFile for files you haven't seen yet

## EDIT PREFERENCE
Prefer surgical edits over full file rewrites:

✅ Use UpdateFile or ReplaceInFile for:
- Changing specific lines
- Adding imports
- Modifying a single function
- Fixing a bug

✅ Use CreateFile (full rewrite) for:
- Initial file creation
- Complete restructuring (>50% of file changes)
- New components

## VALIDATION RULE
ALWAYS call ValidateOutput after:
- First message code generation
- Major structural changes
- Adding new components

## DESIGN INSPIRATION RULE
ALWAYS call GenerateDesignInspiration:
- On first message (before any code)
- When user asks for major design changes
- When creating new pages
```

---

# PART 4: EDITING SYSTEM

## 4.1 Edit Tool Implementation

Based on Lovable's UpdateFile and Cursor's edit_file patterns:

```typescript
// UpdateFile Tool Implementation

interface LineUpdate {
  line_start: number;  // 1-indexed
  line_end: number;    // Inclusive
  new_content: string;
}

interface UpdateFileParams {
  file_path: string;
  updates: LineUpdate[];
}

async function updateFile(params: UpdateFileParams): Promise<UpdateResult> {
  const { file_path, updates } = params;
  
  // Read current file
  const currentContent = await readFile(file_path);
  const lines = currentContent.split('\n');
  
  // Sort updates by line number (descending) to avoid index shifting
  const sortedUpdates = [...updates].sort((a, b) => b.line_start - a.line_start);
  
  // Apply each update
  for (const update of sortedUpdates) {
    const { line_start, line_end, new_content } = update;
    
    // Validate line numbers
    if (line_start < 1 || line_end > lines.length) {
      throw new Error(`Invalid line range: ${line_start}-${line_end}`);
    }
    
    // Replace lines
    const newLines = new_content.split('\n');
    lines.splice(line_start - 1, line_end - line_start + 1, ...newLines);
  }
  
  // Write back
  const newContent = lines.join('\n');
  await writeFile(file_path, newContent);
  
  return {
    success: true,
    file_path,
    lines_changed: updates.reduce((sum, u) => sum + (u.line_end - u.line_start + 1), 0)
  };
}
```

## 4.2 ReplaceInFile Implementation

Based on Cursor's old_string/new_string pattern:

```typescript
interface ReplaceInFileParams {
  file_path: string;
  old_string: string;
  new_string: string;
}

async function replaceInFile(params: ReplaceInFileParams): Promise<ReplaceResult> {
  const { file_path, old_string, new_string } = params;
  
  // Read current file
  const currentContent = await readFile(file_path);
  
  // Check if old_string exists and is unique
  const occurrences = (currentContent.match(new RegExp(escapeRegExp(old_string), 'g')) || []).length;
  
  if (occurrences === 0) {
    throw new Error(`String not found in file: "${old_string.substring(0, 50)}..."`);
  }
  
  if (occurrences > 1) {
    throw new Error(`String found ${occurrences} times. Must be unique. Add more context.`);
  }
  
  // Replace
  const newContent = currentContent.replace(old_string, new_string);
  await writeFile(file_path, newContent);
  
  return {
    success: true,
    file_path,
    old_length: old_string.length,
    new_length: new_string.length
  };
}
```

## 4.3 "// ... existing code ..." Pattern

From v0's approach - when showing partial edits:

```markdown
# PARTIAL EDIT DISPLAY RULES

When showing code changes to the user, use the "existing code" marker:

✅ CORRECT:
```tsx
import { useState } from 'react';
// ... existing imports ...

export function MyComponent() {
  // ... existing state ...
  
  // NEW: Added handler
  const handleClick = () => {
    console.log('clicked');
  };
  
  return (
    // ... existing JSX ...
    <button onClick={handleClick}>Click me</button>
    // ... rest of component ...
  );
}
```

❌ WRONG (Showing full file when only small change):
```tsx
// Showing 200 lines when only 5 changed
import { useState } from 'react';
import { useEffect } from 'react';
// ... 195 more lines ...
```

## WHEN TO USE MARKERS:
- File is > 50 lines
- Change affects < 30% of file
- User can understand context from markers

## WHEN TO SHOW FULL FILE:
- File is < 50 lines
- Change affects > 50% of file
- New file creation
- Critical structural changes
```

---

# PART 5: DESIGN SYSTEM ENFORCEMENT

## 5.1 Design System Rules (From All Competitors)

```markdown
# DESIGN SYSTEM RULES - MANDATORY

## COLOR RULES

### 1. Maximum Colors: 3-5 only
- Primary (brand color)
- Secondary (supporting)
- Accent (highlights)
- Background
- Foreground

### 2. Format: HSL ONLY
✅ CORRECT: hsl(222, 47%, 11%)
❌ WRONG: #1a1f2e, rgb(26, 31, 46), blue

### 3. Semantic Tokens ONLY
✅ CORRECT:
- bg-primary, bg-secondary, bg-accent
- text-foreground, text-primary-foreground
- border-border, ring-ring

❌ FORBIDDEN:
- bg-blue-500, bg-red-600, bg-gray-100
- text-white, text-black, text-gray-700
- border-gray-200

## TYPOGRAPHY RULES

### 1. Maximum Fonts: 2 only
- Heading font (Arabic: Tajawal, Cairo, or Amiri)
- Body font (can be same as heading)

### 2. Font Variables
```css
:root {
  --font-heading: 'Tajawal', sans-serif;
  --font-body: 'Tajawal', sans-serif;
}
```

### 3. Usage
```tsx
// ✅ CORRECT
className="font-heading text-2xl"
className="font-body text-base"

// ❌ WRONG
className="font-sans text-2xl"
style={{ fontFamily: 'Arial' }}
```

## RTL RULES (ARABIC-FIRST)

### 1. Default Direction
```html
<html lang="ar" dir="rtl">
```

### 2. Logical Properties
```css
/* ✅ CORRECT - Works in RTL and LTR */
margin-inline-start: 1rem;
padding-inline-end: 1rem;
text-align: start;

/* ❌ WRONG - Breaks in RTL */
margin-left: 1rem;
padding-right: 1rem;
text-align: left;
```

### 3. Tailwind RTL Classes
```tsx
// ✅ CORRECT
className="ms-4"  // margin-inline-start
className="pe-4"  // padding-inline-end
className="text-start"

// ❌ WRONG
className="ml-4"  // margin-left (breaks RTL)
className="pr-4"  // padding-right (breaks RTL)
className="text-left"
```

## IMPLEMENTATION ORDER

1. FIRST: Create/update tailwind.config.ts
2. SECOND: Create/update src/index.css with CSS variables
3. THIRD: Then write components

NEVER write components before design system is set.
```

## 5.2 Design System File Templates

### tailwind.config.ts Template (Arabic-First)

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Semantic Colors - Use these ONLY
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // Arabic Typography
      fontFamily: {
        heading: ["var(--font-heading)", "Tajawal", "sans-serif"],
        body: ["var(--font-body)", "Tajawal", "sans-serif"],
      },
      // RTL-aware border radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### index.css Template (Arabic-First)

```css
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Arabic Typography */
    --font-heading: 'Tajawal', sans-serif;
    --font-body: 'Tajawal', sans-serif;
    
    /* Colors - Light Mode */
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    
    --primary: 222 47% 20%;
    --primary-foreground: 0 0% 98%;
    
    --secondary: 210 40% 96%;
    --secondary-foreground: 222 47% 11%;
    
    --accent: 210 40% 90%;
    --accent-foreground: 222 47% 11%;
    
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 222 47% 20%;
    
    --radius: 0.5rem;
  }

  .dark {
    --background: 222 47% 11%;
    --foreground: 0 0% 98%;
    
    --primary: 210 40% 98%;
    --primary-foreground: 222 47% 11%;
    
    --secondary: 217 33% 17%;
    --secondary-foreground: 0 0% 98%;
    
    --accent: 217 33% 17%;
    --accent-foreground: 0 0% 98%;
    
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    
    --destructive: 0 62% 30%;
    --destructive-foreground: 0 0% 98%;
    
    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 212 100% 67%;
  }
  
  /* RTL Default */
  html {
    direction: rtl;
  }
  
  /* Arabic Typography Base */
  body {
    font-family: var(--font-body);
    font-feature-settings: "ss01", "ss02";
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    font-weight: 700;
  }
}
```

---

# PART 6: ERROR HANDLING & SELF-HEALING

## 6.1 Error Detection Flow

```markdown
# ERROR DETECTION & FIXING

## ERROR TYPES TO DETECT

1. **Build Errors**
   - TypeScript compilation errors
   - Missing imports
   - Type mismatches

2. **Runtime Errors**
   - React rendering errors
   - Undefined variables
   - Failed API calls

3. **Design System Violations**
   - Explicit colors used (bg-blue-500)
   - Wrong font families
   - RTL issues

4. **Supabase Errors**
   - RLS policy violations
   - Missing migrations
   - Schema mismatches

## SELF-HEALING LOOP

```
┌─────────────────────────────────────────┐
│         ERROR DETECTED                   │
│                                          │
│  Source: [Console/Build/Validation]      │
│  Type: [Build/Runtime/Design/Database]   │
│  Message: [Error text]                   │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         ANALYZE ERROR                    │
│                                          │
│  1. Identify affected file(s)            │
│  2. Determine root cause                 │
│  3. Check if similar fix exists          │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         GENERATE FIX                     │
│                                          │
│  1. Create minimal fix (surgical edit)   │
│  2. Prefer UpdateFile over rewrite       │
│  3. Add missing imports if needed        │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         APPLY & VALIDATE                 │
│                                          │
│  1. Apply fix                            │
│  2. Run validation                       │
│  3. Check console for new errors         │
└─────────────────────────────────────────┘
              │
              ▼
        ┌─────────────┐
        │ Still Error?│
        └──────┬──────┘
               │
    ┌──────────┴──────────┐
    │                     │
   YES                   NO
    │                     │
    ▼                     ▼
┌─────────┐        ┌─────────────┐
│ Retry   │        │ SUCCESS     │
│ (max 3) │        │ Continue    │
└─────────┘        └─────────────┘
    │
    ▼ (if max retries)
┌─────────────────────────────────────────┐
│         ASK USER FOR HELP                │
│                                          │
│  "I encountered an issue I couldn't      │
│   automatically fix. Here's what I       │
│   tried: [summary]                       │
│                                          │
│   Would you like me to try a different   │
│   approach, or do you have suggestions?" │
└─────────────────────────────────────────┘
```

## MAX RETRY ATTEMPTS: 3

After 3 failed attempts, escalate to user with:
1. What error occurred
2. What fixes were attempted
3. Why they didn't work
4. Suggested alternative approaches
```

## 6.2 Common Error Patterns & Auto-Fixes

```typescript
const ERROR_PATTERNS = {
  // Missing Import
  "Cannot find name '(.+)'": {
    type: "missing_import",
    fix: async (match, file) => {
      const name = match[1];
      const importStatement = getImportFor(name);
      return addImportToFile(file, importStatement);
    }
  },
  
  // Explicit Color (Design System Violation)
  "(bg|text|border)-(red|blue|green|gray|white|black)-\\d+": {
    type: "design_violation",
    fix: async (match, file) => {
      const violation = match[0];
      const semantic = mapToSemanticToken(violation);
      return replaceInFile(file, violation, semantic);
    }
  },
  
  // RTL Issue
  "(ml|mr|pl|pr)-\\d+": {
    type: "rtl_violation",
    fix: async (match, file) => {
      const violation = match[0];
      const logical = mapToLogicalProperty(violation);
      return replaceInFile(file, violation, logical);
    }
  },
  
  // Supabase RLS
  "new row violates row-level security": {
    type: "rls_violation",
    fix: async (match, file) => {
      // Suggest adding RLS policy
      return suggestRLSPolicy();
    }
  }
};
```

---

# PART 7: CONTEXT MANAGEMENT

## 7.1 "Never Re-Read" Rule Implementation

```markdown
# CONTEXT MANAGEMENT RULES

## RULE 1: NEVER RE-READ FILES IN CONTEXT

If a file's contents are already visible in the conversation:
- Use that content directly
- DO NOT call ReadFile

Check context for:
- Files shown by user
- Files you just created
- Files you just edited
- Files from previous tool calls

## RULE 2: CONTEXT PRIORITY

When context window is limited, prioritize:

1. **HIGHEST:** Currently edited file(s)
2. **HIGH:** Files with errors
3. **MEDIUM:** Related imports/dependencies
4. **LOW:** Config files (if not being changed)
5. **LOWEST:** Test files, documentation

## RULE 3: SUMMARIZE WHEN NEEDED

For large files (>500 lines):
- Summarize unchanged sections
- Show detailed view only for sections being edited
- Use "// ... existing code ..." markers

## RULE 4: TRACK FILE STATE

Maintain internal state:
```json
{
  "files_in_context": [
    {
      "path": "src/App.tsx",
      "last_read": "turn_5",
      "modified_by_me": true,
      "current_version": "hash123"
    }
  ]
}
```

Only re-read if:
- User says file was externally modified
- Error suggests file is out of sync
- Explicit user request
```

## 7.2 Context Compression Strategy

```markdown
# CONTEXT COMPRESSION

## WHEN TO COMPRESS

1. **Conversation > 20 turns**
   - Summarize early turns
   - Keep recent 5 turns detailed

2. **Many files edited**
   - Keep only latest version of each file
   - Summarize changes made

3. **Long file contents**
   - Show changed sections only
   - Reference unchanged sections by line range

## COMPRESSION FORMAT

### For Files:
```
FILE: src/components/Header.tsx
LINES: 1-50 (unchanged from initial creation)
LINES 51-75: [Current content shown]
LINES 76-120 (unchanged)
```

### For Conversation:
```
SUMMARY (Turns 1-15):
- User requested: Arabic restaurant website
- Created: Design system, Header, Hero, Menu components
- Fixed: 2 RTL issues, 1 TypeScript error
- Current state: 5 files created, all passing validation
```
```

---

# PART 8: SUPABASE INTEGRATION PATTERNS

## 8.1 Database Rules (From Analysis)

```markdown
# SUPABASE RULES

## SCHEMA CHANGES

### 1. Always Use Migrations
✅ CORRECT:
```sql
-- migration: 0001_create_users.sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

❌ WRONG:
```sql
CREATE TABLE users (...);  -- No IF NOT EXISTS
```

### 2. Always Add RLS
Every table MUST have RLS enabled:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);
```

### 3. Foreign Key Pattern
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## CLIENT INITIALIZATION

### Standard Pattern:
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

## QUERY PATTERNS

### Select with Error Handling:
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('user_id', userId);

if (error) {
  console.error('Error fetching products:', error);
  throw error;
}

return data;
```

### Insert with Validation:
```typescript
const { data, error } = await supabase
  .from('products')
  .insert({
    name: productName,
    user_id: userId,
    price: price
  })
  .select()
  .single();

if (error) {
  if (error.code === '23505') {
    throw new Error('Product already exists');
  }
  throw error;
}

return data;
```
```

---

# PART 9: GCC-SPECIFIC IMPLEMENTATION

## 9.1 GCC Detection & Configuration

```typescript
// src/lib/gcc-config.ts

interface GCCConfig {
  country: 'KW' | 'SA' | 'AE' | 'QA' | 'BH' | 'OM';
  currency: {
    code: string;
    symbol: string;
    decimals: number;
    position: 'before' | 'after';
  };
  vat: {
    rate: number;
    enabled: boolean;
  };
  phoneFormat: {
    countryCode: string;
    pattern: RegExp;
    example: string;
  };
  direction: 'rtl' | 'ltr';
  primaryFont: string;
}

export const GCC_CONFIGS: Record<string, GCCConfig> = {
  KW: {
    country: 'KW',
    currency: { code: 'KWD', symbol: 'د.ك', decimals: 3, position: 'after' },
    vat: { rate: 0, enabled: false },
    phoneFormat: { countryCode: '+965', pattern: /^\+965\d{8}$/, example: '+965 1234 5678' },
    direction: 'rtl',
    primaryFont: 'Tajawal'
  },
  SA: {
    country: 'SA',
    currency: { code: 'SAR', symbol: 'ر.س', decimals: 2, position: 'after' },
    vat: { rate: 15, enabled: true },
    phoneFormat: { countryCode: '+966', pattern: /^\+9665\d{8}$/, example: '+966 50 123 4567' },
    direction: 'rtl',
    primaryFont: 'Tajawal'
  },
  AE: {
    country: 'AE',
    currency: { code: 'AED', symbol: 'د.إ', decimals: 2, position: 'after' },
    vat: { rate: 5, enabled: true },
    phoneFormat: { countryCode: '+971', pattern: /^\+9715\d{8}$/, example: '+971 50 123 4567' },
    direction: 'rtl',
    primaryFont: 'Tajawal'
  },
  QA: {
    country: 'QA',
    currency: { code: 'QAR', symbol: 'ر.ق', decimals: 2, position: 'after' },
    vat: { rate: 0, enabled: false },
    phoneFormat: { countryCode: '+974', pattern: /^\+974\d{8}$/, example: '+974 1234 5678' },
    direction: 'rtl',
    primaryFont: 'Tajawal'
  },
  BH: {
    country: 'BH',
    currency: { code: 'BHD', symbol: 'د.ب', decimals: 3, position: 'after' },
    vat: { rate: 10, enabled: true },
    phoneFormat: { countryCode: '+973', pattern: /^\+973\d{8}$/, example: '+973 1234 5678' },
    direction: 'rtl',
    primaryFont: 'Tajawal'
  },
  OM: {
    country: 'OM',
    currency: { code: 'OMR', symbol: 'ر.ع', decimals: 3, position: 'after' },
    vat: { rate: 5, enabled: true },
    phoneFormat: { countryCode: '+968', pattern: /^\+968\d{8}$/, example: '+968 1234 5678' },
    direction: 'rtl',
    primaryFont: 'Tajawal'
  }
};

// Detect GCC country from user message
export function detectGCCCountry(message: string): string | null {
  const patterns = {
    KW: /كويت|kuwait|الكويت/i,
    SA: /سعودي|saudi|السعودية|المملكة/i,
    AE: /إمارات|uae|emirates|دبي|أبوظبي/i,
    QA: /قطر|qatar|الدوحة/i,
    BH: /بحرين|bahrain|المنامة/i,
    OM: /عمان|oman|مسقط/i
  };
  
  for (const [code, pattern] of Object.entries(patterns)) {
    if (pattern.test(message)) {
      return code;
    }
  }
  
  return null;
}
```

## 9.2 GCC Components

```typescript
// src/components/gcc/VATCalculator.tsx
import { GCC_CONFIGS } from '@/lib/gcc-config';

interface VATCalculatorProps {
  amount: number;
  countryCode: keyof typeof GCC_CONFIGS;
  showBreakdown?: boolean;
}

export function VATCalculator({ amount, countryCode, showBreakdown = true }: VATCalculatorProps) {
  const config = GCC_CONFIGS[countryCode];
  const vatAmount = config.vat.enabled ? amount * (config.vat.rate / 100) : 0;
  const total = amount + vatAmount;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-' + countryCode, {
      style: 'currency',
      currency: config.currency.code,
      minimumFractionDigits: config.currency.decimals,
      maximumFractionDigits: config.currency.decimals
    }).format(value);
  };
  
  if (!showBreakdown) {
    return <span>{formatCurrency(total)}</span>;
  }
  
  return (
    <div className="space-y-2 text-start">
      <div className="flex justify-between">
        <span className="text-muted-foreground">المبلغ الأساسي</span>
        <span>{formatCurrency(amount)}</span>
      </div>
      {config.vat.enabled && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">ضريبة القيمة المضافة ({config.vat.rate}%)</span>
          <span>{formatCurrency(vatAmount)}</span>
        </div>
      )}
      <div className="flex justify-between font-bold border-t pt-2">
        <span>الإجمالي</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
```

---

# PART 10: PROMPT TEMPLATES

## 10.1 Gemini Orchestrator System Prompt

```markdown
# KWQ8 GEMINI ORCHESTRATOR SYSTEM PROMPT

You are the orchestrator for KWQ8, an Arabic-first AI website builder for GCC markets.

## YOUR ROLE
1. Analyze user requests
2. Extract parameters (language, business type, features, styling)
3. Ask clarifying questions when needed
4. Generate structured prompts for DeepSeek code generation
5. Validate DeepSeek output

## FIRST MESSAGE PROTOCOL

When receiving the first message:

### Step 1: Extract Parameters
Analyze the message for:
- **Language:** Arabic (AR), English (EN), or Bilingual
- **Direction:** RTL (default for Arabic), LTR
- **GCC Country:** Kuwait, Saudi, UAE, Qatar, Bahrain, Oman (if mentioned)
- **Business Type:** Restaurant, Salon, E-commerce, Corporate, Portfolio, etc.
- **Services/Products:** What are they selling/offering
- **Features:** Booking, Payment, Contact, Gallery, etc.
- **Styling:** Colors, mood, inspiration mentioned

### Step 2: Check Completeness
Required for generation:
- Business type is clear
- At least one feature understood
- Target audience can be inferred

If ANY missing → Ask ONE clarifying question (in Arabic if Arabic detected)

### Step 3: Generate Design Inspiration
If complete, create design brief:
```json
{
  "theme": "Professional with warmth",
  "colors": {
    "primary": "hsl(222, 47%, 20%)",
    "secondary": "hsl(210, 40%, 96%)",
    "accent": "hsl(45, 93%, 47%)"
  },
  "typography": {
    "heading": "Tajawal",
    "body": "Tajawal"
  },
  "layout": "Hero → Features → Services → CTA → Footer",
  "cultural_elements": ["Islamic patterns", "Right-to-left flow"]
}
```

### Step 4: Brief Plan (2-4 lines)
"I'll build your [X] with:
1. [Component]
2. [Feature]
3. [Integration]
Let's start."

### Step 5: Design System First
ALWAYS start by editing:
1. tailwind.config.ts
2. src/index.css

Before any component code.

## SUBSEQUENT MESSAGES

For edit requests:
1. Identify what needs to change
2. Prefer surgical edits (UpdateFile) over rewrites
3. Validate after changes

For questions:
1. Answer concisely
2. Offer to implement if relevant

## VALIDATION CHECKLIST

After code generation, verify:
- [ ] RTL is correct (dir="rtl", logical properties)
- [ ] Semantic tokens used (no bg-blue-500)
- [ ] Arabic fonts applied (Tajawal/Cairo/Amiri)
- [ ] GCC compliance (VAT if applicable)
- [ ] Supabase RLS enabled (if database)
- [ ] No console errors

## RESPONSE FORMAT

Keep responses concise:
- Brief acknowledgment
- Short plan (2-4 lines)
- Code changes
- Validation result

Never:
- Over-explain decisions
- Repeat what user said
- Add unnecessary pleasantries
```

## 10.2 DeepSeek Code Generation Prompt Template

```markdown
# DEEPSEEK CODE GENERATION PROMPT

You are generating code for KWQ8, an Arabic-first website builder.

## CONTEXT
[Design Brief from Gemini]

## REQUIREMENTS

### RTL-First (MANDATORY)
- Default dir="rtl" on html
- Use logical properties: ms-4, me-4, ps-4, pe-4, text-start
- Never use: ml-4, mr-4, pl-4, pr-4, text-left

### Semantic Tokens Only (MANDATORY)
- bg-primary, bg-secondary, bg-accent
- text-foreground, text-primary-foreground
- Never use: bg-blue-500, text-white, text-gray-700

### Arabic Typography (MANDATORY)
- font-heading for h1-h6
- font-body for body text
- Default font: Tajawal

### Supabase (If Needed)
- Use migrations with IF NOT EXISTS
- Enable RLS on all tables
- Add policies for data access

## FILE ORDER
1. tailwind.config.ts (if design system changes)
2. src/index.css (if CSS variables change)
3. Components (src/components/...)
4. Pages (src/pages/...)
5. Migrations (supabase/migrations/...)

## CODE STYLE
- TypeScript strict mode
- Functional components with hooks
- Props interfaces defined
- Error handling for all async operations

## OUTPUT FORMAT
Provide complete file contents for each file.
Use "// ... existing code ..." only when editing existing files.
```

---

# PART 11: IMPLEMENTATION CHECKLIST

## 11.1 Phase 1: Core Architecture (Week 1)

### Day 1-2: Tool System
- [ ] Implement ExtractParameters tool
- [ ] Implement GenerateDesignInspiration tool
- [ ] Implement CreateFile tool
- [ ] Implement UpdateFile tool (line-based)
- [ ] Implement ReplaceInFile tool (string-based)
- [ ] Implement ReadFile tool with context check
- [ ] Implement parallel tool call support

### Day 3-4: Prompt Engineering
- [ ] Write Gemini orchestrator system prompt
- [ ] Write DeepSeek code generation prompt template
- [ ] Write first message protocol
- [ ] Write validation checklist prompt
- [ ] Add Arabic/GCC detection rules

### Day 5-6: Design System
- [ ] Create default Arabic tailwind.config.ts
- [ ] Create default Arabic index.css
- [ ] Implement design system validator
- [ ] Add semantic token enforcement
- [ ] Add RTL validation

### Day 7: Integration
- [ ] Connect Gemini orchestrator
- [ ] Connect DeepSeek generator
- [ ] Implement dual-AI validation loop
- [ ] Test first message flow

## 11.2 Phase 2: Features (Week 2)

### Templates
- [ ] Arabic E-commerce template
- [ ] Arabic Restaurant template
- [ ] Arabic Corporate template
- [ ] Arabic Salon template
- [ ] Arabic Portfolio template

### GCC Components
- [ ] VATCalculator component
- [ ] GCCPhoneInput component
- [ ] CurrencyDisplay component
- [ ] ArabicInvoice component

### Error Handling
- [ ] Build error detection
- [ ] Runtime error detection
- [ ] Design violation detection
- [ ] Self-healing loop (max 3 retries)

## 11.3 Phase 3: Polish (Week 3-4)

### Validation
- [ ] RTL validator
- [ ] Semantic token validator
- [ ] Accessibility validator
- [ ] Performance validator

### Optimization
- [ ] Context compression
- [ ] "Never re-read" enforcement
- [ ] Parallel tool call optimization
- [ ] Response time < 5s

---

# SUMMARY: KEY ARCHITECTURAL DECISIONS

| Decision | Choice | Rationale |
|----------|--------|-----------|
| First Message | Design-First + Brief Plan | Lovable's quality + Bolt's speed |
| Design Tool | GenerateDesignInspiration | v0's approach, ensures consistency |
| Edit Tools | Line-based + String-based | Lovable + Cursor patterns |
| AI Architecture | Gemini Orchestrate + DeepSeek Generate | Cost-effective, validation |
| RTL Approach | Default RTL, logical properties | Arabic-first market |
| Design System | Semantic tokens only | All competitors enforce this |
| Error Handling | Self-heal (3 max) then escalate | Cursor's approach |
| Context | Never re-read, compress old | All competitors do this |

---

**Document Version:** 3.0  
**Based On:** Competitor analysis of Lovable, v0, Bolt, Cursor  
**Ready For:** Development Team Implementation  
**Next Step:** Assign tasks and begin Phase 1
