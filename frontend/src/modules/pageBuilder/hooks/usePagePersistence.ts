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

export const usePagePersistence = ({

  sId,

  pId,

  pageTitle,

  slug,

  blocks,

  tokens

}: any) => {

  const navigate =
    useNavigate();

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
  // GENERATED SLUG
  // ========================

  const generatedSlug =

    pageTitle

      ? pageTitle
          .toLowerCase()
          .trim()
          .replaceAll(" ", "-")

      : "untitled-page";

  // ========================
  // SAVE
  // ========================

  const save = async () => {

    try {

      // 🔥 DEBUG
      console.log(
        "🔥 RAW BLOCKS",
        blocks
      );

      const publishingResult =
        publishCanonicalTree(
          blocks
        );

      // 🔥 DEBUG
      console.log(
        "🔥 CANONICAL TREE",
        publishingResult.canonicalTree
      );

      // 🔥 DEBUG
      console.log(
        "🔥 API BLOCKS JSON",
        JSON.stringify(
          fromUIToAPI(
            publishingResult.canonicalTree
          ),
          null,
          2
        )
      );

      // ====================
      // UPDATE EXISTING PAGE
      // ====================

      if (pId) {

        await updatePage({

          title:
            pageTitle,

          slug:
            generatedSlug,

          blocks:
            fromUIToAPI(
              publishingResult
                .canonicalTree
            ) as any,

          theme:
            tokens,

          siteId:
            sId,

          pageId:
            pId

        }).unwrap();

        console.log(
          "✅ PAGE UPDATED"
        );
      }

      // ====================
      // CREATE NEW PAGE
      // ====================

      else {

        const createdPage =
          await createPage({

            siteId:
              sId,

            title:
              pageTitle,

            slug:
              generatedSlug,

            blocks:
              fromUIToAPI(
                publishingResult
                  .canonicalTree
              ) as any,

          }).unwrap();

        console.log(
          "🔥 CREATED PAGE FULL",
          createdPage
        );

        navigate(
          `/sites/${sId}/pages/${
            (createdPage as any)
              ?.data?.id
          }/edit`
        );
      }

    } catch (err) {

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

    console.log(
      "🔥 PUBLISH CLICKED"
    );

    if (!pId) {

      console.warn(
        "❌ NO PAGE ID"
      );

      return;
    }

    try {

      // 🔥 DEBUG
      console.log(
        "🔥 RAW BLOCKS",
        blocks
      );

      const publishingResult =
        publishCanonicalTree(
          blocks
        );

      // 🔥 DEBUG
      console.log(
        "🔥 CANONICAL TREE",
        publishingResult.canonicalTree
      );

      await updatePage({

        title:
          pageTitle,

        slug:
          generatedSlug,

        blocks:
          fromUIToAPI(
            publishingResult
              .canonicalTree
          ) as any,

        theme:
          tokens,

        siteId:
          sId,

        pageId:
          pId

      }).unwrap();

      await publishPage({

        siteId:
          sId,

        pageId:
          pId

      }).unwrap();

      console.log(
        "✅ PAGE PUBLISHED"
      );

    } catch (err) {

      console.error(
        "❌ Publish Error:",
        err
      );
    }
  };

  return {

    save,

    publish,

    isSaving,

    isPublishing
  };
};