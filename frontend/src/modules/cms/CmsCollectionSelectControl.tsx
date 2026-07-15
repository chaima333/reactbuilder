import React from "react";

import {
  MenuItem,
  TextField
} from "@mui/material";

import {
  useParams
} from "react-router-dom";
import { useGetCmsCollectionsQuery } from "../../redux/services/cms.api";


type Props = {
  label: string;
  value: any;
  error?: string | null;
  onChange: (value: any) => void;
};

export const CmsCollectionSelectControl = ({
  label,
  value,
  error,
  onChange
}: Props) => {
  const { siteId } =
    useParams();

  const {
    data: collections = [],
    isLoading
  } = useGetCmsCollectionsQuery(
    siteId || "",
    {
      skip: !siteId
    }
  );

  return (
    <TextField
      select
      fullWidth
      size="small"
      label={label}
      value={value || ""}
      error={!!error}
      helperText={
        error ||
        "Choose the CMS collection to display"
      }
      disabled={isLoading || !siteId}
      onChange={(event) =>
        onChange(event.target.value)
      }
    >
      <MenuItem value="">
        Select collection
      </MenuItem>

      {collections.map((collection) => (
        <MenuItem
          key={collection.id}
          value={collection.slug}
        >
          {collection.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default CmsCollectionSelectControl;