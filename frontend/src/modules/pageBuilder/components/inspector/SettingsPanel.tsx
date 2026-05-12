import {
  Box,
  TextField,
  Typography
} from "@mui/material";

type Props = {

  pageTitle: string;

  setPageTitle:
    (value:string)=>void;

  slug: string;

  setSlug:
    (value:string)=>void;
};

export const SettingsPanel = ({

  pageTitle,

  setPageTitle,

  slug,

  setSlug

}: Props) => {

  return (

    <Box p={2}>

      <Typography
        variant="h6"
        fontWeight="bold"
      >
        Settings
      </Typography>

      {/* PAGE TITLE */}

      <TextField

        fullWidth

        label="Page Title"

        value={pageTitle}

        onChange={(e)=>

          setPageTitle(
            e.target.value
          )
        }

        sx={{ mt:2 }}
      />

      {/* SLUG */}

      <TextField

        fullWidth

        label="Slug"

        value={slug}

        onChange={(e)=>

          setSlug(
            e.target.value
          )
        }

        sx={{ mt:2 }}
      />

    </Box>
  );
};