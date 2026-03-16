export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 animate-pulse">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-8 bg-muted rounded-lg w-1/3" />
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-xl mt-6" />
      </div>
    </div>
  );
}
