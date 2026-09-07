import fs from "node:fs";
import path from "node:path";

const maintenanceFilePath = path.resolve(process.cwd(), "maintenance.json");

export interface MaintenanceStatus {
  enabled: boolean;
  message: string;
}

export function getMaintenanceStatus(): MaintenanceStatus {
  try {
    if (fs.existsSync(maintenanceFilePath)) {
      const content = fs.readFileSync(maintenanceFilePath, "utf-8");
      const parsed = JSON.parse(content);
      return {
        enabled: !!parsed.enabled,
        message: parsed.message || "النظام تحت الصيانة الدورية حالياً، سنعود للعمل قريباً."
      };
    }
  } catch (e) {
    console.error("Error reading maintenance config:", e);
  }
  return { enabled: false, message: "النظام تحت الصيانة الدورية حالياً، سنعود للعمل قريباً." };
}

export function setMaintenanceStatus(enabled: boolean, message: string): boolean {
  try {
    const config = { enabled, message };
    fs.writeFileSync(maintenanceFilePath, JSON.stringify(config, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Error writing maintenance config:", e);
    return false;
  }
}
