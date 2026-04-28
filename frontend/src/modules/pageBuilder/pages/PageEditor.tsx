import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material'; // زِدنا Typography
import { EditorLayout } from "../components/editor/EditorLayout";
import { PageHeader } from "../components/editor/PageHeader";
import { BlockLibrary } from "../components/sidebar/BlockLibrary";
import { VersionHistory } from "../components/sidebar/VersionHistory";
import { InspectorPanel } from "../components/editor/InspectorPanel";
import { EditorCanvas } from "../components/editor/EditorCanvas";
import { usePageEditor } from "../hooks/usePageEditor";


export const PageEditor: React.FC<{ mode: "create" | "edit" }> = ({ mode }) => {
  const { 
    blocks, pageTitle, setPageTitle, actions, 
    isLoading, registry, selectedBlock, setSelectedBlockId,
    versions, isVersionsLoading, isSaving // 👈 جيب isSaving
  } = usePageEditor(mode);

  const [isPreview, setIsPreview] = React.useState(false);

  if (isLoading) return <CircularProgress />;

  return (
    <EditorLayout
      // ⚠️ ثبت في اسم الـ Props في ملف EditorLayout.tsx
      // إذا كان اسمهم leftSidebar عوض sidebar بدّلهم هنا
      header={<PageHeader
        title={pageTitle}
        onSave={actions.save}
        onChange={setPageTitle}
        onPreview={() => setIsPreview(!isPreview)}
        isPreview={isPreview}
        loading={isSaving} // 👈 نعديو الـ loading للـ Header
      />}
      // تأكد إن EditorLayout يقبل prop اسمها 'sidebar'
      sidebar={!isPreview ? <BlockLibrary onAdd={actions.addBlock} /> : null}
      rightSidebar={!isPreview ? (
        <Box sx={{ width: 300 }}>
          {selectedBlock ? (
            <InspectorPanel block={selectedBlock} registry={registry} onChange={actions.updateBlock} />
          ) : (
            <VersionHistory versions={versions} onRestore={actions.restore} isLoading={isVersionsLoading} />
          )}
        </Box>
      ) : null}
      content={<EditorCanvas
        blocks={blocks} registry={registry} preview={isPreview}
        selectedId={selectedBlock?.id} onSelect={setSelectedBlockId}
        onUpdate={actions.updateBlock} onDelete={actions.deleteBlock} />} left={undefined} children={undefined}    />
  );
};