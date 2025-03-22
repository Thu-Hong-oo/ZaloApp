const express = require("express");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

app.use(express.json());
app.use("/api/contacts", contactRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
