/**
 * Namecheap Domain API Client
 *
 * Handles domain availability checks, pricing, and registration
 * via Namecheap's XML API.
 */

import type {
  NamecheapConfig,
  DomainAvailability,
  DomainPrice,
  NamecheapApiResponse,
  NamecheapDomainCheckResponse,
} from './types'

// API Endpoints
const SANDBOX_URL = 'https://api.sandbox.namecheap.com/xml.response'
const PRODUCTION_URL = 'https://api.namecheap.com/xml.response'

export class NamecheapClient {
  private config: NamecheapConfig

  constructor(config?: Partial<NamecheapConfig>) {
    this.config = {
      apiUser: config?.apiUser || process.env.NAMECHEAP_API_USER || '',
      apiKey: config?.apiKey || process.env.NAMECHEAP_API_KEY || '',
      username: config?.username || process.env.NAMECHEAP_USERNAME || '',
      clientIp: config?.clientIp || process.env.NAMECHEAP_CLIENT_IP || '127.0.0.1',
      sandbox: config?.sandbox ?? process.env.NAMECHEAP_SANDBOX === 'true',
    }

    if (!this.config.apiKey) {
      console.warn('[Namecheap] API key not configured - using mock mode')
    }
  }

  private get baseUrl(): string {
    return this.config.sandbox ? SANDBOX_URL : PRODUCTION_URL
  }

  private buildParams(command: string, extraParams: Record<string, string> = {}): URLSearchParams {
    const params = new URLSearchParams({
      ApiUser: this.config.apiUser,
      ApiKey: this.config.apiKey,
      UserName: this.config.username,
      ClientIp: this.config.clientIp,
      Command: command,
      ...extraParams,
    })
    return params
  }

  /**
   * Check domain availability
   */
  async checkAvailability(domains: string[]): Promise<DomainAvailability[]> {
    // Use mock data if no API key
    if (!this.config.apiKey) {
      return this.mockCheckAvailability(domains)
    }

    try {
      const params = this.buildParams('namecheap.domains.check', {
        DomainList: domains.join(','),
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      const text = await response.text()
      const data = this.parseXmlResponse<NamecheapDomainCheckResponse>(text)

      if (!data.ApiResponse.CommandResponse.DomainCheckResult) {
        return []
      }

      const results = Array.isArray(data.ApiResponse.CommandResponse.DomainCheckResult)
        ? data.ApiResponse.CommandResponse.DomainCheckResult
        : [data.ApiResponse.CommandResponse.DomainCheckResult]

      return results.map((result) => ({
        domain: result.Domain,
        available: result.Available === 'true',
        premium: result.IsPremiumName === 'true',
        price: result.PremiumRegistrationPrice
          ? {
              registration: parseFloat(result.PremiumRegistrationPrice),
              renewal: parseFloat(result.PremiumRegistrationPrice),
              transfer: parseFloat(result.PremiumRegistrationPrice),
              currency: 'USD' as const,
            }
          : undefined,
      }))
    } catch (error) {
      console.error('[Namecheap] Check availability error:', error)
      return this.mockCheckAvailability(domains)
    }
  }

  /**
   * Get domain pricing for a TLD
   */
  async getPricing(tld: string): Promise<DomainPrice | null> {
    // Use mock data if no API key
    if (!this.config.apiKey) {
      return this.mockGetPricing(tld)
    }

    try {
      const params = this.buildParams('namecheap.users.getPricing', {
        ProductType: 'DOMAIN',
        ProductCategory: 'DOMAINS',
        ProductName: tld,
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      const text = await response.text()

      // Parse pricing from response
      const priceMatch = text.match(/YourPrice="([\d.]+)"/)
      if (priceMatch) {
        const price = parseFloat(priceMatch[1])
        return {
          registration: price,
          renewal: price,
          transfer: price,
          currency: 'USD',
        }
      }

      return this.mockGetPricing(tld)
    } catch (error) {
      console.error('[Namecheap] Get pricing error:', error)
      return this.mockGetPricing(tld)
    }
  }

  /**
   * Register a domain
   */
  async registerDomain(
    domain: string,
    years: number = 1,
    registrant: DomainRegistrant
  ): Promise<{ success: boolean; orderId?: string; error?: string }> {
    if (!this.config.apiKey) {
      return {
        success: false,
        error: 'Namecheap API not configured',
      }
    }

    try {
      const [sld, tld] = this.splitDomain(domain)

      const params = this.buildParams('namecheap.domains.create', {
        DomainName: domain,
        Years: years.toString(),
        // Registrant info
        RegistrantFirstName: registrant.firstName,
        RegistrantLastName: registrant.lastName,
        RegistrantAddress1: registrant.address1,
        RegistrantCity: registrant.city,
        RegistrantStateProvince: registrant.state,
        RegistrantPostalCode: registrant.postalCode,
        RegistrantCountry: registrant.country,
        RegistrantPhone: registrant.phone,
        RegistrantEmailAddress: registrant.email,
        // Copy to other contacts
        TechFirstName: registrant.firstName,
        TechLastName: registrant.lastName,
        TechAddress1: registrant.address1,
        TechCity: registrant.city,
        TechStateProvince: registrant.state,
        TechPostalCode: registrant.postalCode,
        TechCountry: registrant.country,
        TechPhone: registrant.phone,
        TechEmailAddress: registrant.email,
        AdminFirstName: registrant.firstName,
        AdminLastName: registrant.lastName,
        AdminAddress1: registrant.address1,
        AdminCity: registrant.city,
        AdminStateProvince: registrant.state,
        AdminPostalCode: registrant.postalCode,
        AdminCountry: registrant.country,
        AdminPhone: registrant.phone,
        AdminEmailAddress: registrant.email,
        AuxBillingFirstName: registrant.firstName,
        AuxBillingLastName: registrant.lastName,
        AuxBillingAddress1: registrant.address1,
        AuxBillingCity: registrant.city,
        AuxBillingStateProvince: registrant.state,
        AuxBillingPostalCode: registrant.postalCode,
        AuxBillingCountry: registrant.country,
        AuxBillingPhone: registrant.phone,
        AuxBillingEmailAddress: registrant.email,
        // Enable WhoisGuard for privacy
        AddFreeWhoisguard: 'yes',
        WGEnabled: 'yes',
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      const text = await response.text()

      if (text.includes('Status="OK"')) {
        const orderIdMatch = text.match(/OrderID="(\d+)"/)
        return {
          success: true,
          orderId: orderIdMatch?.[1],
        }
      }

      const errorMatch = text.match(/Message="([^"]+)"/)
      return {
        success: false,
        error: errorMatch?.[1] || 'فشل تسجيل النطاق',
      }
    } catch (error) {
      console.error('[Namecheap] Register domain error:', error)
      return {
        success: false,
        error: 'خطأ في الاتصال بخدمة النطاقات',
      }
    }
  }

  /**
   * Search domains by keyword - generates suggestions
   */
  async searchDomains(
    keyword: string,
    tlds: string[] = ['com', 'net', 'org', 'co', 'io', 'app', 'dev', 'me', 'site', 'online']
  ): Promise<{
    keyword: string
    suggestions: DomainAvailability[]
    alternatives: DomainAvailability[]
  }> {
    // Generate domain suggestions based on keyword
    const cleanKeyword = keyword
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 63)

    // Primary suggestions: keyword + TLD
    const primaryDomains = tlds.map(tld => `${cleanKeyword}.${tld}`)

    // Alternative suggestions: variations
    const variations = [
      `${cleanKeyword}app`,
      `get${cleanKeyword}`,
      `my${cleanKeyword}`,
      `${cleanKeyword}kw`,
      `${cleanKeyword}hub`,
    ]
    const alternativeDomains = variations
      .slice(0, 3)
      .flatMap(v => ['com', 'net', 'io'].map(tld => `${v}.${tld}`))

    // Check availability for all
    const allDomains = [...primaryDomains, ...alternativeDomains]
    const availability = await this.checkAvailability(allDomains)

    // Split results
    const suggestions = availability.slice(0, primaryDomains.length)
    const alternatives = availability.slice(primaryDomains.length)

    return {
      keyword: cleanKeyword,
      suggestions,
      alternatives,
    }
  }

  /**
   * Get domain info from Namecheap
   */
  async getDomainInfo(domain: string): Promise<{
    success: boolean
    domain?: string
    status?: string
    createdDate?: string
    expiredDate?: string
    isLocked?: boolean
    autoRenew?: boolean
    whoisGuard?: boolean
    nameservers?: string[]
    error?: string
    errorAr?: string
  }> {
    if (!this.config.apiKey) {
      return this.mockGetDomainInfo(domain)
    }

    try {
      const params = this.buildParams('namecheap.domains.getInfo', {
        DomainName: domain,
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      const text = await response.text()

      if (text.includes('Status="ERROR"')) {
        const errorMatch = text.match(/Message="([^"]+)"/)
        return {
          success: false,
          error: errorMatch?.[1] || 'Failed to get domain info',
          errorAr: 'فشل الحصول على معلومات النطاق',
        }
      }

      // Parse domain info from XML
      const statusMatch = text.match(/Status>([^<]+)</)
      const createdMatch = text.match(/CreatedDate>([^<]+)</)
      const expiredMatch = text.match(/ExpiredDate>([^<]+)</)
      const lockedMatch = text.match(/IsLocked>([^<]+)</)
      const autoRenewMatch = text.match(/AutoRenew>([^<]+)</)
      const whoisGuardMatch = text.match(/WhoisGuard>([^<]+)</)

      // Parse nameservers
      const nameservers: string[] = []
      const nsRegex = /Nameserver>([^<]+)</g
      let nsMatch
      while ((nsMatch = nsRegex.exec(text)) !== null) {
        nameservers.push(nsMatch[1])
      }

      return {
        success: true,
        domain,
        status: statusMatch?.[1] || 'unknown',
        createdDate: createdMatch?.[1],
        expiredDate: expiredMatch?.[1],
        isLocked: lockedMatch?.[1]?.toLowerCase() === 'true',
        autoRenew: autoRenewMatch?.[1]?.toLowerCase() === 'true',
        whoisGuard: whoisGuardMatch?.[1]?.toLowerCase() === 'enabled',
        nameservers: nameservers.length > 0 ? nameservers : ['dns1.vercel-dns.com', 'dns2.vercel-dns.com'],
      }
    } catch (error) {
      console.error('[Namecheap] Get domain info error:', error)
      return {
        success: false,
        error: 'Connection error',
        errorAr: 'خطأ في الاتصال بخدمة النطاقات',
      }
    }
  }

  /**
   * Get DNS records for a domain (host records)
   */
  async getDnsRecords(domain: string): Promise<{
    success: boolean
    records?: Array<{
      hostId: string
      name: string
      type: string
      address: string
      ttl: number
      mxPref?: number
    }>
    error?: string
    errorAr?: string
  }> {
    if (!this.config.apiKey) {
      return this.mockGetDnsRecords(domain)
    }

    try {
      const [sld, tld] = this.splitDomain(domain)

      const params = this.buildParams('namecheap.domains.dns.getHosts', {
        SLD: sld,
        TLD: tld,
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      const text = await response.text()

      if (text.includes('Status="ERROR"')) {
        return {
          success: false,
          error: 'Failed to get DNS records',
          errorAr: 'فشل الحصول على سجلات DNS',
        }
      }

      // Parse host records
      const records: Array<{
        hostId: string
        name: string
        type: string
        address: string
        ttl: number
        mxPref?: number
      }> = []

      const hostRegex = /host HostId="([^"]+)" Name="([^"]+)" Type="([^"]+)" Address="([^"]+)" MXPref="([^"]*)" TTL="([^"]+)"/g
      let match
      while ((match = hostRegex.exec(text)) !== null) {
        records.push({
          hostId: match[1],
          name: match[2],
          type: match[3],
          address: match[4],
          mxPref: match[5] ? parseInt(match[5]) : undefined,
          ttl: parseInt(match[6]),
        })
      }

      return { success: true, records }
    } catch (error) {
      console.error('[Namecheap] Get DNS records error:', error)
      return {
        success: false,
        error: 'Connection error',
        errorAr: 'خطأ في الاتصال',
      }
    }
  }

  /**
   * Set DNS host records for a domain
   */
  async setDnsRecords(
    domain: string,
    records: Array<{
      name: string
      type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV'
      address: string
      ttl?: number
      mxPref?: number
    }>
  ): Promise<{ success: boolean; error?: string; errorAr?: string }> {
    if (!this.config.apiKey) {
      return { success: false, error: 'API not configured', errorAr: 'API غير مهيأ' }
    }

    try {
      const [sld, tld] = this.splitDomain(domain)

      // Build record parameters
      const recordParams: Record<string, string> = {}
      records.forEach((record, index) => {
        const i = index + 1
        recordParams[`HostName${i}`] = record.name
        recordParams[`RecordType${i}`] = record.type
        recordParams[`Address${i}`] = record.address
        recordParams[`TTL${i}`] = (record.ttl || 3600).toString()
        if (record.type === 'MX' && record.mxPref !== undefined) {
          recordParams[`MXPref${i}`] = record.mxPref.toString()
        }
      })

      const params = this.buildParams('namecheap.domains.dns.setHosts', {
        SLD: sld,
        TLD: tld,
        ...recordParams,
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      const text = await response.text()

      if (text.includes('Status="OK"')) {
        return { success: true }
      }

      const errorMatch = text.match(/Message="([^"]+)"/)
      return {
        success: false,
        error: errorMatch?.[1] || 'Failed to set DNS records',
        errorAr: 'فشل تحديث سجلات DNS',
      }
    } catch (error) {
      console.error('[Namecheap] Set DNS records error:', error)
      return {
        success: false,
        error: 'Connection error',
        errorAr: 'خطأ في الاتصال',
      }
    }
  }

  /**
   * Set nameservers for a domain
   */
  async setNameservers(
    domain: string,
    nameservers: string[]
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.config.apiKey) {
      return { success: false, error: 'API not configured' }
    }

    try {
      const [sld, tld] = this.splitDomain(domain)

      const nsParams: Record<string, string> = {}
      nameservers.forEach((ns, i) => {
        nsParams[`Nameserver${i + 1}`] = ns
      })

      const params = this.buildParams('namecheap.domains.dns.setCustom', {
        SLD: sld,
        TLD: tld,
        ...nsParams,
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      const text = await response.text()

      return {
        success: text.includes('Status="OK"'),
        error: text.includes('Status="ERROR"') ? 'فشل تحديث خوادم DNS' : undefined,
      }
    } catch (error) {
      console.error('[Namecheap] Set nameservers error:', error)
      return { success: false, error: 'خطأ في الاتصال' }
    }
  }

  /**
   * Parse XML response to JSON
   */
  private parseXmlResponse<T>(xml: string): NamecheapApiResponse<T> {
    // Simple XML parsing for Namecheap responses
    // In production, use a proper XML parser like xml2js
    const statusMatch = xml.match(/Status="(\w+)"/)
    const status = statusMatch?.[1] as 'OK' | 'ERROR'

    // Extract domain check results
    const domainResults: any[] = []
    const domainRegex =
      /DomainCheckResult Domain="([^"]+)" Available="([^"]+)" IsPremiumName="([^"]+)"(?:\s+PremiumRegistrationPrice="([^"]+)")?/g
    let match
    while ((match = domainRegex.exec(xml)) !== null) {
      domainResults.push({
        Domain: match[1],
        Available: match[2],
        IsPremiumName: match[3],
        PremiumRegistrationPrice: match[4],
      })
    }

    return {
      ApiResponse: {
        Status: status,
        CommandResponse: {
          DomainCheckResult: domainResults,
        } as T,
      },
    }
  }

  /**
   * Split domain into SLD and TLD
   */
  private splitDomain(domain: string): [string, string] {
    const parts = domain.split('.')
    const tld = parts.pop() || ''
    const sld = parts.join('.')
    return [sld, tld]
  }

  /**
   * Mock availability check for development
   */
  private mockCheckAvailability(domains: string[]): DomainAvailability[] {
    return domains.map((domain) => {
      const [, tld] = this.splitDomain(domain)
      const mockPrice = this.mockGetPricing(tld)

      // Simulate availability (80% available for random domains)
      const available = !domain.includes('google') && !domain.includes('facebook') && Math.random() > 0.2

      return {
        domain,
        available,
        premium: tld === 'io' || tld === 'app',
        price: mockPrice || undefined,
      }
    })
  }

  /**
   * Mock pricing for development
   */
  private mockGetPricing(tld: string): DomainPrice | null {
    const prices: Record<string, number> = {
      com: 12.98,
      net: 14.98,
      org: 12.98,
      co: 11.98,
      io: 32.98,
      app: 15.98,
      dev: 15.98,
      me: 8.98,
      site: 3.98,
      online: 4.98,
      store: 5.98,
      shop: 11.98,
      kw: 49.0,
    }

    const price = prices[tld] || 12.98

    return {
      registration: price,
      renewal: price * 1.1, // Renewal slightly higher
      transfer: price,
      currency: 'USD',
    }
  }

  /**
   * Mock domain info for development
   */
  private mockGetDomainInfo(domain: string): {
    success: boolean
    domain: string
    status: string
    createdDate: string
    expiredDate: string
    isLocked: boolean
    autoRenew: boolean
    whoisGuard: boolean
    nameservers: string[]
  } {
    const now = new Date()
    const created = new Date(now)
    created.setMonth(created.getMonth() - 6)
    const expires = new Date(now)
    expires.setMonth(expires.getMonth() + 6)

    return {
      success: true,
      domain,
      status: 'active',
      createdDate: created.toISOString().split('T')[0],
      expiredDate: expires.toISOString().split('T')[0],
      isLocked: true,
      autoRenew: true,
      whoisGuard: true,
      nameservers: ['dns1.vercel-dns.com', 'dns2.vercel-dns.com'],
    }
  }

  /**
   * Mock DNS records for development
   */
  private mockGetDnsRecords(domain: string): {
    success: boolean
    records: Array<{
      hostId: string
      name: string
      type: string
      address: string
      ttl: number
      mxPref?: number
    }>
  } {
    return {
      success: true,
      records: [
        {
          hostId: '1',
          name: '@',
          type: 'A',
          address: '76.76.21.21',
          ttl: 1800,
        },
        {
          hostId: '2',
          name: 'www',
          type: 'CNAME',
          address: 'cname.vercel-dns.com',
          ttl: 1800,
        },
        {
          hostId: '3',
          name: '@',
          type: 'TXT',
          address: 'v=spf1 include:_spf.google.com ~all',
          ttl: 3600,
        },
      ],
    }
  }
}

// Domain registrant info
export interface DomainRegistrant {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string // 2-letter code
  phone: string // +965.12345678 format
  email: string
}

// Singleton instance
let namecheapClient: NamecheapClient | null = null

export function getNamecheapClient(): NamecheapClient {
  if (!namecheapClient) {
    namecheapClient = new NamecheapClient()
  }
  return namecheapClient
}

export function createNamecheapClient(config: Partial<NamecheapConfig>): NamecheapClient {
  return new NamecheapClient(config)
}
