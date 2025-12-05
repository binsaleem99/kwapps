# Decision Log: Gemini 3 Pro Integration

**Date**: 2025-12-02
**Author**: KWAPPS-CHIEF
**Status**: In Progress

---

## Executive Summary

Integrate Google Gemini 3 Pro alongside DeepSeek to create a hybrid AI pipeline:
- **Gemini**: Planning/architecture + Annotation/explanation
- **DeepSeek**: Code generation (remains primary coder)

---

## Architecture Decisions

### 1. Hybrid Pipeline Design

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER PROMPT (Arabic)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                   ┌─────────┴─────────┐
                   │   Mode Selection  │
                   └─────────┬─────────┘
                             │
          ┌──────────────────┴──────────────────┐
          │                                      │
          ▼                                      ▼
┌─────────────────────┐                ┌─────────────────────┐
│   STANDARD MODE     │                │    SMART MODE       │
│   (DeepSeek only)   │                │ (Gemini + DeepSeek) │
└─────────────────────┘                └──────────┬──────────┘
                                                  │
                                        ┌─────────┴─────────┐
                                        ▼                   │
                               ┌─────────────────┐          │
                               │ Stage 1: GEMINI │          │
                               │ planFromPrompt  │          │
                               │  → JSON Spec    │          │
                               └────────┬────────┘          │
                                        │                   │
                                        ▼                   │
                               ┌─────────────────┐          │
                               │ Stage 2: DEEPSK │          │
                               │ generateCode    │          │
                               │  → TSX/JSX      │          │
                               └────────┬────────┘          │
                                        │                   │
                                        ▼                   │
                               ┌─────────────────┐          │
                               │ Stage 3: GEMINI │◄─────────┘
                               │ annotateCode    │  (on demand)
                               │  → Suggestions  │
                               └─────────────────┘
```

### 2. File Structure

```
src/lib/gemini/
├── client.ts           # Main Gemini client
├── types.ts            # TypeScript interfaces
└── prompts.ts          # Gemini-specific prompts

src/app/api/
├── generate/route.ts   # Updated with Smart mode
└── annotate/route.ts   # NEW: Annotation endpoint
```

### 3. Environment Variables

```env
# Gemini Configuration
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL_ID=gemini-2.0-flash-exp  # Using Gemini 2.0 Flash (latest available)
```

### 4. Database Schema (No changes needed)

Existing tables support this:
- `generated_code.description` - Can store Gemini plan summary
- `messages.metadata` - Can store generation mode
- `analytics_events` - For tracking Smart mode usage

---

## Implementation Order

1. **OPS Phase** (DONE)
   - Add env vars to .env.local
   - Create gemini/client.ts skeleton

2. **DEV Phase 1** (IN PROGRESS)
   - Implement gemini/client.ts with planFromPrompt + annotateCode
   - Create gemini/types.ts with interfaces

3. **DEV Phase 2**
   - Update /api/generate for Smart mode
   - Create /api/annotate endpoint

4. **DESIGN+DEV Phase**
   - Add mode switch to chat panel
   - Add Annotations tab to preview panel

5. **GUARD Phase**
   - Manual testing of both modes
   - Verify RTL and Arabic support

6. **OPS Phase Final**
   - Deploy to Vercel

---

## Risk Mitigation

1. **Gemini API Latency**: Use non-blocking SSE progress updates
2. **Fallback**: If Gemini fails, fall back to Standard mode
3. **Cost Control**: Track Gemini API calls in analytics_events
4. **Backward Compatibility**: Default to Standard mode

---

## Success Criteria

- [ ] Smart mode produces structured apps following Gemini's plan
- [ ] Annotations provide useful UX/conversion insights
- [ ] No regression in Standard mode
- [ ] All UI text in Arabic
- [ ] Under 30s total generation time

---

## Related Files

- `/src/app/api/generate/route.ts`
- `/src/lib/deepseek/streaming-client.ts`
- `/src/components/builder/chat-panel-new.tsx`
- `/src/components/builder/preview-panel.tsx`
- `/prompts/master-ui-deepseek-client.md`
