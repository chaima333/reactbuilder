// src/modules/cms/pages/CmsEntryPage.tsx

import {
  useEffect,
  useMemo
} from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Typography
} from "@mui/material";

import {
  Link,
  useParams
} from "react-router-dom";

import {
  useGetPublicCmsEntryQuery
} from "../../../redux/services/cmsPublic.api";

import {
  useGetPublicSiteQuery
} from "../../../redux/services/sites.api";

import {
  PublicPageRuntime
} from "../../pageBuilder/runtime/public/PublicPageRuntime";

import {
  RuntimeProvider
} from "../../pageBuilder/runtime/context/RuntimeProvider";

import {
  resolveBindings
} from "../utils/binding.resolver";

import CmsEntryRenderer from "../components/CmsEntryRenderer";

export default function PublicCmsEntryPage() {
  const {
    siteId,
    collectionSlug,
    entrySlug
  } = useParams<{
    siteId: string;
    collectionSlug: string;
    entrySlug: string;
  }>();

  // =========================
  // CMS ENTRY
  // =========================

  const {
    data: entry,
    isLoading: isLoadingEntry,
    isError: isEntryError,
    error: entryError
  } = useGetPublicCmsEntryQuery(
    {
      siteId: siteId || "",
      collectionSlug:
        collectionSlug || "",
      entrySlug:
        entrySlug || ""
    },
    {
      skip:
        !siteId ||
        !collectionSlug ||
        !entrySlug
    }
  );

  // =========================
  // PUBLIC SITE
  // =========================

  const {
    data: site,
    isLoading: isLoadingSite,
    isError: isSiteError,
    error: siteError
  } = useGetPublicSiteQuery(
    Number(siteId || 0),
    {
      skip: !siteId
    }
  );

  // =========================
  // ENTRY DATA
  // =========================

  const entryData =
    useMemo(
      () =>
        entry?.data || {},
      [entry]
    );

  const title =
    entryData?.title ||
    entry?.slug ||
    "CMS Entry";

  const description =
    entryData?.description ||
    entryData?.excerpt ||
    "";

  const image =
    entryData?.featuredImage ||
    entryData?.image ||
    "";

  const siteName =
    site?.title ||
    site?.name ||
    "Website";

  // =========================
  // RESOLVE TEMPLATE BINDINGS
  // =========================

  const resolvedBlocks =
    useMemo(() => {
      const templateBlocks =
        entry?.templatePage?.blocks ||
        entry?.template?.blocks ||
        [];

      if (!Array.isArray(templateBlocks)) {
        return [];
      }

      return resolveBindings(
        templateBlocks,
        entryData
      );
    }, [
      entry,
      entryData
    ]);

  const hasTemplateBlocks =
    resolvedBlocks.length > 0;

  // =========================
  // PAGE-LIKE OBJECT
  // PublicPageRuntime expects a page
  // =========================

  const dynamicPage =
    useMemo(
      () => ({
        id:
          entry?.templatePage?.id ||
          entry?.template?.pageId ||
          entry?.id ||
          null,

        siteId:
          Number(siteId || 0),

        title,
        slug:
          entrySlug || entry?.slug,

        status: "published",

        blocks:
          resolvedBlocks,

        theme:
          site?.theme ||
          (site as any)?.settings?.theme ||
          {},

        site
      }),
      [
        entry,
        entrySlug,
        resolvedBlocks,
        site,
        siteId,
        title
      ]
    );

  // =========================
  // DYNAMIC SEO
  // =========================

  useEffect(() => {
    document.title =
      `${title} | ${siteName}`;

    const setMetaTag = (
      name: string,
      content: string,
      isProperty = false
    ) => {
      const selector =
        isProperty
          ? `meta[property="${name}"]`
          : `meta[name="${name}"]`;

      let meta =
        document.querySelector(
          selector
        ) as HTMLMetaElement | null;

      if (!meta) {
        meta =
          document.createElement("meta");

        if (isProperty) {
          meta.setAttribute(
            "property",
            name
          );
        } else {
          meta.setAttribute(
            "name",
            name
          );
        }

        document.head.appendChild(
          meta
        );
      }

      meta.setAttribute(
        "content",
        content
      );
    };

    const setLinkTag = (
      rel: string,
      href: string
    ) => {
      let link =
        document.querySelector(
          `link[rel="${rel}"]`
        ) as HTMLLinkElement | null;

      if (!link) {
        link =
          document.createElement("link");

        link.setAttribute(
          "rel",
          rel
        );

        document.head.appendChild(
          link
        );
      }

      link.setAttribute(
        "href",
        href
      );
    };

    const canonicalUrl =
      `${window.location.origin}` +
      `/site/${siteId}` +
      `/${collectionSlug}` +
      `/${entrySlug}`;

    setMetaTag(
      "og:title",
      title,
      true
    );

    setMetaTag(
      "twitter:title",
      title
    );

    setMetaTag(
      "og:type",
      "article",
      true
    );

    setMetaTag(
      "og:site_name",
      siteName,
      true
    );

    setMetaTag(
      "twitter:card",
      "summary_large_image"
    );

    setMetaTag(
      "og:url",
      canonicalUrl,
      true
    );

    setMetaTag(
      "robots",
      "index, follow"
    );

    setLinkTag(
      "canonical",
      canonicalUrl
    );

    if (description) {
      setMetaTag(
        "description",
        description
      );

      setMetaTag(
        "og:description",
        description,
        true
      );

      setMetaTag(
        "twitter:description",
        description
      );
    }

    if (image) {
      setMetaTag(
        "og:image",
        image,
        true
      );

      setMetaTag(
        "twitter:image",
        image
      );
    }

    if (entry?.createdAt) {
      setMetaTag(
        "article:published_time",
        entry.createdAt,
        true
      );
    }

    if (entryData?.keywords) {
      const keywords =
        Array.isArray(
          entryData.keywords
        )
          ? entryData.keywords.join(", ")
          : String(
              entryData.keywords
            );

      setMetaTag(
        "keywords",
        keywords
      );
    }
  }, [
    collectionSlug,
    description,
    entry,
    entryData,
    entrySlug,
    image,
    siteId,
    siteName,
    title
  ]);

  // =========================
  // LOADING
  // =========================

  if (
    isLoadingEntry ||
    isLoadingSite
  ) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // =========================
  // ENTRY ERROR
  // =========================

  if (
    isEntryError ||
    !entry
  ) {
    const errorMessage =
      (entryError as any)
        ?.data?.message ||
      "CMS entry not found";

    return (
      <Container
        maxWidth="md"
        sx={{ py: 8 }}
      >
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              component={Link}
              to={`/site/${siteId}`}
            >
              Back to Site
            </Button>
          }
        >
          {errorMessage}
        </Alert>

        {import.meta.env.DEV && (
          <Box
            sx={{
              p: 3,
              bgcolor: "grey.50",
              borderRadius: 1
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Debug Info:
            </Typography>

            <pre
              style={{
                fontSize: "0.75rem",
                overflow: "auto"
              }}
            >
              {JSON.stringify(
                {
                  siteId,
                  collectionSlug,
                  entrySlug,
                  entryError
                },
                null,
                2
              )}
            </pre>
          </Box>
        )}
      </Container>
    );
  }

  // =========================
  // SITE ERROR
  // =========================

  if (
    isSiteError ||
    !site
  ) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: 8 }}
      >
        <Alert severity="error">
          Site not found
        </Alert>

        {import.meta.env.DEV && (
          <pre>
            {JSON.stringify(
              siteError,
              null,
              2
            )}
          </pre>
        )}
      </Container>
    );
  }

  // =========================
  // TEMPLATE RUNTIME
  // Navbar + CMS + Footer
  // =========================

  if (hasTemplateBlocks) {
    return (
      <PublicPageRuntime
        page={dynamicPage}
        site={site}
      />
    );
  }

  // =========================
  // FALLBACK WITHOUT TEMPLATE
  // =========================

  return (
    <RuntimeProvider
      value={{
        mode: "public",
        device: "desktop",
        siteId:
          Number(siteId || 0),
        pageId: null,
        tokens:
          site?.theme || {}
      }}
    >
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh"
        }}
      >
        <CmsEntryRenderer
          entry={entry}
        />
      </Box>
    </RuntimeProvider>
  );
}