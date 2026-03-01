const { setGlobalOptions } = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

setGlobalOptions({ maxInstances: 10 });

admin.initializeApp();
const db = admin.firestore();

const STATUS_DOC = db.collection("site").doc("status");
const BUILD = process.env.BUILD || "dev";
const STARTED_AT = process.env.STARTED_AT || new Date().toISOString();

exports.view = onRequest(async (req, res) => {
  try {
    res.set("Access-Control-Allow-Origin", "*");

    await STATUS_DOC.set(
      {
        views: admin.firestore.FieldValue.increment(1),
        build: BUILD,
        started: STARTED_AT,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "view_failed" });
  }
});

exports.status = onRequest(async (req, res) => {
  try {
    res.set("Access-Control-Allow-Origin", "*");

    const snap = await STATUS_DOC.get();
    const data = snap.exists ? snap.data() : {};

    res.json({
      build: data.build || BUILD,
      started: data.started || STARTED_AT,
      views: Number(data.views || 0),
    });
  } catch {
    res.status(500).json({ error: "status_failed" });
  }
});