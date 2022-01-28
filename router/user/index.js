const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  const { isManager } = req.user;

  return res.status(200).json(user[0]);
});

module.exports = router;
