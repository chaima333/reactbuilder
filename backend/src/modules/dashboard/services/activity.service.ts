import { ActivityLog } from "../../../models";

export class ActivityService {

  static async log(data: {
    userId: number;
    siteId: number;
    action: string;
    entityType: string;
    entityId: number;
  }) {

    await ActivityLog.create({
      userId: data.userId,
      siteId: data.siteId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId
    });

  }

}