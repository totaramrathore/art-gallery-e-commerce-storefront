import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow text-ash">404</p>
      <h1 className="mt-4 max-w-2xl font-display text-[clamp(2.25rem,6vw,4rem)] leading-[1.02]">
        This wall has been re-hung
      </h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-ash">
        The page or work you were looking for is no longer here. It may have sold — which happens quickly when
        there is only one of something.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <Link href="/shop" className="btn-ink">
          See what is available
        </Link>
        <Link href="/collections" className="btn-outline">
          Browse collections
        </Link>
      </div>
    </div>
  );
}
