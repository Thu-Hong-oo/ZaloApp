const express = require("express");
const { getContacts, getContact, createContact, removeContact } = require("../controllers/contactController");

const router = express.Router();

router.get("/", getContacts);  // Đảm bảo hàm `getContacts` tồn tại
router.get("/:contactid/:tenDB", getContact);
router.post("/", createContact);
router.delete("/:contactid/:tenDB", removeContact);

module.exports = router;
