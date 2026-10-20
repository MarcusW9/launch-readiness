import { ActivityDetailView } from "@/components/launch/activity-detail-view";

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ id: string; activity: string }>;
}) {
  const { id, activity } = await params;
  return <ActivityDetailView productId={id} activityKey={activity} />;
}
