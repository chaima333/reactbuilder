import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
  useTheme,
  alpha
} from "@mui/material";
import {
  Business,
  Person,
  Work,
  FolderOpen,
  CheckCircle
} from "@mui/icons-material";
import {
  useState
} from "react";
import {
  useParams
} from "react-router-dom";
import {
  useCreatePublicPartnerApplicationMutation,
  type PartnerAvailability
} from "../../redux/services/partnerApplications.api";

const splitValues = (
  value: string
) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const PublicPartnerApplicationPage = () => {
  const { siteId } =
    useParams<{
      siteId: string;
    }>();

  const numericSiteId =
    Number(siteId);

  const theme = useTheme();

  const [
    createApplication,
    {
      isLoading
    }
  ] =
    useCreatePublicPartnerApplicationMutation();

  const [
    success,
    setSuccess
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const [
    form,
    setForm
  ] = useState({
    representativeFullName: "",
    professionalEmail: "",
    phone: "+216",
    country: "Tunisia",
    region: "",
    city: "",
    companyName: "",
    legalIdentifier: "",
    expertiseSectors: "IT, Marketing",
    specializations: "",
    yearsExperience: "1",
    certificationFileName: "certification.pdf",
    portfolioFileName: "portfolio.pdf",
    portfolioText: "",
    clientReferences: "",
    availability: "AVAILABLE" as PartnerAvailability,
    currentWorkload: "0",
    dailyRate: "0",
    languages: "Français, Anglais",
    workModes: "Remote, Hybrid",
    services: "Website, Design",
    acceptedTerms: false
  });

  const updateField = (
    key: keyof typeof form,
    value: string | boolean
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!numericSiteId) {
      setError("Site invalide.");
      return;
    }

    if (!form.acceptedTerms) {
      setError("Vous devez accepter les conditions.");
      return;
    }

    try {
      await createApplication({
        siteId: numericSiteId,
        body: {
          representativeFullName:
            form.representativeFullName,
          professionalEmail:
            form.professionalEmail,
          phone:
            form.phone,
          country:
            form.country,
          region:
            form.region || null,
          city:
            form.city,
          companyName:
            form.companyName,
          legalIdentifier:
            form.legalIdentifier || null,
          expertiseSectors:
            splitValues(form.expertiseSectors),
          specializations:
            form.specializations,
          yearsExperience:
            Number(form.yearsExperience),
          certificationFiles: [
            {
              name:
                form.certificationFileName
            }
          ],
          portfolioFiles: [
            {
              name:
                form.portfolioFileName
            }
          ],
          portfolioText:
            form.portfolioText,
          clientReferences:
            form.clientReferences || null,
          availability:
            form.availability,
          currentWorkload:
            Number(form.currentWorkload),
          dailyRate:
            Number(form.dailyRate),
          languages:
            splitValues(form.languages),
          workModes:
            splitValues(form.workModes),
          services:
            splitValues(form.services),
          companyLogoFile:
            null,
          acceptedTerms:
            true
        }
      }).unwrap();

      setSuccess(true);
    } catch (submitError: any) {
      setError(
        submitError?.data?.message ||
        "Impossible d’envoyer la demande partenaire."
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fa",
        py: 5
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Stack
          spacing={1.5}
          mb={4}
          textAlign="center"
        >
          <Typography
            variant="h4"
            fontWeight={700}
            color="primary"
          >
            Devenir partenaire
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ maxWidth: 500, mx: 'auto' }}
          >
            Présentez votre entreprise, vos compétences et vos services
          </Typography>
        </Stack>

        <Paper
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid #e8ecf1'
          }}
        >
          <Stack spacing={3.5}>
            {/* Alert Messages */}
            {success && (
              <Alert 
                severity="success" 
                icon={<CheckCircle />}
                sx={{ borderRadius: 2 }}
              >
                Votre demande a été envoyée avec succès !
              </Alert>
            )}

            {error && (
              <Alert 
                severity="error" 
                sx={{ borderRadius: 2 }}
              >
                {error}
              </Alert>
            )}

            {/* Section 1: Représentant */}
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Person color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Informations représentant
                </Typography>
              </Stack>
              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Nom complet"
                    value={form.representativeFullName}
                    onChange={(event) =>
                      updateField(
                        "representativeFullName",
                        event.target.value
                      )
                    }
                    required
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Email professionnel"
                    type="email"
                    value={form.professionalEmail}
                    onChange={(event) =>
                      updateField(
                        "professionalEmail",
                        event.target.value
                      )
                    }
                    required
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Téléphone"
                    helperText="Ex: +216XXXXXXXXX"
                    value={form.phone}
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value
                      )
                    }
                    required
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            </Stack>

            {/* Section 2: Entreprise */}
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Business color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Informations entreprise
                </Typography>
              </Stack>
              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Nom de l'entreprise"
                    value={form.companyName}
                    onChange={(event) =>
                      updateField(
                        "companyName",
                        event.target.value
                      )
                    }
                    required
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Identifiant légal"
                    value={form.legalIdentifier}
                    onChange={(event) =>
                      updateField(
                        "legalIdentifier",
                        event.target.value
                      )
                    }
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Pays"
                    value={form.country}
                    onChange={(event) =>
                      updateField(
                        "country",
                        event.target.value
                      )
                    }
                    required
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Ville"
                    value={form.city}
                    onChange={(event) =>
                      updateField(
                        "city",
                        event.target.value
                      )
                    }
                    required
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Région"
                    value={form.region}
                    onChange={(event) =>
                      updateField(
                        "region",
                        event.target.value
                      )
                    }
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            </Stack>

            {/* Section 3: Compétences */}
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Work color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Compétences et services
                </Typography>
              </Stack>
              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Secteurs d'expertise"
                    helperText="IT, Marketing, Finance"
                    value={form.expertiseSectors}
                    onChange={(event) =>
                      updateField(
                        "expertiseSectors",
                        event.target.value
                      )
                    }
                    required
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Services proposés"
                    helperText="Website, Design, SEO"
                    value={form.services}
                    onChange={(event) =>
                      updateField(
                        "services",
                        event.target.value
                      )
                    }
                    required
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Spécialisations"
                    value={form.specializations}
                    onChange={(event) =>
                      updateField(
                        "specializations",
                        event.target.value
                      )
                    }
                    required
                    multiline
                    minRows={2}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Années d'expérience"
                    type="number"
                    value={form.yearsExperience}
                    onChange={(event) =>
                      updateField(
                        "yearsExperience",
                        event.target.value
                      )
                    }
                    required
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Langues"
                    helperText="Français, Anglais"
                    value={form.languages}
                    onChange={(event) =>
                      updateField(
                        "languages",
                        event.target.value
                      )
                    }
                    required
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Modes de travail"
                    helperText="Remote, Hybrid"
                    value={form.workModes}
                    onChange={(event) =>
                      updateField(
                        "workModes",
                        event.target.value
                      )
                    }
                    required
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Disponibilité"
                    value={form.availability}
                    onChange={(event) =>
                      updateField(
                        "availability",
                        event.target.value
                      )
                    }
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="AVAILABLE">Disponible</MenuItem>
                    <MenuItem value="PARTIAL">Partiellement disponible</MenuItem>
                    <MenuItem value="UNAVAILABLE">Indisponible</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Stack>

            {/* Section 4: Portfolio */}
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FolderOpen color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Portfolio
                </Typography>
              </Stack>
              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Fichier certification"
                    helperText="certification.pdf"
                    value={form.certificationFileName}
                    onChange={(event) =>
                      updateField(
                        "certificationFileName",
                        event.target.value
                      )
                    }
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Fichier portfolio"
                    helperText="portfolio.pdf"
                    value={form.portfolioFileName}
                    onChange={(event) =>
                      updateField(
                        "portfolioFileName",
                        event.target.value
                      )
                    }
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description du portfolio"
                    value={form.portfolioText}
                    onChange={(event) =>
                      updateField(
                        "portfolioText",
                        event.target.value
                      )
                    }
                    required
                    multiline
                    minRows={3}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Références clients"
                    value={form.clientReferences}
                    onChange={(event) =>
                      updateField(
                        "clientReferences",
                        event.target.value
                      )
                    }
                    multiline
                    minRows={2}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            </Stack>

            {/* Section 5: Acceptation */}
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.acceptedTerms}
                    onChange={(event) =>
                      updateField(
                        "acceptedTerms",
                        event.target.checked
                      )
                    }
                  />
                }
                label="J'accepte les conditions de collaboration"
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                {isLoading
                  ? "Envoi en cours..."
                  : "Envoyer la demande"}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default PublicPartnerApplicationPage;