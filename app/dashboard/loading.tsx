import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center py-10">
      <div className="w-full max-w-4xl space-y-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
