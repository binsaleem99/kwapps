# 🔍 COMPETITOR ANALYSIS QUESTIONS
## For Claude Code Analysis of github.com/binsaleem99/system-prompts-and-models-of-ai-tools

> **INSTRUCTIONS FOR CLAUDE CODE:**
> - Only answer based on actual code/prompts in the repository
> - Quote exact text when possible
> - Say "not found" if information doesn't exist
> - No assumptions or inferences
> - Provide file paths for all references

---

# SECTION 1: CODE GENERATION

## 1.1 Initial Code Generation
1. What exact prompt structure do Lovable, v0, and Bolt use to generate code from a user's first message?
2. What parameters/variables do they extract from user input before generating?
3. Show the exact code/prompt that handles "build me a landing page" type requests
4. What default values do they set when user doesn't specify (framework, styling, database)?
5. How do they determine file structure for a new project?
6. What's the exact order of files they create first?

## 1.2 Code Quality Rules
7. What exact rules do they enforce for code formatting?
8. Show all linting/style rules mentioned in the prompts
9. What patterns are FORBIDDEN in generated code? (exact list)
10. What patterns are REQUIRED in generated code? (exact list)
11. How do they enforce TypeScript strict mode?
12. What import ordering rules do they specify?

## 1.3 Framework-Specific Generation
13. What exact React patterns do they enforce? (hooks, components, state)
14. What Next.js specific rules exist in the prompts?
15. How do they handle Server Components vs Client Components?
16. What Tailwind CSS rules/restrictions do they enforce?
17. Show all shadcn/ui usage rules
18. What database query patterns do they enforce for Supabase?

---

# SECTION 2: EDITING & MODIFYING CODE

## 2.1 Edit Detection
19. How do they detect what needs to be edited vs what stays the same?
20. What's the exact logic for "surgical edits" vs "full file rewrite"?
21. Show the prompt text that instructs minimal changes
22. How do they handle "change the button color" type requests?
23. What's their diff/patch generation approach?

## 2.2 Edit Tools
24. List ALL editing tools available in each system (exact names)
25. What are the exact parameters for each edit tool?
26. Show the tool schema/definition for line-replace or equivalent
27. How do they specify line numbers or ranges?
28. What's the fallback when edit fails?

## 2.3 Edit Safety
29. What validation happens before applying an edit?
30. How do they prevent breaking existing functionality?
31. What's the rollback mechanism if edit breaks code?
32. Show any "read before edit" requirements in the prompts
33. How do they handle merge conflicts or concurrent edits?

---

# SECTION 3: ERROR HANDLING & DEBUGGING

## 3.1 Error Detection
34. How do they detect errors in generated code?
35. What error types do they specifically handle? (list all)
36. Show the prompt text for error classification
37. How do they parse console errors?
38. How do they parse build/compile errors?
39. How do they parse runtime errors?

## 3.2 Error Fixing
40. What's the exact prompt/flow when an error is detected?
41. How many retry attempts do they allow?
42. What changes between retry attempts?
43. Show the "self-healing" or auto-fix logic
44. How do they prevent infinite error loops?
45. What's the escalation path when auto-fix fails?

## 3.3 Debugging Tools
46. What debugging tools are available? (list all with parameters)
47. How do they access browser console logs?
48. How do they access network requests?
49. Show any screenshot/visual debugging capabilities
50. How do they handle "it doesn't work" vague complaints?

---

# SECTION 4: CONTEXT MANAGEMENT

## 4.1 Context Window
51. How do they manage context window limits?
52. What's their strategy for large codebases?
53. Show any "context compression" or summarization logic
54. How do they decide what to include/exclude from context?
55. What's the priority order for context inclusion?

## 4.2 File Reading
56. When do they read files vs use cached content?
57. Show the exact "don't re-read files in context" rules
58. How do they track what's already in context?
59. What triggers a fresh file read?
60. How do they handle files too large for context?

## 4.3 Memory & State
61. How do they track conversation state across messages?
62. What information persists between turns?
63. Show any "memory" or "state" management prompts
64. How do they handle "continue where we left off" requests?
65. What gets reset vs preserved on new conversation?

---

# SECTION 5: DESIGN SYSTEM

## 5.1 Color Management
66. What exact color rules do they enforce? (quote the rules)
67. How do they validate color format (HSL, RGB, hex)?
68. What's the max colors allowed? Show the rule.
69. How do they handle "make it blue" requests?
70. Show the semantic color token requirements

## 5.2 Typography
71. What font rules do they enforce?
72. How many fonts are allowed? Show the rule.
73. What font size/spacing rules exist?
74. How do they handle custom font requests?

## 5.3 Layout & Spacing
75. What spacing/margin/padding rules exist?
76. Show any grid system requirements
77. What responsive design rules do they enforce?
78. How do they handle mobile vs desktop layouts?

## 5.4 Design Inspiration
79. Show the complete "design inspiration" or "design brief" generation logic
80. What inputs trigger design generation?
81. What outputs does design generation produce?
82. How do they handle vague design requests?

---

# SECTION 6: DATABASE & BACKEND

## 6.1 Supabase Integration
83. Show ALL Supabase-related rules in the prompts
84. What's the exact pattern for creating tables?
85. How do they enforce Row Level Security (RLS)?
86. Show the migration file generation logic
87. What's the client initialization pattern?
88. How do they handle auth with Supabase?

## 6.2 API Generation
89. How do they generate API routes?
90. What validation do they add to APIs?
91. Show error handling patterns for APIs
92. How do they handle authentication in APIs?
93. What's the rate limiting approach?

## 6.3 Data Modeling
94. How do they design database schemas from user requests?
95. What relationships (foreign keys) do they auto-create?
96. Show any data type inference logic
97. How do they handle "add a users table" requests?

---

# SECTION 7: TOOL ORCHESTRATION

## 7.1 Tool Selection
98. List ALL tools available in each system with full schemas
99. How do they decide which tool to use?
100. Show the tool selection/routing logic
101. What's the priority order for tools?
102. Can they call multiple tools in parallel? Show the rules.

## 7.2 Tool Execution
103. What happens before a tool is called? (validation)
104. What happens after a tool returns? (processing)
105. How do they handle tool failures?
106. What's the timeout for tool execution?
107. Show any retry logic for tools

## 7.3 Tool Chaining
108. How do they chain multiple tools together?
109. What's the max tools per turn?
110. Show any "workflow" or "pipeline" definitions
111. How do they pass data between tools?

---

# SECTION 8: USER INTERACTION

## 8.1 Clarifying Questions
112. When do they ask clarifying questions vs proceed?
113. Show the exact rules for when to ask questions
114. What question templates do they use?
115. How do they handle ambiguous requests?
116. What's the max questions before proceeding?

## 8.2 Response Format
117. What's the required response structure?
118. Show rules for response length
119. What markdown formatting do they use?
120. How do they structure code vs explanation?
121. When do they show code vs hide it?

## 8.3 Progress Communication
122. How do they communicate progress on long tasks?
123. Show any streaming/incremental response logic
124. How do they handle multi-step operations?
125. What status updates do they provide?

---

# SECTION 9: VALIDATION & QUALITY

## 9.1 Pre-Generation Validation
126. What validation happens before generating code?
127. How do they validate user intent?
128. What requests do they refuse? (list all)
129. Show any content moderation rules

## 9.2 Post-Generation Validation
130. What validation happens after generating code?
131. How do they check if code compiles?
132. How do they verify functionality?
133. Show any "self-review" logic
134. What metrics do they check before responding?

## 9.3 Output Verification
135. How do they verify the UI looks correct?
136. Do they screenshot/preview results?
137. What accessibility checks exist?
138. How do they verify responsive design?

---

# SECTION 10: PERFORMANCE & OPTIMIZATION

## 10.1 Speed Optimization
139. What rules exist for faster responses?
140. Show any parallel processing rules
141. How do they minimize API calls?
142. What caching strategies are mentioned?

## 10.2 Cost Optimization
143. What rules exist for reducing token usage?
144. Show any "be concise" or length rules
145. How do they avoid redundant operations?
146. What's their strategy for large files?

## 10.3 Efficiency Patterns
147. Show the "efficiency" or "optimization" sections of prompts
148. What anti-patterns do they explicitly avoid?
149. How do they prioritize speed vs quality?

---

# SECTION 11: SPECIAL FEATURES

## 11.1 Image Generation
150. What image generation capabilities exist?
151. Show the image generation prompt/parameters
152. How do they handle image placement in code?
153. What image formats/sizes do they support?

## 11.2 Search Capabilities
154. What search tools exist? (web, code, docs)
155. Show the search query construction logic
156. How do they filter/rank search results?
157. When do they search vs use training data?

## 11.3 External Integrations
158. What external services can they integrate?
159. Show the integration request/setup flow
160. How do they handle API keys/secrets?
161. What environment variables patterns exist?

---

# SECTION 12: SAFETY & SECURITY

## 12.1 Security Rules
162. What security rules do they enforce in generated code?
163. Show any SQL injection prevention rules
164. Show any XSS prevention rules
165. How do they handle user input validation?
166. What authentication patterns do they enforce?

## 12.2 Forbidden Actions
167. What actions are explicitly forbidden?
168. Show the complete list of things they won't do
169. How do they handle jailbreak attempts?
170. What safety checks exist?

## 12.3 Data Protection
171. How do they handle sensitive data in code?
172. Show any PII protection rules
173. What secrets management approach exists?
174. How do they handle .env files?

---

# SECTION 13: MULTI-FILE OPERATIONS

## 13.1 File Management
175. How do they decide to create new files vs modify existing?
176. What file naming conventions do they enforce?
177. Show the directory structure rules
178. How do they handle file imports/exports?
179. What's the max files they'll create in one turn?

## 13.2 Project Structure
180. What project structures do they enforce? (by framework)
181. Show Next.js app router structure rules
182. Show React project structure rules
183. How do they handle monorepo structures?

## 13.3 Dependencies
184. How do they manage package.json?
185. What dependencies do they auto-add?
186. Show any version pinning rules
187. How do they handle dependency conflicts?

---

# SECTION 14: TESTING & DEPLOYMENT

## 14.1 Testing
188. What testing rules/requirements exist?
189. Do they auto-generate tests?
190. What test frameworks do they support?
191. Show any test coverage requirements

## 14.2 Deployment
192. What deployment configurations do they generate?
193. Show Vercel deployment rules
194. How do they handle environment-specific configs?
195. What CI/CD patterns exist?

---

# SECTION 15: PROMPT STRUCTURE ANALYSIS

## 15.1 Overall Structure
196. Show the complete structure/outline of each major prompt
197. What sections does each prompt contain?
198. What's the word count of each prompt?
199. How do they organize rules vs examples?

## 15.2 Examples in Prompts
200. List ALL examples included in the prompts
201. What do the examples demonstrate?
202. How detailed are the examples?
203. Show the before/after examples for edits

## 15.3 Meta-Instructions
204. What instructions exist about how to interpret the prompt?
205. Show any "CRITICAL" or "IMPORTANT" markers
206. What's emphasized as highest priority?
207. What conflicts or overrides exist?

---

# EXECUTION INSTRUCTIONS

For each question:
1. Search the repository for relevant content
2. Quote exact text when found
3. Provide file path and line numbers if possible
4. Note which competitor (Lovable, v0, Bolt, Cursor, etc.) each answer applies to
5. If not found, state "NOT FOUND IN REPOSITORY"

**Priority Questions (Answer First):**
- #1-6 (Initial Generation)
- #19-28 (Edit Tools)
- #34-45 (Error Handling)
- #51-60 (Context Management)
- #66-79 (Design System)
- #83-88 (Supabase)
- #98-107 (Tool Orchestration)

---

**Repository URL:** https://github.com/binsaleem99/system-prompts-and-models-of-ai-tools
