

export type PageUpdatedEvent = {
  data: {
    current: any;
    previous: any;
    shouldVersion: boolean;
  };

  context: {
    userId: number;
    siteId: number;
  };

  _meta: {
    eventId: string;
    timestamp: number;
    source: string;
  };
};


export const isValidPageUpdatedEvent = (payload: any): boolean => {
  return (
    payload?.data?.current &&
    payload?.context?.userId &&
    payload?._meta?.eventId
  );
};