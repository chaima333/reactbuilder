import {
  api
} from "../api/api";

export type FormFieldType =
  | "text"
  | "email"
  | "textarea"
  | "number"
  | "tel"
  | "select"
  | "checkbox"
  | "radio"
  | "date";

export type FormSchemaField = {
  key: string;
  name?: string;
  label?: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  options?: Array<{
    label: string;
    value: string;
  }>;
};

export type SiteForm = {
  id: number;
  siteId: number;
  pageId?: number | null;
  name: string;
  slug: string;
  schema: FormSchemaField[];
  settings?: Record<string, any>;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type FormSubmissionStatus =
  | "new"
  | "read"
  | "archived"
  | "spam";

export type FormSubmission = {
  id: number;
  formId: number;
  siteId: number;
  pageId?: number | null;
  values: Record<string, any>;
  status: FormSubmissionStatus;
  createdAt?: string;
  updatedAt?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const unwrap =
  <T,>(response: ApiResponse<T>) =>
    response.data;

export const formsApi =
  api.injectEndpoints({
    endpoints: (builder) => ({
      getForms: builder.query<
        SiteForm[],
        number | string
      >({
        query: (siteId) =>
          `/sites/${siteId}/forms`,

        transformResponse:
          unwrap<SiteForm[]>,

        providesTags: [
          "Forms" as any
        ]
      }),

      getFormById: builder.query<
        SiteForm,
        {
          siteId: number | string;
          formId: number | string;
        }
      >({
        query: ({
          siteId,
          formId
        }) =>
          `/sites/${siteId}/forms/${formId}`,

        transformResponse:
          unwrap<SiteForm>,

        providesTags: [
          "Forms" as any
        ]
      }),

      getPublicFormById: builder.query<
        SiteForm,
        {
          siteId: number | string;
          formId: number | string;
        }
      >({
        query: ({
          siteId,
          formId
        }) =>
          `/public/sites/${siteId}/forms/${formId}`,

        transformResponse:
          unwrap<SiteForm>,

        providesTags: [
          "Forms" as any
        ]
      }),

      getFormBySlug: builder.query<
        SiteForm,
        {
          siteId: number | string;
          slug: string;
        }
      >({
        query: ({
          siteId,
          slug
        }) =>
          `/sites/${siteId}/forms/slug/${slug}`,

        transformResponse:
          unwrap<SiteForm>,

        providesTags: [
          "Forms" as any
        ]
      }),

      createForm: builder.mutation<
        SiteForm,
        {
          siteId: number | string;
          body: {
            name: string;
            slug?: string;
            pageId?: number | null;
            schema?: FormSchemaField[];
            settings?: Record<string, any>;
            isActive?: boolean;
          };
        }
      >({
        query: ({
          siteId,
          body
        }) => ({
          url: `/sites/${siteId}/forms`,
          method: "POST",
          body
        }),

        transformResponse:
          unwrap<SiteForm>,

        invalidatesTags: [
          "Forms" as any
        ]
      }),

      updateForm: builder.mutation<
        SiteForm,
        {
          siteId: number | string;
          formId: number | string;
          body: {
            name?: string;
            slug?: string;
            pageId?: number | null;
            schema?: FormSchemaField[];
            settings?: Record<string, any>;
            isActive?: boolean;
          };
        }
      >({
        query: ({
          siteId,
          formId,
          body
        }) => ({
          url:
            `/sites/${siteId}/forms/${formId}`,
          method: "PUT",
          body
        }),

        transformResponse:
          unwrap<SiteForm>,

        invalidatesTags: [
          "Forms" as any
        ]
      }),

      deleteForm: builder.mutation<
        boolean,
        {
          siteId: number | string;
          formId: number | string;
        }
      >({
        query: ({
          siteId,
          formId
        }) => ({
          url:
            `/sites/${siteId}/forms/${formId}`,
          method: "DELETE"
        }),

        transformResponse:
          unwrap<boolean>,

        invalidatesTags: [
          "Forms" as any
        ]
      }),

    getFormSubmissions: builder.query<
  FormSubmission[],
  {
    siteId: number | string;
    formId: number | string;
  }
>({
  query: ({
    siteId,
    formId
  }) =>
    `/sites/${siteId}/forms/${formId}/submissions`,

  transformResponse:
    unwrap<FormSubmission[]>,

  providesTags: [
    "Forms" as any
  ]
}),
updateFormSubmissionStatus:
  builder.mutation<
    FormSubmission,
    {
      siteId: number | string;
      formId: number | string;
      submissionId: number | string;
      status: FormSubmissionStatus;
    }
  >({
    query: ({
      siteId,
      formId,
      submissionId,
      status
    }) => ({
      url:
        `/sites/${siteId}/forms/${formId}/submissions/${submissionId}`,
      method: "PATCH",
      body: {
        status
      }
    }),

    transformResponse:
      unwrap<FormSubmission>,

    invalidatesTags: [
      "Forms" as any
    ]
  }),

deleteFormSubmission:
  builder.mutation<
    boolean,
    {
      siteId: number | string;
      formId: number | string;
      submissionId: number | string;
    }
  >({
    query: ({
      siteId,
      formId,
      submissionId
    }) => ({
      url:
        `/sites/${siteId}/forms/${formId}/submissions/${submissionId}`,
      method: "DELETE"
    }),

    transformResponse:
      unwrap<boolean>,

    invalidatesTags: [
      "Forms" as any
    ]
  }),
      submitPublicForm: builder.mutation<
        {
          id: number;
          status: string;
        },
        {
          siteId: number | string;
          formId: number | string;
          body: {
            values: Record<string, any>;
            pageId?: number | null;
          };
        }
      >({
        query: ({
          siteId,
          formId,
          body
        }) => ({
          url:
            `/public/sites/${siteId}/forms/${formId}/submit`,
          method: "POST",
          body
        }),
        transformResponse:
          unwrap<{
            id: number;
            status: string;
          }>
      })
      
    })
  });

export const {
  useGetFormsQuery,
  useGetFormByIdQuery,
  useGetPublicFormByIdQuery,
  useGetFormBySlugQuery,
  useCreateFormMutation,
  useUpdateFormMutation,
  useDeleteFormMutation,
  useGetFormSubmissionsQuery,
  useUpdateFormSubmissionStatusMutation,
  useDeleteFormSubmissionMutation,
  useSubmitPublicFormMutation
} = formsApi;
