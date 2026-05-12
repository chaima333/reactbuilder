import {
  useUpdatePageMutation,
  usePublishPageMutation,
  useCreatePageMutation
} from "../../../redux/services/pages.api";

import { fromUIToAPI }
from "../adapters/pageAdapter";

import {
  useNavigate
} from "react-router-dom";

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
  // SAVE
  // ========================

  const save = async () => {

    try {

      // ====================
      // UPDATE EXISTING PAGE
      // ====================

      if (pId) {

        await updatePage({

          title:
            pageTitle,

          slug,

          blocks:
            fromUIToAPI(
              blocks
            ) as any,

          theme:
            tokens,

          siteId:
            sId,

          pageId:
            pId,

        }).unwrap();

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

            slug,

            blocks:
              fromUIToAPI(
                blocks
              ) as any,

          }).unwrap();

        console.log(
          "NEW PAGE:",
          createdPage
        );

        // ✅ important fix

        navigate(

          `/sites/${sId}/pages/${createdPage.id}`
        );
      }

    } catch (err) {

      console.error(
        "Save Error:",
        err
      );
    }
  };

  // ========================
  // PUBLISH
  // ========================

  const publish = async () => {

    console.log(
      "PUBLISH CLICKED"
    );

    if (!pId) {

      console.warn(
        "NO PAGE ID"
      );

      return;
    }

    try {

      await publishPage({

        siteId:
          sId,

        pageId:
          pId

      }).unwrap();

      console.log(
        "PAGE PUBLISHED"
      );

    } catch (err) {

      console.error(
        "Publish Error:",
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