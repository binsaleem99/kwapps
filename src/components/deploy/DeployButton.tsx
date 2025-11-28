'use client'

/**
 * Deploy Button Component
 *
 * Triggers deployment modal for publishing user-generated websites
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Rocket } from 'lucide-react'
import { DeploymentModal } from './DeploymentModal'

interface DeployButtonProps {
  projectId: string
  hasCode: boolean
  disabled?: boolean
}

export function DeployButton({ projectId, hasCode, disabled }: DeployButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        disabled={!hasCode || disabled}
        className="font-['Cairo']"
        variant="default"
      >
        <Rocket className="w-4 h-4 ml-2" />
        نشر التطبيق
      </Button>

      {showModal && (
        <DeploymentModal
          projectId={projectId}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            // Could trigger a refresh or show success message
          }}
        />
      )}
    </>
  )
}
