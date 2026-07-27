// frontend/src/modules/pageBuilder/hooks/usePagePersistence.ts

import {
  useUpdatePageMutation,
  usePublishPageMutation,
  useCreatePageMutation
} from "../../../redux/services/pages.api";

import {
  fromUIToAPI
} from "../adapters/pageAdapter";

import {
  useNavigate
} from "react-router-dom";

import {
  publishCanonicalTree
} from "../runtime/publishing/publishPipeline";

import { useSnackbar } from "notistack";
import { getApiErrorMessage } from "../../../redux/api/errorMessages";

export const usePagePersistence = ({

  sId,

  pId,

  pageTitle,

  slug,

  pageVisibility,


  blocks,

  tokens

}: any) => {

  const navigate =
    useNavigate();

  const { enqueueSnackbar } =
    useSnackbar();

  const [
    updatePage,
    {
      isLoading: isSaving
    }
  ] = useUpdatePageMutation();

  const [
    publishPage,
    {
      isLoading: isPublishing
    }
  ] = usePublishPageMutation();

  const [
    createPage
  ] = useCreatePageMutation();

  // ========================
  // GENERATED SLUG (fallback)
  // ========================

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // ========================
  // SAVE
  // ========================

  const save = async () => {
    try {

      console.log("🔥 RAW BLOCKS", blocks);

      const publishingResult =
        publishCanonicalTree(blocks);

      console.log("🔥 CANONICAL TREE", publishingResult.canonicalTree);
      console.log("🔥 API BLOCKS JSON", JSON.stringify(fromUIToAPI(publishingResult.canonicalTree), null, 2));

      // ✅ استعمل الـ slug من المستخدم، وإذا فارغ استعمل الـ title
      const finalSlug = slug?.trim()
        ? generateSlug(slug)
        : pageTitle
          ? generateSlug(pageTitle)
          : "untitled-page";

      const apiBlocks = fromUIToAPI(publishingResult.canonicalTree) as any;

      // ====================
      // UPDATE EXISTING PAGE
      // ====================
      if (pId) {

        await updatePage({

          title: pageTitle,

          slug: finalSlug,        

          blocks: apiBlocks,

          visibility: pageVisibility,

          theme: tokens,          

          siteId: sId,

          pageId: pId

        }).unwrap();

        console.log("✅ PAGE UPDATED");
      }

      // ====================
      // CREATE NEW PAGE
      // ====================

      else {

        const createdPage =
          await createPage({

            siteId: sId,

            title: pageTitle,

            slug: finalSlug,  
            
            visibility: pageVisibility,

            blocks: apiBlocks,

            theme: tokens,         

          }).unwrap();

        const created =
          (createdPage as any).data ||
          createdPage;

        navigate(
          `/sites/${sId}/pages/${created.id}/edit`
        );
      }

    } catch (err) {
      enqueueSnackbar(
        getApiErrorMessage(err),
        { variant: "error" }
      );

      console.error(
        "❌ Save Error:",
        err
      );
    }
  };

  // ========================
  // PUBLISH
  // ========================

  const publish = async () => {

    console.log("🔥 PUBLISH CLICKED");

    if (!pId) {

      console.warn("❌ NO PAGE ID");

      return;
    }

    try {

      console.log("🔥 RAW BLOCKS", blocks);

      const publishingResult =
        publishCanonicalTree(blocks);

      console.log(" CANONICAL TREE", publishingResult.canonicalTree);

      const finalSlug = slug?.trim()
        ? generateSlug(slug)
        : pageTitle
          ? generateSlug(pageTitle)
          : "untitled-page";

      await updatePage({

        title: pageTitle,

        slug: finalSlug, 
        
        visibility: pageVisibility,

        blocks: fromUIToAPI(publishingResult.canonicalTree) as any,

        theme: tokens,          

        siteId: sId,

        pageId: pId

      }).unwrap();

      await publishPage({

        siteId: sId,

        pageId: pId

      }).unwrap();

      console.log("✅ PAGE PUBLISHED");

    } catch (err) {

      console.error("❌ Publish Error:", err);
    }
  };

  return {

    save,

    publish,

    isSaving,

    isPublishing
  };
};