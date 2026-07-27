import {
  useState
} from "react";

import {
  useNavigate,
  useParams
} from "react-router-dom";

import {
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
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";

import {
  SiteForm,
  useCreateFormMutation,
  useDeleteFormMutation,
  useGetFormsQuery,
  useUpdateFormMutation
} from "../../redux/services/forms.api";

export const FormsPage = () => {
  const {
    siteId
  } = useParams();

  const navigate =
    useNavigate();

  const [name, setName] =
    useState("");

  const [editingForm, setEditingForm] =
    useState<SiteForm | null>(null);

  const {
    data: forms = [],
    isLoading
  } = useGetFormsQuery(
    siteId || "",
    {
      skip: !siteId
    }
  );

  const [
    createForm,
    {
      isLoading:
        isCreating
    }
  ] = useCreateFormMutation();

  const [
    updateForm,
    {
      isLoading:
        isUpdating
    }
  ] = useUpdateFormMutation();

  const [
    deleteForm,
    {
      isLoading:
        isDeleting
    }
  ] = useDeleteFormMutation();

  const handleCreate = async () => {
    if (
      !siteId ||
      !name.trim()
    ) {
      return;
    }

    const created =
      await createForm({
        siteId,
        body: {
          name: name.trim(),
          schema: [],
          settings: {},
          isActive: true
        }
      }).unwrap();

    setName("");

    navigate(
      `/sites/${siteId}/forms/${created.id}`
    );
  };

  const handleUpdate = async () => {
    if (
      !siteId ||
      !editingForm ||
      !editingForm.name.trim() ||
      !editingForm.slug.trim()
    ) {
      return;
    }

    await updateForm({
      siteId,
      formId: editingForm.id,
      body: {
        name:
          editingForm.name.trim(),

        slug:
          editingForm.slug.trim(),

        isActive:
          editingForm.isActive
      }
    }).unwrap();

    setEditingForm(null);
  };

  const handleDelete = async (
    form: SiteForm
  ) => {
    if (!siteId) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete form "${form.name}" and its submissions?`
      );

    if (!confirmed) {
      return;
    }

    await deleteForm({
      siteId,
      formId: form.id
    }).unwrap();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        fontWeight={700}
        mb={3}
      >
        Forms
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            mb={2}
          >
            Create form
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Form name"
              value={name}
              placeholder="Contact form, Newsletter..."
              fullWidth
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
            />

            <Button
              variant="contained"
              disabled={
                isCreating ||
                !name.trim()
              }
              onClick={handleCreate}
            >
              {isCreating
                ? "Creating..."
                : "Create form"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {isLoading
        ? (
          <CircularProgress />
        )
        : (
          <Stack spacing={2}>
            {forms.map((form) => (
              <Card key={form.id}>
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
                        variant="h6"
                        fontWeight={700}
                      >
                        {form.name}
                      </Typography>

                      <Typography
                        color="text.secondary"
                      >
                        slug: {form.slug}
                      </Typography>

                      <Typography
                        color={
                          form.isActive
                            ? "success.main"
                            : "text.secondary"
                        }
                        fontSize={13}
                        mt={1}
                      >
                        {form.isActive
                          ? "Active"
                          : "Inactive"}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        fontSize={13}
                      >
                        {form.schema?.length || 0}
                        {" fields"}
                      </Typography>
                    </Box>

                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row"
                      }}
                      spacing={1}
                    >
                      <Button
                        variant="contained"
                        onClick={() =>
                          navigate(
                            `/sites/${siteId}/forms/${form.id}`
                          )
                        }
                      >
                        Manage fields
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={() =>
                          setEditingForm({
                            ...form
                          })
                        }
                      >
                        Edit
                      </Button>

                      <Button
                        color="error"
                        variant="outlined"
                        disabled={isDeleting}
                        onClick={() =>
                          handleDelete(form)
                        }
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}

            {!forms.length && (
              <Card>
                <CardContent>
                  <Typography
                    color="text.secondary"
                  >
                    No forms yet.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Stack>
        )}

      <Dialog
        open={!!editingForm}
        onClose={() =>
          setEditingForm(null)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Edit form
        </DialogTitle>

        <DialogContent>
          {editingForm && (
            <Stack
              spacing={2}
              mt={1}
            >
              <TextField
                label="Name"
                value={
                  editingForm.name
                }
                onChange={(event) =>
                  setEditingForm({
                    ...editingForm,
                    name:
                      event.target.value
                  })
                }
              />

              <TextField
                label="Slug"
                value={
                  editingForm.slug
                }
                onChange={(event) =>
                  setEditingForm({
                    ...editingForm,
                    slug:
                      event.target.value
                  })
                }
              />

              <FormControlLabel
                label="Active"
                control={
                  <Switch
                    checked={
                      editingForm.isActive
                    }
                    onChange={(
                      event
                    ) =>
                      setEditingForm({
                        ...editingForm,
                        isActive:
                          event.target.checked
                      })
                    }
                  />
                }
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setEditingForm(null)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={isUpdating}
            onClick={handleUpdate}
          >
            {isUpdating
              ? "Saving..."
              : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormsPage;