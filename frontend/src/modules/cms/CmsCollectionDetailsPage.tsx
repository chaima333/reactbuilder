import {
  useState
} from "react";

import {
  useParams
} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";

import {
  CmsField,
  CmsFieldType,
  useCreateCmsEntryMutation,
  useCreateCmsFieldMutation,
  useDeleteCmsEntryMutation,
  useDeleteCmsFieldMutation,
  useGetCmsCollectionQuery,
  useUpdateCmsCollectionMutation,
  useUpdateCmsEntryMutation,
  useUpdateCmsFieldMutation
} from "../../redux/services/cms.api";
import PublicCmsEntriesPreview from "./PublicCmsEntriesPreview";
import { useGetPagesQuery } from "../../redux/services/pages.api";

const fieldTypes: CmsFieldType[] = [
  "text",
  "textarea",
  "number",
  "boolean",
  "image",
  "date",
  "select"
];

export const getCmsErrorCode = (
  error: unknown
) => {
  const data =
    (error as any)?.data ||
    error;

  return String(
    data?.code ||
      data?.message ||
      ""
  );
};

export const getSlugErrorMessage = (
  error: unknown
) => {
  const code =
    getCmsErrorCode(error);

  if (code === "CMS_ENTRY_SLUG_CONFLICT") {
    return "This slug is already used in this collection.";
  }

  if (code === "CMS_ENTRY_SLUG_INVALID") {
    return "Enter a valid slug using letters, numbers, and hyphens.";
  }

  if (code === "CMS_ENTRY_SLUG_TOO_LONG") {
    return "Slug must be 160 characters or fewer.";
  }

  return "";
};

export const CmsCollectionDetailsPage = () => {
  const { siteId, collectionSlug } = useParams();

  const {
    data: collection,
    isLoading,
    error
  } = useGetCmsCollectionQuery(
    {
      siteId: siteId || "",
      collectionId: collectionSlug || ""
    },
    {
      skip: !siteId || !collectionSlug
    }
  );

  const {
  data: pages = []
} = useGetPagesQuery(
  Number(siteId),
  {
    skip: !siteId
  }
);
const [
  updateCollection,
  { isLoading: isUpdatingCollection }
] = useUpdateCmsCollectionMutation();

  const [
    createField,
    { isLoading: isCreatingField }
  ] = useCreateCmsFieldMutation();

  const [
    createEntry,
    { isLoading: isCreatingEntry }
  ] = useCreateCmsEntryMutation();

  const [
    updateEntry,
    { isLoading: isUpdatingEntry }
  ] = useUpdateCmsEntryMutation();

  const [
    deleteEntry,
    { isLoading: isDeletingEntry }
  ] = useDeleteCmsEntryMutation();

  const [editingEntryId, setEditingEntryId] =
    useState<number | null>(null);

  const [editEntryData, setEditEntryData] =
    useState<Record<string, any>>({});

  const [fieldName, setFieldName] =
    useState("");

  const [fieldType, setFieldType] =
    useState<CmsFieldType>("text");

  const [fieldRequired, setFieldRequired] =
    useState(false);

  const [entryData, setEntryData] =
    useState<Record<string, any>>({});

  const [entrySlug, setEntrySlug] =
    useState("");

  const [entrySlugError, setEntrySlugError] =
    useState("");

  const [editEntrySlug, setEditEntrySlug] =
    useState("");

  const [editEntrySlugError, setEditEntrySlugError] =
    useState("");

  const [editingField, setEditingField] =
    useState<CmsField | null>(null);

  const [
    updateField,
    { isLoading: isUpdatingField }
  ] = useUpdateCmsFieldMutation();

  const [
    deleteField,
    { isLoading: isDeletingField }
  ] = useDeleteCmsFieldMutation();

  const [selectOptionsText, setSelectOptionsText] =
    useState("");

  const handleCreateField = async () => {
    if (
      !siteId ||
      !collection?.id ||
      !fieldName.trim()
    ) {
      return;
    }

    // Validate select options
    if (fieldType === "select") {
      const options = selectOptionsText
        .split(",")
        .map((option) => option.trim())
        .filter(Boolean);
      
      if (options.length === 0) {
        return;
      }
    }

    await createField({
      siteId,
      collectionId: collection.id,
      body: {
        name: fieldName.trim(),
        type: fieldType,
        required: fieldRequired,
        settings:
          fieldType === "select"
            ? {
                options: selectOptionsText
                  .split(",")
                  .map((option) => option.trim())
                  .filter(Boolean)
              }
            : {}
      }
    }).unwrap();

    setFieldName("");
    setFieldType("text");
    setFieldRequired(false);
    setSelectOptionsText("");
  };

  const handleCreateEntry = async () => {
    if (
      !siteId ||
      !collection?.id
    ) {
      return;
    }

    setEntrySlugError("");

    try {
      await createEntry({
        siteId,
        collectionId: collection.id,
        body: {
          status: "published",
          slug:
            entrySlug.trim() ||
            undefined,
          data: entryData
        }
      }).unwrap();

      setEntryData({});
      setEntrySlug("");
    } catch (error) {
      const slugError =
        getSlugErrorMessage(error);

      if (slugError) {
        setEntrySlugError(slugError);
        return;
      }

      throw error;
    }
  };

  const handleStartEditEntry = (
    entry: any
  ) => {
    setEditingEntryId(entry.id);
    setEditEntryData(entry.data || {});
    setEditEntrySlug(entry.slug || "");
    setEditEntrySlugError("");
  };

  const handleCancelEditEntry = () => {
    setEditingEntryId(null);
    setEditEntryData({});
    setEditEntrySlug("");
    setEditEntrySlugError("");
  };

  const handleUpdateEntry = async (
    entry: any
  ) => {
    if (!siteId) return;

    setEditEntrySlugError("");

    try {
      await updateEntry({
        siteId,
        entryId: entry.id,
        body: {
          status: entry.status,
          slug:
            editEntrySlug.trim(),
          data: editEntryData
        }
      }).unwrap();

      handleCancelEditEntry();
    } catch (error) {
      const slugError =
        getSlugErrorMessage(error);

      if (slugError) {
        setEditEntrySlugError(slugError);
        return;
      }

      throw error;
    }
  };

  const handleToggleEntryStatus = async (
    entry: any
  ) => {
    if (!siteId) return;

    await updateEntry({
      siteId,
      entryId: entry.id,
      body: {
        status:
          entry.status === "published"
            ? "draft"
            : "published",
        data: entry.data || {}
      }
    }).unwrap();
  };

  const handleDeleteEntry = async (
    entry: any
  ) => {
    if (!siteId) return;

    const confirmed =
      window.confirm(
        "Delete this CMS entry?"
      );

    if (!confirmed) return;

    await deleteEntry({
      siteId,
      entryId: entry.id
    }).unwrap();
  };

  const handleUpdateField = async () => {
    if (
      !siteId ||
      !editingField ||
      !editingField.name.trim() ||
      !editingField.key.trim()
    ) {
      return;
    }

    // Validate select options
    if (editingField.type === "select") {
      const options = Array.isArray(editingField.settings?.options)
        ? editingField.settings.options
        : [];
      
      if (options.length === 0) {
        return;
      }
    }

    await updateField({
      siteId,
      fieldId: editingField.id,
      body: {
        name: editingField.name.trim(),
        key: editingField.key.trim(),
        type: editingField.type,
        required: editingField.required,
        order: editingField.order,
        settings: editingField.settings || {}
      }
    }).unwrap();

    setEditingField(null);
  };

  const handleDeleteField = async (
    field: CmsField
  ) => {
    if (!siteId) {
      return;
    }

    const confirmed = window.confirm(
      `Delete field "${field.name}"? Existing entry data using key "${field.key}" may remain inside JSON data.`
    );

    if (!confirmed) {
      return;
    }

    await deleteField({
      siteId,
      fieldId: field.id
    }).unwrap();
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !collection) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load CMS collection.
        </Alert>
      </Box>
    );
  }

  const fields =
    collection.fields || [];

  const entries =
    collection.entries || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        fontWeight={700}
        mb={1}
      >
        {collection.name}
      </Typography>

      <Typography
        color="text.secondary"
        mb={3}
      >
        slug: {collection.slug}
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            mb={2}
          >
            Template page
          </Typography>

          <TextField
            select
            label="Template page"
            fullWidth
            value={collection.templatePageId ?? ""}
            onChange={async (event) => {
              if (!siteId) {
                return;
              }

              const value = event.target.value;

              try {
                await updateCollection({
                  siteId,
                  collectionId: collection.id,
                  body: {
                    templatePageId:
                      value === ""
                        ? null
                        : Number(value)
                  }
                }).unwrap();

                console.log(
                  "TEMPLATE_PAGE_UPDATED"
                );
              } catch (error) {
                console.error(
                  "TEMPLATE_PAGE_UPDATE_FAILED",
                  error
                );
              }
            }}
          >
            <MenuItem value="">
              None
            </MenuItem>

            {pages.map((page) => (
              <MenuItem
                key={page.id}
                value={page.id}
              >
                {page.title} — /{page.slug}
              </MenuItem>
            ))}
          </TextField>

          <Typography
            mt={1}
            fontSize={13}
            color="text.secondary"
          >
            This page design will be reused for every published entry in this collection.
          </Typography>
        </CardContent>
      </Card>

      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              mb={2}
            >
              Add field
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Field name"
                value={fieldName}
                onChange={(event) =>
                  setFieldName(event.target.value)
                }
                placeholder="Title, Description, Image..."
                fullWidth
              />

              <TextField
                select
                label="Field type"
                value={fieldType}
                onChange={(event) =>
                  setFieldType(
                    event.target.value as CmsFieldType
                  )
                }
                fullWidth
              >
                {fieldTypes.map((type) => (
                  <MenuItem
                    key={type}
                    value={type}
                  >
                    {type}
                  </MenuItem>
                ))}
              </TextField>

              {fieldType === "select" && (
                <TextField
                  label="Options"
                  placeholder="Basic, Premium, Enterprise"
                  value={selectOptionsText}
                  onChange={(event) =>
                    setSelectOptionsText(event.target.value)
                  }
                  helperText="Separate options with commas"
                  fullWidth
                />
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={fieldRequired}
                    onChange={(event) =>
                      setFieldRequired(
                        event.target.checked
                      )
                    }
                  />
                }
                label="Required field"
              />

              <Button
                variant="contained"
                disabled={
                  isCreatingField ||
                  !fieldName.trim() ||
                  !collection?.id ||
                  (
                    fieldType === "select" &&
                    !selectOptionsText
                      .split(",")
                      .some((option) => option.trim())
                  )
                }
                onClick={handleCreateField}
              >
                {isCreatingField
                  ? "Creating..."
                  : "Create field"}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography
              variant="h6"
              mb={2}
            >
              Fields
            </Typography>

            <Stack spacing={1}>
              {fields.map((field) => (
                <Box
                  key={field.id}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={2}
                  >
                    <Box>
                      <Typography fontWeight={700}>
                        {field.name}
                      </Typography>

                      <Typography
                        fontSize={13}
                        color="text.secondary"
                      >
                        key: {field.key} • type: {field.type}
                        {field.required ? " • required" : ""}
                        {field.type === "select" && field.settings?.options && (
                          ` • options: ${field.settings.options.join(", ")}`
                        )}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          setEditingField({
                            ...field,
                            settings: field.settings || {}
                          })
                        }
                      >
                        Edit
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={isDeletingField}
                        onClick={() =>
                          handleDeleteField(field)
                        }
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              ))}

              {!fields.length && (
                <Typography color="text.secondary">
                  No fields yet.
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography
              variant="h6"
              mb={2}
            >
              Create entry
            </Typography>

            {fields.length === 0 ? (
              <Alert severity="info">
                Create fields first before adding entries.
              </Alert>
            ) : (
              <Stack spacing={2}>
                <TextField
                  label="Slug"
                  value={entrySlug}
                  onChange={(event) => {
                    setEntrySlug(
                      event.target.value
                    );
                    setEntrySlugError("");
                  }}
                  helperText={
                    entrySlugError ||
                    "Optional. Used in the public URL for this entry."
                  }
                  error={Boolean(entrySlugError)}
                  fullWidth
                  inputProps={{
                    maxLength: 160
                  }}
                />

                {fields.map((field) => {
                  if (field.type === "boolean") {
                    return (
                      <FormControlLabel
                        key={field.id}
                        control={
                          <Switch
                            checked={
                              Boolean(entryData[field.key])
                            }
                            onChange={(event) =>
                              setEntryData((prev) => ({
                                ...prev,
                                [field.key]:
                                  event.target.checked
                              }))
                            }
                          />
                        }
                        label={field.name}
                      />
                    );
                  }

                  if (field.type === "select") {
                    return (
                      <TextField
                        key={field.id}
                        select
                        label={field.name}
                        value={entryData[field.key] || ""}
                        onChange={(event) =>
                          setEntryData((prev) => ({
                            ...prev,
                            [field.key]: event.target.value
                          }))
                        }
                        fullWidth
                        required={field.required}
                        error={
                          field.required &&
                          !entryData[field.key]
                        }
                        helperText={
                          field.required &&
                          !entryData[field.key]
                            ? "Required"
                            : ""
                        }
                      >
                        {(field.settings?.options || []).map((option: string) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    );
                  }

                  return (
                    <TextField
                      key={field.id}
                      label={field.name}
                      type={
                        field.type === "number"
                          ? "number"
                          : field.type === "date"
                            ? "date"
                            : "text"
                      }
                      value={
                        entryData[field.key] || ""
                      }
                      onChange={(event) =>
                        setEntryData((prev) => ({
                          ...prev,
                          [field.key]:
                            field.type === "number"
                              ? event.target.value === ""
                                ? ""
                                : Number(event.target.value)
                              : event.target.value
                        }))
                      }
                      fullWidth
                      multiline={
                        field.type === "textarea"
                      }
                      minRows={
                        field.type === "textarea"
                          ? 3
                          : undefined
                      }
                      InputLabelProps={
                        field.type === "date"
                          ? { shrink: true }
                          : undefined
                      }
                      required={field.required}
                      error={
                        field.required &&
                        !entryData[field.key]
                      }
                      helperText={
                        field.required &&
                        !entryData[field.key]
                          ? "Required"
                          : ""
                      }
                    />
                  );
                })}

                <Button
                  variant="contained"
                  disabled={isCreatingEntry || !collection?.id}
                  onClick={handleCreateEntry}
                >
                  {isCreatingEntry
                    ? "Creating..."
                    : "Create entry"}
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography
              variant="h6"
              mb={2}
            >
              Entries
            </Typography>

            <Stack spacing={2}>
              {entries.map((entry) => {
                const isEditing =
                  editingEntryId === entry.id;

                return (
                  <Box
                    key={entry.id}
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                    >
                      <Box>
                        <Typography fontWeight={700}>
                          Entry #{entry.id}
                        </Typography>

                        <Typography
                          fontSize={13}
                          color={
                            entry.status === "published"
                              ? "success.main"
                              : "text.secondary"
                          }
                        >
                          status: {entry.status}
                        </Typography>

                        <Typography
                          fontSize={13}
                          color="text.secondary"
                        >
                          slug: {entry.slug}
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={1}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            handleToggleEntryStatus(entry)
                          }
                          disabled={isUpdatingEntry}
                        >
                          {entry.status === "published"
                            ? "Move to draft"
                            : "Publish"}
                        </Button>

                        {!isEditing && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              handleStartEditEntry(entry)
                            }
                          >
                            Edit
                          </Button>
                        )}

                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() =>
                            handleDeleteEntry(entry)
                          }
                          disabled={isDeletingEntry}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Stack>

                    {isEditing ? (
                      <Stack spacing={2}>
                        <TextField
                          label="Slug"
                          value={editEntrySlug}
                          onChange={(event) => {
                            setEditEntrySlug(
                              event.target.value
                            );
                            setEditEntrySlugError("");
                          }}
                          helperText={
                            editEntrySlugError ||
                            "Used in the public URL for this entry."
                          }
                          error={Boolean(
                            editEntrySlugError
                          )}
                          fullWidth
                          inputProps={{
                            maxLength: 160
                          }}
                        />

                        {fields.map((field) => {
                          if (field.type === "boolean") {
                            return (
                              <FormControlLabel
                                key={field.id}
                                control={
                                  <Switch
                                    checked={
                                      Boolean(
                                        editEntryData[field.key]
                                      )
                                    }
                                    onChange={(event) =>
                                      setEditEntryData((prev) => ({
                                        ...prev,
                                        [field.key]:
                                          event.target.checked
                                      }))
                                    }
                                  />
                                }
                                label={field.name}
                              />
                            );
                          }

                          if (field.type === "select") {
                            return (
                              <TextField
                                key={field.id}
                                select
                                label={field.name}
                                value={editEntryData[field.key] || ""}
                                onChange={(event) =>
                                  setEditEntryData((prev) => ({
                                    ...prev,
                                    [field.key]: event.target.value
                                  }))
                                }
                                fullWidth
                                required={field.required}
                                error={
                                  field.required &&
                                  !editEntryData[field.key]
                                }
                                helperText={
                                  field.required &&
                                  !editEntryData[field.key]
                                    ? "Required"
                                    : ""
                                }
                              >
                                {(field.settings?.options || []).map((option: string) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            );
                          }

                          return (
                            <TextField
                              key={field.id}
                              label={field.name}
                              type={
                                field.type === "number"
                                  ? "number"
                                  : field.type === "date"
                                    ? "date"
                                    : "text"
                              }
                              value={
                                editEntryData[field.key] || ""
                              }
                              onChange={(event) =>
                                setEditEntryData((prev) => ({
                                  ...prev,
                                  [field.key]:
                                    field.type === "number"
                                      ? event.target.value === ""
                                        ? ""
                                        : Number(event.target.value)
                                      : event.target.value
                                }))
                              }
                              fullWidth
                              multiline={
                                field.type === "textarea"
                              }
                              minRows={
                                field.type === "textarea"
                                  ? 3
                                  : undefined
                              }
                              InputLabelProps={
                                field.type === "date"
                                  ? { shrink: true }
                                  : undefined
                              }
                              required={field.required}
                              error={
                                field.required &&
                                !editEntryData[field.key]
                              }
                              helperText={
                                field.required &&
                                !editEntryData[field.key]
                                  ? "Required"
                                  : ""
                              }
                            />
                          );
                        })}

                        <Stack
                          direction="row"
                          spacing={1}
                        >
                          <Button
                            variant="contained"
                            onClick={() =>
                              handleUpdateEntry(entry)
                            }
                            disabled={isUpdatingEntry}
                          >
                            Save changes
                          </Button>

                          <Button
                            variant="outlined"
                            onClick={
                              handleCancelEditEntry
                            }
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Stack>
                    ) : (
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: "pre-wrap"
                        }}
                      >
                        {JSON.stringify(
                          entry.data,
                          null,
                          2
                        )}
                      </pre>
                    )}
                  </Box>
                );
              })}

              {!entries.length && (
                <Typography color="text.secondary">
                  No entries yet.
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography
              variant="h6"
              mb={2}
            >
              Public preview
            </Typography>

            <PublicCmsEntriesPreview
              siteId={siteId || ""}
              slug={collection.slug}
            />
          </CardContent>
        </Card>
      </Stack>

      <Dialog
        open={Boolean(editingField)}
        onClose={() => setEditingField(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Edit field
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Field name"
              value={editingField?.name || ""}
              onChange={(event) =>
                setEditingField((current) =>
                  current
                    ? {
                        ...current,
                        name: event.target.value
                      }
                    : current
                )
              }
              fullWidth
            />

            <TextField
              label="Field key"
              value={editingField?.key || ""}
              onChange={(event) =>
                setEditingField((current) =>
                  current
                    ? {
                        ...current,
                        key: event.target.value
                      }
                    : current
                )
              }
              fullWidth
            />

            <TextField
              select
              label="Field type"
              value={editingField?.type || "text"}
              onChange={(event) =>
                setEditingField((current) =>
                  current
                    ? {
                        ...current,
                        type: event.target.value as CmsFieldType
                      }
                    : current
                )
              }
              fullWidth
            >
              {fieldTypes.map((type) => (
                <MenuItem
                  key={type}
                  value={type}
                >
                  {type}
                </MenuItem>
              ))}
            </TextField>

            {editingField?.type === "select" && (
              <TextField
                label="Options"
                value={
                  Array.isArray(editingField.settings?.options)
                    ? editingField.settings.options.join(", ")
                    : ""
                }
                onChange={(event) =>
                  setEditingField((current) =>
                    current
                      ? {
                          ...current,
                          settings: {
                            ...(current.settings || {}),
                            options: event.target.value
                              .split(",")
                              .map((option) => option.trim())
                              .filter(Boolean)
                          }
                        }
                      : current
                  )
                }
                helperText="Separate options with commas"
                fullWidth
              />
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(
                    editingField?.required
                  )}
                  onChange={(event) =>
                    setEditingField((current) =>
                      current
                        ? {
                            ...current,
                            required: event.target.checked
                          }
                        : current
                    )
                  }
                />
              }
              label="Required field"
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setEditingField(null)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleUpdateField}
            disabled={
              isUpdatingField ||
              !editingField?.name.trim() ||
              !editingField?.key.trim() ||
              (
                editingField?.type === "select" &&
                (
                !Array.isArray(editingField.settings?.options) ||
                (editingField.settings?.options || []).length === 0
                )
              )
            }
          >
            {isUpdatingField
              ? "Saving..."
              : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CmsCollectionDetailsPage;
