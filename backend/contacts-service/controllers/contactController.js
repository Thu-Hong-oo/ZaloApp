const { getAllContacts, getContactById, addContact, deleteContact } = require("../models/contactModel.js");

// Lấy tất cả danh bạ
const getContacts = async (req, res) => {
  try {
    const contacts = await getAllContacts();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy danh bạ" });
  }
};

// Lấy danh bạ theo contactid và tenDB
const getContact = async (req, res) => {
  const { contactid, tenDB } = req.params;

  if (!contactid || !tenDB) {
    return res.status(400).json({ error: "Thiếu contactid hoặc tenDB" });
  }

  try {
    const contact = await getContactById(contactid, tenDB);
    if (!contact) {
      return res.status(404).json({ error: "Không tìm thấy danh bạ" });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy danh bạ theo ID" });
  }
};

// Thêm danh bạ mới (chỉ lưu `contactid` và `tenDB`)
const createContact = async (req, res) => {
    const { contactid, tenDB } = req.body;
  
    if (!contactid || !tenDB) {
      return res.status(400).json({ error: "Thiếu contactid hoặc tenDB" });
    }
  
    const newContact = { contactid, tenDB };
  
    try {
      await addContact(newContact);
      res.status(201).json({ message: "Thêm danh bạ thành công", data: newContact });
    } catch (error) {
      res.status(500).json({ error: "Lỗi thêm danh bạ" });
    }
  };

// Xóa danh bạ theo contactid và tenDB
const removeContact = async (req, res) => {
  const { contactid, tenDB } = req.params;

  if (!contactid || !tenDB) {
    return res.status(400).json({ error: "Thiếu contactid hoặc tenDB" });
  }

  try {
    const result = await deleteContact(contactid, tenDB);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi xóa danh bạ" });
  }
};

module.exports = { getContacts, getContact, createContact, removeContact };
