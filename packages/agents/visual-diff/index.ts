/**
 * VisualDiffAgent - Self-hosted visual regression testing agent
 * Uses Playwright for screenshots and pixelmatch for pixel-perfect comparisons
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

interface AgentContext {
  args: string[];
  parsed: {
    sub: string;
    urls?: string[];
  };
  env: Record<string, string>;
  setEnv: (env: Record<string, string>) => void;
  reply: (message: string, options?: { exit_code?: number }) => string;
}

export default async function visualDiffAgent(ctx: AgentContext) {
  const mode = ctx.parsed.sub; // 'baseline' or 'test'
  const urls = ctx.parsed.urls as string[] || ["/", "/trends", "/products", "/behaviour", "/consumers"];
  const threshold = 0.1; // 10% diff allowed

  console.log(`🎭 VisualDiffAgent starting in ${mode} mode`);
  console.log(`📸 Testing URLs: ${urls.join(", ")}`);

  // 1. Install dependencies if needed
  try {
    console.log("📦 Installing dependencies...");
    execSync("npm install --no-save playwright pixelmatch pngjs", { stdio: "inherit" });
    execSync("npx playwright install chromium", { stdio: "inherit" });
  } catch (error) {
    console.error("❌ Failed to install dependencies:", error);
    return ctx.reply("❌ Failed to install dependencies", { exit_code: 1 });
  }

  // 2. Write the Playwright + pixelmatch script
  const script = `
    const { chromium } = require('playwright');
    const { PNG } = require('pngjs');
    const pixelmatch = require('pixelmatch');
    const fs = require('fs');
    const path = require('path');

    (async () => {
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      
      // Set viewport for consistent screenshots
      await page.setViewportSize({ width: 1280, height: 720 });
      
      const urls = ${JSON.stringify(urls)};
      let report = "# 🎭 Visual Diff Report\\n\\n";
      let failed = false;
      
      // Ensure directories exist
      if (!fs.existsSync('visual-baseline')) {
        fs.mkdirSync('visual-baseline', { recursive: true });
      }
      if (!fs.existsSync('visual-current')) {
        fs.mkdirSync('visual-current', { recursive: true });
      }
      if (!fs.existsSync('visual-diffs')) {
        fs.mkdirSync('visual-diffs', { recursive: true });
      }

      for (const route of urls) {
        const baseUrl = process.env.PREVIEW_URL || process.env.VERCEL_URL || 'http://localhost:3000';
        const url = baseUrl + route;
        const safeName = route.replace(/\\//g, '_') || 'root';
        const baselinePath = path.join('visual-baseline', \`\${safeName}.png\`);
        const currentPath = path.join('visual-current', \`\${safeName}.png\`);
        const diffPath = path.join('visual-diffs', \`\${safeName}_diff.png\`);

        console.log(\`📸 Capturing: \${url}\`);
        
        try {
          await page.goto(url, { 
            waitUntil: 'networkidle',
            timeout: 30000 
          });
          
          // Wait for any animations to complete
          await page.waitForTimeout(2000);
          
          await page.screenshot({ 
            path: currentPath, 
            fullPage: true,
            animations: 'disabled'
          });

          if (process.env.MODE === 'baseline') {
            // Copy current to baseline
            fs.copyFileSync(currentPath, baselinePath);
            report += \`- ✅ **\${route}**: Baseline captured\\n\`;
            console.log(\`✅ Baseline captured for \${route}\`);
          } else {
            // Compare with baseline
            if (!fs.existsSync(baselinePath)) {
              report += \`- ❌ **\${route}**: Missing baseline (run baseline mode first)\\n\`;
              failed = true;
              console.log(\`❌ Missing baseline for \${route}\`);
              continue;
            }

            const img1 = PNG.sync.read(fs.readFileSync(baselinePath));
            const img2 = PNG.sync.read(fs.readFileSync(currentPath));
            
            // Ensure images are same size
            if (img1.width !== img2.width || img1.height !== img2.height) {
              report += \`- ❌ **\${route}**: Image size mismatch (baseline: \${img1.width}x\${img1.height}, current: \${img2.width}x\${img2.height})\\n\`;
              failed = true;
              continue;
            }

            const { width, height } = img1;
            const diff = new PNG({ width, height });
            
            const mismatches = pixelmatch(
              img1.data, 
              img2.data, 
              diff.data, 
              width, 
              height, 
              { 
                threshold: 0.1,
                includeAA: false,
                diffColor: [255, 0, 0]
              }
            );
            
            fs.writeFileSync(diffPath, PNG.sync.write(diff));

            const pct = (mismatches / (width * height)) * 100;
            const thresholdPct = ${threshold * 100};
            
            if (pct > thresholdPct) {
              report += \`- ❌ **\${route}**: \${pct.toFixed(2)}% diff (> \${thresholdPct}%) — [View diff](\${diffPath})\\n\`;
              failed = true;
              console.log(\`❌ \${route}: \${pct.toFixed(2)}% diff (exceeds threshold)\`);
            } else {
              report += \`- ✅ **\${route}**: \${pct.toFixed(2)}% diff (within threshold)\\n\`;
              console.log(\`✅ \${route}: \${pct.toFixed(2)}% diff (acceptable)\`);
            }
          }
        } catch (error) {
          report += \`- ❌ **\${route}**: Error capturing screenshot - \${error.message}\\n\`;
          failed = true;
          console.error(\`❌ Error capturing \${route}:\`, error.message);
        }
      }

      report += \`\\n## Summary\\n\\n\`;
      if (process.env.MODE === 'baseline') {
        report += \`📸 Captured \${urls.length} baseline screenshots\\n\`;
        report += \`\\n**Next steps:** Run in test mode to compare against these baselines\\n\`;
      } else {
        const passedCount = urls.length - (report.match(/❌/g) || []).length;
        report += \`✅ Passed: \${passedCount}/\${urls.length} pages\\n\`;
        if (failed) {
          report += \`❌ Failed: Visual regressions detected\\n\`;
          report += \`\\n**Action required:** Review diff images and update baselines if changes are intentional\\n\`;
        } else {
          report += \`🎉 All visual tests passed!\\n\`;
        }
      }

      console.log(report);
      await browser.close();
      process.exit(failed ? 1 : 0);
    })();
  `;

  // 3. Write and execute the script
  fs.writeFileSync("visual-diff-runner.js", script);

  const modeEnv = mode === "baseline" ? "baseline" : "test";
  const previewUrl = process.env.PREVIEW_URL || process.env.VERCEL_URL || ctx.env.PREVIEW_URL || "http://localhost:3000";
  
  ctx.setEnv({ 
    MODE: modeEnv, 
    PREVIEW_URL: previewUrl 
  });

  try {
    execSync(`node visual-diff-runner.js`, { 
      stdio: "inherit",
      env: { 
        ...process.env, 
        MODE: modeEnv, 
        PREVIEW_URL: previewUrl 
      }
    });
    
    // Clean up
    fs.unlinkSync("visual-diff-runner.js");
    
    if (mode === "baseline") {
      return ctx.reply("### 🎭 VisualDiffAgent Report\n\n✅ Baselines captured successfully. Ready for visual regression testing!");
    } else {
      return ctx.reply("### 🎭 VisualDiffAgent Report\n\n✅ No visual regressions detected. All pages look good!");
    }
  } catch (error) {
    // Clean up
    if (fs.existsSync("visual-diff-runner.js")) {
      fs.unlinkSync("visual-diff-runner.js");
    }
    
    return ctx.reply("### 🎭 VisualDiffAgent Report\n\n❌ Visual regressions detected—see diff images for details.", { exit_code: 1 });
  }
}
