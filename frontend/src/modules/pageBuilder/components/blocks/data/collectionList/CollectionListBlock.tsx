import React from "react";

import {
  Box,
  CircularProgress,
  Typography
} from "@mui/material";

import {
  useParams
} from "react-router-dom";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

import {
  useGetPublicCmsEntriesQuery
} from "../../../../../../redux/services/cmsPublic.api";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

const readEntryValue = (
  entry: any,
  key?: string
) => {
  if (!entry || !key) {
    return "";
  }

  const value =
    entry.data?.[key] ??
    entry[key] ??
    "";

  if (
    value &&
    typeof value === "object"
  ) {
    return (
      value.url ||
      value.src ||
      value.secure_url ||
      value.path ||
      ""
    );
  }

  return value;
};

const getFallbackTitle = (
  entry: any
) =>
  readEntryValue(entry, "title") ||
  readEntryValue(entry, "name") ||
  entry?.slug ||
  `Entry ${entry?.id || ""}`;

export const CollectionListBlock = ({
  block,
  data,
  device = "desktop"
}: any) => {
  const source =
    data ||
    block?.data ||
    {};

  const props =
    source.props || {};

  const {
    siteId
  } = useParams();

  const collectionSlug =
    String(
      props.collectionSlug ||
      props.collectionId ||
      ""
    ).trim();

  const limit =
    Math.max(
      1,
      Number(props.limit || 6)
    );

  const {
    data: entries = [],
    isLoading,
    isError
  } = useGetPublicCmsEntriesQuery(
    {
      siteId:
        siteId || "",
      slug:
        collectionSlug
    },
    {
      skip:
        !siteId ||
        !collectionSlug
    }
  );

  const resolved =
    useResolvedStyle(
      source.style || {},
      device as Device
    ) as React.CSSProperties;

  const visibleEntries =
    entries.slice(
      0,
      limit
    );

  const gridStyle:
    React.CSSProperties = {
      display: "grid",
      gridTemplateColumns:
        resolved.gridTemplateColumns ||
        (
          device === "mobile"
            ? "1fr"
            : "repeat(auto-fit, minmax(240px, 1fr))"
        ),
      gap:
        resolved.gap || "20px",
      width: "100%",
      boxSizing: "border-box"
    };

  const rootStyle:
    React.CSSProperties = {
      ...resolved,
      width:
        resolved.width || "100%",
      boxSizing:
        resolved.boxSizing || "border-box",
      padding:
        resolved.padding || "24px"
    };

  if (!collectionSlug) {
    return (
      <Box sx={rootStyle as any}>
        <Typography color="text.secondary">
          Select a CMS collection.
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={rootStyle as any}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={rootStyle as any}>
        <Typography color="error">
          Failed to load CMS entries.
        </Typography>
      </Box>
    );
  }

  if (!visibleEntries.length) {
    return (
      <Box sx={rootStyle as any}>
        <Typography color="text.secondary">
          No published CMS entries.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={rootStyle as any}>
      <Box sx={gridStyle as any}>
        {visibleEntries.map((entry: any) => {
          const title =
            readEntryValue(
              entry,
              props.titleField
            ) ||
            getFallbackTitle(entry);

          const description =
            readEntryValue(
              entry,
              props.descriptionField
            );

          const imageUrl =
            readEntryValue(
              entry,
              props.imageField
            );

          const href =
            siteId &&
            collectionSlug &&
            entry.slug
              ? `/site/${siteId}/${collectionSlug}/${entry.slug}`
              : undefined;

          const card = (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
                height: "100%",
                padding: "20px",
                border:
                  "1px solid rgba(148, 163, 184, 0.25)",
                borderRadius: "12px",
                backgroundColor:
                  "rgba(255, 255, 255, 0.04)",
                color: "inherit",
                boxSizing: "border-box",
                textDecoration: "none"
              }}
            >
              {imageUrl && (
                <Box
                  component="img"
                  src={String(imageUrl)}
                  alt={String(title || "")}
                  sx={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    objectFit: "cover",
                    borderRadius: "8px"
                  }}
                />
              )}

              <Typography
                component="h3"
                sx={{
                  margin: 0,
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  lineHeight: 1.25,
                  color: "inherit"
                }}
              >
                {String(title)}
              </Typography>

              {description && (
                <Typography
                  sx={{
                    margin: 0,
                    color: "inherit",
                    opacity: 0.78,
                    lineHeight: 1.6
                  }}
                >
                  {String(description)}
                </Typography>
              )}
            </Box>
          );

          return href ? (
            <Box
              key={entry.id}
              component="a"
              href={href}
              sx={{
                color: "inherit",
                textDecoration: "none"
              }}
            >
              {card}
            </Box>
          ) : (
            <Box key={entry.id}>
              {card}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default CollectionListBlock;
