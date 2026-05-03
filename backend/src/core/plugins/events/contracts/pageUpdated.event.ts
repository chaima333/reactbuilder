

export type PageUpdatedEvent = {
  type: "page.updated";   

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


export const isValidPageUpdatedEvent = (
  payload: any
): payload is PageUpdatedEvent => {
  return (
    payload &&
    payload.type === "page.updated" &&
    payload.data &&
    typeof payload.data.current !== "undefined" &&
    payload.context &&
    typeof payload.context.userId === "number" &&
    payload._meta &&
    typeof payload._meta.eventId === "string"
  );
};