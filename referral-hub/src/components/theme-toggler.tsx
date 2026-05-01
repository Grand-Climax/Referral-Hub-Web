'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <ToggleGroup
      type='single'
      value={theme || 'light'}
      onValueChange={(value) => {
        if (value) setTheme(value)
      }}
      className='rounded-lg border border-input bg-background shadow-xs'
    >
      <ToggleGroupItem
        value='light'
        aria-label='Switch to light mode'
        className='rounded-l-md'
      >
        <Sun className='h-4 w-4' />
      </ToggleGroupItem>
      <ToggleGroupItem
        value='dark'
        aria-label='Switch to dark mode'
        className='rounded-r-md'
      >
        <Moon className='h-4 w-4' />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
