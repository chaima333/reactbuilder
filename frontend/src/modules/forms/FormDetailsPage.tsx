import {
  useMemo,
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
  Chip,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";

import {
  FormFieldType,
  FormSchemaField,
  FormSubmissionStatus,
  useDeleteFormSubmissionMutation,
  useGetFormByIdQuery,
  useGetFormSubmissionsQuery,
  useUpdateFormMutation,
  useUpdateFormSubmissionStatusMutation
} from "../../redux/services/forms.api";

const fieldTypes: FormFieldType[] = [
  "text",
  "email",
  "textarea",
  "number",
  "tel",
  "select",
  "checkbox",
  "radio",
  "date"
];

const createFieldKey = (
  value: string
) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const FormDetailsPage = () => {
  const {
    siteId,
    formId
  } = useParams();

  const {
    data: form,
    isLoading,
    error
  } = useGetFormByIdQuery(
    {
      siteId: siteId || "",
      formId: formId || ""
    },
    {
      skip:
        !siteId ||
        !formId
    }
  );

  const {
    data: submissions = [],
    isLoading:
      isLoadingSubmissions
  } = useGetFormSubmissionsQuery(
    {
      siteId: siteId || "",
      formId: formId || ""
    },
    {
      skip:
        !siteId ||
        !formId
    }
  );

  const [
    updateForm,
    {
      isLoading:
        isSaving
    }
  ] = useUpdateFormMutation();

  const [
  updateSubmissionStatus,
  {
    isLoading:
      isUpdatingSubmission
  }
] =
  useUpdateFormSubmissionStatusMutation();

const [
  deleteSubmission,
  {
    isLoading:
      isDeletingSubmission
  }
] =
  useDeleteFormSubmissionMutation();

  const [fieldLabel, setFieldLabel] =
    useState("");

  const [fieldKey, setFieldKey] =
    useState("");

  const [fieldType, setFieldType] =
    useState<FormFieldType>(
      "text"
    );

  const [
    fieldRequired,
    setFieldRequired
  ] = useState(false);

  const [
    placeholder,
    setPlaceholder
  ] = useState("");

  const [
    optionsText,
    setOptionsText
  ] = useState("");

  const schema =
    useMemo(
      () =>
        Array.isArray(form?.schema)
          ? form.schema
          : [],
      [form?.schema]
    );

  const saveSchema = async (
    nextSchema:
      FormSchemaField[]
  ) => {
    if (
      !siteId ||
      !form
    ) {
      return;
    }

    await updateForm({
      siteId,
      formId: form.id,
      body: {
        schema:
          nextSchema
      }
    }).unwrap();
  };

  const handleCreateField =
    async () => {
      const label =
        fieldLabel.trim();

      const key =
        createFieldKey(
          fieldKey || label
        );

      if (
        !label ||
        !key
      ) {
        return;
      }

      const duplicate =
        schema.some(
          (field) =>
            field.key === key
        );

      if (duplicate) {
        window.alert(
          `Field key "${key}" already exists.`
        );

        return;
      }

      const options =
        optionsText
          .split(",")
          .map((option) =>
            option.trim()
          )
          .filter(Boolean)
          .map((option) => ({
            label: option,
            value:
              createFieldKey(option)
          }));

      if (
        (
          fieldType === "select" ||
          fieldType === "radio"
        ) &&
        !options.length
      ) {
        window.alert(
          "Add at least one option."
        );

        return;
      }

      const nextField:
        FormSchemaField = {
          key,
          name: label,
          label,
          type: fieldType,
          required:
            fieldRequired,

          placeholder:
            placeholder.trim(),

          options:
            fieldType ===
              "select" ||
            fieldType ===
              "radio"
              ? options
              : undefined
        };

      await saveSchema([
        ...schema,
        nextField
      ]);

      setFieldLabel("");
      setFieldKey("");
      setFieldType("text");
      setFieldRequired(false);
      setPlaceholder("");
      setOptionsText("");
    };

  const handleDeleteField =
    async (
      fieldKeyToDelete: string
    ) => {
      const confirmed =
        window.confirm(
          `Delete field "${fieldKeyToDelete}"?`
        );

      if (!confirmed) {
        return;
      }

      await saveSchema(
        schema.filter(
          (field) =>
            field.key !==
            fieldKeyToDelete
        )
      );
    };

  const handleToggleRequired =
    async (
      fieldKeyToUpdate: string
    ) => {
      await saveSchema(
        schema.map((field) =>
          field.key ===
          fieldKeyToUpdate
            ? {
                ...field,
                required:
                  !field.required
              }
            : field
        )
      );
    };

  const handleUpdateSubmissionStatus =
  async (
    submissionId: number,
    status:
      FormSubmissionStatus
  ) => {
    if (
      !siteId ||
      !formId
    ) {
      return;
    }

    try {
      await updateSubmissionStatus({
        siteId,
        formId,
        submissionId,
        status
      }).unwrap();
    } catch (error) {
      console.error(
        "UPDATE_SUBMISSION_STATUS_ERROR",
        error
      );

      window.alert(
        "Failed to update submission status."
      );
    }
  };

const handleDeleteSubmission =
  async (
    submissionId: number
  ) => {
    if (
      !siteId ||
      !formId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this submission permanently?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSubmission({
        siteId,
        formId,
        submissionId
      }).unwrap();
    } catch (error) {
      console.error(
        "DELETE_SUBMISSION_ERROR",
        error
      );

      window.alert(
        "Failed to delete submission."
      );
    }
  };

const getFieldLabel = (
  key: string
) => {
  const field =
    schema.find(
      (item) =>
        item.key === key
    );

  return (
    field?.label ||
    field?.name ||
    key
  );
};

const formatValue = (
  value: any
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "-";
  }

  if (
    typeof value === "boolean"
  ) {
    return value
      ? "Yes"
      : "No";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (
    typeof value === "object"
  ) {
    return JSON.stringify(
      value
    );
  }

  return String(value);
};

const getStatusColor = (
  status:
    FormSubmissionStatus
):
  | "default"
  | "primary"
  | "success"
  | "error" => {
  switch (status) {
    case "new":
      return "primary";

    case "read":
      return "success";

    case "spam":
      return "error";

    default:
      return "default";
  }
};

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (
    error ||
    !form
  ) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load form.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        fontWeight={700}
      >
        {form.name}
      </Typography>

      <Typography
        color="text.secondary"
        mb={3}
      >
        slug: {form.slug}
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            mb={2}
          >
            Add field
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Field label"
              value={fieldLabel}
              placeholder="Full name"
              onChange={(event) => {
                const value =
                  event.target.value;

                setFieldLabel(
                  value
                );

                if (!fieldKey) {
                  setFieldKey(
                    createFieldKey(
                      value
                    )
                  );
                }
              }}
            />

            <TextField
              label="Field key"
              value={fieldKey}
              placeholder="full_name"
              onChange={(event) =>
                setFieldKey(
                  createFieldKey(
                    event.target.value
                  )
                )
              }
            />

            <TextField
              select
              label="Field type"
              value={fieldType}
              onChange={(event) =>
                setFieldType(
                  event.target
                    .value as
                    FormFieldType
                )
              }
            >
              {fieldTypes.map(
                (type) => (
                  <MenuItem
                    key={type}
                    value={type}
                  >
                    {type}
                  </MenuItem>
                )
              )}
            </TextField>

            <TextField
              label="Placeholder"
              value={placeholder}
              onChange={(event) =>
                setPlaceholder(
                  event.target.value
                )
              }
            />

            {(
              fieldType === "select" ||
              fieldType === "radio"
            ) && (
              <TextField
                label="Options"
                value={optionsText}
                helperText="Separate options with commas"
                placeholder="Sales, Support, Other"
                onChange={(event) =>
                  setOptionsText(
                    event.target.value
                  )
                }
              />
            )}

            <FormControlLabel
              label="Required"
              control={
                <Switch
                  checked={
                    fieldRequired
                  }
                  onChange={(event) =>
                    setFieldRequired(
                      event.target
                        .checked
                    )
                  }
                />
              }
            />

            <Button
              variant="contained"
              disabled={
                isSaving ||
                !fieldLabel.trim()
              }
              onClick={
                handleCreateField
              }
            >
              {isSaving
                ? "Saving..."
                : "Add field"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Typography
        variant="h5"
        fontWeight={700}
        mb={2}
      >
        Fields
      </Typography>

      <Stack spacing={2} mb={4}>
        {schema.map((field) => (
          <Card key={field.key}>
            <CardContent>
              <Stack
                direction={{
                  xs: "column",
                  sm: "row"
                }}
                justifyContent="space-between"
                gap={2}
              >
                <Box>
                  <Typography
                    fontWeight={700}
                  >
                    {field.label ||
                      field.name ||
                      field.key}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    fontSize={13}
                  >
                    {field.key}
                    {" · "}
                    {field.type}
                  </Typography>
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                >
                  <Button
                    variant="outlined"
                    onClick={() =>
                      handleToggleRequired(
                        field.key
                      )
                    }
                  >
                    {field.required
                      ? "Required"
                      : "Optional"}
                  </Button>

                  <Button
                    color="error"
                    variant="outlined"
                    onClick={() =>
                      handleDeleteField(
                        field.key
                      )
                    }
                  >
                    Delete
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}

        {!schema.length && (
          <Alert severity="info">
            This form has no fields yet.
          </Alert>
        )}
      </Stack>

      <Typography
        variant="h5"
        fontWeight={700}
        mb={2}
      >
        Submissions
      </Typography>

      {isLoadingSubmissions
        ? (
          <CircularProgress />
        )
        : (
          <Stack spacing={2}>
            {submissions.map(
  (submission) => (
    <Card
      key={submission.id}
    >
      <CardContent>
        <Stack
          direction={{
            xs: "column",
            sm: "row"
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            sm: "center"
          }}
          gap={1}
          mb={2}
        >
          <Box>
            <Typography
              fontWeight={700}
            >
              Submission #
              {submission.id}
            </Typography>

            <Typography
              color="text.secondary"
              fontSize={13}
            >
              {submission.createdAt ||
                "Unknown date"}
            </Typography>

            {submission.pageId && (
              <Typography
                color="text.secondary"
                fontSize={13}
              >
                Page ID:{" "}
                {submission.pageId}
              </Typography>
            )}
          </Box>

          <Chip
            size="small"
            label={
              submission.status
            }
            color={
              getStatusColor(
                submission.status
              )
            }
            variant="outlined"
          />
        </Stack>

        <Stack
          spacing={0.75}
          mb={2}
        >
          {Object.entries(
            submission.values || {}
          ).map(
            ([
              key,
              value
            ]) => (
              <Typography
                key={key}
              >
                <strong>
                  {getFieldLabel(
                    key
                  )}:
                </strong>{" "}
                {formatValue(
                  value
                )}
              </Typography>
            )
          )}
        </Stack>

        <Stack
          direction={{
            xs: "column",
            sm: "row"
          }}
          spacing={1}
          flexWrap="wrap"
        >
          {submission.status !==
            "read" && (
            <Button
              size="small"
              variant="outlined"
              disabled={
                isUpdatingSubmission
              }
              onClick={() =>
                handleUpdateSubmissionStatus(
                  submission.id,
                  "read"
                )
              }
            >
              Mark as read
            </Button>
          )}

          {submission.status !==
            "archived" && (
            <Button
              size="small"
              variant="outlined"
              disabled={
                isUpdatingSubmission
              }
              onClick={() =>
                handleUpdateSubmissionStatus(
                  submission.id,
                  "archived"
                )
              }
            >
              Archive
            </Button>
          )}

          {submission.status !==
            "spam" && (
            <Button
              size="small"
              variant="outlined"
              color="warning"
              disabled={
                isUpdatingSubmission
              }
              onClick={() =>
                handleUpdateSubmissionStatus(
                  submission.id,
                  "spam"
                )
              }
            >
              Mark as spam
            </Button>
          )}

          <Button
            size="small"
            variant="outlined"
            color="error"
            disabled={
              isDeletingSubmission
            }
            onClick={() =>
              handleDeleteSubmission(
                submission.id
              )
            }
          >
            Delete
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
)}

            {!submissions.length && (
              <Alert severity="info">
                No submissions yet.
              </Alert>
            )}
          </Stack>
        )}
    </Box>
  );
};

export default FormDetailsPage;