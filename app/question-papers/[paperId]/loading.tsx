import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PaperDetailLoading() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <Skeleton className="size-9 shrink-0" />
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-7 w-48 sm:h-8 sm:w-64" />
          <Skeleton className="h-4 w-36 sm:w-48" />
        </div>
      </div>
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}
