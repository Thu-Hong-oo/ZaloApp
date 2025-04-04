const { dynamoDB } = require("../config/aws");

const TableName = process.env.DYNAMODB_TABLE_CONTACTS;

// Lấy tất cả danh bạ
const getAllContacts = async () => {
  const params = {
    TableName,
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    return data.Items;
  } catch (error) {
    console.error("Lỗi lấy danh bạ:", error);
    throw error;
  }
};

// Lấy một danh bạ theo contactid và tenDB
const getContactById = async (contactid, tenDB) => {
  const params = {
    TableName,
    Key: { contactid, tenDB },
  };

  try {
    const data = await dynamoDB.get(params).promise();
    return data.Item;
  } catch (error) {
    console.error("Lỗi lấy danh bạ theo ID:", error);
    throw error;
  }
};

// Thêm danh bạ mới
const addContact = async (contact) => {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_CONTACTS,
      Item: contact,  // Chỉ lưu `contactid` và `tenDB`
    };
  
    try {
      await dynamoDB.put(params).promise();
      return contact;
    } catch (error) {
      console.error("Lỗi thêm danh bạ:", error);
      throw error;
    }
  };
  

// Xóa danh bạ theo contactid và tenDB
const deleteContact = async (contactid, tenDB) => {
  const params = {
    TableName,
    Key: { contactid, tenDB },
  };

  try {
    await dynamoDB.delete(params).promise();
    return { message: "Xóa thành công" };
  } catch (error) {
    console.error("Lỗi xóa danh bạ:", error);
    throw error;
  }
};

module.exports = { getAllContacts, getContactById, addContact, deleteContact };
