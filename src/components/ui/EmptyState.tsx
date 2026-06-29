import { type LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-gray-100 rounded-full p-4 mb-3">
        <Icon size={28} className="text-gray-400" />
      </div>
      <p className="font-medium text-gray-700">{title}</p>
      <p className="text-sm text-gray-500 mt-1 mb-4">{description}</p>
      {action && (
        <button onClick={action.onClick} className="btn-primary text-sm">
          {action.label}
        </button>
      )}
    </div>
  )
}
