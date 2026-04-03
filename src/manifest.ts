import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

const manifest: PaperclipPluginManifestV1 = {
  id: "uos.skills-catalog",
  apiVersion: 1,
  version: "0.1.0",
  displayName: "Skills Catalog",
  description: "Skills catalog package for vendored skill content and generated catalogs.",
  author: "turmo.dev",
  categories: ["automation"],
  capabilities: [
    "events.subscribe",
    "plugin.state.read",
    "plugin.state.write"
  ],
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui"
  },
  ui: {
    slots: [
      {
        type: "dashboardWidget",
        id: "health-widget",
        displayName: "Skills Catalog Health",
        exportName: "DashboardWidget"
      }
    ]
  }
};

export default manifest;
