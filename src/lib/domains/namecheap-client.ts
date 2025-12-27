/**
 * Namecheap API Client
 *
 * Domain search, availability check, and purchase via Namecheap API
 * Features:
 * - Domain search with TLD suggestions
 * - Real-time availability checking
 * - Automated domain registration
 * - DNS management
 */

interface NamecheapConfig {
  apiUser: string
  apiKey: string
  username: string
  clientIp: string
  sandbox: boolean
}

interface DomainAvailability {
  domain: string
  available: boolean
  price: number // USD
  priceKWD: number
  premium: boolean
}

interface DomainRegistrationResult {
  success: boolean
  domain: string
  orderId?: string
  transactionId?: string
  chargeAmount?: number
  error?: string
}

export class NamecheapClient {
  private config: NamecheapConfig
  private baseUrl: string

  constructor() {
    this.config = {
      apiUser: process.env.NAMECHEAP_API_USER!,
      apiKey: process.env.NAMECHEAP_API_KEY!,
      username: process.env.NAMECHEAP_USERNAME!,
      clientIp: process.env.NAMECHEAP_CLIENT_IP!,
      sandbox: process.env.NAMECHEAP_SANDBOX === 'true',
    }

    this.baseUrl = this.config.sandbox
      ? 'https://api.sandbox.namecheap.com/xml.response'
      : 'https://api.namecheap.com/xml.response'
  }

  /**
   * Search domains with availability
   */
  async searchDomains(keyword: string, tlds: string[] = ['com', 'net', 'org', 'io']): Promise<DomainAvailability[]> {
    const results: DomainAvailability[] = []

    for (const tld of tlds) {
      const domain = `${keyword}.${tld}`
      const available = await this.checkAvailability(domain)
      results.push(available)
    }

    return results
  }

  /**
   * Check if domain is available
   */
  async checkAvailability(domain: string): Promise<DomainAvailability> {
    try {
      const params = new URLSearchParams({
        ApiUser: this.config.apiUser,
        ApiKey: this.config.apiKey,
        UserName: this.config.username,
        ClientIp: this.config.clientIp,
        Command: 'namecheap.domains.check',
        DomainList: domain,
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      const text = await response.text()

      // Parse XML response
      const available = text.includes('Available="true"')
      const priceMatch = text.match(/Price="([0-9.]+)"/)
      const priceUSD = priceMatch ? parseFloat(priceMatch[1]) : 10.0

      // Convert to KWD (1 USD ≈ 0.308 KWD)
      const priceKWD = this.convertToKWD(priceUSD)

      return {
        domain,
        available,
        price: priceUSD,
        priceKWD,
        premium: priceUSD > 50,
      }
    } catch (error) {
      console.error('Availability check error:', error)
      return {
        domain,
        available: false,
        price: 0,
        priceKWD: 0,
        premium: false,
      }
    }
  }

  /**
   * Register domain
   */
  async registerDomain(
    domain: string,
    years: number,
    registrantInfo: RegistrantInfo
  ): Promise<DomainRegistrationResult> {
    try {
      const [sld, tld] = domain.split('.')

      const params = new URLSearchParams({
        ApiUser: this.config.apiUser,
        ApiKey: this.config.apiKey,
        UserName: this.config.username,
        ClientIp: this.config.clientIp,
        Command: 'namecheap.domains.create',
        DomainName: sld,
        TLD: tld,
        Years: years.toString(),

        // Registrant contact
        RegistrantFirstName: registrantInfo.firstName,
        RegistrantLastName: registrantInfo.lastName,
        RegistrantAddress1: registrantInfo.address,
        RegistrantCity: registrantInfo.city,
        RegistrantStateProvince: registrantInfo.state || 'NA',
        RegistrantPostalCode: registrantInfo.postalCode || '00000',
        RegistrantCountry: registrantInfo.country,
        RegistrantPhone: registrantInfo.phone,
        RegistrantEmailAddress: registrantInfo.email,

        // Same info for tech/admin/billing (simplified)
        TechFirstName: registrantInfo.firstName,
        TechLastName: registrantInfo.lastName,
        TechAddress1: registrantInfo.address,
        TechCity: registrantInfo.city,
        TechStateProvince: registrantInfo.state || 'NA',
        TechPostalCode: registrantInfo.postalCode || '00000',
        TechCountry: registrantInfo.country,
        TechPhone: registrantInfo.phone,
        TechEmailAddress: registrantInfo.email,

        AdminFirstName: registrantInfo.firstName,
        AdminLastName: registrantInfo.lastName,
        AdminAddress1: registrantInfo.address,
        AdminCity: registrantInfo.city,
        AdminStateProvince: registrantInfo.state || 'NA',
        AdminPostalCode: registrantInfo.postalCode || '00000',
        AdminCountry: registrantInfo.country,
        AdminPhone: registrantInfo.phone,
        AdminEmailAddress: registrantInfo.email,
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      const text = await response.text()

      // Parse response
      const success = text.includes('Registered="true"')
      const orderIdMatch = text.match(/OrderID="([0-9]+)"/)
      const transactionIdMatch = text.match(/TransactionID="([0-9]+)"/)

      return {
        success,
        domain,
        orderId: orderIdMatch?.[1],
        transactionId: transactionIdMatch?.[1],
      }
    } catch (error: any) {
      console.error('Domain registration error:', error)
      return {
        success: false,
        domain,
        error: error.message,
      }
    }
  }

  /**
   * Set DNS records for Vercel
   */
  async setDNSForVercel(domain: string): Promise<boolean> {
    try {
      const [sld, tld] = domain.split('.')

      const params = new URLSearchParams({
        ApiUser: this.config.apiUser,
        ApiKey: this.config.apiKey,
        UserName: this.config.username,
        ClientIp: this.config.clientIp,
        Command: 'namecheap.domains.dns.setHosts',
        SLD: sld,
        TLD: tld,

        // Vercel DNS records
        HostName1: '@',
        RecordType1: 'A',
        Address1: '76.76.21.21', // Vercel IP
        TTL1: '1800',

        HostName2: 'www',
        RecordType2: 'CNAME',
        Address2: 'cname.vercel-dns.com',
        TTL2: '1800',
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      const text = await response.text()

      return text.includes('IsSuccess="true"')
    } catch (error) {
      console.error('DNS setup error:', error)
      return false
    }
  }

  /**
   * Convert USD to KWD
   */
  private convertToKWD(usd: number): number {
    const USD_TO_KWD = 0.308
    return Math.round(usd * USD_TO_KWD * 1000) / 1000 // 3 decimals
  }
}

export interface RegistrantInfo {
  firstName: string
  lastName: string
  address: string
  city: string
  state?: string
  postalCode?: string
  country: string
  phone: string
  email: string
}

// Singleton
export const namecheapClient = new NamecheapClient()
