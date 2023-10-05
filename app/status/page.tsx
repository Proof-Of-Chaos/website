import { ApiStatus } from "@/components/api-status";
import { title } from "@/components/primitives";

export const revalidate = 3600;

export default function StatusPage() {
  return (
    <div>
      <h1 className={title({ siteTitle: true })}>Status</h1>
      <ApiStatus />
      <p className="text-center text-4xl">🔥</p>
    </div>
  );
}
