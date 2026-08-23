import {
  Alert,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import {
  useEffect,
  useMemo
} from "react";

import {
  CmsCollection,
  CmsEntry,
  useGetCmsCollectionQuery,
  useGetCmsCollectionsQuery
} from "../../redux/services/cms.api";

export type CmsTemplatePreview = {
  collection: CmsCollection;
  entry: CmsEntry;
};

type Props = {
  siteId: number | string;
  pageId: number | string | null;
  selectedEntryId: number | "";
  onEntryChange: (
    entryId: number | ""
  ) => void;
  onPreviewChange: (
    preview: CmsTemplatePreview | null
  ) => void;
};

export const findTemplateCollection = (
  collections: CmsCollection[],
  pageId: number | string | null
) => {
  if (!pageId) {
    return undefined;
  }

  return collections.find(
    (collection) =>
      String(
        collection.templatePageId || ""
      ) === String(pageId)
  );
};

export const getCmsEntryPreviewLabel = (
  entry: CmsEntry
) =>
  String(
    entry.data?.title ||
      entry.data?.name ||
      entry.slug ||
      `Entry ${entry.id}`
  );

export const selectPreviewBlocks = (
  originalBlocks: any[],
  previewBlocks: any[] | null
) =>
  previewBlocks || originalBlocks;

export const isCmsPreviewMutationAllowed = (
  preview: CmsTemplatePreview | null
) =>
  !preview;

export const getCmsEntryPreviewReadOnly = (
  preview: CmsTemplatePreview | null
) =>
  Boolean(preview);

export const runUnlessCmsPreviewActive = (
  preview: CmsTemplatePreview | null,
  mutation: () => void
) => {
  if (!isCmsPreviewMutationAllowed(preview)) {
    return false;
  }

  mutation();
  return true;
};

export const getCmsPreviewSaveBlocks = (
  originalBlocks: any[]
) =>
  originalBlocks;

export const CmsEntryPreviewSelect = ({
  siteId,
  pageId,
  selectedEntryId,
  onEntryChange,
  onPreviewChange
}: Props) => {
  const {
    data: collections = [],
    isLoading: isLoadingCollections
  } = useGetCmsCollectionsQuery(
    siteId || "",
    {
      skip:
        !siteId ||
        !pageId
    }
  );

  const templateCollection =
    useMemo(
      () =>
        findTemplateCollection(
          collections,
          pageId
        ),
      [
        collections,
        pageId
      ]
    );

  const {
    data: collectionDetails,
    isLoading: isLoadingCollection,
    isFetching,
    isError
  } = useGetCmsCollectionQuery(
    {
      siteId,
      collectionId:
        templateCollection?.id || ""
    },
    {
      skip:
        !siteId ||
        !templateCollection?.id
    }
  );

  const collection =
    collectionDetails ||
    templateCollection ||
    null;

  const entries =
    collection?.entries || [];

 const selectedEntry =
  entries.find(
    (entry) =>
      entry.id === selectedEntryId
  ) || null;

console.log("CMS PREVIEW DEBUG", {
  selectedEntryId,
  entries,
  selectedEntry,
  collection,
});

  useEffect(() => {
    onEntryChange("");
    onPreviewChange(null);
  }, [
    pageId,
    templateCollection?.id
  ]);

  useEffect(() => {
    if (
      selectedEntryId &&
      entries.length > 0 &&
      !selectedEntry
    ) {
      onEntryChange("");
      onPreviewChange(null);
    }
  }, [
    selectedEntryId,
    selectedEntry,
    entries,
    onEntryChange,
    onPreviewChange
  ]);

  useEffect(() => {
    if (
      collection &&
      selectedEntry
    ) {
      onPreviewChange({
        collection,
        entry: selectedEntry
      });
      return;
    }

    onPreviewChange(null);
  }, [
    collection,
    selectedEntry,
    onPreviewChange
  ]);

  if (!pageId) {
    return null;
  }

  if (
    isLoadingCollections ||
    isLoadingCollection ||
    isFetching
  ) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
      >
        <CircularProgress size={16} />
        <Typography variant="caption">
          Loading CMS preview
        </Typography>
      </Stack>
    );
  }

  if (!templateCollection) {
    return null;
  }

  if (isError) {
    return (
      <Alert
        severity="warning"
        sx={{ py: 0 }}
      >
        Failed to load CMS preview entries.
      </Alert>
    );
  }

  return (
    <TextField
      select
      size="small"
      label="Preview entry"
      value={selectedEntryId}
      onChange={(event) => {
        const nextValue =
          event.target.value;

        onEntryChange(
          nextValue === ""
            ? ""
            : Number(nextValue)
        );
      }}
      helperText={
        entries.length
          ? `Collection: ${templateCollection.name}`
          : "This collection has no entries."
      }
      sx={{
        minWidth: 220
      }}
    >
      <MenuItem value="">
        Template tokens
      </MenuItem>

      {entries.map((entry) => (
        <MenuItem
          key={entry.id}
          value={entry.id}
        >
          {getCmsEntryPreviewLabel(entry)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default CmsEntryPreviewSelect;
