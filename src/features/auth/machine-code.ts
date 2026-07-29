import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { AuthApiError } from "./types";

let fingerprintPromise: ReturnType<typeof FingerprintJS.load> | undefined;

export async function getMachineCode(): Promise<string> {
  try {
    fingerprintPromise ??= FingerprintJS.load();
    const agent = await fingerprintPromise;
    const result = await agent.get();
    if (!result.visitorId) {
      throw new Error("FingerprintJS returned an empty visitorId");
    }
    return result.visitorId;
  } catch {
    throw new AuthApiError("Không thể tạo mã thiết bị. Vui lòng thử lại.", "MACHINE_CODE_ERROR");
  }
}
