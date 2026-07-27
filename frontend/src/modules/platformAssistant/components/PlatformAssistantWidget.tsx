import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  TextField,
  Typography
} from "@mui/material";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

import {
  useState
} from "react";

type PlatformAssistantSource = {
  docId: string;
  title: string;
  category: string;
  excerpt: string;
  score: number;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: PlatformAssistantSource[];
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://backend-rmfq.onrender.com/api";

const findTokenInStorage = () => {
  const directKeys = [
    "token",
    "accessToken",
    "authToken",
    "jwt"
  ];

  for (const key of directKeys) {
    const value =
      localStorage.getItem(key);

    if (
      value &&
      value !== "null" &&
      value !== "undefined"
    ) {
      return value.replace(/^"|"$/g, "");
    }
  }

  for (let index = 0; index < localStorage.length; index += 1) {
    const key =
      localStorage.key(index);

    if (!key) {
      continue;
    }

    const value =
      localStorage.getItem(key);

    if (
      value &&
      value.includes("eyJ") &&
      value.split(".").length >= 3
    ) {
      const match =
        value.match(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);

      if (match?.[0]) {
        return match[0];
      }
    }
  }

  return "";
};

export const PlatformAssistantWidget = () => {
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
        content:
          "Hi! I can help you use ReactBuilder. Ask me about pages, publishing, plugins, AI, roles, or troubleshooting."
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
        role: "user",
        content: cleanMessage
      }
    ]);

    setMessage("");
    setLoading(true);

    try {
      const token =
        findTokenInStorage();

      const response =
        await fetch(
          `${API_BASE_URL}/platform-assistant/message`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token
                ? {
                    Authorization: `Bearer ${token}`
                  }
                : {})
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
            "Platform assistant request failed"
        );
      }

      setMessages(previous => [
        ...previous,
        {
          role: "assistant",
          content:
            json.data?.answer ||
            "I could not find an answer in the ReactBuilder documentation.",
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
            "Sorry, I could not answer right now. Please check that you are logged in and that the backend is running."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

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
            width: 390,
            maxWidth: "calc(100vw - 32px)",
            height: 520,
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
                ReactBuilder Assistant
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Help from platform documentation
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
                    item.role === "user"
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
                      item.role === "user"
                        ? "primary.main"
                        : "grey.100",
                    color:
                      item.role === "user"
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
                          key={`${source.docId}-${source.title}`}
                          size="small"
                          label={`${source.category}: ${source.title}`}
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
                  Searching ReactBuilder documentation...
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
              placeholder="Ask about ReactBuilder..."
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
        startIcon={<HelpOutlineIcon />}
        sx={{
          borderRadius: 999,
          px: 2.5,
          py: 1.25,
          boxShadow: 6,
          textTransform: "none",
          fontWeight: 700
        }}
      >
        Help
      </Button>
    </Box>
  );
};