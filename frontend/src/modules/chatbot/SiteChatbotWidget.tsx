import {
  Box,
  Button,
  IconButton,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Chip
} from "@mui/material";

import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

import {
  useState
} from "react";

type ChatbotSource = {
  pageId: number;
  title: string;
  slug: string;
  excerpt?: string;
  score?: number;
};

type ChatMessage = {
  role: "visitor" | "assistant";
  content: string;
  sources?: ChatbotSource[];
};

type ChatbotConfig = {
  displayName?: string;
  welcomeMessage?: string;
  fallbackMessage?: string;
  primaryColor?: string;
};

type Props = {
  siteId: number;
  config?: ChatbotConfig;
};
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://backend-rmfq.onrender.com/api";

export const SiteChatbotWidget = ({
  siteId,
  config
}: Props) => {
  const displayName =
    config?.displayName ||
    "Site Assistant";

  const welcomeMessage =
    config?.welcomeMessage ||
    "Hi! Ask me anything about this website.";

  const primaryColor =
    config?.primaryColor ||
    "#00c7a7";

  const [open, setOpen] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

 const [messages, setMessages] =
  useState<ChatMessage[]>([
    {
      role: "assistant",
      content: welcomeMessage
    }
  ]);

  const sendMessage = async () => {
    const cleanMessage =
      message.trim();

    if (
      !cleanMessage ||
      cleanMessage.length < 3 ||
      loading
    ) {
      return;
    }

    setMessages(previous => [
      ...previous,
      {
        role: "visitor",
        content: cleanMessage
      }
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/public/sites/${siteId}/chatbot/message`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              message: cleanMessage
            })
          }
        );

      const json =
        await response.json();

      if (
        !response.ok ||
        !json?.success
      ) {
        throw new Error(
          json?.message ||
            "Chatbot request failed"
        );
      }

      setMessages(previous => [
        ...previous,
        {
          role: "assistant",
          content:
            json.data?.answer ||
            "I could not find an answer.",
          sources:
            json.data?.sources || []
        }
      ]);
    } catch {
      setMessages(previous => [
        ...previous,
        {
          role: "assistant",
          content:
            "Sorry, I could not answer right now."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!siteId) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        right: 24,
        bottom: 24,
        zIndex: 9999
      }}
    >
      {open && (
        <Paper
          elevation={8}
          sx={{
            width: 360,
            maxWidth: "calc(100vw - 32px)",
            height: 480,
            mb: 2,
            borderRadius: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom:
                "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <Box>
              <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700 }}
              >
             {displayName}
            </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Answers from this website
              </Typography>
            </Box>

            <IconButton
              size="small"
              onClick={() => setOpen(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 1.5
            }}
          >
            {messages.map((item, index) => (
              <Box
                key={index}
                sx={{
                  alignSelf:
                    item.role === "visitor"
                      ? "flex-end"
                      : "flex-start",
                  maxWidth: "88%"
                }}
              >
                <Box
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor:
                    item.role === "visitor"
                    ? primaryColor
                    : "grey.100",
                    color:
                      item.role === "visitor"
                        ? "primary.contrastText"
                        : "text.primary",
                    whiteSpace: "pre-wrap"
                  }}
                >
                  <Typography variant="body2">
                    {item.content}
                  </Typography>
                </Box>

                {!!item.sources?.length && (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      mt: 0.75
                    }}
                  >
                    {item.sources
                      .slice(0, 3)
                      .map(source => (
                        <Chip
                          key={`${source.pageId}-${source.slug}`}
                          size="small"
                          label={source.title}
                          variant="outlined"
                        />
                      ))}
                  </Box>
                )}
              </Box>
            ))}

            {loading && (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center"
                }}
              >
                <CircularProgress size={16} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Searching website content...
                </Typography>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderTop:
                "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              gap: 1
            }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Ask about this website..."
              value={message}
              onChange={event =>
                setMessage(event.target.value)
              }
              onKeyDown={event => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />

            <IconButton
              color="primary"
              onClick={sendMessage}
              disabled={loading}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}

      <Button
        variant="contained"
        onClick={() => setOpen(value => !value)}
        startIcon={<ChatBubbleOutlineIcon />}
        sx={{
  borderRadius: 999,
  px: 2.5,
  py: 1.25,
  boxShadow: 6,
  textTransform: "none",
  fontWeight: 700,
  bgcolor: primaryColor,
  "&:hover": {
    bgcolor: primaryColor
  }
}}
      >
        Chat
      </Button>
    </Box>
  );
};