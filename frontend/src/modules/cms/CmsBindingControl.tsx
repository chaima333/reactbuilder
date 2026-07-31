import {
  MenuItem,
  Stack,
  TextField
} from "@mui/material";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useParams
} from "react-router-dom";

import {
  useGetCmsCollectionQuery,
  useGetCmsCollectionsQuery
} from "../../redux/services/cms.api";

type SourceMode =
  | "static"
  | "cms";

type Props = {
  label: string;
  value: unknown;
  error?: string | null;
  block?: any;
  field?: any;
  onChange: (
    value: string
  ) => void;
};

const strictBindingPattern =
  /^\{\{\s*cms\.([A-Za-z0-9_]+)\s*\}\}$/;

const legacyBindingPattern =
  /^\{\{\s*([A-Za-z0-9_]+)\s*\}\}$/;

export const formatCmsBindingValue = (
  key: string
) =>
  key
    ? `{{cms.${key}}}`
    : "";

export const extractCmsBindingKey = (
  value: unknown
) => {
  if (typeof value !== "string") {
    return "";
  }

  const strictMatch =
    value.match(strictBindingPattern);

  if (strictMatch) {
    return strictMatch[1];
  }

  const legacyMatch =
    value.match(legacyBindingPattern);

  return legacyMatch?.[1] || "";
};

export const CmsBindingControl = ({
  label,
  value,
  error,
  block,
  onChange
}: Props) => {
  const {
    siteId,
    pageId
  } = useParams<{
    siteId: string;
    pageId: string;
  }>();

  const bindingKey =
    extractCmsBindingKey(value);

  const [
    sourceMode,
    setSourceMode
  ] = useState<SourceMode>(
    bindingKey
      ? "cms"
      : "static"
  );

  useEffect(() => {
    setSourceMode(
      bindingKey
        ? "cms"
        : "static"
    );
  }, [bindingKey]);

  const {
    data: collections = [],
    isLoading: isLoadingCollections
  } = useGetCmsCollectionsQuery(
    siteId || "",
    {
      skip: !siteId
    }
  );

  const templateCollection =
    useMemo(
      () =>
        collections.find(
          (collection) =>
            String(
              collection.templatePageId || ""
            ) ===
            String(pageId || "")
        ),
      [
        collections,
        pageId
      ]
    );

  const collectionId =
    templateCollection?.id;

  const {
    data: collectionDetails,
    isLoading: isLoadingCollection,
    isFetching: isFetchingCollection
  } = useGetCmsCollectionQuery(
    {
      siteId: siteId || "",
      collectionId:
        collectionId || ""
    },
    {
      skip:
        !siteId ||
        !collectionId
    }
  );

  const allFields =
    collectionDetails?.fields ||
    templateCollection?.fields ||
    [];

  const compatibleFields =
    useMemo(() => {
      const blockType =
        String(block?.type || "");

      if (blockType === "image") {
        return allFields.filter(
          (cmsField) =>
            cmsField.type === "image"
        );
      }

      return allFields.filter(
        (cmsField) =>
          cmsField.type !== "image" &&
          cmsField.type !== "boolean"
      );
    }, [
      allFields,
      block?.type
    ]);

  const loading =
    isLoadingCollections ||
    isLoadingCollection ||
    isFetchingCollection;

  const handleSourceChange = (
    nextMode: SourceMode
  ) => {
    setSourceMode(nextMode);

    if (
      nextMode === "static" &&
      bindingKey
    ) {
      onChange("");
    }
  };

  const getCmsHelperText = () => {
    if (!pageId) {
      return "Save the page, then reopen it to configure CMS binding.";
    }

    if (loading) {
      return "Loading CMS fields...";
    }

    if (!templateCollection) {
      return "Link this page as the Template Page of a CMS collection.";
    }

    if (compatibleFields.length === 0) {
      return "No compatible CMS fields found in this collection.";
    }

    return `Collection: ${templateCollection.name}`;
  };

  return (
    <Stack spacing={1.25}>
      <TextField
        select
        fullWidth
        size="small"
        label={`${label} Source`}
        value={sourceMode}
        onChange={(event) =>
          handleSourceChange(
            event.target.value as SourceMode
          )
        }
      >
        <MenuItem value="static">
          Static content
        </MenuItem>

        <MenuItem value="cms">
          CMS field
        </MenuItem>
      </TextField>

      {sourceMode === "static" ? (
        <TextField
          fullWidth
          size="small"
          label={label}
          value={
            bindingKey
              ? ""
              : String(value || "")
          }
          error={Boolean(error)}
          helperText={error || ""}
          multiline={
            block?.type === "text"
          }
          minRows={
            block?.type === "text"
              ? 3
              : undefined
          }
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
        />
      ) : (
        <TextField
          select
          fullWidth
          size="small"
          label={`${label} CMS Field`}
          value={bindingKey}
          disabled={
            loading ||
            !templateCollection ||
            compatibleFields.length === 0
          }
          error={Boolean(error)}
          helperText={
            error ||
            getCmsHelperText()
          }
          onChange={(event) => {
            const key =
              event.target.value;

            onChange(
              key
                ? formatCmsBindingValue(key)
                : ""
            );
          }}
        >
          <MenuItem value="">
            Select CMS field
          </MenuItem>

          {compatibleFields.map(
            (cmsField) => (
              <MenuItem
                key={cmsField.id}
                value={cmsField.key}
              >
                {cmsField.name}
                {" "}
                ({cmsField.key})
              </MenuItem>
            )
          )}
        </TextField>
      )}
    </Stack>
  );
};

export default CmsBindingControl;
