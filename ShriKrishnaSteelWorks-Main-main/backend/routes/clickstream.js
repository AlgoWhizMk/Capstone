// backend/routes/clickstream.js
import express     from "express";
import ClickEvent  from "../models/ClickEvent.js";

const router = express.Router();

// POST /api/clickstream  —  record one or many click events (batch)
router.post("/", async (req, res) => {
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];
    const docs = events.map(e => ({
      path:      e.path      || "/",
      tagName:   e.tagName   || "DIV",
      id:        e.id        || "",
      className: e.className || "",
      user:      e.user      || "Anonymous",
      sessionId: e.sessionId || "",
    }));
    await ClickEvent.insertMany(docs, { ordered: false });
    res.status(201).json({ saved: docs.length });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/clickstream  —  all events (newest first, capped at 2000)
router.get("/", async (req, res) => {
  try {
    const limit  = Math.min(Number(req.query.limit) || 500, 2000);
    const events = await ClickEvent.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/clickstream/stats  —  aggregated summary for dashboard
router.get("/stats", async (req, res) => {
  try {
    const now      = new Date();
    const today    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo  = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);

    const [total, todayCount, weekCount, topPages, byHour, byDay, byWeek, byMonth, uniqueUsers] = await Promise.all([
      ClickEvent.countDocuments({}),
      ClickEvent.countDocuments({ createdAt: { $gte: today } }),
      ClickEvent.countDocuments({ createdAt: { $gte: weekAgo } }),

      // Top 10 pages
      ClickEvent.aggregate([
        { $group: { _id: "$path", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Clicks per hour for the last 24 hours
      ClickEvent.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 24 * 3600 * 1000) } } },
        { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Clicks per day for the last 30 days
      ClickEvent.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) } } },
        { $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } },
            count: { $sum: 1 },
        }},
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]),

      // Clicks per week for the last 12 weeks
      ClickEvent.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 12 * 7 * 24 * 3600 * 1000) } } },
        { $group: {
            _id: { year: { $year: "$createdAt" }, week: { $isoWeek: "$createdAt" } },
            count: { $sum: 1 },
        }},
        { $sort: { "_id.year": 1, "_id.week": 1 } },
      ]),

      // Clicks per month for the last 12 months
      ClickEvent.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 365 * 24 * 3600 * 1000) } } },
        { $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            count: { $sum: 1 },
        }},
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // Unique users count
      ClickEvent.distinct("user"),
    ]);

    res.json({
      total,
      todayCount,
      weekCount,
      uniqueUsers:  uniqueUsers.length,
      topPages:     topPages.map(p => ({ path: p._id, count: p.count })),
      byHour:       byHour.map(h => ({ hour: h._id, count: h.count })),
      byDay:        byDay.map(d => ({ date: `${d._id.year}-${String(d._id.month).padStart(2,'0')}-${String(d._id.day).padStart(2,'0')}`, count: d.count })),
      byWeek:       byWeek.map(w => ({ week: `${w._id.year}-W${w._id.week}`, count: w.count })),
      byMonth:      byMonth.map(m => ({ month: `${m._id.year}-${String(m._id.month).padStart(2,'0')}`, count: m.count })),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /api/clickstream  —  clear all events
router.delete("/", async (req, res) => {
  try {
    const result = await ClickEvent.deleteMany({});
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
