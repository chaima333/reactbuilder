import { restoreVersion }
from "../core/versions/restoreVersion";

export const useVersionActions = ({

  restorePageVersion,

  siteId,

  pageId

}: any) => {

  const handleRestoreVersion =
   async (
     versionId:string
   ) => {

    await restorePageVersion({

      siteId,

      pageId,

      versionId

    });

    window.location.reload();
  };

  return {

    restoreVersion:
      handleRestoreVersion

  };
};