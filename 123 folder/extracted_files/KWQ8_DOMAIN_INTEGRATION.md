# 🌐 KWQ8 DOMAIN INTEGRATION SYSTEM
## Namecheap API + In-Platform Domain Purchase
### Version 1.0 | December 2025

---

## OVERVIEW

KWQ8 provides seamless domain purchasing directly within the platform using the Namecheap API. Users never need to leave KWQ8 to buy, configure, or manage their domains.

**Key Features:**
- Domain search and availability checking
- In-platform purchase via UPayments
- Automatic DNS configuration for Vercel
- SSL provisioning included
- Domain management dashboard

---

# SECTION 1: DOMAIN PRICING MODEL

## 1.1 Pricing Structure

| Domain Cost (USD) | User Pays | KWQ8 Margin |
|-------------------|-----------|-------------|
| ≤ $15 | **FREE** (1/year per tier) | -$15 (acquisition cost) |
| $15.01 - $25 | Cost + 20% | 20% |
| $25.01 - $50 | Cost + 15% | 15% |
| $50+ | Cost + 10% | 10% |

## 1.2 Free Domains by Tier

| Tier | Free Domains (≤$15/year) | Per Year |
|------|--------------------------|----------|
| Basic | 0 | — |
| Pro | 1 | Included |
| Premium | 2 | Included |
| Enterprise | 5 | Included |

## 1.3 Currency Conversion

```typescript
const USD_TO_KWD = 0.308; // Updated daily via API

function convertToKWD(usdPrice: number): number {
  const kwd = usdPrice * USD_TO_KWD;
  // Round to 3 decimal places (KWD uses 3 decimals)
  return Math.round(kwd * 1000) / 1000;
}

function calculateUserPrice(domainCostUSD: number): {
  costKWD: number;
  margin: number;
  isFree: boolean;
} {
  if (domainCostUSD <= 15) {
    return { costKWD: 0, margin: 0, isFree: true };
  }
  
  let marginPercent = 0.20;
  if (domainCostUSD > 50) marginPercent = 0.10;
  else if (domainCostUSD > 25) marginPercent = 0.15;
  
  const totalUSD = domainCostUSD * (1 + marginPercent);
  return {
    costKWD: convertToKWD(totalUSD),
    margin: marginPercent,
    isFree: false,
  };
}
```

---

# SECTION 2: NAMECHEAP API INTEGRATION

## 2.1 API Configuration

```typescript
// Environment variables
const NAMECHEAP_CONFIG = {
  apiUser: process.env.NAMECHEAP_API_USER,
  apiKey: process.env.NAMECHEAP_API_KEY,
  userName: process.env.NAMECHEAP_USERNAME,
  clientIP: process.env.SERVER_IP, // Required by Namecheap
  sandbox: process.env.NODE_ENV !== 'production',
  baseUrl: process.env.NODE_ENV === 'production'
    ? 'https://api.namecheap.com/xml.response'
    : 'https://api.sandbox.namecheap.com/xml.response',
};
```

## 2.2 Domain Search Functionality

```typescript
interface DomainSearchResult {
  domain: string;
  available: boolean;
  premium: boolean;
  priceUSD: number;
  priceKWD: number;
  renewalPriceUSD: number;
  isFree: boolean;
}

async function searchDomains(query: string): Promise<DomainSearchResult[]> {
  // Generate domain variations
  const tlds = ['.com', '.net', '.org', '.io', '.co', '.kw', '.sa', '.ae'];
  const domains = tlds.map(tld => `${query}${tld}`);
  
  // Call Namecheap API
  const response = await fetch(NAMECHEAP_CONFIG.baseUrl, {
    method: 'POST',
    body: new URLSearchParams({
      ApiUser: NAMECHEAP_CONFIG.apiUser,
      ApiKey: NAMECHEAP_CONFIG.apiKey,
      UserName: NAMECHEAP_CONFIG.userName,
      ClientIp: NAMECHEAP_CONFIG.clientIP,
      Command: 'namecheap.domains.check',
      DomainList: domains.join(','),
    }),
  });

  const xml = await response.text();
  const results = parseNamecheapResponse(xml);
  
  // Get pricing for available domains
  const availableDomains = results.filter(d => d.available);
  const pricedDomains = await Promise.all(
    availableDomains.map(async (d) => {
      const pricing = await getDomainPricing(d.domain);
      const userPrice = calculateUserPrice(pricing.registration);
      
      return {
        domain: d.domain,
        available: true,
        premium: pricing.premium,
        priceUSD: pricing.registration,
        priceKWD: userPrice.costKWD,
        renewalPriceUSD: pricing.renewal,
        isFree: userPrice.isFree,
      };
    })
  );

  return pricedDomains.sort((a, b) => a.priceKWD - b.priceKWD);
}

async function getDomainPricing(domain: string): Promise<{
  registration: number;
  renewal: number;
  premium: boolean;
}> {
  const tld = domain.split('.').pop();
  
  const response = await fetch(NAMECHEAP_CONFIG.baseUrl, {
    method: 'POST',
    body: new URLSearchParams({
      ApiUser: NAMECHEAP_CONFIG.apiUser,
      ApiKey: NAMECHEAP_CONFIG.apiKey,
      UserName: NAMECHEAP_CONFIG.userName,
      ClientIp: NAMECHEAP_CONFIG.clientIP,
      Command: 'namecheap.users.getPricing',
      ProductType: 'DOMAIN',
      ProductCategory: 'DOMAINS',
      ActionName: 'REGISTER',
      ProductName: tld,
    }),
  });

  const xml = await response.text();
  return parsePricingResponse(xml);
}
```

## 2.3 Domain Purchase Flow

```typescript
interface DomainPurchaseRequest {
  userId: string;
  projectId: string;
  domain: string;
  years: number;
  registrantInfo: RegistrantInfo;
}

interface RegistrantInfo {
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
}

async function initiateDomainPurchase(
  request: DomainPurchaseRequest
): Promise<{ checkoutUrl: string; orderId: string }> {
  // Get domain price
  const pricing = await getDomainPricing(request.domain);
  const userPrice = calculateUserPrice(pricing.registration * request.years);
  
  // Check if user has free domain available
  const freeDomainAvailable = await checkFreeDomainEligibility(
    request.userId,
    pricing.registration
  );

  if (freeDomainAvailable && pricing.registration <= 15) {
    // Use free domain allocation
    return await processFreeDomaingRegistration(request);
  }

  // Create order record
  const order = await supabase
    .from('domain_orders')
    .insert({
      user_id: request.userId,
      project_id: request.projectId,
      domain: request.domain,
      years: request.years,
      price_usd: pricing.registration * request.years,
      price_kwd: userPrice.costKWD,
      status: 'pending',
      registrant_info: request.registrantInfo,
    })
    .select()
    .single();

  // Create UPayments checkout
  const checkout = await upayments.createCheckout({
    amount: userPrice.costKWD,
    currency: 'KWD',
    description: `نطاق ${request.domain} لمدة ${request.years} سنة`,
    metadata: {
      type: 'domain_purchase',
      order_id: order.data.id,
      domain: request.domain,
    },
    success_url: `${BASE_URL}/domains/success?order=${order.data.id}`,
    cancel_url: `${BASE_URL}/domains/cancel?order=${order.data.id}`,
  });

  return {
    checkoutUrl: checkout.url,
    orderId: order.data.id,
  };
}

async function completeDomainPurchase(orderId: string): Promise<void> {
  // Get order details
  const { data: order } = await supabase
    .from('domain_orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (!order) throw new Error('Order not found');

  // Register domain with Namecheap
  const registrationResult = await registerDomainWithNamecheap(order);

  if (!registrationResult.success) {
    // Refund the payment
    await processRefund(orderId);
    throw new Error(`Domain registration failed: ${registrationResult.error}`);
  }

  // Update order status
  await supabase
    .from('domain_orders')
    .update({
      status: 'completed',
      namecheap_order_id: registrationResult.orderId,
      expiry_date: registrationResult.expiryDate,
    })
    .eq('id', orderId);

  // Configure DNS for Vercel
  await configureDNSForVercel(order.domain, order.project_id);

  // Link domain to project
  await supabase
    .from('projects')
    .update({
      custom_domain: order.domain,
      domain_status: 'configuring',
    })
    .eq('id', order.project_id);
}

async function registerDomainWithNamecheap(order: DomainOrder): Promise<{
  success: boolean;
  orderId?: string;
  expiryDate?: string;
  error?: string;
}> {
  const r = order.registrant_info;
  
  const response = await fetch(NAMECHEAP_CONFIG.baseUrl, {
    method: 'POST',
    body: new URLSearchParams({
      ApiUser: NAMECHEAP_CONFIG.apiUser,
      ApiKey: NAMECHEAP_CONFIG.apiKey,
      UserName: NAMECHEAP_CONFIG.userName,
      ClientIp: NAMECHEAP_CONFIG.clientIP,
      Command: 'namecheap.domains.create',
      DomainName: order.domain,
      Years: order.years.toString(),
      // Registrant
      RegistrantFirstName: r.firstName,
      RegistrantLastName: r.lastName,
      RegistrantAddress1: r.address1,
      RegistrantCity: r.city,
      RegistrantStateProvince: r.stateProvince,
      RegistrantPostalCode: r.postalCode,
      RegistrantCountry: r.country,
      RegistrantPhone: r.phone,
      RegistrantEmailAddress: r.email,
      // Tech (same as registrant)
      TechFirstName: r.firstName,
      TechLastName: r.lastName,
      TechAddress1: r.address1,
      TechCity: r.city,
      TechStateProvince: r.stateProvince,
      TechPostalCode: r.postalCode,
      TechCountry: r.country,
      TechPhone: r.phone,
      TechEmailAddress: r.email,
      // Admin (same as registrant)
      AdminFirstName: r.firstName,
      AdminLastName: r.lastName,
      AdminAddress1: r.address1,
      AdminCity: r.city,
      AdminStateProvince: r.stateProvince,
      AdminPostalCode: r.postalCode,
      AdminCountry: r.country,
      AdminPhone: r.phone,
      AdminEmailAddress: r.email,
      // Billing (same as registrant)
      AuxBillingFirstName: r.firstName,
      AuxBillingLastName: r.lastName,
      AuxBillingAddress1: r.address1,
      AuxBillingCity: r.city,
      AuxBillingStateProvince: r.stateProvince,
      AuxBillingPostalCode: r.postalCode,
      AuxBillingCountry: r.country,
      AuxBillingPhone: r.phone,
      AuxBillingEmailAddress: r.email,
      // Enable WHOIS privacy
      AddFreeWhoisguard: 'yes',
      WGEnabled: 'yes',
    }),
  });

  const xml = await response.text();
  return parseRegistrationResponse(xml);
}
```

---

# SECTION 3: DNS CONFIGURATION

## 3.1 Vercel DNS Setup

```typescript
async function configureDNSForVercel(
  domain: string,
  projectId: string
): Promise<void> {
  // Get project's Vercel deployment
  const { data: project } = await supabase
    .from('projects')
    .select('vercel_project_id')
    .eq('id', projectId)
    .single();

  if (!project?.vercel_project_id) {
    throw new Error('Project not deployed to Vercel yet');
  }

  // Get Vercel's required DNS records
  const vercelRecords = await getVercelDNSRecords(project.vercel_project_id, domain);

  // Set DNS records in Namecheap
  await setNamecheapDNS(domain, vercelRecords);

  // Add domain to Vercel project
  await addDomainToVercel(project.vercel_project_id, domain);

  // Start monitoring for propagation
  await startDNSPropagationMonitor(domain, projectId);
}

async function setNamecheapDNS(
  domain: string,
  records: DNSRecord[]
): Promise<void> {
  const [sld, tld] = splitDomain(domain);

  const params: Record<string, string> = {
    ApiUser: NAMECHEAP_CONFIG.apiUser,
    ApiKey: NAMECHEAP_CONFIG.apiKey,
    UserName: NAMECHEAP_CONFIG.userName,
    ClientIp: NAMECHEAP_CONFIG.clientIP,
    Command: 'namecheap.domains.dns.setHosts',
    SLD: sld,
    TLD: tld,
  };

  // Add each record
  records.forEach((record, index) => {
    const i = index + 1;
    params[`HostName${i}`] = record.name;
    params[`RecordType${i}`] = record.type;
    params[`Address${i}`] = record.value;
    params[`TTL${i}`] = (record.ttl || 1800).toString();
  });

  const response = await fetch(NAMECHEAP_CONFIG.baseUrl, {
    method: 'POST',
    body: new URLSearchParams(params),
  });

  const xml = await response.text();
  const result = parseDNSResponse(xml);

  if (!result.success) {
    throw new Error(`Failed to set DNS: ${result.error}`);
  }
}

// Vercel DNS records for custom domain
async function getVercelDNSRecords(
  vercelProjectId: string,
  domain: string
): Promise<DNSRecord[]> {
  // Standard Vercel DNS configuration
  return [
    {
      name: '@',
      type: 'A',
      value: '76.76.21.21', // Vercel's IP
      ttl: 1800,
    },
    {
      name: 'www',
      type: 'CNAME',
      value: 'cname.vercel-dns.com',
      ttl: 1800,
    },
  ];
}
```

## 3.2 SSL Provisioning

```typescript
// SSL is automatically provisioned by Vercel
// Monitor SSL status

async function checkSSLStatus(domain: string): Promise<{
  status: 'pending' | 'active' | 'error';
  expiresAt?: string;
  error?: string;
}> {
  const response = await fetch(
    `https://api.vercel.com/v6/domains/${domain}/config`,
    {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      },
    }
  );

  const data = await response.json();

  if (data.misconfigured) {
    return { status: 'error', error: 'DNS misconfigured' };
  }

  if (data.certs && data.certs.length > 0) {
    return {
      status: 'active',
      expiresAt: data.certs[0].expiresAt,
    };
  }

  return { status: 'pending' };
}
```

---

# SECTION 4: UI COMPONENTS

## 4.1 Domain Search UI

```tsx
function DomainSearchForm({ projectId }: { projectId: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DomainSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setSearching(true);
    try {
      const domains = await searchDomains(query.trim());
      setResults(domains);
    } catch (error) {
      toast.error('حدث خطأ في البحث');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Search Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="ابحث عن اسم النطاق..."
          className="input flex-1"
          dir="ltr"
        />
        <button
          onClick={handleSearch}
          disabled={searching}
          className="btn-primary px-6"
        >
          {searching ? 'جاري البحث...' : 'بحث'}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-heading font-bold text-lg">النتائج</h3>
          
          {results.map((domain) => (
            <DomainResultCard
              key={domain.domain}
              domain={domain}
              selected={selectedDomain === domain.domain}
              onSelect={() => setSelectedDomain(domain.domain)}
            />
          ))}
        </div>
      )}

      {/* Purchase Button */}
      {selectedDomain && (
        <div className="flex justify-end">
          <DomainPurchaseButton
            domain={selectedDomain}
            projectId={projectId}
          />
        </div>
      )}
    </div>
  );
}

function DomainResultCard({
  domain,
  selected,
  onSelect,
}: {
  domain: DomainSearchResult;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full p-4 rounded-lg border transition-all text-start",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Selection indicator */}
          <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
            selected ? "border-primary bg-primary" : "border-muted-foreground"
          )}>
            {selected && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                <path d="M10.28 2.28L4.5 8.06 1.72 5.28a1 1 0 00-1.44 1.44l3.5 3.5a1 1 0 001.44 0l6.5-6.5a1 1 0 00-1.44-1.44z"/>
              </svg>
            )}
          </div>
          
          {/* Domain name */}
          <span className="font-mono text-lg" dir="ltr">
            {domain.domain}
          </span>
          
          {/* Premium badge */}
          {domain.premium && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
              مميز
            </span>
          )}
        </div>
        
        {/* Price */}
        <div className="text-end">
          {domain.isFree ? (
            <span className="text-green-600 font-heading font-bold">
              مجاناً
            </span>
          ) : (
            <span className="font-heading font-bold">
              {domain.priceKWD.toFixed(3)} د.ك
            </span>
          )}
          <div className="text-sm text-muted-foreground">
            سنوياً
          </div>
        </div>
      </div>
    </button>
  );
}
```

## 4.2 Domain Purchase Form

```tsx
function DomainPurchaseFlow({
  domain,
  projectId,
}: {
  domain: string;
  projectId: string;
}) {
  const [step, setStep] = useState<'info' | 'payment' | 'processing' | 'complete'>('info');
  const [registrantInfo, setRegistrantInfo] = useState<RegistrantInfo>({
    firstName: '',
    lastName: '',
    address1: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: 'KW',
    phone: '',
    email: '',
  });

  const handleSubmit = async () => {
    setStep('processing');
    
    try {
      const { checkoutUrl } = await initiateDomainPurchase({
        userId: user.id,
        projectId,
        domain,
        years: 1,
        registrantInfo,
      });

      // Redirect to UPayments
      window.location.href = checkoutUrl;
    } catch (error) {
      toast.error('حدث خطأ في عملية الشراء');
      setStep('info');
    }
  };

  if (step === 'processing') {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">جاري معالجة طلبك...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="p-4 bg-muted rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">النطاق المختار</span>
          <span className="font-mono font-bold" dir="ltr">{domain}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">الاسم الأول</label>
          <input
            type="text"
            value={registrantInfo.firstName}
            onChange={(e) => setRegistrantInfo(prev => ({
              ...prev,
              firstName: e.target.value,
            }))}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">اسم العائلة</label>
          <input
            type="text"
            value={registrantInfo.lastName}
            onChange={(e) => setRegistrantInfo(prev => ({
              ...prev,
              lastName: e.target.value,
            }))}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">العنوان</label>
        <input
          type="text"
          value={registrantInfo.address1}
          onChange={(e) => setRegistrantInfo(prev => ({
            ...prev,
            address1: e.target.value,
          }))}
          className="input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">المدينة</label>
          <input
            type="text"
            value={registrantInfo.city}
            onChange={(e) => setRegistrantInfo(prev => ({
              ...prev,
              city: e.target.value,
            }))}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">الرمز البريدي</label>
          <input
            type="text"
            value={registrantInfo.postalCode}
            onChange={(e) => setRegistrantInfo(prev => ({
              ...prev,
              postalCode: e.target.value,
            }))}
            className="input"
            dir="ltr"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">الهاتف</label>
          <input
            type="tel"
            value={registrantInfo.phone}
            onChange={(e) => setRegistrantInfo(prev => ({
              ...prev,
              phone: e.target.value,
            }))}
            className="input"
            dir="ltr"
            placeholder="+965 XXXX XXXX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            value={registrantInfo.email}
            onChange={(e) => setRegistrantInfo(prev => ({
              ...prev,
              email: e.target.value,
            }))}
            className="input"
            dir="ltr"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full btn-primary btn-lg"
      >
        متابعة للدفع
      </button>
    </div>
  );
}
```

---

# SECTION 5: DOMAIN MANAGEMENT

## 5.1 User Domain Dashboard

```tsx
function DomainsDashboard({ userId }: { userId: string }) {
  const { data: domains, isLoading } = useDomains(userId);

  if (isLoading) return <DomainsSkeletons />;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-2xl font-bold">نطاقاتي</h2>
        <button className="btn-outline btn-sm">
          إضافة نطاق جديد
        </button>
      </div>

      {domains.length === 0 ? (
        <EmptyDomainsState />
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <DomainCard key={domain.id} domain={domain} />
          ))}
        </div>
      )}
    </div>
  );
}

function DomainCard({ domain }: { domain: UserDomain }) {
  const statusColors = {
    active: 'text-green-600 bg-green-100',
    configuring: 'text-amber-600 bg-amber-100',
    error: 'text-red-600 bg-red-100',
    expired: 'text-gray-600 bg-gray-100',
  };

  const statusLabels = {
    active: 'فعال',
    configuring: 'قيد التهيئة',
    error: 'خطأ',
    expired: 'منتهي',
  };

  return (
    <div className="p-6 bg-card rounded-lg border">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-mono text-lg font-bold" dir="ltr">
              {domain.domain}
            </h3>
            <span className={cn(
              "px-2 py-0.5 rounded text-sm",
              statusColors[domain.status]
            )}>
              {statusLabels[domain.status]}
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p>المشروع: {domain.projectName}</p>
            <p>ينتهي في: {formatDate(new Date(domain.expiryDate))}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="btn-ghost btn-sm">
            إعدادات DNS
          </button>
          <button className="btn-ghost btn-sm">
            تجديد
          </button>
        </div>
      </div>

      {/* SSL Status */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          {domain.sslStatus === 'active' ? (
            <>
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm text-green-600">شهادة SSL فعالة</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm text-amber-600">جاري تفعيل SSL...</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

# SECTION 6: DATABASE SCHEMA

```sql
-- Domain orders table
CREATE TABLE IF NOT EXISTS domain_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  project_id UUID REFERENCES projects(id),
  domain TEXT NOT NULL,
  years INTEGER NOT NULL DEFAULT 1,
  price_usd DECIMAL(10, 2) NOT NULL,
  price_kwd DECIMAL(10, 3) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  namecheap_order_id TEXT,
  expiry_date TIMESTAMPTZ,
  registrant_info JSONB NOT NULL,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE domain_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own domain orders"
  ON domain_orders FOR SELECT
  USING (auth.uid() = user_id);

-- User domains table
CREATE TABLE IF NOT EXISTS user_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  project_id UUID REFERENCES projects(id),
  domain TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'configuring', -- configuring, active, error, expired
  ssl_status TEXT NOT NULL DEFAULT 'pending', -- pending, active, error
  expiry_date TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  dns_configured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own domains"
  ON user_domains FOR SELECT
  USING (auth.uid() = user_id);

-- Free domain allocations
CREATE TABLE IF NOT EXISTS free_domain_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  year INTEGER NOT NULL,
  domains_used INTEGER NOT NULL DEFAULT 0,
  domains_allowed INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE free_domain_allocations ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_domain_orders_user ON domain_orders(user_id);
CREATE INDEX idx_domain_orders_status ON domain_orders(status);
CREATE INDEX idx_user_domains_user ON user_domains(user_id);
CREATE INDEX idx_user_domains_project ON user_domains(project_id);
CREATE INDEX idx_user_domains_expiry ON user_domains(expiry_date);
```

---

**Version:** 1.0  
**Last Updated:** December 27, 2025  
**Status:** Ready for Implementation
