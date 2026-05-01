import { listDailyLogs, readDailyLog } from "@/lib/fs-adapter";
import LogsClient from "./LogsClient";

export const metadata = { title: "Daily Log — Clawspace" };
export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const dates = await listDailyLogs();
  const latest = dates[0] ? await readDailyLog(dates[0]) : null;
  return (
    <LogsClient
      dates={dates}
      initialDate={latest?.date ?? null}
      initialBody={latest?.body ?? null}
    />
  );
}
