/**
 * Component Registry - MIT Licensed Components Only
 *
 * This registry catalogs all available components for AI code generation.
 * Components are organized by category with import statements and descriptions.
 */

export interface ComponentInfo {
  name: string
  nameAr: string
  category: string
  categoryAr: string
  importStatement: string
  description: string
  descriptionAr: string
  props?: string[]
  examples?: string[]
}

export const COMPONENT_REGISTRY: ComponentInfo[] = [
  // ============================================
  // SHADCN/UI - STRUCTURAL COMPONENTS
  // ============================================

  {
    name: 'Button',
    nameAr: 'زر',
    category: 'Interactive',
    categoryAr: 'تفاعلي',
    importStatement: "import { Button } from '@/components/ui/button'",
    description: 'Clickable button with multiple variants (default, destructive, outline, ghost, link)',
    descriptionAr: 'زر قابل للنقر مع أشكال متعددة (افتراضي، تدميري، خطوط، شبح، رابط)',
    props: ['variant', 'size', 'disabled', 'onClick'],
    examples: [
      '<Button>Click me</Button>',
      '<Button variant="outline">Outline Button</Button>',
      '<Button variant="destructive" size="lg">Delete</Button>'
    ]
  },

  {
    name: 'Card',
    nameAr: 'بطاقة',
    category: 'Layout',
    categoryAr: 'تخطيط',
    importStatement: "import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'",
    description: 'Container card with header, content, and footer sections',
    descriptionAr: 'بطاقة حاوية مع أقسام رأسية ومحتوى وتذييل',
    props: ['className'],
    examples: [
      '<Card><CardHeader><CardTitle>Title</CardTitle></CardHeader><CardContent>Content</CardContent></Card>'
    ]
  },

  {
    name: 'Dialog',
    nameAr: 'حوار',
    category: 'Overlay',
    categoryAr: 'طبقة علوية',
    importStatement: "import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'",
    description: 'Modal dialog overlay for important content',
    descriptionAr: 'نافذة حوار منبثقة للمحتوى المهم',
    props: ['open', 'onOpenChange'],
    examples: [
      '<Dialog><DialogTrigger><Button>Open</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Dialog Title</DialogTitle></DialogHeader></DialogContent></Dialog>'
    ]
  },

  {
    name: 'Input',
    nameAr: 'إدخال',
    category: 'Form',
    categoryAr: 'نموذج',
    importStatement: "import { Input } from '@/components/ui/input'",
    description: 'Text input field for user data entry',
    descriptionAr: 'حقل إدخال نصي لإدخال بيانات المستخدم',
    props: ['type', 'placeholder', 'value', 'onChange', 'disabled'],
    examples: [
      '<Input type="text" placeholder="Enter name" />',
      '<Input type="email" placeholder="Email address" />'
    ]
  },

  {
    name: 'Textarea',
    nameAr: 'منطقة نصية',
    category: 'Form',
    categoryAr: 'نموذج',
    importStatement: "import { Textarea } from '@/components/ui/textarea'",
    description: 'Multi-line text input area',
    descriptionAr: 'منطقة إدخال نصية متعددة الأسطر',
    props: ['placeholder', 'value', 'onChange', 'rows'],
    examples: [
      '<Textarea placeholder="Enter description" rows={5} />'
    ]
  },

  {
    name: 'Select',
    nameAr: 'اختيار',
    category: 'Form',
    categoryAr: 'نموذج',
    importStatement: "import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'",
    description: 'Dropdown select menu for choosing options',
    descriptionAr: 'قائمة منسدلة لاختيار الخيارات',
    props: ['value', 'onValueChange'],
    examples: [
      '<Select><SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger><SelectContent><SelectItem value="1">Option 1</SelectItem></SelectContent></Select>'
    ]
  },

  {
    name: 'Checkbox',
    nameAr: 'مربع اختيار',
    category: 'Form',
    categoryAr: 'نموذج',
    importStatement: "import { Checkbox } from '@/components/ui/checkbox'",
    description: 'Checkbox for boolean selections',
    descriptionAr: 'مربع اختيار للاختيارات الثنائية',
    props: ['checked', 'onCheckedChange', 'disabled'],
    examples: [
      '<Checkbox id="terms" /><label htmlFor="terms">Accept terms</label>'
    ]
  },

  {
    name: 'Radio Group',
    nameAr: 'مجموعة خيارات',
    category: 'Form',
    categoryAr: 'نموذج',
    importStatement: "import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'",
    description: 'Radio button group for single selection',
    descriptionAr: 'مجموعة أزرار اختيار لخيار واحد',
    props: ['value', 'onValueChange'],
    examples: [
      '<RadioGroup><RadioGroupItem value="1" id="r1" /><Label htmlFor="r1">Option 1</Label></RadioGroup>'
    ]
  },

  {
    name: 'Switch',
    nameAr: 'مفتاح',
    category: 'Form',
    categoryAr: 'نموذج',
    importStatement: "import { Switch } from '@/components/ui/switch'",
    description: 'Toggle switch for on/off states',
    descriptionAr: 'مفتاح تبديل للحالات المفتوحة/المغلقة',
    props: ['checked', 'onCheckedChange', 'disabled'],
    examples: [
      '<Switch checked={enabled} onCheckedChange={setEnabled} />'
    ]
  },

  {
    name: 'Label',
    nameAr: 'تسمية',
    category: 'Form',
    categoryAr: 'نموذج',
    importStatement: "import { Label } from '@/components/ui/label'",
    description: 'Label for form inputs',
    descriptionAr: 'تسمية لحقول النموذج',
    props: ['htmlFor'],
    examples: [
      '<Label htmlFor="email">Email</Label>'
    ]
  },

  {
    name: 'Badge',
    nameAr: 'شارة',
    category: 'Display',
    categoryAr: 'عرض',
    importStatement: "import { Badge } from '@/components/ui/badge'",
    description: 'Small badge for status or count display',
    descriptionAr: 'شارة صغيرة لعرض الحالة أو العدد',
    props: ['variant'],
    examples: [
      '<Badge>New</Badge>',
      '<Badge variant="destructive">Error</Badge>',
      '<Badge variant="outline">Draft</Badge>'
    ]
  },

  {
    name: 'Alert',
    nameAr: 'تنبيه',
    category: 'Feedback',
    categoryAr: 'ردود الفعل',
    importStatement: "import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'",
    description: 'Alert message for important notifications',
    descriptionAr: 'رسالة تنبيه للإشعارات المهمة',
    props: ['variant'],
    examples: [
      '<Alert><AlertTitle>Notice</AlertTitle><AlertDescription>Important message</AlertDescription></Alert>'
    ]
  },

  {
    name: 'Avatar',
    nameAr: 'صورة رمزية',
    category: 'Display',
    categoryAr: 'عرض',
    importStatement: "import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'",
    description: 'User avatar image with fallback',
    descriptionAr: 'صورة رمزية للمستخدم مع بديل',
    props: [],
    examples: [
      '<Avatar><AvatarImage src="/avatar.jpg" /><AvatarFallback>AB</AvatarFallback></Avatar>'
    ]
  },

  {
    name: 'Accordion',
    nameAr: 'أكورديون',
    category: 'Layout',
    categoryAr: 'تخطيط',
    importStatement: "import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'",
    description: 'Collapsible content sections',
    descriptionAr: 'أقسام محتوى قابلة للطي',
    props: ['type', 'collapsible'],
    examples: [
      '<Accordion type="single"><AccordionItem value="item-1"><AccordionTrigger>Title</AccordionTrigger><AccordionContent>Content</AccordionContent></AccordionItem></Accordion>'
    ]
  },

  {
    name: 'Tabs',
    nameAr: 'علامات تبويب',
    category: 'Layout',
    categoryAr: 'تخطيط',
    importStatement: "import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'",
    description: 'Tabbed content sections',
    descriptionAr: 'أقسام محتوى مع علامات تبويب',
    props: ['defaultValue', 'value', 'onValueChange'],
    examples: [
      '<Tabs defaultValue="tab1"><TabsList><TabsTrigger value="tab1">Tab 1</TabsTrigger></TabsList><TabsContent value="tab1">Content</TabsContent></Tabs>'
    ]
  },

  {
    name: 'Table',
    nameAr: 'جدول',
    category: 'Display',
    categoryAr: 'عرض',
    importStatement: "import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'",
    description: 'Data table for displaying structured information',
    descriptionAr: 'جدول بيانات لعرض المعلومات المنظمة',
    props: [],
    examples: [
      '<Table><TableHeader><TableRow><TableHead>Name</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Value</TableCell></TableRow></TableBody></Table>'
    ]
  },

  {
    name: 'Calendar',
    nameAr: 'تقويم',
    category: 'Form',
    categoryAr: 'نموذج',
    importStatement: "import { Calendar } from '@/components/ui/calendar'",
    description: 'Date picker calendar',
    descriptionAr: 'تقويم لاختيار التاريخ',
    props: ['mode', 'selected', 'onSelect'],
    examples: [
      '<Calendar mode="single" selected={date} onSelect={setDate} />'
    ]
  },

  {
    name: 'Dropdown Menu',
    nameAr: 'قائمة منسدلة',
    category: 'Interactive',
    categoryAr: 'تفاعلي',
    importStatement: "import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'",
    description: 'Dropdown menu with actions',
    descriptionAr: 'قائمة منسدلة مع إجراءات',
    props: [],
    examples: [
      '<DropdownMenu><DropdownMenuTrigger><Button>Menu</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Item</DropdownMenuItem></DropdownMenuContent></DropdownMenu>'
    ]
  },

  {
    name: 'Popover',
    nameAr: 'نافذة منبثقة',
    category: 'Overlay',
    categoryAr: 'طبقة علوية',
    importStatement: "import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'",
    description: 'Popover overlay for additional content',
    descriptionAr: 'نافذة منبثقة لمحتوى إضافي',
    props: [],
    examples: [
      '<Popover><PopoverTrigger><Button>Open</Button></PopoverTrigger><PopoverContent>Content</PopoverContent></Popover>'
    ]
  },

  {
    name: 'Tooltip',
    nameAr: 'تلميح',
    category: 'Feedback',
    categoryAr: 'ردود الفعل',
    importStatement: "import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'",
    description: 'Tooltip for hover information',
    descriptionAr: 'تلميح لمعلومات التمرير',
    props: [],
    examples: [
      '<TooltipProvider><Tooltip><TooltipTrigger>Hover</TooltipTrigger><TooltipContent>Info</TooltipContent></Tooltip></TooltipProvider>'
    ]
  },

  {
    name: 'Hover Card',
    nameAr: 'بطاقة تمرير',
    category: 'Overlay',
    categoryAr: 'طبقة علوية',
    importStatement: "import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'",
    description: 'Card that appears on hover',
    descriptionAr: 'بطاقة تظهر عند التمرير',
    props: [],
    examples: [
      '<HoverCard><HoverCardTrigger>Hover me</HoverCardTrigger><HoverCardContent>Details</HoverCardContent></HoverCard>'
    ]
  },

  {
    name: 'Sheet',
    nameAr: 'لوحة جانبية',
    category: 'Overlay',
    categoryAr: 'طبقة علوية',
    importStatement: "import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'",
    description: 'Side panel sheet overlay',
    descriptionAr: 'لوحة جانبية منزلقة',
    props: ['side'],
    examples: [
      '<Sheet><SheetTrigger><Button>Open</Button></SheetTrigger><SheetContent side="right"><SheetHeader><SheetTitle>Title</SheetTitle></SheetHeader></SheetContent></Sheet>'
    ]
  },

  {
    name: 'Command',
    nameAr: 'أمر',
    category: 'Interactive',
    categoryAr: 'تفاعلي',
    importStatement: "import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'",
    description: 'Command palette for search and actions',
    descriptionAr: 'لوحة أوامر للبحث والإجراءات',
    props: [],
    examples: [
      '<Command><CommandInput placeholder="Search..." /><CommandList><CommandEmpty>No results</CommandEmpty><CommandGroup><CommandItem>Item</CommandItem></CommandGroup></CommandList></Command>'
    ]
  },

  {
    name: 'Separator',
    nameAr: 'فاصل',
    category: 'Layout',
    categoryAr: 'تخطيط',
    importStatement: "import { Separator } from '@/components/ui/separator'",
    description: 'Visual divider line',
    descriptionAr: 'خط فاصل بصري',
    props: ['orientation'],
    examples: [
      '<Separator />',
      '<Separator orientation="vertical" />'
    ]
  },

  {
    name: 'Skeleton',
    nameAr: 'هيكل تحميل',
    category: 'Feedback',
    categoryAr: 'ردود الفعل',
    importStatement: "import { Skeleton } from '@/components/ui/skeleton'",
    description: 'Loading skeleton placeholder',
    descriptionAr: 'عنصر هيكلي للتحميل',
    props: [],
    examples: [
      '<Skeleton className="h-12 w-full" />'
    ]
  },

  {
    name: 'Slider',
    nameAr: 'شريط تمرير',
    category: 'Form',
    categoryAr: 'نموذج',
    importStatement: "import { Slider } from '@/components/ui/slider'",
    description: 'Range slider for numeric values',
    descriptionAr: 'شريط تمرير لاختيار قيم رقمية',
    props: ['min', 'max', 'step', 'value', 'onValueChange'],
    examples: [
      '<Slider min={0} max={100} step={1} />'
    ]
  },

  {
    name: 'Toggle',
    nameAr: 'تبديل',
    category: 'Interactive',
    categoryAr: 'تفاعلي',
    importStatement: "import { Toggle } from '@/components/ui/toggle'",
    description: 'Toggle button for on/off states',
    descriptionAr: 'زر تبديل للحالات المفتوحة/المغلقة',
    props: ['pressed', 'onPressedChange'],
    examples: [
      '<Toggle>Toggle</Toggle>'
    ]
  },

  {
    name: 'Scroll Area',
    nameAr: 'منطقة تمرير',
    category: 'Layout',
    categoryAr: 'تخطيط',
    importStatement: "import { ScrollArea } from '@/components/ui/scroll-area'",
    description: 'Custom styled scrollable area',
    descriptionAr: 'منطقة قابلة للتمرير بنمط مخصص',
    props: [],
    examples: [
      '<ScrollArea className="h-96"><div>Long content...</div></ScrollArea>'
    ]
  },

  {
    name: 'Navigation Menu',
    nameAr: 'قائمة تنقل',
    category: 'Navigation',
    categoryAr: 'تنقل',
    importStatement: "import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu'",
    description: 'Navigation menu with dropdowns',
    descriptionAr: 'قائمة تنقل مع قوائم منسدلة',
    props: [],
    examples: [
      '<NavigationMenu><NavigationMenuList><NavigationMenuItem><NavigationMenuTrigger>Menu</NavigationMenuTrigger><NavigationMenuContent>Content</NavigationMenuContent></NavigationMenuItem></NavigationMenuList></NavigationMenu>'
    ]
  },

  {
    name: 'Menubar',
    nameAr: 'شريط قوائم',
    category: 'Navigation',
    categoryAr: 'تنقل',
    importStatement: "import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar'",
    description: 'Application menubar',
    descriptionAr: 'شريط قوائم التطبيق',
    props: [],
    examples: [
      '<Menubar><MenubarMenu><MenubarTrigger>File</MenubarTrigger><MenubarContent><MenubarItem>New</MenubarItem></MenubarContent></MenubarMenu></Menubar>'
    ]
  },

  // ============================================
  // MAGIC UI - ANIMATION COMPONENTS
  // ============================================

  {
    name: 'Animated Beam',
    nameAr: 'شعاع متحرك',
    category: 'Animation',
    categoryAr: 'حركة',
    importStatement: "import { AnimatedBeam } from '@/components/magicui/animated-beam'",
    description: 'Animated connecting beam between elements',
    descriptionAr: 'شعاع متحرك يربط بين العناصر',
    props: ['fromRef', 'toRef', 'duration', 'curvature'],
    examples: []
  },

  {
    name: 'Blur Fade',
    nameAr: 'تلاشي ضبابي',
    category: 'Animation',
    categoryAr: 'حركة',
    importStatement: "import { BlurFade } from '@/components/magicui/blur-fade'",
    description: 'Fade in animation with blur effect',
    descriptionAr: 'حركة ظهور تدريجي مع تأثير ضبابي',
    props: ['delay', 'duration', 'inView'],
    examples: []
  },

  {
    name: 'Shimmer Button',
    nameAr: 'زر متألق',
    category: 'Animation',
    categoryAr: 'حركة',
    importStatement: "import { ShimmerButton } from '@/components/magicui/shimmer-button'",
    description: 'Button with shimmer animation effect',
    descriptionAr: 'زر مع تأثير تألق متحرك',
    props: ['shimmerColor', 'shimmerSize'],
    examples: []
  },

  {
    name: 'Marquee',
    nameAr: 'نص متحرك',
    category: 'Animation',
    categoryAr: 'حركة',
    importStatement: "import { Marquee } from '@/components/magicui/marquee'",
    description: 'Scrolling marquee animation',
    descriptionAr: 'حركة نص متحرك أفقياً',
    props: ['pauseOnHover', 'reverse', 'speed'],
    examples: []
  },

  {
    name: 'Animated Gradient Text',
    nameAr: 'نص متدرج متحرك',
    category: 'Animation',
    categoryAr: 'حركة',
    importStatement: "import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text'",
    description: 'Text with animated gradient colors',
    descriptionAr: 'نص مع ألوان متدرجة متحركة',
    props: [],
    examples: []
  },

  {
    name: 'Dot Pattern',
    nameAr: 'نمط نقطي',
    category: 'Background',
    categoryAr: 'خلفية',
    importStatement: "import { DotPattern } from '@/components/magicui/dot-pattern'",
    description: 'Animated dot pattern background',
    descriptionAr: 'خلفية نمط نقطي متحرك',
    props: ['width', 'height', 'cx', 'cy', 'cr'],
    examples: []
  },

  {
    name: 'Grid Pattern',
    nameAr: 'نمط شبكي',
    category: 'Background',
    categoryAr: 'خلفية',
    importStatement: "import { GridPattern } from '@/components/magicui/grid-pattern'",
    description: 'Grid pattern background',
    descriptionAr: 'خلفية نمط شبكي',
    props: ['width', 'height', 'squares'],
    examples: []
  },

  {
    name: 'Sparkles',
    nameAr: 'شرارات',
    category: 'Animation',
    categoryAr: 'حركة',
    importStatement: "import { Sparkles } from '@/components/magicui/sparkles'",
    description: 'Sparkle animation effect',
    descriptionAr: 'تأثير حركة شرارات متألقة',
    props: ['color', 'size'],
    examples: []
  },

  {
    name: 'Particles',
    nameAr: 'جزيئات',
    category: 'Animation',
    categoryAr: 'حركة',
    importStatement: "import { Particles } from '@/components/magicui/particles'",
    description: 'Floating particles animation',
    descriptionAr: 'حركة جزيئات عائمة',
    props: ['quantity', 'color', 'size'],
    examples: []
  },

  // ============================================
  // ICONS - LUCIDE REACT
  // ============================================

  {
    name: 'Lucide Icons',
    nameAr: 'أيقونات لوسيد',
    category: 'Icons',
    categoryAr: 'أيقونات',
    importStatement: "import { Menu, X, Home, User, Mail, Phone, Settings, Search, ChevronDown, ChevronRight, Check, Plus, Minus, Edit, Trash, Upload, Download, Star, Heart, Share, Calendar, Clock, MapPin, Globe, Camera, Image, File, Folder } from 'lucide-react'",
    description: 'Comprehensive icon library with consistent design. Import icons individually as needed.',
    descriptionAr: 'مكتبة أيقونات شاملة بتصميم متسق. استورد الأيقونات بشكل فردي حسب الحاجة.',
    props: ['size', 'color', 'strokeWidth', 'className'],
    examples: [
      '<Menu className="h-6 w-6" />',
      '<User size={24} />',
      '<Settings strokeWidth={1.5} />'
    ]
  }
]

// Helper functions for component lookup

export function getComponentByName(name: string): ComponentInfo | undefined {
  return COMPONENT_REGISTRY.find(
    c => c.name.toLowerCase() === name.toLowerCase() || c.nameAr === name
  )
}

export function getComponentsByCategory(category: string): ComponentInfo[] {
  return COMPONENT_REGISTRY.filter(
    c => c.category.toLowerCase() === category.toLowerCase() ||
         c.categoryAr === category
  )
}

export function getAllCategories(): string[] {
  const categories = new Set<string>()
  COMPONENT_REGISTRY.forEach(c => {
    categories.add(c.category)
  })
  return Array.from(categories)
}

export function searchComponents(query: string): ComponentInfo[] {
  const lowerQuery = query.toLowerCase()
  return COMPONENT_REGISTRY.filter(c =>
    c.name.toLowerCase().includes(lowerQuery) ||
    c.nameAr.includes(query) ||
    c.description.toLowerCase().includes(lowerQuery) ||
    c.descriptionAr.includes(query)
  )
}

// Generate import statements for all components
export function generateAllImports(): string {
  return COMPONENT_REGISTRY
    .map(c => c.importStatement)
    .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
    .join('\n')
}

// Component library summary for AI prompts
export const COMPONENT_LIBRARY_SUMMARY = `
# Available MIT-Licensed Components

## shadcn/ui Components (Structural)
${getComponentsByCategory('Interactive').map(c => `- ${c.name} (${c.nameAr}): ${c.description}`).join('\n')}
${getComponentsByCategory('Layout').map(c => `- ${c.name} (${c.nameAr}): ${c.description}`).join('\n')}
${getComponentsByCategory('Form').map(c => `- ${c.name} (${c.nameAr}): ${c.description}`).join('\n')}
${getComponentsByCategory('Display').map(c => `- ${c.name} (${c.nameAr}): ${c.description}`).join('\n')}
${getComponentsByCategory('Overlay').map(c => `- ${c.name} (${c.nameAr}): ${c.description}`).join('\n')}
${getComponentsByCategory('Feedback').map(c => `- ${c.name} (${c.nameAr}): ${c.description}`).join('\n')}
${getComponentsByCategory('Navigation').map(c => `- ${c.name} (${c.nameAr}): ${c.description}`).join('\n')}

## Magic UI Components (Animations)
${getComponentsByCategory('Animation').map(c => `- ${c.name} (${c.nameAr}): ${c.description}`).join('\n')}
${getComponentsByCategory('Background').map(c => `- ${c.name} (${c.nameAr}): ${c.description}`).join('\n')}

## Icons
- Lucide React: Comprehensive icon library with 1000+ icons

**Total Components:** ${COMPONENT_REGISTRY.length}
**All components are MIT licensed and free to use**
`
