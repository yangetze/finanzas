import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-border mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2 text-sm font-ui font-medium border-b-2 -mb-px transition-colors',
            activeTab === tab.id
              ? 'border-gold text-ink'
              : 'border-transparent text-ink-muted hover:text-ink',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
