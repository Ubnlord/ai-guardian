import { createFileRoute } from "@tanstack/react-router";
import { Checker } from "@/components/guardian/checker";
import { Authed } from "@/components/guardian/frame";

export const Route = createFileRoute("/check/image")({
  component: () => (
    <Authed>
      <Checker kind="image" />
    </Authed>
  ),
});
