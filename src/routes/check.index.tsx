import { createFileRoute } from "@tanstack/react-router";
import { Authed } from "@/components/guardian/frame";
import { SmartCheck } from "@/components/guardian/checker";

export const Route = createFileRoute("/check/")({ component: CheckHubRoute });

function CheckHubRoute() {
  return (
    <Authed>
      <SmartCheck />
    </Authed>
  );
}
