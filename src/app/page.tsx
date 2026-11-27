import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RootEntryPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }
  redirect("/career-reviews");
}
