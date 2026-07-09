export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="skeleton h-36 rounded-xl" />
      <div className="grid lg:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="skeleton h-6 w-32" />
            <div className="skeleton h-20" />
            <div className="skeleton h-20" />
            <div className="skeleton h-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
