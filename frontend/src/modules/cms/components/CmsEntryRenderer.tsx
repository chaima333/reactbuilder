// src/modules/cms/components/CmsEntryRenderer.tsx

import React, { useMemo } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper,
  Divider,
  Chip,
  Stack,
  Breadcrumbs,
  Link as MuiLink,
  Avatar,
  alpha,
  useTheme
} from "@mui/material";
import { Link } from "react-router-dom";
import { useRuntime } from '../../pageBuilder/runtime/context/RuntimeProvider';
import { resolveBindings } from '../utils/binding.resolver';
import { RenderTree } from '../../pageBuilder/runtime/renderer/RenderTree';

interface CmsEntryRendererProps {
  entry: {
    id?: string | number;
    slug?: string;
    title?: string;
    description?: string;
    excerpt?: string;
    template?: {
      blocks?: any[];
    };
    templatePage?: {
      id: number;
      title: string;
      slug: string;
      blocks?: any[];
    };
    content?: string;
    featuredImage?: string;
    categories?: string[];
    tags?: string[];
    author?: string;
    mon_premier_site_web?: string;
    data?: {
      title?: string;
      description?: string;
      mon_premier_site_web?: string;
      [key: string]: any;
    };
    collection?: {
      id: number;
      name: string;
      slug: string;
    };
    siteId?: number;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
    createdBy?: {
      id: number;
      name: string;
      email: string;
      avatar?: string;
    };
    status?: string;
    [key: string]: any;
  };
  showHeader?: boolean;
  showFooter?: boolean;
  containerMaxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  className?: string;
}

// ============================================
// HELPERS
// ============================================

const deepCloneBlocks = (blocks: any[]): any[] => {
  return blocks.map((block) => {
    const cloned = { ...block };
    if (Array.isArray(block.children) && block.children.length > 0) {
      cloned.children = deepCloneBlocks(block.children);
    } else {
      cloned.children = block.children || [];
    }
    return cloned;
  });
};

const ensureBlockStructure = (blocks: any[]): any[] => {
  return blocks.map((block) => ({
    ...block,
    children: Array.isArray(block.children) 
      ? ensureBlockStructure(block.children) 
      : []
  }));
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function CmsEntryRenderer({ 
  entry, 
  showHeader = true,
  showFooter = true,
  containerMaxWidth = 'lg',
  className = ''
}: CmsEntryRendererProps) {
  const theme = useTheme();
  const { mode, device } = useRuntime();
  
  const entryData = entry?.data || entry || {};
  
  const resolvedData = useMemo(() => {
    return resolveBindings(entryData, entryData);
  }, [entryData]);
  
  const blocks = useMemo(() => {
    const templateBlocks =
      entry?.templatePage?.blocks ||
      entry?.template?.blocks ||
      [];

    if (templateBlocks.length > 0) {
      const structuredBlocks = ensureBlockStructure(templateBlocks);
      
      const resolved = resolveBindings(
        structuredBlocks,
        resolvedData
      );
      
      return deepCloneBlocks(resolved);
    }
    
    // Generate blocks from data if no template
    const generated = [];
    let id = 0;
    
    if (resolvedData?.title) {
      generated.push({ 
        id: `b-${id++}`, 
        type: 'title', 
        data: { text: resolvedData.title } 
      });
    }
    
    if (resolvedData?.description) {
      generated.push({ 
        id: `b-${id++}`, 
        type: 'text', 
        data: { content: resolvedData.description } 
      });
    }
    
    if (resolvedData?.mon_premier_site_web) {
      generated.push({ 
        id: `b-${id++}`, 
        type: 'text', 
        data: { content: resolvedData.mon_premier_site_web } 
      });
    }
    
    Object.keys(resolvedData).forEach((key) => {
      if (!['title', 'description', 'mon_premier_site_web', 'template', 'categories', 'tags', 'author', 'featuredImage', 'id', 'slug', 'status', 'createdAt', 'updatedAt', 'collection', 'siteId', 'createdBy', 'publishedAt'].includes(key)) {
        if (typeof resolvedData[key] === 'string' && resolvedData[key].trim()) {
          generated.push({ 
            id: `b-${id++}`, 
            type: 'text', 
            data: { content: resolvedData[key] } 
          });
        }
      }
    });
    
    return generated;
  }, [resolvedData, entry]);

  const title = resolvedData?.title || entry?.slug || "Untitled";
  const description = resolvedData?.description || resolvedData?.excerpt || "";
  const featuredImage = resolvedData?.featuredImage || resolvedData?.image || "";
  const categories = resolvedData?.categories || [];
  const tags = resolvedData?.tags || [];
  const author = resolvedData?.author || entry?.createdBy?.name || "";
  const authorAvatar = resolvedData?.authorAvatar || entry?.createdBy?.avatar || "";
  
  const hasBlocks =
    Array.isArray(blocks) &&
    blocks.length > 0;

  const templateBlocks =
    entry?.templatePage?.blocks ||
    entry?.template?.blocks ||
    [];

  const hasTemplateBlocks =
    Array.isArray(templateBlocks) &&
    templateBlocks.length > 0;

  const publishedDate =
    entry?.publishedAt ||
    entry?.createdAt ||
    "";

  // Debug log in development only
  if (import.meta.env.DEV) {
    console.log("🔍 CmsEntryRenderer - Entry:", entry);
    console.log("🔍 CmsEntryRenderer - entryData:", entryData);
    console.log("🔍 CmsEntryRenderer - resolvedData:", resolvedData);
    console.log("🔍 CmsEntryRenderer - Blocks:", blocks);
    console.log("🔍 CmsEntryRenderer - Mode:", mode, "Device:", device);
    console.log("🔍 CmsEntryRenderer - hasTemplateBlocks:", hasTemplateBlocks);
  }

  // ============================================
  // Render Header
  // ============================================
  const renderHeader = () => {
    if (!showHeader) return null;
    if (!title && !description && !featuredImage) return null;

    return (
      <Box
        sx={{
          position: 'relative',
          mb: 4,
          ...(featuredImage && {
            minHeight: { xs: 200, md: 400 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${featuredImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 2,
            color: 'white',
            p: { xs: 3, md: 6 },
          }),
        }}
      >
        <Container maxWidth={containerMaxWidth}>
          {/* Breadcrumbs */}
          {entry?.collection?.name && (
            <Breadcrumbs sx={{ mb: 2, color: featuredImage ? 'rgba(255,255,255,0.8)' : 'inherit' }}>
              <MuiLink 
                component={Link} 
                to={`/site/${entry.siteId}`}
                sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Home
              </MuiLink>
              <MuiLink 
                component={Link} 
                to={`/site/${entry.siteId}/${entry.collection?.slug}`}
                sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                {entry.collection.name}
              </MuiLink>
              <Typography sx={{ color: featuredImage ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
                {title}
              </Typography>
            </Breadcrumbs>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
              {categories.map((category: string, index: number) => (
                <Chip
                  key={index}
                  label={category}
                  size="small"
                  sx={{
                    bgcolor: featuredImage ? 'rgba(255,255,255,0.2)' : alpha(theme.palette.primary.main, 0.1),
                    color: featuredImage ? 'white' : 'inherit',
                    backdropFilter: featuredImage ? 'blur(10px)' : 'none',
                  }}
                />
              ))}
            </Stack>
          )}

          {/* Title */}
          {title && (
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: '2rem', md: '3.5rem' },
                fontWeight: 700,
                lineHeight: 1.2,
                mb: 2,
                ...(featuredImage && { textShadow: '0 2px 4px rgba(0,0,0,0.3)' }),
              }}
            >
              {title}
            </Typography>
          )}

          {/* Description */}
          {description && (
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1rem', md: '1.25rem' },
                fontWeight: 400,
                opacity: 0.9,
                mb: 3,
                maxWidth: '80%',
                ...(featuredImage && { textShadow: '0 1px 2px rgba(0,0,0,0.2)' }),
              }}
            >
              {description}
            </Typography>
          )}

          {/* Meta Info */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            sx={{
              color: featuredImage ? 'rgba(255,255,255,0.8)' : 'text.secondary',
            }}
          >
            {author && (
              <Stack direction="row" spacing={1} alignItems="center">
                {authorAvatar && (
                  <Avatar src={authorAvatar} alt={author} sx={{ width: 24, height: 24 }} />
                )}
                <Typography variant="body2">
                  By {author}
                </Typography>
              </Stack>
            )}

            {publishedDate && (
              <Typography variant="body2">
                {new Date(publishedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            )}

            {entry?.status && (
              <Chip
                label={entry.status}
                size="small"
                sx={{
                  bgcolor: featuredImage ? 'rgba(255,255,255,0.2)' : alpha(theme.palette.success.main, 0.1),
                  color: featuredImage ? 'white' : 'success.main',
                  backdropFilter: featuredImage ? 'blur(10px)' : 'none',
                }}
              />
            )}
          </Stack>

          {/* Tags */}
          {tags.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
              {tags.map((tag: string, index: number) => (
                <Chip
                  key={index}
                  label={`#${tag}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: featuredImage ? 'rgba(255,255,255,0.3)' : 'inherit',
                    color: featuredImage ? 'rgba(255,255,255,0.8)' : 'inherit',
                  }}
                />
              ))}
            </Stack>
          )}
        </Container>
      </Box>
    );
  };

  const renderContent = () => {
    // Case 1: Has blocks from template
    if (hasBlocks) {
      return (
        <Box sx={{ width: "100%" }}>
          <RenderTree
            blocks={blocks}
          />
        </Box>
      );
    }

    // Case 2: Has HTML content
    const content = resolvedData?.content || resolvedData?.html || resolvedData?.body;
    if (content) {
      return (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            bgcolor: 'background.paper',
            borderRadius: 2,
          }}
        >
          <Box
            dangerouslySetInnerHTML={{ __html: content }}
            sx={{
              '& img': {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: 1,
              },
              '& h1, & h2, & h3': {
                mt: 4,
                mb: 2,
                fontWeight: 600,
              },
              '& h1': { fontSize: '2.5rem' },
              '& h2': { fontSize: '2rem' },
              '& h3': { fontSize: '1.5rem' },
              '& p': {
                mb: 2,
                lineHeight: 1.8,
              },
              '& ul, & ol': {
                mb: 2,
                pl: 3,
              },
              '& blockquote': {
                borderLeft: 4,
                borderColor: 'primary.main',
                pl: 2,
                py: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 1,
                my: 3,
                fontStyle: 'italic',
              },
              '& a': {
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              },
              '& table': {
                width: '100%',
                borderCollapse: 'collapse',
                mb: 2,
              },
              '& th, & td': {
                border: 1,
                borderColor: 'divider',
                p: 1,
              },
            }}
          />
        </Paper>
      );
    }

    // Case 3: Show raw data as fallback
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          bgcolor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No content blocks defined for this entry.
        </Typography>
        {import.meta.env.DEV && (
          <Box
            sx={{
              bgcolor: 'grey.50',
              p: 3,
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 400,
              border: 1,
              borderColor: 'divider',
            }}
          >
            <pre style={{ margin: 0, fontSize: '0.75rem' }}>
              {JSON.stringify(resolvedData, null, 2)}
            </pre>
          </Box>
        )}
      </Paper>
    );
  };

  // ============================================
  // Render Footer
  // ============================================
  const renderFooter = () => {
    if (!showFooter) return null;

    return (
      <Container maxWidth={containerMaxWidth} sx={{ py: 4, mt: 4 }}>
        <Divider sx={{ mb: 3 }} />
        
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Last updated: {entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : 'N/A'}
          </Typography>
          
          <Stack direction="row" spacing={2}>
            {entry?.collection?.name && (
              <Typography variant="caption" color="text.secondary">
                Collection: {entry.collection.name}
              </Typography>
            )}
            {entry?.id && (
              <Typography variant="caption" color="text.secondary">
                ID: {entry.id}
              </Typography>
            )}
          </Stack>
        </Box>
      </Container>
    );
  };

  // ============================================
  // Main Render 
  // ============================================
  return (
    <Box
      className={className}
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {!hasTemplateBlocks && renderHeader()}

      {hasTemplateBlocks ? (
        renderContent()
      ) : (
        <Container maxWidth={containerMaxWidth}>
          {renderContent()}
        </Container>
      )}

      {!hasTemplateBlocks && renderFooter()}
    </Box>
  );
}