import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography
} from "@mui/material";

import {
  useGetPublicCmsEntriesQuery
} from "../../redux/services/cmsPublic.api";

type Props = {
  siteId: number | string;
  slug: string;
};

export const PublicCmsEntriesPreview = ({
  siteId,
  slug
}: Props) => {
  const {
    data: entries = [],
    isLoading,
    error
  } = useGetPublicCmsEntriesQuery(
    {
      siteId,
      slug
    },
    {
      skip: !siteId || !slug
    }
  );

  if (isLoading) {
    return (
      <CircularProgress size={24} />
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load CMS entries.
      </Alert>
    );
  }

  if (!entries.length) {
    return (
      <Typography color="text.secondary">
        No published entries.
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {entries.map((entry) => (
        <Card key={entry.id}>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={700}
            >
              {entry.title || `Entry #${entry.id}`}
            </Typography>

            {entry.description && (
              <Typography
                color="text.secondary"
                mt={1}
              >
                {entry.description}
              </Typography>
            )}

            <Box
              component="pre"
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "action.hover",
                borderRadius: 2,
                overflow: "auto",
                fontSize: 12
              }}
            >
              {JSON.stringify(
                entry,
                null,
                2
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default PublicCmsEntriesPreview;