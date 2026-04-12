'use client'

import dynamic from 'next/dynamic'

/**
 * AIChatWidget Client Wrapper
 * 
 * This wrapper is necessary because `next/dynamic` with `ssr: false` 
 * is not allowed in Server Components (like app/layout.tsx).
 * By moving the dynamic import into this Client Component, 
 * we satisfy Next.js Turbo requirements.
 */
const AIChatWidget = dynamic(
  () => import('@/components/ai-chat-widget').then((mod) => mod.AIChatWidget),
  { ssr: false }
)

export default AIChatWidget
