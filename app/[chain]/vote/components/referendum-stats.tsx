import { Card } from "@nextui-org/card";
import { UIReferendum } from "../types";
import { ReferendumStatsAyeNay } from "./referendum-stats-ayenay";

export function ReferendumStats({ referendum }: { referendum: UIReferendum }) {
  return (
    <Card
      radius="sm"
      className="p-4 mb-2 text-sm bg-gray-100 dark:bg-slate-800"
      shadow="sm"
    >
      <span className="mb-1">Referendum {referendum.index} Approval</span>
      <ReferendumStatsAyeNay
        ayes={referendum.tally?.ayes}
        nays={referendum?.tally?.nays}
        total={referendum?.tally?.total}
      />
    </Card>
  );
}
