import { api } from "../../../redux/api/api"; // تأكد إنو الـ axios instance هذا موجود

export const pagesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    
    // جلب النسخ (Versions)
    getPageVersions: builder.query({
      query: ({ siteId, pageId }) => `/sites/${siteId}/pages/${pageId}/versions`,
      providesTags: ['Pages'], // باش كي تعمل تحديث، النسخ تتحين
    }),

    // استرجاع نسخة قديمة (Restore)
    restorePageVersion: builder.mutation({
      query: ({ siteId, pageId, versionId }) => ({
        url: `/sites/${siteId}/pages/${pageId}/restore/${versionId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Pages'], // هوني السحر: الـ Editor باش يعمل ريفريش أوتوماتيكياً
    }),

    // تحديث الصفحة (الي وريتهولي قبيلة)
    updatePage: builder.mutation({
      query: ({ siteId, pageId, ...payload }) => ({
        url: `/sites/${siteId}/pages/${pageId}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['Pages'],
    }),

  }),
});

// تصدير الـ Hooks لاستعمالهم في الـ PageEditor
export const { 
  useGetPageVersionsQuery, 
  useRestorePageVersionMutation,
  useUpdatePageMutation 
} = pagesApi