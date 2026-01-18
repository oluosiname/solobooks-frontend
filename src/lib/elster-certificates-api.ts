import { BaseApiClient } from "@/lib/base-api";
import type { ElsterCertificate } from "@/types";

class ElsterCertificatesApi extends BaseApiClient {
  async uploadCertificate(
    certificateFile: File,
    password: string,
  ): Promise<ElsterCertificate> {
    const formData = new FormData();
    formData.append("certificate_file", certificateFile);
    formData.append("password", password);

    const response = await this.postFormData<{ data: ElsterCertificate }>(
      "/api/v1/elster_certificate",
      formData,
    );

    return response.data;
  }

  async deleteCertificate(): Promise<void> {
    await this.delete("/api/v1/elster_certificate");
  }

  async getCertificate(): Promise<ElsterCertificate | null> {
    try {
      const response = await this.get<{ data: ElsterCertificate }>(
        "/api/v1/elster_certificate"
      );
      return response.data;
    } catch (error: unknown) {
      // Return null if certificate doesn't exist (404)
      const apiError = error as { error?: { code?: string }; response?: { status?: number } };
      if (apiError?.error?.code === "not_found" || apiError?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

const elsterCertificatesApi = new ElsterCertificatesApi();

export async function uploadElsterCertificate(
  certificateFile: File,
  password: string,
): Promise<ElsterCertificate> {
  return elsterCertificatesApi.uploadCertificate(certificateFile, password);
}

export async function deleteElsterCertificate(): Promise<void> {
  return elsterCertificatesApi.deleteCertificate();
}

export async function getElsterCertificate(): Promise<ElsterCertificate | null> {
  return elsterCertificatesApi.getCertificate();
}