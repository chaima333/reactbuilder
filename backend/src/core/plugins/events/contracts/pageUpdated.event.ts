export interface PageUpdatedEvent {
  type: "page.updated";

  data: {
    current: any;
    previous: any;
    changes: string[];
    flags: {
      shouldVersion: boolean;
      shouldSEO: boolean;
    };
  };

  context: {
    userId: number;
    siteId: number;
  };

  meta: {
    eventId: string;
    timestamp: number;
    source: string;
  };
}


export const isValidPageUpdatedEvent = (payload: any): payload is PageUpdatedEvent => {
  return (
    payload &&
    payload.type === "page.updated" &&
    payload.data?.current !== undefined &&
    typeof payload.context?.userId === "number" &&
    typeof payload.context?.siteId === "number" &&
    typeof payload.meta?.eventId === "string" &&
    typeof payload.meta?.timestamp === "number"
  );
};