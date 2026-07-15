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
  Stack,
  TextField,
  Typography
} from "@mui/material";

import {
  useCreateCmsCollectionMutation,
  useDeleteCmsCollectionMutation,
  useGetCmsCollectionsQuery,
  useUpdateCmsCollectionMutation
} from "../../redux/services/cms.api";

export const CmsCollectionsPage = () => {
  const { siteId } =
    useParams();

  const navigate =
    useNavigate();

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const {
    data: collections = [],
    isLoading
  } = useGetCmsCollectionsQuery(
    siteId || "",
    {
      skip: !siteId
    }
  );

  const [
    createCollection,
    { isLoading: isCreating }
  ] = useCreateCmsCollectionMutation();

  const [editingCollection, setEditingCollection] =
    useState<{
      id: number;
      name: string;
      slug: string;
      description: string;
    } | null>(null);

  const [
    updateCollection,
    { isLoading: isUpdating }
  ] = useUpdateCmsCollectionMutation();

  const [
    deleteCollection,
    { isLoading: isDeleting }
  ] = useDeleteCmsCollectionMutation();

  const handleCreate = async () => {
    if (!siteId || !name.trim()) {
      return;
    }

    await createCollection({
      siteId,
      body: {
        name: name.trim(),
        description: description.trim()
      }
    }).unwrap();

    setName("");
    setDescription("");
  };

  const handleOpenEdit = (collection: any) => {
    setEditingCollection({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description:
        collection.description || ""
    });
  };

  const handleUpdate = async () => {
    if (
      !siteId ||
      !editingCollection ||
      !editingCollection.name.trim() ||
      !editingCollection.slug.trim()
    ) {
      return;
    }

    await updateCollection({
      siteId,
      collectionId:
        editingCollection.id,
      body: {
        name:
          editingCollection.name.trim(),
        slug:
          editingCollection.slug.trim(),
        description:
          editingCollection.description.trim()
      }
    }).unwrap();

    setEditingCollection(null);
  };

  const handleDelete = async (
    collectionId: number,
    collectionName: string
  ) => {
    if (!siteId) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete collection "${collectionName}" and all its fields and entries?`
      );

    if (!confirmed) {
      return;
    }

    await deleteCollection({
      siteId,
      collectionId
    }).unwrap();
  };

  return (
    <Box
      sx={{
        p: 3
      }}
    >
      <Typography
        variant="h4"
        fontWeight={700}
        mb={3}
      >
        CMS Collections
      </Typography>

      <Card
        sx={{
          mb: 3
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            mb={2}
          >
            Create collection
          </Typography>

          <Stack
            spacing={2}
          >
            <TextField
              label="Collection name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Services, Blog, Team..."
              fullWidth
            />

            <TextField
              label="Description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              fullWidth
              multiline
              minRows={2}
            />

            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={
                isCreating ||
                !name.trim()
              }
            >
              {isCreating
                ? "Creating..."
                : "Create collection"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {isLoading
        ? (
          <CircularProgress />
        )
        : (
          <Stack
            spacing={2}
          >
            {collections.map((collection) => (
              <Card
                key={collection.id}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    {collection.name}
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    slug: {collection.slug}
                  </Typography>

                  {collection.description && (
                    <Typography
                      mt={1}
                    >
                      {collection.description}
                    </Typography>
                  )}

                  <Typography
                    mt={1}
                    fontSize={13}
                    color="text.secondary"
                  >
                    Fields: {collection.fields?.length || 0}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    mt={2}
                  >
                    <Button
                      variant="outlined"
                      onClick={() =>
                        navigate(
                          `/sites/${siteId}/cms/collections/${collection.id}`
                        )
                      }
                    >
                      Open
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={() =>
                        handleOpenEdit(collection)
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      disabled={isDeleting}
                      onClick={() =>
                        handleDelete(
                          collection.id,
                          collection.name
                        )
                      }
                    >
                      Delete
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}

            {!collections.length && (
              <Typography
                color="text.secondary"
              >
                No CMS collections yet.
              </Typography>
            )}
          </Stack>
        )}

      <Dialog
        open={Boolean(editingCollection)}
        onClose={() =>
          setEditingCollection(null)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Edit collection
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            mt={1}
          >
            <TextField
              label="Collection name"
              value={
                editingCollection?.name || ""
              }
              onChange={(event) =>
                setEditingCollection(
                  (current) =>
                    current
                      ? {
                          ...current,
                          name:
                            event.target.value
                        }
                      : current
                )
              }
              fullWidth
            />

            <TextField
              label="Slug"
              value={
                editingCollection?.slug || ""
              }
              onChange={(event) =>
                setEditingCollection(
                  (current) =>
                    current
                      ? {
                          ...current,
                          slug:
                            event.target.value
                        }
                      : current
                )
              }
              fullWidth
            />

            <TextField
              label="Description"
              value={
                editingCollection
                  ?.description || ""
              }
              onChange={(event) =>
                setEditingCollection(
                  (current) =>
                    current
                      ? {
                          ...current,
                          description:
                            event.target.value
                        }
                      : current
                )
              }
              multiline
              minRows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setEditingCollection(null)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={
              isUpdating ||
              !editingCollection?.name.trim() ||
              !editingCollection?.slug.trim()
            }
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

export default CmsCollectionsPage;