const db = require('./config/db');

async function addAttachmentColumn() {
    try {
        const [columns] = await db.query("SHOW COLUMNS FROM support_tickets LIKE 'attachment_path'");
        if (columns.length === 0) {
            console.log("Column 'attachment_path' does not exist. Adding...");
            await db.query("ALTER TABLE support_tickets ADD COLUMN attachment_path VARCHAR(255) NULL");
            console.log("Column added successfully!");
        } else {
            console.log("Column 'attachment_path' already exists.");
        }
    } catch (error) {
        console.error("Error modifying table:", error);
    } finally {
        process.exit();
    }
}

addAttachmentColumn();
