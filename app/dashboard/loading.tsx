import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="container pt-24 pb-12 sm:pt-40 sm:pb-20 animate-slide-up grid-bg min-h-screen">
      <div className="w-full max-w-4xl space-y-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
