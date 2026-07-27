import {
  Box,
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

type HelpDoc = {
  id: string;
  title: string;
  category: string;
  content: string;
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

export const HelpCenterPage = () => {
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
      try {
        const token =
          findTokenInStorage();

        const response =
          await fetch(
            `${API_BASE_URL}/platform-assistant/docs`,
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
              "Failed to load documentation"
          );
        }

        setDocs(json.data || []);
      } catch {
        setError(
          "Unable to load ReactBuilder documentation."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDocs();
  }, []);

  const filteredDocs =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return docs;
      }

      return docs.filter(doc => {
        const text =
          `${doc.title} ${doc.category} ${doc.content}`
            .toLowerCase();

        return text.includes(query);
      });
    }, [docs, search]);

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
          Help Center
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            maxWidth: 760
          }}
        >
          Learn how to use ReactBuilder: sites, pages,
          builder, publishing, plugins, AI assistant,
          chatbot and troubleshooting.
        </Typography>
      </Box>

      <TextField
        fullWidth
        placeholder="Search documentation..."
        value={search}
        onChange={event =>
          setSearch(event.target.value)
        }
        sx={{
          mb: 3,
          maxWidth: 620
        }}
      />

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
            Loading documentation...
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