import { readLatestDigest } from "@/lib/storage";
import { HomeClient } from "@/components/site/HomeClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const digest = await readLatestDigest("all");
  return (
    <HomeClient digest={digest} />
  );
}
