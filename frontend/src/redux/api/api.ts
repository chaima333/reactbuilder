

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,

  tagTypes: [
    'Sites',
    'Pages',
    'Media',
    'Users',
    'User',
     'Stats',
    'PendingUsers',
    'Activity',
    "AdminStats",
    "Plugins",
    "ActivityLogs",
    "AdminSettings",
    "PlatformSettings",
    "Notifications",
     "Dashboard",
     "SiteMembers",
     "PartnerApplications",
     "AiActivity",
     "Forms",
     "Patterns"
    ],

  endpoints: () => ({}),
});
