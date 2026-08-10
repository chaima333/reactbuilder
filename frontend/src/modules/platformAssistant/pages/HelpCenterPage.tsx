import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  TextField,
  Typography
} from "@mui/material";

import {
  useEffect,
  useMemo,
  useState
} from "react";
import { useLanguage } from "../../../app/providers/LanguageProvider";

type HelpDoc = {
  id: string;
  title: string;
  category: string;
  summary?: string;
  content: string;
  slug?: string;
  keywords?: string[];
  order?: number;
  score?: number;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://backend-rmfq.onrender.com/api";

const findTokenInStorage = () => {
  const keys = [
    "token",
    "accessToken",
    "authToken",
    "jwt"
  ];

  for (const key of keys) {
    const value =
      localStorage.getItem(key);

    if (
      value &&
      value !== "null" &&
      value !== "undefined"
    ) {
      return value.replace(/^"|"$/g, "");
    }
  }

  for (let index = 0; index < localStorage.length; index += 1) {
    const key =
      localStorage.key(index);

    if (!key) {
      continue;
    }

    const value =
      localStorage.getItem(key);

    if (
      value &&
      value.includes("eyJ") &&
      value.split(".").length >= 3
    ) {
      const match =
        value.match(
          /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/
        );

      if (match?.[0]) {
        return match[0];
      }
    }
  }

  return "";
};

export const getHelpCenterLabels = (
  language: "fr" | "en"
) =>
  language === "fr"
    ? {
        title: "Centre d'aide",
        description:
          "Trouvez rapidement de l'aide sur les sites, les pages, le Page Builder, le CMS, les formulaires, les plugins, l'IA, les rôles et le dépannage.",
        searchPlaceholder:
          "Rechercher dans la documentation...",
        loading:
          "Chargement de la documentation...",
        loadError:
          "Impossible de charger la documentation ReactBuilder.",
        noResultsTitle:
          "Aucun article trouvé",
        noResultsBody:
          "Essayez avec un autre mot-clé comme formulaire, connexion, CMS, partenaire, import ZIP ou SEO.",
        clear:
          "Effacer",
        results:
          "résultat",
        resultsPlural:
          "résultats"
      }
    : {
        title: "Help Center",
        description:
          "Find help for sites, pages, the Page Builder, CMS, forms, plugins, AI, roles and troubleshooting.",
        searchPlaceholder:
          "Search documentation...",
        loading:
          "Loading documentation...",
        loadError:
          "Unable to load ReactBuilder documentation.",
        noResultsTitle:
          "No articles found",
        noResultsBody:
          "Try another keyword such as form, login, CMS, partner, ZIP import or SEO.",
        clear:
          "Clear",
        results:
          "result",
        resultsPlural:
          "results"
      };

export const HelpCenterPage = () => {
  const { language } =
    useLanguage();

  const [docs, setDocs] =
    useState<HelpDoc[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadDocs = async () => {
      setLoading(true);
      setError("");

      try {
        const token =
          findTokenInStorage();
        const params =
          new URLSearchParams({
            locale: language
          });

        if (search.trim()) {
          params.set(
            "q",
            search.trim()
          );
        }

        const response =
          await fetch(
            `${API_BASE_URL}/platform-assistant/docs?${params.toString()}`,
            {
              headers: {
                ...(token
                  ? {
                      Authorization: `Bearer ${token}`
                    }
                  : {})
              }
            }
          );

        const json =
          await response.json();

        if (
          !response.ok ||
          !json?.success
        ) {
          throw new Error(
            json?.message ||
              labels.loadError
          );
        }

        setDocs(json.data || []);
      } catch {
        setError(labels.loadError);
      } finally {
        setLoading(false);
      }
    };

    loadDocs();
  }, [language, search]);

  const labels =
    useMemo(
      () =>
        getHelpCenterLabels(language),
      [language]
    );

  const filteredDocs =
    useMemo(() => {
      return docs;
    }, [docs]);

  const categories =
    useMemo(
      () =>
        Array.from(
          new Set(
            filteredDocs.map(doc => doc.category)
          )
        ),
      [filteredDocs]
    );

  return (
    <Box>
      <Box
        sx={{
          mb: 4
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 1
          }}
        >
          {labels.title}
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            maxWidth: 760
          }}
        >
          {labels.description}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          mb: 2,
          maxWidth: 760
        }}
      >
        <TextField
          fullWidth
          placeholder={labels.searchPlaceholder}
          value={search}
          onChange={event =>
            setSearch(event.target.value)
          }
        />
        {!!search && (
          <Button
            variant="outlined"
            onClick={() => setSearch("")}
          >
            {labels.clear}
          </Button>
        )}
      </Box>

      {!loading && !error && !!search.trim() && (
        <Typography
          color="text.secondary"
          sx={{
            mb: 3
          }}
        >
          {filteredDocs.length}{" "}
          {filteredDocs.length === 1
            ? labels.results
            : labels.resultsPlural}
        </Typography>
      )}

      {loading && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1
          }}
        >
          <CircularProgress size={20} />
          <Typography>
            {labels.loading}
          </Typography>
        </Box>
      )}

      {!!error && (
        <Typography color="error">
          {error}
        </Typography>
      )}

      {!loading &&
        !error &&
        !filteredDocs.length && (
          <Box
            sx={{
              py: 4,
              maxWidth: 680
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                mb: 1
              }}
            >
              {labels.noResultsTitle}
            </Typography>
            <Typography color="text.secondary">
              {labels.noResultsBody}
            </Typography>
          </Box>
        )}

      {!loading &&
        !error &&
        categories.map(category => (
          <Box
            key={category}
            sx={{
              mb: 4
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                mb: 2
              }}
            >
              {category}
            </Typography>

            <Grid
              container
              spacing={2}
            >
              {filteredDocs
                .filter(doc => doc.category === category)
                .map(doc => (
                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    key={doc.id}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        borderRadius: 3
                      }}
                    >
                      <CardContent>
                        <Chip
                          label={doc.category}
                          size="small"
                          sx={{
                            mb: 1
                          }}
                        />

                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            mb: 1
                          }}
                        >
                          {doc.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            mb: 1
                          }}
                        >
                          {doc.summary}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            whiteSpace: "pre-line"
                          }}
                        >
                          {doc.content}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>
        ))}
    </Box>
  );
};

export default HelpCenterPage;
