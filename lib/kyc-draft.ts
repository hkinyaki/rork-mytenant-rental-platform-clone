import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  KycDraft,
  KycSubmission,
} from "@/types";

const KYC_DRAFT_KEY = "kycDraft";

export const createEmptyKycDraft = (): KycDraft => ({
  personalDetails: null,
  idDocument: null,
  selfie: null,
  updatedAt: "",
});

export const loadKycDraft = async (): Promise<KycDraft> => {
  try {
    const raw = await AsyncStorage.getItem(KYC_DRAFT_KEY);
    if (!raw) return createEmptyKycDraft();
    const parsed = JSON.parse(raw) as Partial<KycDraft>;
    return {
      personalDetails: parsed.personalDetails ?? null,
      idDocument: parsed.idDocument ?? null,
      selfie: parsed.selfie ?? null,
      updatedAt: parsed.updatedAt ?? "",
    };
  } catch (error) {
    console.error("loadKycDraft error:", error);
    return createEmptyKycDraft();
  }
};

export const saveKycDraft = async (draft: KycDraft): Promise<void> => {
  try {
    const withTimestamp: KycDraft = { ...draft, updatedAt: new Date().toISOString() };
    await AsyncStorage.setItem(KYC_DRAFT_KEY, JSON.stringify(withTimestamp));
  } catch (error) {
    console.error("saveKycDraft error:", error);
  }
};

export const clearKycDraft = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(KYC_DRAFT_KEY);
  } catch (error) {
    console.error("clearKycDraft error:", error);
  }
};

/**
 * Finalize the draft: verify all 3 steps are present, produce a KycSubmission
 * and clear the draft. In Phase 2 nothing is uploaded yet — the submission is
 * validated locally and KYC status flips to verified via AuthContext.
 */
export const finalizeKycSubmission = async (
  draft: KycDraft,
  completeKyc: () => Promise<void>
): Promise<KycSubmission> => {
  if (!draft.personalDetails) throw new Error("Personal details are missing");
  if (!draft.idDocument) throw new Error("ID document is missing");
  if (!draft.selfie) throw new Error("Selfie is missing");

  const submission: KycSubmission = {
    personalDetails: draft.personalDetails,
    idDocument: draft.idDocument,
    selfie: draft.selfie,
    submittedAt: new Date().toISOString(),
  };

  // TODO(Phase 3+): upload idDocument/selfie images to storage and submit via
  // tRPC instead of flipping KYC status locally.
  await completeKyc();
  await clearKycDraft();

  return submission;
};
