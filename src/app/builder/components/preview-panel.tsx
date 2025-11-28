'use client'

import { PreviewIframe, PreviewEmpty, PreviewSkeleton } from '@/components/preview-iframe'

interface PreviewPanelProps {
  code?: string
  isGenerating: boolean
}

export function PreviewPanel({ code, isGenerating }: PreviewPanelProps) {
  if (isGenerating) {
    return <PreviewSkeleton />
  }

  if (!code) {
    return <PreviewEmpty />
  }

  return <PreviewIframe code={code} />
}
