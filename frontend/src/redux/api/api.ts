

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Stats', 'Activity', 'Sites', 'Pages', 'User', 'Media', 'Users', 'PendingUsers'],
  endpoints: () => ({}), // فارغ، سيتم ملؤه عبر injectEndpoints
});