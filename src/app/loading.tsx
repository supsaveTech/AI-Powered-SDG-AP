export default function Loading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div>
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-white shadow-sm p-6 flex flex-col h-32">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-slate-200 rounded w-3/4 mt-auto"></div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border p-6 h-80">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-6"></div>
          <div className="h-48 bg-slate-100 rounded w-full"></div>
        </div>
        <div className="bg-white rounded-xl border p-6 h-80">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-6"></div>
          <div className="h-48 bg-slate-100 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}
