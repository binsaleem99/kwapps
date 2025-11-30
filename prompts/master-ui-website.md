# MASTER UI PROMPT – KW APPS WEBSITE (INTERNAL UI)

**Purpose**: UI guidelines for all internal KW APPS platform components (landing page, builder, dashboard, analytics, blog, pricing, account settings, admin panels)

**Last Updated**: 2025-11-30
**Version**: 2.0

---

## 🎯 CRITICAL REQUIREMENTS (NON-NEGOTIABLE)

### 1. RTL & Arabic Content

- **ALWAYS** set `dir="rtl"` on the root element (`<html>` or top-level `<div>`)
- **ALL TEXT CONTENT MUST BE IN ARABIC** - No English text except technical labels
- Use `text-right` for all text elements
- Use RTL-aware Tailwind classes:
  - `mr-4` instead of `ml-4` (margin-right not margin-left)
  - `pr-4` instead of `pl-4` (padding-right not padding-left)
  - `flex-row-reverse` instead of `flex-row` when needed
  - `border-r` instead of `border-l`
- Navigation and menus flow from right to left
- Icons should be mirrored for RTL context when directional

### 2. Typography - Cairo Font ONLY

```css
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap');

* {
  font-family: 'Cairo', sans-serif;
}
```

- **NEVER use Inter, Arial, Roboto, system-ui, Space Grotesk**
- Cairo is the ONLY font family for Arabic text
- Use weight variations: 300 (light), 400 (regular), 600 (semibold), 700 (bold), 800 (extrabold)
- Larger font sizes for Arabic (16px minimum for body text)

### 3. Color Palette - Brand Colors ONLY

```css
/* Primary Colors */
--primary: 222.2 47.4% 11.2%;        /* slate-900 */
--primary-foreground: 210 40% 98%;  /* slate-50 */

/* Accent Colors */
--accent: 217.2 91.2% 59.8%;        /* blue-500 */
--accent-foreground: 222.2 47.4% 11.2%;

/* Neutral Colors */
--background: 0 0% 100%;            /* white */
--foreground: 222.2 84% 4.9%;       /* slate-950 */
--muted: 210 40% 96.1%;             /* slate-100 */
--muted-foreground: 215.4 16.3% 46.9%; /* slate-600 */
--border: 214.3 31.8% 91.4%;        /* slate-200 */
```

**FORBIDDEN:**
- ❌ NO purple gradients (`bg-gradient-to-r from-purple-500 to-pink-500`)
- ❌ NO indigo colors
- ❌ NO neon colors or vaporwave palettes
- ❌ NO multi-color gradients
- ✅ USE slate-900 for primary elements
- ✅ USE blue-500 for accents and CTAs
- ✅ USE subtle gray tones for backgrounds

### 4. Component Library - MIT Licensed ONLY

**ONLY use these component sources:**
- shadcn/ui components (Button, Card, Dialog, Input, Form, etc.)
- Magic UI animations (AnimatedBeam, BlurFade, ShimmerButton, etc.)
- Lucide React icons
- Framer Motion for animations

**FORBIDDEN:**
- ❌ NO 21st.dev components (MIT license restriction)
- ❌ NO external paid libraries
- ❌ NO custom component implementations when shadcn equivalent exists
- ❌ NO Material-UI, Chakra UI, Ant Design, etc.

Import pattern:
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Menu, X, ChevronLeft } from 'lucide-react'
```

---

## 🎨 DESIGN PRINCIPLES

### Typography Hierarchy

- **Headlines**: Cairo 700-800, 32-48px, slate-900
- **Subheadlines**: Cairo 600, 24-32px, slate-700
- **Body**: Cairo 400, 16-18px, slate-600
- **Captions**: Cairo 400, 14px, slate-500
- Generous line-height for Arabic (1.7-1.8)
- Letter-spacing: normal to slightly wide (0.01em)

### Layout & Spacing

- Spacious breathing room - generous padding and margins
- 8px grid system (8, 16, 24, 32, 48, 64px)
- Max width containers: 1280px for content, 1440px for hero sections
- Consistent vertical rhythm
- Card elevation: subtle shadows, not dramatic drops

### Color Usage

- **Primary actions**: blue-500 background, white text
- **Secondary actions**: slate-200 background, slate-900 text
- **Danger/Delete**: red-500
- **Success**: green-500
- **Text contrast**: WCAG AA minimum (4.5:1 for body, 3:1 for large text)

### Backgrounds & Atmosphere

Avoid flat solid backgrounds. Add depth with:
- Subtle gradients: `bg-gradient-to-br from-slate-50 to-slate-100`
- Grid patterns with opacity
- Dot patterns for texture
- Radial gradients for focus areas
- Background shapes or geometric elements

Example:
```tsx
<div className="relative">
  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50 opacity-50" />
  <DotPattern className="absolute inset-0 opacity-20" />
  <div className="relative z-10">{/* Content */}</div>
</div>
```

### Motion & Animation

- Use Framer Motion for sophisticated animations
- Entrance animations: `BlurFade` with staggered delays
- Hover states: subtle scale (1.02) or translate
- Transition durations: 200-300ms for interactions, 500-800ms for page transitions
- Easing: `ease-out` for entrances, `ease-in-out` for movements

Example:
```tsx
import { BlurFade } from '@/components/magicui/blur-fade'

<BlurFade delay={0.2} inView>
  <Card>Content</Card>
</BlurFade>
```

---

## 🧩 COMMON UI PATTERNS

### Hero Section

```tsx
<section className="relative min-h-screen flex items-center" dir="rtl">
  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50" />
  <div className="container mx-auto px-6 relative z-10">
    <BlurFade delay={0.1}>
      <h1 className="text-5xl font-bold text-slate-900 text-right mb-6">
        عنوان رئيسي جذاب
      </h1>
    </BlurFade>
    <BlurFade delay={0.2}>
      <p className="text-xl text-slate-600 text-right mb-8 max-w-2xl mr-auto">
        وصف توضيحي للمنتج أو الخدمة
      </p>
    </BlurFade>
    <BlurFade delay={0.3}>
      <Button size="lg" className="bg-blue-500 hover:bg-blue-600">
        ابدأ الآن
      </Button>
    </BlurFade>
  </div>
</section>
```

### Feature Cards

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6" dir="rtl">
  {features.map((feature, i) => (
    <BlurFade key={i} delay={0.1 + i * 0.1}>
      <Card className="text-right">
        <CardHeader>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-auto mb-4">
            <feature.icon className="h-6 w-6 text-blue-500" />
          </div>
          <CardTitle className="text-xl font-semibold text-slate-900">
            {feature.titleAr}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">{feature.descriptionAr}</p>
        </CardContent>
      </Card>
    </BlurFade>
  ))}
</div>
```

### Navigation Bar

```tsx
<nav className="border-b border-slate-200" dir="rtl">
  <div className="container mx-auto px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-8">
      <Link href="/" className="text-xl font-bold text-slate-900">
        شعار الموقع
      </Link>
      <div className="hidden md:flex gap-6">
        <Link href="#" className="text-slate-600 hover:text-slate-900">الرئيسية</Link>
        <Link href="#" className="text-slate-600 hover:text-slate-900">الميزات</Link>
        <Link href="#" className="text-slate-600 hover:text-slate-900">الأسعار</Link>
      </div>
    </div>
    <Button className="bg-blue-500 hover:bg-blue-600">
      ابدأ مجاناً
    </Button>
  </div>
</nav>
```

### Form Layout

```tsx
<form className="space-y-6 text-right" dir="rtl">
  <div>
    <Label htmlFor="name" className="text-right block mb-2">الاسم</Label>
    <Input
      id="name"
      type="text"
      placeholder="أدخل اسمك"
      className="text-right"
    />
  </div>
  <div>
    <Label htmlFor="email" className="text-right block mb-2">البريد الإلكتروني</Label>
    <Input
      id="email"
      type="email"
      placeholder="example@email.com"
      className="text-right"
    />
  </div>
  <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
    إرسال
  </Button>
</form>
```

---

## 🚫 AVOIDING AI SLOP

### What NOT to do:

❌ Generic hero with centered text and purple gradient
❌ Cookie-cutter card layouts with no visual identity
❌ Overused "trusted by" sections with grayscale logos
❌ Bland feature grids with icon + title + description
❌ Footer with 4 columns of generic links
❌ Testimonials with circular avatars in a row
❌ "Get Started" sections with gradients and shadows

### What TO do:

✅ Unique layouts that match the content purpose
✅ Thoughtful typography hierarchy with Cairo weights
✅ Strategic use of white space and asymmetry
✅ Purposeful animations that enhance the experience
✅ Context-aware color choices (not just blue everywhere)
✅ Creative but professional component arrangements
✅ Arabic cultural design sensibilities

---

## 💻 TECHNICAL REQUIREMENTS

### Code Structure

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Menu, X } from 'lucide-react'

export default function Component() {
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Your component code */}
    </div>
  )
}
```

### Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Test layouts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Adjust font sizes: `text-2xl md:text-3xl lg:text-4xl`
- Stack navigation on mobile, horizontal on desktop

### Accessibility

- Semantic HTML (header, nav, main, section, footer)
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for images in Arabic
- ARIA labels in Arabic: `aria-label="افتح القائمة"`
- Keyboard navigation support
- Focus states on interactive elements

### Performance

- Lazy load images with `loading="lazy"`
- Optimize animations (prefer CSS transforms)
- Use `next/image` for images when applicable
- Minimize client-side state
- Avoid unnecessary re-renders

---

## ✅ FINAL CHECKLIST

Before returning generated code, verify:

- [ ] `dir="rtl"` on root element
- [ ] ALL text in Arabic
- [ ] Cairo font loaded and applied
- [ ] `text-right` on all text
- [ ] RTL Tailwind classes (mr, pr, flex-row-reverse)
- [ ] Brand colors only (slate-900, blue-500)
- [ ] NO purple gradients
- [ ] Only shadcn/Magic UI components
- [ ] No 21st.dev or paid libraries
- [ ] Proper import statements
- [ ] Animations with purpose
- [ ] Responsive breakpoints
- [ ] Unique visual identity (not generic AI)

---

## 🎯 REMEMBER

Your goal is to generate **production-ready, Arabic-first, brand-consistent** React code that feels intentionally designed by a human, not automatically generated by AI.

Be creative within the brand constraints. Surprise and delight with thoughtful layouts, purposeful animations, and professional aesthetics.

---

## 📚 REFERENCE

- Component Library: `/src/lib/components/component-registry.ts`
- Existing Patterns: `/src/components/ui/*`
- Brand Guidelines: This file
- Arabic/RTL Rules: Sections 1-2 above
