export default function ShopLoading() {
  return (
    <div className="container-x pb-24 pt-14 md:pt-20">
      <div className="h-4 w-24 animate-pulse bg-ink/10" />
      <div className="mt-6 h-14 w-2/3 animate-pulse bg-ink/10" />
      <div className="mt-8 h-8 w-72 animate-pulse bg-ink/10" />

      <div className="mt-12 grid gap-12 lg:grid-cols-[15rem_1fr] lg:gap-14">
        <div className="hidden space-y-6 lg:block">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-3 w-20 animate-pulse bg-ink/10" />
              <div className="h-3 w-32 animate-pulse bg-ink/8" />
              <div className="h-3 w-24 animate-pulse bg-ink/8" />
            </div>
          ))}
        </div>

        <div>
          <div className="h-4 w-40 animate-pulse bg-ink/10" />
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index}>
                <div className="aspect-[4/5] w-full animate-pulse bg-bone-3" />
                <div className="mt-4 h-4 w-2/3 animate-pulse bg-ink/10" />
                <div className="mt-2 h-3 w-1/3 animate-pulse bg-ink/8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
