# 🎛️ KWQ8 AUTO-GENERATED ADMIN DASHBOARD
## Per-Project Admin Panel System
### Version 1.0 | December 2025

---

## OVERVIEW

Every user project in KWQ8 automatically receives a fully-functional admin dashboard. This dashboard allows business owners to manage their website content, users, products, and analytics without using AI credits.

**Key Principle:** Adding content through the admin dashboard is **FREE** (no credits consumed). Using AI to add/modify content costs credits.

---

# SECTION 1: DASHBOARD ARCHITECTURE

## 1.1 Auto-Generation Trigger

```typescript
// Triggered when project is first deployed or when user requests dashboard
async function generateAdminDashboard(
  projectId: string,
  projectType: ProjectType,
  schema: DatabaseSchema
): Promise<AdminDashboardConfig> {
  // Analyze project type to determine dashboard features
  const features = await analyzeProjectForDashboard(projectId, projectType);
  
  // Generate dashboard configuration
  const dashboardConfig: AdminDashboardConfig = {
    projectId,
    features: features.enabledFeatures,
    pages: generateDashboardPages(features),
    credentials: await generateAdminCredentials(projectId),
    theme: 'arabic-rtl', // Always RTL
    createdAt: new Date(),
  };

  // Store configuration
  await supabase
    .from('admin_dashboards')
    .insert(dashboardConfig);

  // Generate actual dashboard code
  await generateDashboardCode(dashboardConfig);

  return dashboardConfig;
}

interface ProjectFeatures {
  enabledFeatures: {
    products: boolean;
    services: boolean;
    bookings: boolean;
    users: boolean;
    orders: boolean;
    blog: boolean;
    gallery: boolean;
    reviews: boolean;
    contactForms: boolean;
    analytics: boolean;
  };
  projectType: 'ecommerce' | 'service' | 'portfolio' | 'corporate' | 'restaurant' | 'booking';
}

async function analyzeProjectForDashboard(
  projectId: string,
  projectType: ProjectType
): Promise<ProjectFeatures> {
  const featureMap: Record<ProjectType, ProjectFeatures['enabledFeatures']> = {
    ecommerce: {
      products: true,
      services: false,
      bookings: false,
      users: true,
      orders: true,
      blog: true,
      gallery: true,
      reviews: true,
      contactForms: true,
      analytics: true,
    },
    service: {
      products: false,
      services: true,
      bookings: true,
      users: true,
      orders: true,
      blog: true,
      gallery: true,
      reviews: true,
      contactForms: true,
      analytics: true,
    },
    restaurant: {
      products: true, // Menu items
      services: false,
      bookings: true, // Table reservations
      users: true,
      orders: true,
      blog: false,
      gallery: true,
      reviews: true,
      contactForms: true,
      analytics: true,
    },
    portfolio: {
      products: false,
      services: true,
      bookings: false,
      users: false,
      orders: false,
      blog: true,
      gallery: true,
      reviews: false,
      contactForms: true,
      analytics: true,
    },
    corporate: {
      products: false,
      services: true,
      bookings: false,
      users: false,
      orders: false,
      blog: true,
      gallery: true,
      reviews: false,
      contactForms: true,
      analytics: true,
    },
    booking: {
      products: false,
      services: true,
      bookings: true,
      users: true,
      orders: true,
      blog: false,
      gallery: true,
      reviews: true,
      contactForms: true,
      analytics: true,
    },
  };

  return {
    enabledFeatures: featureMap[projectType],
    projectType,
  };
}
```

## 1.2 Admin Credentials System

```typescript
interface AdminCredentials {
  dashboardUrl: string;
  email: string;
  temporaryPassword: string;
  mustChangePassword: boolean;
}

async function generateAdminCredentials(
  projectId: string
): Promise<AdminCredentials> {
  // Get project owner's email
  const { data: project } = await supabase
    .from('projects')
    .select('user_id, name, vercel_url')
    .eq('id', projectId)
    .single();

  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', project.user_id)
    .single();

  // Generate temporary password
  const tempPassword = generateSecurePassword(12);
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // Create admin user in project's database
  await supabase
    .from('project_admin_users')
    .insert({
      project_id: projectId,
      email: user.email,
      password_hash: hashedPassword,
      role: 'owner',
      must_change_password: true,
      created_at: new Date(),
    });

  // Send credentials email
  await sendAdminCredentialsEmail({
    to: user.email,
    projectName: project.name,
    dashboardUrl: `${project.vercel_url}/admin`,
    tempPassword,
  });

  return {
    dashboardUrl: `${project.vercel_url}/admin`,
    email: user.email,
    temporaryPassword: tempPassword,
    mustChangePassword: true,
  };
}

function generateSecurePassword(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
```

---

# SECTION 2: DASHBOARD PAGES

## 2.1 Page Generator

```typescript
function generateDashboardPages(
  features: ProjectFeatures
): DashboardPage[] {
  const pages: DashboardPage[] = [
    // Always included
    {
      id: 'home',
      title: 'الرئيسية',
      titleEn: 'Home',
      icon: 'home',
      route: '/admin',
      component: 'DashboardHome',
    },
    {
      id: 'settings',
      title: 'الإعدادات',
      titleEn: 'Settings',
      icon: 'settings',
      route: '/admin/settings',
      component: 'DashboardSettings',
    },
  ];

  // Conditional pages based on features
  if (features.enabledFeatures.products) {
    pages.push({
      id: 'products',
      title: 'المنتجات',
      titleEn: 'Products',
      icon: 'package',
      route: '/admin/products',
      component: 'ProductsManager',
      subpages: [
        { id: 'products-list', title: 'قائمة المنتجات', route: '/admin/products' },
        { id: 'products-add', title: 'إضافة منتج', route: '/admin/products/add' },
        { id: 'products-categories', title: 'التصنيفات', route: '/admin/products/categories' },
      ],
    });
  }

  if (features.enabledFeatures.services) {
    pages.push({
      id: 'services',
      title: 'الخدمات',
      titleEn: 'Services',
      icon: 'briefcase',
      route: '/admin/services',
      component: 'ServicesManager',
      subpages: [
        { id: 'services-list', title: 'قائمة الخدمات', route: '/admin/services' },
        { id: 'services-add', title: 'إضافة خدمة', route: '/admin/services/add' },
      ],
    });
  }

  if (features.enabledFeatures.bookings) {
    pages.push({
      id: 'bookings',
      title: 'الحجوزات',
      titleEn: 'Bookings',
      icon: 'calendar',
      route: '/admin/bookings',
      component: 'BookingsManager',
      subpages: [
        { id: 'bookings-list', title: 'جميع الحجوزات', route: '/admin/bookings' },
        { id: 'bookings-calendar', title: 'التقويم', route: '/admin/bookings/calendar' },
        { id: 'bookings-settings', title: 'إعدادات الحجز', route: '/admin/bookings/settings' },
      ],
    });
  }

  if (features.enabledFeatures.users) {
    pages.push({
      id: 'users',
      title: 'المستخدمين',
      titleEn: 'Users',
      icon: 'users',
      route: '/admin/users',
      component: 'UsersManager',
    });
  }

  if (features.enabledFeatures.orders) {
    pages.push({
      id: 'orders',
      title: 'الطلبات',
      titleEn: 'Orders',
      icon: 'shopping-bag',
      route: '/admin/orders',
      component: 'OrdersManager',
      subpages: [
        { id: 'orders-list', title: 'جميع الطلبات', route: '/admin/orders' },
        { id: 'orders-pending', title: 'قيد الانتظار', route: '/admin/orders?status=pending' },
        { id: 'orders-completed', title: 'مكتملة', route: '/admin/orders?status=completed' },
      ],
    });
  }

  if (features.enabledFeatures.blog) {
    pages.push({
      id: 'blog',
      title: 'المدونة',
      titleEn: 'Blog',
      icon: 'file-text',
      route: '/admin/blog',
      component: 'BlogManager',
      subpages: [
        { id: 'blog-posts', title: 'المقالات', route: '/admin/blog' },
        { id: 'blog-add', title: 'مقال جديد', route: '/admin/blog/add' },
      ],
    });
  }

  if (features.enabledFeatures.gallery) {
    pages.push({
      id: 'gallery',
      title: 'معرض الصور',
      titleEn: 'Gallery',
      icon: 'image',
      route: '/admin/gallery',
      component: 'GalleryManager',
    });
  }

  if (features.enabledFeatures.reviews) {
    pages.push({
      id: 'reviews',
      title: 'التقييمات',
      titleEn: 'Reviews',
      icon: 'star',
      route: '/admin/reviews',
      component: 'ReviewsManager',
    });
  }

  if (features.enabledFeatures.contactForms) {
    pages.push({
      id: 'messages',
      title: 'الرسائل',
      titleEn: 'Messages',
      icon: 'mail',
      route: '/admin/messages',
      component: 'MessagesManager',
    });
  }

  if (features.enabledFeatures.analytics) {
    pages.push({
      id: 'analytics',
      title: 'الإحصائيات',
      titleEn: 'Analytics',
      icon: 'bar-chart',
      route: '/admin/analytics',
      component: 'AnalyticsDashboard',
    });
  }

  return pages;
}
```

---

# SECTION 3: DASHBOARD UI COMPONENTS

## 3.1 Admin Layout

```tsx
// components/admin/AdminLayout.tsx
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pages } = useAdminConfig();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 right-0 h-full bg-card border-l border-border transition-all z-40",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-border">
          {sidebarOpen ? (
            <h1 className="font-heading font-bold text-xl">لوحة التحكم</h1>
          ) : (
            <span className="text-2xl">⚙️</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {pages.map((page) => (
            <AdminNavItem
              key={page.id}
              page={page}
              collapsed={!sidebarOpen}
            />
          ))}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-4 left-4 p-2 rounded-lg hover:bg-muted"
        >
          {sidebarOpen ? '→' : '←'}
        </button>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "transition-all",
        sidebarOpen ? "mr-64" : "mr-16"
      )}>
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <AdminBreadcrumb />
          </div>
          <div className="flex items-center gap-4">
            <AdminNotifications />
            <AdminUserMenu />
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

function AdminNavItem({
  page,
  collapsed,
}: {
  page: DashboardPage;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === page.route || pathname.startsWith(page.route + '/');
  const [expanded, setExpanded] = useState(false);
  const hasSubpages = page.subpages && page.subpages.length > 0;

  const IconComponent = Icons[page.icon];

  return (
    <div>
      <Link
        href={hasSubpages ? '#' : page.route}
        onClick={hasSubpages ? () => setExpanded(!expanded) : undefined}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted text-foreground"
        )}
      >
        <IconComponent className="w-5 h-5 flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1">{page.title}</span>
            {hasSubpages && (
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                expanded && "rotate-180"
              )} />
            )}
          </>
        )}
      </Link>

      {/* Subpages */}
      {hasSubpages && expanded && !collapsed && (
        <div className="mr-8 mt-1 space-y-1">
          {page.subpages.map((subpage) => (
            <Link
              key={subpage.id}
              href={subpage.route}
              className={cn(
                "block px-3 py-1.5 rounded text-sm",
                pathname === subpage.route
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {subpage.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 3.2 Dashboard Home

```tsx
// components/admin/DashboardHome.tsx
export function DashboardHome() {
  const { stats, recentOrders, recentUsers } = useDashboardData();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">مرحباً بك في لوحة التحكم</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي المبيعات"
          value={formatCurrency(stats.totalSales, 'KWD')}
          change={stats.salesChange}
          icon="dollar-sign"
        />
        <StatCard
          title="الطلبات الجديدة"
          value={stats.newOrders}
          change={stats.ordersChange}
          icon="shopping-bag"
        />
        <StatCard
          title="المستخدمين"
          value={stats.totalUsers}
          change={stats.usersChange}
          icon="users"
        />
        <StatCard
          title="الزيارات اليوم"
          value={stats.todayVisits}
          change={stats.visitsChange}
          icon="eye"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-heading font-bold mb-4">المبيعات (آخر 7 أيام)</h3>
          <SalesChart data={stats.salesChart} />
        </div>
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-heading font-bold mb-4">مصادر الزيارات</h3>
          <TrafficSourcesChart data={stats.trafficSources} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-heading font-bold">أحدث الطلبات</h3>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">#{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">{order.customerName}</p>
                </div>
                <div className="text-end">
                  <p className="font-medium">{formatCurrency(order.total, 'KWD')}</p>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-heading font-bold">أحدث المستخدمين</h3>
            <Link href="/admin/users" className="text-sm text-primary hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentUsers.map((user) => (
              <div key={user.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(new Date(user.createdAt))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string | number;
  change: number;
  icon: string;
}) {
  const IconComponent = Icons[icon];
  const isPositive = change >= 0;

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-heading font-bold mt-1">{value}</p>
        </div>
        <div className="p-2 bg-primary/10 rounded-lg">
          <IconComponent className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className={cn(
        "flex items-center gap-1 mt-4 text-sm",
        isPositive ? "text-green-600" : "text-red-600"
      )}>
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        <span>{Math.abs(change)}%</span>
        <span className="text-muted-foreground">من الأسبوع الماضي</span>
      </div>
    </div>
  );
}
```

## 3.3 Products Manager

```tsx
// components/admin/ProductsManager.tsx
export function ProductsManager() {
  const { products, isLoading, mutate } = useProducts();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products?.filter((product) => {
      const matchesSearch = product.name.includes(search) ||
        product.description?.includes(search);
      const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-heading text-2xl font-bold">المنتجات</h1>
        <Link href="/admin/products/add" className="btn-primary">
          <Plus className="w-4 h-4 ml-2" />
          إضافة منتج
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في المنتجات..."
            className="input pr-10 w-full"
          />
        </div>
        <CategorySelect
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-right px-4 py-3 font-medium">المنتج</th>
              <th className="text-right px-4 py-3 font-medium">التصنيف</th>
              <th className="text-right px-4 py-3 font-medium">السعر</th>
              <th className="text-right px-4 py-3 font-medium">المخزون</th>
              <th className="text-right px-4 py-3 font-medium">الحالة</th>
              <th className="text-right px-4 py-3 font-medium">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredProducts?.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onDelete={() => handleDelete(product.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductRow({
  product,
  onDelete,
}: {
  product: Product;
  onDelete: () => void;
}) {
  return (
    <tr className="hover:bg-muted/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={product.image || '/placeholder.png'}
            alt={product.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {product.description}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="px-2 py-1 bg-muted rounded text-sm">
          {product.category?.name}
        </span>
      </td>
      <td className="px-4 py-3 font-medium">
        {formatCurrency(product.price, 'KWD')}
      </td>
      <td className="px-4 py-3">
        <span className={cn(
          "font-medium",
          product.stock < 10 && "text-red-600"
        )}>
          {product.stock}
        </span>
      </td>
      <td className="px-4 py-3">
        <ProductStatusBadge status={product.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/products/${product.id}`}
            className="p-2 hover:bg-muted rounded"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-100 text-red-600 rounded"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
```

## 3.4 Product Add/Edit Form

```tsx
// components/admin/ProductForm.tsx
export function ProductForm({ productId }: { productId?: string }) {
  const isEditing = !!productId;
  const { product } = useProduct(productId);
  const { categories } = useCategories();
  const router = useRouter();

  const [form, setForm] = useState<ProductFormData>({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    price: 0,
    comparePrice: null,
    categoryId: '',
    stock: 0,
    images: [],
    status: 'draft',
    featured: false,
    specifications: [],
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        nameEn: product.nameEn || '',
        description: product.description || '',
        descriptionEn: product.descriptionEn || '',
        price: product.price,
        comparePrice: product.comparePrice,
        categoryId: product.categoryId,
        stock: product.stock,
        images: product.images || [],
        status: product.status,
        featured: product.featured,
        specifications: product.specifications || [],
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await updateProduct(productId, form);
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await createProduct(form);
        toast.success('تم إضافة المنتج بنجاح');
      }
      router.push('/admin/products');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-heading text-2xl font-bold">
          {isEditing ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        </h1>
        <div className="flex gap-3">
          <button type="button" className="btn-outline" onClick={() => router.back()}>
            إلغاء
          </button>
          <button type="submit" className="btn-primary">
            {isEditing ? 'حفظ التعديلات' : 'إضافة المنتج'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <h2 className="font-heading font-bold">المعلومات الأساسية</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  اسم المنتج (عربي) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  اسم المنتج (إنجليزي)
                </label>
                <input
                  type="text"
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                  className="input"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">الوصف (عربي)</label>
              <RichTextEditor
                value={form.description}
                onChange={(value) => setForm({ ...form, description: value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">الوصف (إنجليزي)</label>
              <RichTextEditor
                value={form.descriptionEn}
                onChange={(value) => setForm({ ...form, descriptionEn: value })}
                dir="ltr"
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <h2 className="font-heading font-bold">صور المنتج</h2>
            <ImageUploader
              images={form.images}
              onChange={(images) => setForm({ ...form, images })}
              maxImages={5}
            />
          </div>

          {/* Specifications */}
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <h2 className="font-heading font-bold">المواصفات</h2>
            <SpecificationsEditor
              specs={form.specifications}
              onChange={(specs) => setForm({ ...form, specifications: specs })}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <h2 className="font-heading font-bold">الحالة</h2>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              className="input"
            >
              <option value="draft">مسودة</option>
              <option value="active">منشور</option>
              <option value="hidden">مخفي</option>
            </select>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="rounded"
              />
              <span>منتج مميز</span>
            </label>
          </div>

          {/* Pricing */}
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <h2 className="font-heading font-bold">التسعير</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                السعر (د.ك) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.001"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                className="input"
                dir="ltr"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                السعر قبل الخصم (د.ك)
              </label>
              <input
                type="number"
                step="0.001"
                value={form.comparePrice || ''}
                onChange={(e) => setForm({
                  ...form,
                  comparePrice: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="input"
                dir="ltr"
              />
            </div>
          </div>

          {/* Category */}
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <h2 className="font-heading font-bold">التصنيف</h2>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="input"
              required
            >
              <option value="">اختر التصنيف</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Inventory */}
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <h2 className="font-heading font-bold">المخزون</h2>
            <div>
              <label className="block text-sm font-medium mb-1">الكمية المتوفرة</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) })}
                className="input"
                dir="ltr"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
```

---

# SECTION 4: TWO WAYS TO ADD CONTENT

## 4.1 Free vs Credits Comparison

| Action | Through Dashboard | Through AI Chat |
|--------|------------------|-----------------|
| Add product | **FREE** | 20 credits |
| Edit product | **FREE** | 15 credits |
| Add blog post | **FREE** | 25 credits |
| Upload images | **FREE** | 2 credits (placement) |
| Manage users | **FREE** | N/A |
| View analytics | **FREE** | N/A |
| Add new page | **FREE** (preset templates) | 20 credits |
| Design changes | Limited (preset options) | Variable (15-30) |

## 4.2 Dashboard Content Addition Flow

```tsx
// Preset fields for adding new pages
const PAGE_TEMPLATES = {
  product: {
    fields: [
      { key: 'name', type: 'text', label: 'اسم المنتج', required: true },
      { key: 'nameEn', type: 'text', label: 'Product Name', dir: 'ltr' },
      { key: 'price', type: 'number', label: 'السعر', required: true },
      { key: 'image', type: 'image', label: 'صورة المنتج', required: true },
      { key: 'description', type: 'richtext', label: 'الوصف' },
      { key: 'category', type: 'select', label: 'التصنيف', options: 'categories' },
    ],
  },
  service: {
    fields: [
      { key: 'name', type: 'text', label: 'اسم الخدمة', required: true },
      { key: 'price', type: 'number', label: 'السعر' },
      { key: 'duration', type: 'number', label: 'المدة (دقيقة)' },
      { key: 'image', type: 'image', label: 'صورة الخدمة' },
      { key: 'description', type: 'richtext', label: 'وصف الخدمة' },
    ],
  },
  blogPost: {
    fields: [
      { key: 'title', type: 'text', label: 'عنوان المقال', required: true },
      { key: 'slug', type: 'slug', label: 'الرابط', source: 'title' },
      { key: 'excerpt', type: 'textarea', label: 'ملخص المقال' },
      { key: 'featuredImage', type: 'image', label: 'صورة المقال' },
      { key: 'content', type: 'richtext', label: 'المحتوى', required: true },
      { key: 'tags', type: 'tags', label: 'الوسوم' },
    ],
  },
  review: {
    fields: [
      { key: 'customerName', type: 'text', label: 'اسم العميل', required: true },
      { key: 'rating', type: 'rating', label: 'التقييم', required: true },
      { key: 'content', type: 'textarea', label: 'التعليق', required: true },
      { key: 'avatar', type: 'image', label: 'صورة العميل' },
      { key: 'date', type: 'date', label: 'التاريخ' },
    ],
  },
};
```

---

# SECTION 5: DATABASE SCHEMA

```sql
-- Admin dashboards configuration
CREATE TABLE IF NOT EXISTS admin_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) NOT NULL UNIQUE,
  features JSONB NOT NULL,
  pages JSONB NOT NULL,
  theme TEXT NOT NULL DEFAULT 'arabic-rtl',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Admin users (per project)
CREATE TABLE IF NOT EXISTS project_admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin', -- owner, admin, editor, viewer
  must_change_password BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, email)
);

-- Admin activity logs
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  admin_user_id UUID REFERENCES project_admin_users(id) NOT NULL,
  action TEXT NOT NULL, -- create, update, delete, login, etc.
  resource_type TEXT NOT NULL, -- product, order, user, etc.
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE admin_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their project dashboards"
  ON admin_dashboards FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_admin_dashboards_project ON admin_dashboards(project_id);
CREATE INDEX idx_project_admin_users_project ON project_admin_users(project_id);
CREATE INDEX idx_admin_activity_logs_project ON admin_activity_logs(project_id);
CREATE INDEX idx_admin_activity_logs_created ON admin_activity_logs(created_at DESC);
```

---

# SECTION 6: CREDIT CONSUMPTION

| Dashboard Action | Credits | Notes |
|-----------------|---------|-------|
| Generate initial dashboard | **30** | One-time |
| Update dashboard config | **15** | When adding new modules via AI |
| Add page via AI | **10** | Using AI to design new admin page |
| Standard CRUD operations | **0** | Always free |
| Bulk import | **0** | Always free |
| Export data | **0** | Always free |

---

**Version:** 1.0  
**Last Updated:** December 27, 2025  
**Status:** Ready for Implementation
