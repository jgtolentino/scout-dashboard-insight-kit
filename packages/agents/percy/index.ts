/**
 * PercyAgent - Visual regression testing agent
 * Uses the Percy CLI to capture and compare snapshots of web pages.
 */
import { execSync } from "child_process";

interface AgentContext {
  args: string[];
  reply: (message: string) => string;
}

export default async function percyAgent(ctx: AgentContext) {
  const url = ctx.args[0] || process.env.PERCY_SNAPSHOT_URL;
  if (!url) throw new Error("PercyAgent requires a URL to snapshot");
  
  // Run Percy snapshot
  execSync(`npx percy snapshot --url=${url} --project=scout-analytics-mvp`, { stdio: "inherit" });
  
  // Return the Percy build URL if available from env
  const reportUrl = process.env.PERCY_BUILD_URL || "https://percy.io/";
  return ctx.reply(`✅ Percy snapshot complete. Report: ${reportUrl}`);
}
