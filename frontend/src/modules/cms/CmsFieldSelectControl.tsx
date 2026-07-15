import React from "react";

import {
  MenuItem,
  TextField
} from "@mui/material";

import {
  useParams
} from "react-router-dom";

import {
  useGetCmsCollectionQuery,
  useGetCmsCollectionsQuery
} from "../../redux/services/cms.api";

type Props = {
  label: string;
  value: unknown;
  error?: string | null;
  block?: any;
  onChange: (
    value: string
  ) => void;
};

export const CmsFieldSelectControl = ({
  label,
  value,
  error,
  block,
  onChange
}: Props) => {
  const {
    siteId
  } = useParams();

  const collectionSlug =
    String(
      block?.data?.props
        ?.collectionSlug || ""
    );

  const {
    data: collections = [],
    isLoading: isLoadingCollections
  } = useGetCmsCollectionsQuery(
    siteId || "",
    {
      skip: !siteId
    }
  );

  const collectionSummary =
    collections.find(
      (collection) =>
        collection.slug ===
        collectionSlug
    );

  const collectionId =
    collectionSummary?.id;

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

  const fields =
    collectionDetails?.fields ||
    collectionSummary?.fields ||
    [];

  const loading =
    isLoadingCollections ||
    isLoadingCollection ||
    isFetchingCollection;

  let helperText =
    "Select a collection first";

  if (collectionSlug) {
    helperText =
      loading
        ? "Loading collection fields..."
        : "Choose field from selected collection";
  }

  if (
    collectionSlug &&
    !loading &&
    fields.length === 0
  ) {
    helperText =
      "This collection has no fields";
  }

  return (
    <TextField
      select
      fullWidth
      size="small"
      label={label}
      value={String(value || "")}
      error={Boolean(error)}
      helperText={
        error || helperText
      }
      disabled={
        loading ||
        !siteId ||
        !collectionId
      }
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
    >
      <MenuItem value="">
        Select field
      </MenuItem>

      {fields.map((field) => (
        <MenuItem
          key={field.id}
          value={field.key}
        >
          {field.name}
          {" "}
          ({field.key})
        </MenuItem>
      ))}
    </TextField>
  );
};

export default CmsFieldSelectControl;