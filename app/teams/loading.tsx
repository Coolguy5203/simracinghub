export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-14 w-64" />
      <div className="skeleton h-28" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-32" />
        ))}
      </div>
    </div>
  )
}
