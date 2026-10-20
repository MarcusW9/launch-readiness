import type { Metadata } from "next";
import { ActionRequiredView } from "@/components/launch/action-required-view";

export const metadata: Metadata = { title: "Action Required | Launch Readiness (prototype)" };

export default function ActionRequiredPage() {
  return <ActionRequiredView />;
}
