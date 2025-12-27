# 🇰🇼🇸🇦🇦🇪🇶🇦🇧🇭🇴🇲 GCC COMPONENTS SPECIFICATION
## Pre-built Components for Gulf Cooperation Council Businesses
### Version 1.0 | December 2025

---

## OVERVIEW

These components are GCC-specific building blocks that handle:
- Currency formatting (3 decimal for KWD/BHD/OMR, 2 for others)
- VAT calculations per country
- Phone number validation per country
- Arabic typography and RTL layout

---

# COMPONENT 1: VATCalculator

## Purpose
Calculate and display VAT based on GCC country.

## Props Interface
```typescript
interface VATCalculatorProps {
  amount: number;
  country: 'KW' | 'SA' | 'AE' | 'QA' | 'BH' | 'OM';
  showBreakdown?: boolean;
  className?: string;
}
```

## Implementation
```tsx
import { useMemo } from 'react';

const VAT_RATES: Record<string, number> = {
  KW: 0,      // Kuwait: 0%
  SA: 0.15,   // Saudi Arabia: 15%
  AE: 0.05,   // UAE: 5%
  QA: 0,      // Qatar: 0%
  BH: 0.10,   // Bahrain: 10%
  OM: 0.05,   // Oman: 5%
};

const CURRENCY_CONFIG: Record<string, { code: string; decimals: number }> = {
  KW: { code: 'KWD', decimals: 3 },
  SA: { code: 'SAR', decimals: 2 },
  AE: { code: 'AED', decimals: 2 },
  QA: { code: 'QAR', decimals: 2 },
  BH: { code: 'BHD', decimals: 3 },
  OM: { code: 'OMR', decimals: 3 },
};

const VAT_LABELS: Record<string, string> = {
  KW: 'بدون ضريبة',
  SA: 'ضريبة القيمة المضافة',
  AE: 'ضريبة القيمة المضافة',
  QA: 'بدون ضريبة',
  BH: 'ضريبة القيمة المضافة',
  OM: 'ضريبة القيمة المضافة',
};

export default function VATCalculator({
  amount,
  country,
  showBreakdown = true,
  className = '',
}: VATCalculatorProps) {
  const calculation = useMemo(() => {
    const rate = VAT_RATES[country];
    const { code, decimals } = CURRENCY_CONFIG[country];
    
    const vatAmount = amount * rate;
    const total = amount + vatAmount;
    
    const format = (value: number) =>
      new Intl.NumberFormat('ar-' + country, {
        style: 'currency',
        currency: code,
        minimumFractionDigits: decimals,
      }).format(value);
    
    return {
      subtotal: format(amount),
      vatRate: `${(rate * 100).toFixed(0)}%`,
      vatAmount: format(vatAmount),
      total: format(total),
      hasVat: rate > 0,
    };
  }, [amount, country]);

  return (
    <div className={`font-body text-foreground ${className}`} dir="rtl">
      {showBreakdown ? (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">المبلغ الأساسي</span>
            <span>{calculation.subtotal}</span>
          </div>
          
          {calculation.hasVat && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {VAT_LABELS[country]} ({calculation.vatRate})
              </span>
              <span>{calculation.vatAmount}</span>
            </div>
          )}
          
          <div className="flex justify-between border-t border-border pt-2 font-semibold">
            <span>الإجمالي</span>
            <span className="text-primary">{calculation.total}</span>
          </div>
        </div>
      ) : (
        <span className="font-heading text-xl font-bold text-primary">
          {calculation.total}
        </span>
      )}
    </div>
  );
}
```

## Usage Example
```tsx
<VATCalculator 
  amount={100} 
  country="SA" 
  showBreakdown={true} 
/>
// Outputs:
// المبلغ الأساسي: ١٠٠٫٠٠ ر.س
// ضريبة القيمة المضافة (15%): ١٥٫٠٠ ر.س
// الإجمالي: ١١٥٫٠٠ ر.س
```

---

# COMPONENT 2: GCCPhoneInput

## Purpose
Phone number input with country-specific validation and formatting.

## Props Interface
```typescript
interface GCCPhoneInputProps {
  country: 'KW' | 'SA' | 'AE' | 'QA' | 'BH' | 'OM';
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  className?: string;
  placeholder?: string;
}
```

## Implementation
```tsx
import { useState, useCallback } from 'react';

const PHONE_CONFIG: Record<string, {
  code: string;
  length: number;
  pattern: RegExp;
  placeholder: string;
  format: (num: string) => string;
}> = {
  KW: {
    code: '+965',
    length: 8,
    pattern: /^[569]\d{7}$/,
    placeholder: 'XXXX XXXX',
    format: (n) => `${n.slice(0,4)} ${n.slice(4)}`,
  },
  SA: {
    code: '+966',
    length: 9,
    pattern: /^5\d{8}$/,
    placeholder: '5X XXX XXXX',
    format: (n) => `${n.slice(0,2)} ${n.slice(2,5)} ${n.slice(5)}`,
  },
  AE: {
    code: '+971',
    length: 9,
    pattern: /^5\d{8}$/,
    placeholder: '5X XXX XXXX',
    format: (n) => `${n.slice(0,2)} ${n.slice(2,5)} ${n.slice(5)}`,
  },
  QA: {
    code: '+974',
    length: 8,
    pattern: /^[3567]\d{7}$/,
    placeholder: 'XXXX XXXX',
    format: (n) => `${n.slice(0,4)} ${n.slice(4)}`,
  },
  BH: {
    code: '+973',
    length: 8,
    pattern: /^[3]\d{7}$/,
    placeholder: '3XXX XXXX',
    format: (n) => `${n.slice(0,4)} ${n.slice(4)}`,
  },
  OM: {
    code: '+968',
    length: 8,
    pattern: /^[79]\d{7}$/,
    placeholder: 'XXXX XXXX',
    format: (n) => `${n.slice(0,4)} ${n.slice(4)}`,
  },
};

export default function GCCPhoneInput({
  country,
  value,
  onChange,
  className = '',
  placeholder,
}: GCCPhoneInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const config = PHONE_CONFIG[country];

  const validate = useCallback((phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    return config.pattern.test(digits);
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    const limited = input.slice(0, config.length);
    const formatted = config.format(limited);
    const isValid = validate(limited);
    onChange(formatted, isValid);
  };

  const displayValue = value.replace(/\D/g, '');
  const isValid = validate(displayValue);

  return (
    <div className={`flex items-center gap-2 ${className}`} dir="ltr">
      <div className="flex-shrink-0 px-3 py-2 bg-muted rounded-s-lg border border-border border-e-0 font-mono text-sm text-muted-foreground">
        {config.code}
      </div>
      <input
        type="tel"
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder || config.placeholder}
        className={`
          flex-1 px-3 py-2 rounded-e-lg border bg-background text-foreground
          font-mono text-sm
          ${isFocused ? 'ring-2 ring-ring border-ring' : 'border-border'}
          ${!isValid && displayValue.length === config.length ? 'border-destructive' : ''}
        `}
      />
      {displayValue.length === config.length && (
        <span className={`text-lg ${isValid ? 'text-green-600' : 'text-destructive'}`}>
          {isValid ? '✓' : '✗'}
        </span>
      )}
    </div>
  );
}
```

## Usage Example
```tsx
const [phone, setPhone] = useState('');
const [isValid, setIsValid] = useState(false);

<GCCPhoneInput
  country="KW"
  value={phone}
  onChange={(value, valid) => {
    setPhone(value);
    setIsValid(valid);
  }}
/>
// Shows: +965 | 9XXX XXXX
```

---

# COMPONENT 3: CurrencyDisplay

## Purpose
Display formatted currency with correct decimals.

## Props Interface
```typescript
interface CurrencyDisplayProps {
  amount: number;
  country: 'KW' | 'SA' | 'AE' | 'QA' | 'BH' | 'OM';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}
```

## Implementation
```tsx
const CURRENCY_CONFIG: Record<string, { code: string; decimals: number }> = {
  KW: { code: 'KWD', decimals: 3 },
  SA: { code: 'SAR', decimals: 2 },
  AE: { code: 'AED', decimals: 2 },
  QA: { code: 'QAR', decimals: 2 },
  BH: { code: 'BHD', decimals: 3 },
  OM: { code: 'OMR', decimals: 3 },
};

const SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl font-bold',
};

export default function CurrencyDisplay({
  amount,
  country,
  size = 'md',
  className = '',
}: CurrencyDisplayProps) {
  const { code, decimals } = CURRENCY_CONFIG[country];
  
  const formatted = new Intl.NumberFormat('ar-' + country, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return (
    <span 
      className={`font-heading text-primary ${SIZE_CLASSES[size]} ${className}`}
      dir="rtl"
    >
      {formatted}
    </span>
  );
}
```

## Usage Example
```tsx
<CurrencyDisplay amount={125.500} country="KW" size="xl" />
// Outputs: ١٢٥٫٥٠٠ د.ك

<CurrencyDisplay amount={500} country="SA" size="lg" />
// Outputs: ٥٠٠٫٠٠ ر.س
```

---

# COMPONENT 4: ArabicInvoice

## Purpose
Generate printable Arabic invoice with GCC compliance.

## Props Interface
```typescript
interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

interface ArabicInvoiceProps {
  invoiceNumber: string;
  date: Date;
  businessName: string;
  businessAddress: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  country: 'KW' | 'SA' | 'AE' | 'QA' | 'BH' | 'OM';
  notes?: string;
}
```

## Implementation
```tsx
import { useMemo } from 'react';

const CURRENCY_CONFIG: Record<string, { code: string; decimals: number; name: string }> = {
  KW: { code: 'KWD', decimals: 3, name: 'دينار كويتي' },
  SA: { code: 'SAR', decimals: 2, name: 'ريال سعودي' },
  AE: { code: 'AED', decimals: 2, name: 'درهم إماراتي' },
  QA: { code: 'QAR', decimals: 2, name: 'ريال قطري' },
  BH: { code: 'BHD', decimals: 3, name: 'دينار بحريني' },
  OM: { code: 'OMR', decimals: 3, name: 'ريال عماني' },
};

const VAT_RATES: Record<string, number> = {
  KW: 0, SA: 0.15, AE: 0.05, QA: 0, BH: 0.10, OM: 0.05,
};

export default function ArabicInvoice({
  invoiceNumber,
  date,
  businessName,
  businessAddress,
  customerName,
  customerPhone,
  items,
  country,
  notes,
}: ArabicInvoiceProps) {
  const { code, decimals, name: currencyName } = CURRENCY_CONFIG[country];
  const vatRate = VAT_RATES[country];

  const format = (value: number) =>
    new Intl.NumberFormat('ar-' + country, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);

  const calculation = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const vat = subtotal * vatRate;
    const total = subtotal + vat;
    return { subtotal, vat, total };
  }, [items, vatRate]);

  const formatDate = (d: Date) =>
    new Intl.DateTimeFormat('ar', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);

  return (
    <div 
      className="max-w-2xl mx-auto bg-background p-8 font-body print:p-0" 
      dir="rtl"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-4 border-b border-border">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary">
            {businessName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{businessAddress}</p>
        </div>
        <div className="text-end">
          <h2 className="font-heading text-xl font-bold">فاتورة</h2>
          <p className="text-muted-foreground">رقم: {invoiceNumber}</p>
          <p className="text-muted-foreground">التاريخ: {formatDate(date)}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <h3 className="font-heading font-semibold mb-2">معلومات العميل</h3>
        <p>الاسم: {customerName}</p>
        <p>الهاتف: <span dir="ltr">{customerPhone}</span></p>
      </div>

      {/* Items Table */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 text-start font-heading">الصنف</th>
            <th className="py-2 text-center font-heading">الكمية</th>
            <th className="py-2 text-center font-heading">السعر</th>
            <th className="py-2 text-end font-heading">المجموع</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-border/50">
              <td className="py-3 text-start">{item.name}</td>
              <td className="py-3 text-center">{item.quantity}</td>
              <td className="py-3 text-center">{format(item.unitPrice)}</td>
              <td className="py-3 text-end">{format(item.quantity * item.unitPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">المجموع الفرعي</span>
            <span>{format(calculation.subtotal)} {currencyName}</span>
          </div>
          
          {vatRate > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                ضريبة القيمة المضافة ({(vatRate * 100).toFixed(0)}%)
              </span>
              <span>{format(calculation.vat)} {currencyName}</span>
            </div>
          )}
          
          <div className="flex justify-between pt-2 border-t border-border font-heading font-bold text-lg">
            <span>الإجمالي</span>
            <span className="text-primary">
              {format(calculation.total)} {currencyName}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="mt-8 pt-4 border-t border-border">
          <h3 className="font-heading font-semibold mb-2">ملاحظات</h3>
          <p className="text-muted-foreground text-sm">{notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-border text-center text-sm text-muted-foreground">
        <p>شكراً لتعاملكم معنا</p>
      </div>
    </div>
  );
}
```

---

# COMPONENT 5: GCCAddressForm

## Purpose
Address form with GCC-specific fields.

## Implementation
```tsx
interface GCCAddressFormProps {
  value: {
    country: string;
    city: string;
    area: string;
    block?: string;
    street?: string;
    building?: string;
    floor?: string;
    apartment?: string;
  };
  onChange: (address: GCCAddressFormProps['value']) => void;
  className?: string;
}

const GCC_COUNTRIES = [
  { code: 'KW', name: 'الكويت' },
  { code: 'SA', name: 'المملكة العربية السعودية' },
  { code: 'AE', name: 'الإمارات العربية المتحدة' },
  { code: 'QA', name: 'قطر' },
  { code: 'BH', name: 'البحرين' },
  { code: 'OM', name: 'سلطنة عمان' },
];

const CITIES: Record<string, string[]> = {
  KW: ['مدينة الكويت', 'حولي', 'الفروانية', 'الأحمدي', 'الجهراء', 'مبارك الكبير'],
  SA: ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر'],
  AE: ['دبي', 'أبوظبي', 'الشارقة', 'عجمان', 'رأس الخيمة', 'الفجيرة'],
  QA: ['الدوحة', 'الوكرة', 'الخور', 'الريان'],
  BH: ['المنامة', 'المحرق', 'الرفاع', 'مدينة حمد'],
  OM: ['مسقط', 'صلالة', 'صحار', 'نزوى'],
};

export default function GCCAddressForm({
  value,
  onChange,
  className = '',
}: GCCAddressFormProps) {
  const update = (field: string, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const cities = value.country ? CITIES[value.country] || [] : [];

  const inputClass = "w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-ring";

  return (
    <div className={`space-y-4 ${className}`} dir="rtl">
      {/* Country */}
      <div>
        <label className="block font-body text-foreground mb-2">الدولة</label>
        <select
          value={value.country}
          onChange={(e) => {
            update('country', e.target.value);
            update('city', '');
          }}
          className={inputClass}
        >
          <option value="">اختر الدولة</option>
          {GCC_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* City */}
      <div>
        <label className="block font-body text-foreground mb-2">المدينة</label>
        <select
          value={value.city}
          onChange={(e) => update('city', e.target.value)}
          className={inputClass}
          disabled={!value.country}
        >
          <option value="">اختر المدينة</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Area */}
      <div>
        <label className="block font-body text-foreground mb-2">المنطقة</label>
        <input
          type="text"
          value={value.area}
          onChange={(e) => update('area', e.target.value)}
          placeholder="اسم المنطقة"
          className={inputClass}
        />
      </div>

      {/* Block & Street (Kuwait-style) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-body text-foreground mb-2">القطعة</label>
          <input
            type="text"
            value={value.block || ''}
            onChange={(e) => update('block', e.target.value)}
            placeholder="رقم القطعة"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block font-body text-foreground mb-2">الشارع</label>
          <input
            type="text"
            value={value.street || ''}
            onChange={(e) => update('street', e.target.value)}
            placeholder="رقم أو اسم الشارع"
            className={inputClass}
          />
        </div>
      </div>

      {/* Building Details */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block font-body text-foreground mb-2">المبنى</label>
          <input
            type="text"
            value={value.building || ''}
            onChange={(e) => update('building', e.target.value)}
            placeholder="رقم المبنى"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block font-body text-foreground mb-2">الطابق</label>
          <input
            type="text"
            value={value.floor || ''}
            onChange={(e) => update('floor', e.target.value)}
            placeholder="رقم الطابق"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block font-body text-foreground mb-2">الشقة</label>
          <input
            type="text"
            value={value.apartment || ''}
            onChange={(e) => update('apartment', e.target.value)}
            placeholder="رقم الشقة"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
```

---

# COMPONENT 6: ContactFormArabic

## Purpose
Pre-built contact form with Arabic labels and GCC phone validation.

## Implementation
```tsx
import { useState } from 'react';
import GCCPhoneInput from './GCCPhoneInput';

interface ContactFormArabicProps {
  country: 'KW' | 'SA' | 'AE' | 'QA' | 'BH' | 'OM';
  onSubmit: (data: ContactFormData) => void;
  className?: string;
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function ContactFormArabic({
  country,
  onSubmit,
  className = '',
}: ContactFormArabicProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [phoneValid, setPhoneValid] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid) return;
    
    onSubmit(formData);
    setSubmitted(true);
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-ring";

  if (submitted) {
    return (
      <div className="text-center p-8 bg-muted rounded-lg" dir="rtl">
        <div className="text-4xl mb-4">✓</div>
        <h3 className="font-heading text-xl font-bold text-foreground mb-2">
          شكراً لتواصلك معنا
        </h3>
        <p className="text-muted-foreground">
          سنرد عليك في أقرب وقت ممكن
        </p>
      </div>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`space-y-6 ${className}`}
      dir="rtl"
    >
      {/* Name */}
      <div>
        <label className="block font-body text-foreground mb-2">
          الاسم الكامل
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="أدخل اسمك"
          className={inputClass}
        />
      </div>

      {/* Email */}
      <div>
        <label className="block font-body text-foreground mb-2">
          البريد الإلكتروني
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="example@email.com"
          dir="ltr"
          className={`${inputClass} text-start`}
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block font-body text-foreground mb-2">
          رقم الهاتف
        </label>
        <GCCPhoneInput
          country={country}
          value={formData.phone}
          onChange={(value, isValid) => {
            setFormData({ ...formData, phone: value });
            setPhoneValid(isValid);
          }}
        />
      </div>

      {/* Message */}
      <div>
        <label className="block font-body text-foreground mb-2">
          الرسالة
        </label>
        <textarea
          required
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="اكتب رسالتك هنا..."
          className={inputClass}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!phoneValid}
        className="w-full bg-primary text-primary-foreground font-heading font-semibold py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        إرسال الرسالة
      </button>
    </form>
  );
}
```

---

# GCC CONFIG OBJECT

## Centralized Configuration
```typescript
// src/lib/gcc-config.ts

export const GCC_CONFIG = {
  countries: {
    KW: {
      name: { ar: 'الكويت', en: 'Kuwait' },
      currency: { code: 'KWD', decimals: 3, symbol: 'د.ك' },
      vat: 0,
      phoneCode: '+965',
      phoneLength: 8,
      phonePattern: /^[569]\d{7}$/,
      timezone: 'Asia/Kuwait',
      locale: 'ar-KW',
    },
    SA: {
      name: { ar: 'المملكة العربية السعودية', en: 'Saudi Arabia' },
      currency: { code: 'SAR', decimals: 2, symbol: 'ر.س' },
      vat: 0.15,
      phoneCode: '+966',
      phoneLength: 9,
      phonePattern: /^5\d{8}$/,
      timezone: 'Asia/Riyadh',
      locale: 'ar-SA',
    },
    AE: {
      name: { ar: 'الإمارات العربية المتحدة', en: 'United Arab Emirates' },
      currency: { code: 'AED', decimals: 2, symbol: 'د.إ' },
      vat: 0.05,
      phoneCode: '+971',
      phoneLength: 9,
      phonePattern: /^5\d{8}$/,
      timezone: 'Asia/Dubai',
      locale: 'ar-AE',
    },
    QA: {
      name: { ar: 'قطر', en: 'Qatar' },
      currency: { code: 'QAR', decimals: 2, symbol: 'ر.ق' },
      vat: 0,
      phoneCode: '+974',
      phoneLength: 8,
      phonePattern: /^[3567]\d{7}$/,
      timezone: 'Asia/Qatar',
      locale: 'ar-QA',
    },
    BH: {
      name: { ar: 'البحرين', en: 'Bahrain' },
      currency: { code: 'BHD', decimals: 3, symbol: 'د.ب' },
      vat: 0.10,
      phoneCode: '+973',
      phoneLength: 8,
      phonePattern: /^[3]\d{7}$/,
      timezone: 'Asia/Bahrain',
      locale: 'ar-BH',
    },
    OM: {
      name: { ar: 'سلطنة عمان', en: 'Oman' },
      currency: { code: 'OMR', decimals: 3, symbol: 'ر.ع' },
      vat: 0.05,
      phoneCode: '+968',
      phoneLength: 8,
      phonePattern: /^[79]\d{7}$/,
      timezone: 'Asia/Muscat',
      locale: 'ar-OM',
    },
  },
  
  // Helper functions
  getCountry(code: string) {
    return this.countries[code as keyof typeof this.countries];
  },
  
  formatCurrency(amount: number, countryCode: string) {
    const country = this.getCountry(countryCode);
    if (!country) return amount.toString();
    
    return new Intl.NumberFormat(country.locale, {
      style: 'currency',
      currency: country.currency.code,
      minimumFractionDigits: country.currency.decimals,
    }).format(amount);
  },
  
  calculateVAT(amount: number, countryCode: string) {
    const country = this.getCountry(countryCode);
    return country ? amount * country.vat : 0;
  },
  
  validatePhone(phone: string, countryCode: string) {
    const country = this.getCountry(countryCode);
    if (!country) return false;
    const digits = phone.replace(/\D/g, '');
    return country.phonePattern.test(digits);
  },
};

export type GCCCountryCode = keyof typeof GCC_CONFIG.countries;
```

---

**Version:** 1.0  
**Last Updated:** December 27, 2025  
**Status:** Ready for Implementation
