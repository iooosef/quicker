-- Insert script for populating the Beds table

-- Inserting 10 active beds
INSERT INTO [dbo].[Beds] ([bedLocCode], [bedStatus])
VALUES 
('LOC001', 'available'),
('LOC002', 'available'),
('LOC003', 'available'),
('LOC004', 'available'),
('LOC005', 'available'),
('LOC006', 'available'),
('LOC007', 'available'),
('LOC008', 'available'),
('LOC009', 'available'),
('LOC010', 'available');

-- Inserting additional beds with other statuses
INSERT INTO [dbo].[Beds] ([bedLocCode], [bedStatus])
VALUES 
('LOC003', 'maintenance'),
('LOC008', 'inactive'),
('LOC010', 'disposed'),
('LOC007', 'disposed'),
('LOC008', 'disposed'),
('LOC009', 'disposed'),
('LOC001', 'disposed'),
('LOC005', 'inactive'),
('LOC004', 'maintenance');