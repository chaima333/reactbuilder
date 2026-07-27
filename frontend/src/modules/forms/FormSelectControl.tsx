import {
  MenuItem,
  TextField
} from "@mui/material";

import {
  useParams
} from "react-router-dom";

import {
  useGetFormsQuery
} from "../../redux/services/forms.api";

type Props = {
  label: string;
  value: any;
  error?: string | null;
  onChange: (value: any) => void;
};

export const FormSelectControl = ({
  label,
  value,
  error,
  onChange
}: Props) => {
  const {
    siteId
  } = useParams();

  const {
    data: forms = [],
    isLoading,
    isError
  } = useGetFormsQuery(
    siteId || "",
    {
      skip: !siteId
    }
  );

  const activeForms =
    forms.filter(
      (form) =>
        form.isActive !== false
    );

  return (
    <TextField
      select
      fullWidth
      size="small"
      label={label}
      value={
        value === undefined ||
        value === null
          ? ""
          : String(value)
      }
      error={!!error || isError}
      helperText={
        error ||
        (
          isError
            ? "Failed to load forms"
            : "Choose the form to display"
        )
      }
      disabled={
        isLoading ||
        !siteId
      }
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
    >
      <MenuItem value="">
        Select form
      </MenuItem>

      {activeForms.map((form) => (
        <MenuItem
          key={form.id}
          value={String(form.id)}
        >
          {form.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default FormSelectControl;