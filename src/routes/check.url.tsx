import { createFileRoute } from "@tanstack/react-router";
import { Checker } from "@/components/guardian/checker";
import { Authed } from "@/components/guardian/frame";

export const Route = createFileRoute("/check/url")({
  component: () => (
    <Authed>
      <Checker kind="url" />
    </Authed>
  ),
});
