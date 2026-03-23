import { Skeleton } from '@/app/components/ui/skeleton'

interface CardGridSkeletonProps {
  cards?: number
}

export function CardGridSkeleton({ cards = 4 }: CardGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
          <Skeleton className="mb-3 h-4 w-24" />
          <Skeleton className="mb-1 h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  )
}
