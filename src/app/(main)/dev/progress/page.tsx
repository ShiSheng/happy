import { notFound } from "next/navigation";
import { ProgressClient } from "@/components/dev/ProgressClient";

export default function DevProgressPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <ProgressClient />;
}
