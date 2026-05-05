import { eventStore } from "../../../core/plugins/events/event.store";

export const getLiveEvents = async (req, res) => {
  try {
    const events = await eventStore.getLatest();

    return res.json({
      success: true,
      data: events || []
    });

  } catch (err) {
    console.error("🚨 monitor error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch events"
    });
  }
};