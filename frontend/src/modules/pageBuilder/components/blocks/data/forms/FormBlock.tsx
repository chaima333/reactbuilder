import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from "@mui/material";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useParams
} from "react-router-dom";

import type {
  CSSProperties,
  FormEvent,
  MouseEvent
} from "react";

import {
  useGetPublicFormByIdQuery,
  useSubmitPublicFormMutation,
  type FormSchemaField
} from "../../../../../../redux/services/forms.api";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

import {
  useRuntime
} from "../../../../runtime/context/RuntimeProvider";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

const getFieldKey = (
  field: FormSchemaField
) =>
  String(
    field.key ||
    field.name ||
    ""
  ).trim();

const getInitialValue = (
  field: FormSchemaField
) =>
  field.type === "checkbox"
    ? false
    : "";

const buildInitialValues = (
  schema: FormSchemaField[]
) =>
  schema.reduce<Record<string, unknown>>(
    (
      acc,
      field
    ) => {
      const key =
        getFieldKey(field);

      if (key) {
        acc[key] =
          getInitialValue(field);
      }

      return acc;
    },
    {}
  );

const normalizeSubmitValues = (
  schema: FormSchemaField[],
  values: Record<string, unknown>
) =>
  schema.reduce<Record<string, unknown>>(
    (
      acc,
      field
    ) => {
      const key =
        getFieldKey(field);

      if (!key) {
        return acc;
      }

      const value =
        values[key];

      acc[key] =
        field.type === "number" &&
        value !== "" &&
        value !== null &&
        value !== undefined
          ? Number(value)
          : value;

      return acc;
    },
    {}
  );

const parsePositiveNumber = (
  value: unknown
) => {
  const parsed =
    Number(value);

  return Number.isFinite(parsed) &&
    parsed > 0
    ? parsed
    : null;
};

export const FormBlock = ({
  block,
  data,
  children,
  device = "desktop"
}: any) => {
  const params =
    useParams();

  const runtime =
    useRuntime();

  const sourceData =
    block?.data ||
    data ||
    {};

  const props =
    sourceData.props || {};

  const renderMode =
  props.renderMode === "imported"
    ? "imported"
    : "schema";

  const resolvedStyle =
    useResolvedStyle(
      sourceData.style || {},
      device as Device
    ) as CSSProperties;

  const formId =
    String(
      props.formId || ""
    ).trim();

  const siteId =
    String(
      runtime.siteId ||
      params.siteId ||
      ""
    ).trim();

  const pageId =
    parsePositiveNumber(
      runtime.pageId ||
      params.pageId
    );

  const title =
    props.title ||
    "Contact us";

  const submitText =
    props.submitText ||
    "Send";

  const successMessage =
    props.successMessage ||
    "Your message has been sent successfully.";

  const errorMessage =
    props.errorMessage ||
    "Failed to send your message.";

  const isPublicRoute =
    typeof window !== "undefined" &&
    (
      window.location.pathname.startsWith("/site/") ||
      window.location.pathname.startsWith("/p/")
    );

  const canSubmit =
  isPublicRoute;

  const {
    data: form,
    isLoading,
    isError
  } = useGetPublicFormByIdQuery(
    {
      siteId,
      formId
    },
    {
      skip:
        !siteId ||
        !formId
    }
  );

  const [
    submitPublicForm,
    {
      isLoading:
        isSubmitting
    }
  ] = useSubmitPublicFormMutation();

  const schema =
    useMemo(
      () =>
        Array.isArray(form?.schema)
          ? form.schema
          : [],
      [form?.schema]
    );

  const [values, setValues] =
    useState<Record<string, unknown>>({});

  const [status, setStatus] =
    useState<{
      type: "success" | "error";
      message: string;
    } | null>(null);

  useEffect(
    () => {
      setValues(
        buildInitialValues(schema)
      );
      setStatus(null);
    },
    [schema]
  );

  const updateValue = (
    key: string,
    value: unknown
  ) => {
    setValues((current) => ({
      ...current,
      [key]: value
    }));
  };

  const readImportedValues = (
  formElement: HTMLFormElement
) => {
  const normalizeLookupValue = (
    value: unknown
  ) =>
    String(value || "")
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        ""
      );

  const controls =
    Array.from(
      formElement.querySelectorAll<
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement
      >(
        "input, select, textarea"
      )
    ).filter(
      control =>
        !control.disabled &&
        !(
          control instanceof
            HTMLInputElement &&
          (
            control.type ===
              "submit" ||
            control.type ===
              "button"
          )
        )
    );

  const usedControls =
    new Set<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >();

  const isCompatibleControl = (
    field: FormSchemaField,
    control:
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
  ) => {
    if (
      field.type === "select"
    ) {
      return (
        control instanceof
        HTMLSelectElement
      );
    }

    if (
      field.type === "textarea"
    ) {
      return (
        control instanceof
        HTMLTextAreaElement
      );
    }

    if (
      field.type === "checkbox"
    ) {
      return (
        control instanceof
          HTMLInputElement &&
        control.type === "checkbox"
      );
    }

    if (
      field.type === "radio"
    ) {
      return (
        control instanceof
          HTMLInputElement &&
        control.type === "radio"
      );
    }

    if (
      field.type === "email"
    ) {
      return (
        control instanceof
          HTMLInputElement &&
        control.type === "email"
      );
    }

    if (
      field.type === "tel"
    ) {
      return (
        control instanceof
          HTMLInputElement &&
        control.type === "tel"
      );
    }

    if (
      field.type === "number"
    ) {
      return (
        control instanceof
          HTMLInputElement &&
        control.type === "number"
      );
    }

    return (
      control instanceof
        HTMLInputElement &&
      ![
        "checkbox",
        "radio",
        "submit",
        "button"
      ].includes(
        control.type
      )
    );
  };

  return schema.reduce<
    Record<string, unknown>
  >(
    (
      result,
      field
    ) => {
      const key =
        getFieldKey(field);

      if (!key) {
        return result;
      }

      const fieldTokens =
        [
          key,
          field.name,
          field.label,
          field.placeholder
        ]
          .map(
            normalizeLookupValue
          )
          .filter(Boolean);

      const exactControl =
        controls.find(
          control => {
            if (
              usedControls.has(
                control
              )
            ) {
              return false;
            }

            const controlTokens =
              [
                control.name,
                control.id,
                control.getAttribute(
                  "aria-label"
                ),
                control.getAttribute(
                  "placeholder"
                )
              ]
                .map(
                  normalizeLookupValue
                )
                .filter(Boolean);

            return controlTokens.some(
              token =>
                fieldTokens.includes(
                  token
                )
            );
          }
        );

      const compatibleControl =
        controls.find(
          control =>
            !usedControls.has(
              control
            ) &&
            isCompatibleControl(
              field,
              control
            )
        );

      const control =
        exactControl ||
        compatibleControl;

      if (!control) {
        result[key] = "";
        return result;
      }

      usedControls.add(
        control
      );

      if (
        control instanceof
          HTMLInputElement &&
        control.type === "checkbox"
      ) {
        result[key] =
          control.checked;

        return result;
      }

      if (
        control instanceof
          HTMLInputElement &&
        control.type === "radio"
      ) {
        result[key] =
          control.checked
            ? control.value
            : "";

        return result;
      }

      result[key] =
        control.value;

      return result;
    },
    {}
  );
};

  const handleSubmit = async (
    event:
      FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const formElement =
      event.currentTarget;

    if (
      !canSubmit ||
      !siteId ||
      !formId
    ) {
      setStatus({
        type: "error",
        message:
          !formId
            ? "Select a form from the inspector."
            : "Form submission is disabled in the editor."
      });

      return;
    }

    const submitValues =
      renderMode === "imported"
        ? readImportedValues(
            formElement
          )
        : normalizeSubmitValues(
            schema,
            values
          );

    try {
      await submitPublicForm({
        siteId,
        formId,
        body: {
          values:
            submitValues,
          pageId
        }
      }).unwrap();

      if (
        renderMode === "imported"
      ) {
        formElement.reset();
      } else {
        setValues(
          buildInitialValues(
            schema
          )
        );
      }

      setStatus({
        type: "success",
        message:
          successMessage
      });
    } catch (error: any) {
      setStatus({
        type: "error",
        message:
          error?.data?.message ||
          errorMessage
      });
    }
  };

  const handleImportedClick = (
    event: MouseEvent<HTMLFormElement>
  ) => {
    const target =
      event.target as HTMLElement;

    const actionElement =
      target.closest(
        "button, a"
      ) as HTMLElement | null;

    if (!actionElement) {
      return;
    }

    const text =
      String(
        actionElement.textContent || ""
      )
        .trim()
        .toLowerCase();

    const looksLikeSubmit =
      /envoyer|send|submit|message/.test(
        text
      );

    if (!looksLikeSubmit) {
      return;
    }

    event.preventDefault();

    event.currentTarget
      .requestSubmit();
  };

  const renderField = (
    field: FormSchemaField
  ) => {
    const key =
      getFieldKey(field);

    if (!key) {
      return null;
    }

    const label =
      field.label ||
      field.name ||
      key;

    const commonProps = {
      key,
      label,
      name: key,
      required:
        !!field.required,
      disabled:
        isSubmitting,
      fullWidth: true,
      value:
        values[key] ?? "",
      onChange: (
        event: React.ChangeEvent<HTMLInputElement>
      ) =>
        updateValue(
          key,
          event.target.value
        )
    };

    if (
      field.type === "textarea"
    ) {
      return (
        <TextField
          {...commonProps}
          placeholder={
            field.placeholder
          }
          multiline
          minRows={4}
        />
      );
    }

    if (
      field.type === "select"
    ) {
      return (
        <TextField
          {...commonProps}
          select
        >
          <MenuItem value="">
            Select
          </MenuItem>

          {(field.options || []).map(
            (option) => (
              <MenuItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </MenuItem>
            )
          )}
        </TextField>
      );
    }

    if (
      field.type === "checkbox"
    ) {
      return (
        <FormControlLabel
          key={key}
          control={
            <Checkbox
              checked={
                values[key] === true
              }
              disabled={
                isSubmitting
              }
              required={
                !!field.required
              }
              onChange={(event) =>
                updateValue(
                  key,
                  event.target.checked
                )
              }
            />
          }
          label={label}
        />
      );
    }

    if (
      field.type === "radio"
    ) {
      return (
        <FormControl
          key={key}
          required={
            !!field.required
          }
          disabled={
            isSubmitting
          }
        >
          <FormLabel>
            {label}
          </FormLabel>

          <RadioGroup
            name={key}
            value={
              values[key] ?? ""
            }
            onChange={(event) =>
              updateValue(
                key,
                event.target.value
              )
            }
          >
            {(field.options || []).map(
              (option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              )
            )}
          </RadioGroup>
        </FormControl>
      );
    }

    return (
      <TextField
        {...commonProps}
        placeholder={
          field.placeholder
        }
        type={
          field.type === "number" ||
          field.type === "tel" ||
          field.type === "date" ||
          field.type === "email"
            ? field.type
            : "text"
        }
      />
    );
  };

  if (
    renderMode === "imported"
  ) {
    return (
      <Box
        component="form"
        onSubmit={handleSubmit}
        onClickCapture={
          handleImportedClick
        }
        sx={{
          ...resolvedStyle
        }}
      >
        {children}

        {status && (
          <Alert
            severity={
              status.type
            }
            sx={{
              marginTop: "16px"
            }}
          >
            {status.message}
          </Alert>
        )}

        {!formId && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              marginTop: "12px"
            }}
          >
            Select a backend form from the inspector.
          </Typography>
        )}
      </Box>
    );
  }

  if (!formId) {
    return (
      <Box
        sx={{
          ...resolvedStyle,
          border:
            "1px dashed rgba(15, 23, 42, 0.25)",
          borderRadius: "16px",
          textAlign: "center"
        }}
      >
        <Typography
          fontWeight={700}
          mb={1}
        >
          Form Block
        </Typography>

        <Typography
          color="text.secondary"
        >
          Select a form from the inspector.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        ...resolvedStyle,
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}
    >
      <Typography
        variant="h5"
        fontWeight={800}
      >
        {title}
      </Typography>

      {isLoading && (
        <Box>
          <CircularProgress size={22} />
        </Box>
      )}

      {isError && (
        <Alert severity="error">
          Failed to load form.
        </Alert>
      )}

      {!isLoading &&
        !isError &&
        !schema.length && (
          <Alert severity="info">
            This form has no fields yet.
          </Alert>
        )}

      {schema.map(renderField)}

      {status && (
        <Alert severity={status.type}>
          {status.message}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        disabled={
          isSubmitting ||
          isLoading ||
          isError ||
          !schema.length ||
          !canSubmit
        }
        sx={{
          alignSelf: "flex-start"
        }}
      >
        {isSubmitting
          ? "Sending..."
          : submitText}
      </Button>

      {!canSubmit && (
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Submissions are disabled while editing.
        </Typography>
      )}
    </Box>
  );
};

export default FormBlock;