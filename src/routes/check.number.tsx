import { createFileRoute } from "@tanstack/react-router";
import { Checker } from "@/components/guardian/checker";
import { Authed } from "@/components/guardian/frame";

export const Route = createFileRoute("/check/number")({
  component: () => (
    <Authed>
      <Checker kind="number" />
    </Authed>
  ),
});
