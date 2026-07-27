import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiUrl } from "../../../../config/api";

export const FigmaImportBridge = () => {
  const { importId } = useParams();

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [payload, setPayload] =
    useState<any>(null);

    const params =
  new URLSearchParams(window.location.search);

const siteId =
  params.get("siteId") ||
  localStorage.getItem("selectedSiteId");

if (!siteId) {
  throw new Error("Missing siteId for Figma import");
}

  useEffect(() => {
    const loadImport = async () => {
      try {
        const token =
          localStorage.getItem("accessToken");

        const response = await fetch(
          apiUrl(`/sites/${siteId}/pages/figma/import/raw/${importId}`),
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load Figma import"
          );
        }

        setPayload(result.data.payload);
      } catch (err: any) {
        setError(
          err?.message || "Failed to load import"
        );
      } finally {
        setLoading(false);
      }
    };

    if (importId) {
      loadImport();
    }
  }, [importId]);

  if (loading) {
    return <div style={{ padding: 40 }}>Loading Figma import...</div>;
  }

  if (error) {
    return <div style={{ padding: 40 }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Figma Import</h2>
      <p>Import ID: {importId}</p>
      <p>Frame: {payload?.name}</p>
      <p>Children: {payload?.children?.length || 0}</p>

      <pre style={{ maxHeight: 300, overflow: "auto" }}>
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  );
};