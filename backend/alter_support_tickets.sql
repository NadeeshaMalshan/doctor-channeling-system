USE doctor_channeling_db;

ALTER TABLE support_tickets 
MODIFY COLUMN status ENUM('Pending', 'Resolved', 'Rejected', 'Approved') DEFAULT 'Pending';

ALTER TABLE support_tickets 
ADD COLUMN hr_reply TEXT,
ADD COLUMN has_new_update TINYINT(1) DEFAULT 0;
