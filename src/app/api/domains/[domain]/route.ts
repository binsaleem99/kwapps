/**
 * Domain Management API
 *
 * GET /api/domains/[domain]
 * Get domain status, expiry, DNS records
 *
 * PUT /api/domains/[domain]
 * Update DNS records
 *
 * DELETE /api/domains/[domain]
 * Cancel domain (mark as cancelled, does not delete from Namecheap)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getNamecheapClient } from '@/lib/namecheap/client'
import { DOMAIN_STATUS_AR } from '@/lib/namecheap/types'

interface RouteParams {
  params: Promise<{ domain: string }>
}

/**
 * GET - Get domain info and DNS records
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { domain } = await params

    if (!domain) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: 'Domain is required',
            messageAr: 'النطاق مطلوب',
          },
        },
        { status: 400 }
      )
    }

    // Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            messageAr: 'يرجى تسجيل الدخول',
          },
        },
        { status: 401 }
      )
    }

    // Get domain purchase from database
    const { data: purchase, error: purchaseError } = await supabase
      .from('domain_purchases')
      .select('*')
      .eq('domain', domain)
      .eq('user_id', user.id)
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json(
        {
          error: {
            code: 'DOMAIN_NOT_FOUND',
            message: 'Domain not found or access denied',
            messageAr: 'النطاق غير موجود أو لا يمكن الوصول إليه',
          },
        },
        { status: 404 }
      )
    }

    // Get domain info from Namecheap
    const client = getNamecheapClient()
    const domainInfo = await client.getDomainInfo(domain)

    // Get DNS records from database
    const { data: dnsRecords } = await supabase
      .from('domain_dns_records')
      .select('*')
      .eq('domain_purchase_id', purchase.id)
      .order('created_at', { ascending: true })

    // Get DNS records from Namecheap if available
    let namecheapDns = null
    if (domainInfo.success) {
      const dnsResult = await client.getDnsRecords(domain)
      if (dnsResult.success) {
        namecheapDns = dnsResult.records
      }
    }

    // Calculate days until expiry
    const expiresAt = purchase.expires_at ? new Date(purchase.expires_at) : null
    const daysUntilExpiry = expiresAt
      ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    return NextResponse.json({
      success: true,
      domain: {
        name: purchase.domain,
        tld: purchase.tld,
        status: purchase.status,
        statusAr: DOMAIN_STATUS_AR[purchase.status as keyof typeof DOMAIN_STATUS_AR] || purchase.status,
        registeredAt: purchase.registered_at,
        expiresAt: purchase.expires_at,
        daysUntilExpiry,
        autoRenew: purchase.auto_renew,
        sslEnabled: purchase.ssl_enabled,
        whoisPrivacy: purchase.whois_privacy,
        nameservers: purchase.nameservers,
        isFree: purchase.is_free,
        purchasePrice: purchase.purchase_price_kwd,
        projectId: purchase.project_id,
      },
      namecheap: domainInfo.success ? {
        status: domainInfo.status,
        isLocked: domainInfo.isLocked,
        autoRenew: domainInfo.autoRenew,
        whoisGuard: domainInfo.whoisGuard,
        nameservers: domainInfo.nameservers,
      } : null,
      dns: {
        local: dnsRecords || [],
        namecheap: namecheapDns,
      },
    })
  } catch (error) {
    console.error('[API] Get domain error:', error)
    return NextResponse.json(
      {
        error: {
          code: 'GET_DOMAIN_FAILED',
          message: 'Failed to get domain info',
          messageAr: 'فشل الحصول على معلومات النطاق',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update DNS records
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { domain } = await params
    const body = await request.json()
    const { records, nameservers, autoRenew } = body

    if (!domain) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: 'Domain is required',
            messageAr: 'النطاق مطلوب',
          },
        },
        { status: 400 }
      )
    }

    // Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            messageAr: 'يرجى تسجيل الدخول',
          },
        },
        { status: 401 }
      )
    }

    // Verify domain ownership
    const { data: purchase, error: purchaseError } = await supabase
      .from('domain_purchases')
      .select('*')
      .eq('domain', domain)
      .eq('user_id', user.id)
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json(
        {
          error: {
            code: 'DOMAIN_NOT_FOUND',
            message: 'Domain not found or access denied',
            messageAr: 'النطاق غير موجود أو لا يمكن الوصول إليه',
          },
        },
        { status: 404 }
      )
    }

    const client = getNamecheapClient()
    const results: {
      records?: { success: boolean; error?: string }
      nameservers?: { success: boolean; error?: string }
      autoRenew?: { success: boolean }
    } = {}

    // Update DNS records if provided
    if (records && Array.isArray(records)) {
      // Validate records
      const validRecordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV']
      for (const record of records) {
        if (!record.name || !record.type || !record.address) {
          return NextResponse.json(
            {
              error: {
                code: 'INVALID_RECORD',
                message: 'Each record must have name, type, and address',
                messageAr: 'كل سجل يجب أن يحتوي على الاسم والنوع والعنوان',
              },
            },
            { status: 400 }
          )
        }
        if (!validRecordTypes.includes(record.type)) {
          return NextResponse.json(
            {
              error: {
                code: 'INVALID_RECORD_TYPE',
                message: `Invalid record type: ${record.type}`,
                messageAr: `نوع سجل غير صالح: ${record.type}`,
              },
            },
            { status: 400 }
          )
        }
      }

      // Update DNS in Namecheap
      const dnsResult = await client.setDnsRecords(domain, records)
      results.records = dnsResult

      if (dnsResult.success) {
        // Sync to local database
        // First, delete existing records
        await supabase
          .from('domain_dns_records')
          .delete()
          .eq('domain_purchase_id', purchase.id)

        // Insert new records
        const dnsInserts = records.map((record: any) => ({
          domain_purchase_id: purchase.id,
          record_type: record.type,
          host: record.name,
          value: record.address,
          ttl: record.ttl || 3600,
          priority: record.mxPref,
          synced: true,
          synced_at: new Date().toISOString(),
        }))

        await supabase.from('domain_dns_records').insert(dnsInserts)
      }
    }

    // Update nameservers if provided
    if (nameservers && Array.isArray(nameservers) && nameservers.length >= 2) {
      const nsResult = await client.setNameservers(domain, nameservers)
      results.nameservers = nsResult

      if (nsResult.success) {
        // Update local database
        await supabase
          .from('domain_purchases')
          .update({ nameservers, updated_at: new Date().toISOString() })
          .eq('id', purchase.id)
      }
    }

    // Update auto-renew setting if provided
    if (typeof autoRenew === 'boolean') {
      await supabase
        .from('domain_purchases')
        .update({ auto_renew: autoRenew, updated_at: new Date().toISOString() })
        .eq('id', purchase.id)

      results.autoRenew = { success: true }
    }

    // Check if any operation failed
    const hasErrors =
      (results.records && !results.records.success) ||
      (results.nameservers && !results.nameservers.success)

    return NextResponse.json({
      success: !hasErrors,
      results,
      message: hasErrors
        ? 'بعض التحديثات فشلت'
        : 'تم تحديث إعدادات النطاق بنجاح',
    })
  } catch (error) {
    console.error('[API] Update domain error:', error)
    return NextResponse.json(
      {
        error: {
          code: 'UPDATE_FAILED',
          message: 'Failed to update domain',
          messageAr: 'فشل تحديث النطاق',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Cancel domain (soft delete)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { domain } = await params

    if (!domain) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: 'Domain is required',
            messageAr: 'النطاق مطلوب',
          },
        },
        { status: 400 }
      )
    }

    // Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            messageAr: 'يرجى تسجيل الدخول',
          },
        },
        { status: 401 }
      )
    }

    // Verify domain ownership
    const { data: purchase, error: purchaseError } = await supabase
      .from('domain_purchases')
      .select('id, status')
      .eq('domain', domain)
      .eq('user_id', user.id)
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json(
        {
          error: {
            code: 'DOMAIN_NOT_FOUND',
            message: 'Domain not found or access denied',
            messageAr: 'النطاق غير موجود أو لا يمكن الوصول إليه',
          },
        },
        { status: 404 }
      )
    }

    if (purchase.status === 'cancelled') {
      return NextResponse.json(
        {
          error: {
            code: 'ALREADY_CANCELLED',
            message: 'Domain is already cancelled',
            messageAr: 'النطاق ملغى بالفعل',
          },
        },
        { status: 400 }
      )
    }

    // Soft delete - mark as cancelled
    const { error: updateError } = await supabase
      .from('domain_purchases')
      .update({
        status: 'cancelled',
        auto_renew: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', purchase.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: 'تم إلغاء النطاق بنجاح. لن يتم تجديده تلقائياً.',
      domain,
      status: 'cancelled',
    })
  } catch (error) {
    console.error('[API] Delete domain error:', error)
    return NextResponse.json(
      {
        error: {
          code: 'DELETE_FAILED',
          message: 'Failed to cancel domain',
          messageAr: 'فشل إلغاء النطاق',
        },
      },
      { status: 500 }
    )
  }
}
