USE quicker
INSERT INTO Supplies (supplyName, supplyType, supplyQty, supplyPrice)
VALUES
-- Tests
('Blood Chemistry', 'test:Laboratory', -1, 50.0000),
('Complete Blood Count (CBC)', 'test:Laboratory', -1, 30.0000),
('Urinalysis', 'test:Laboratory', -1, 20.0000),
('X-Ray', 'test:Imaging', -1, 100.0000),
('Ultrasound', 'test:Imaging', -1, 150.0000),
('CT Scan', 'test:Imaging', -1, 500.0000),
('MRI', 'test:Imaging', -1, 1000.0000),
('Electrocardiogram (EKG)', 'test:Diagnostic', -1, 75.0000),
('Echocardiogram', 'test:Diagnostic', -1, 200.0000),

-- Treatments
('Wound Dressing Change', 'treatment:Treatment', -1, 50.0000),
('IV Infusion Therapy', 'treatment:Treatment', -1, 150.0000),
('Blood Transfusion', 'treatment:Treatment', -1, 250.0000),
('Nebulization Treatment', 'treatment:Treatment', -1, 30.0000),
('Oxygen Therapy', 'treatment:Treatment', -1, 50.0000),
('Suturing', 'treatment:Treatment', -1, 100.0000),
('Fracture Reduction', 'treatment:Treatment', -1, 300.0000),
('Emergency Intubation', 'treatment:Treatment', -1, 1000.0000),
('Defibrillation', 'treatment:Treatment', -1, 800.0000),

-- Respiratory Supplies
('Endotracheal Tube', 'supply:Respiratory', 50, 15.0000),
('Oxygen Mask', 'supply:Respiratory', 30, 5.0000),
('Suction Device', 'supply:Respiratory', 15, 50.0000),

-- WoundCare Supplies
('Sterile Dressing', 'supply:Wound_Care', 100, 2.0000),
('Bandages', 'supply:Wound_Care', 80, 1.5000),
('Gauze', 'supply:Wound_Care', 120, 0.7500),
('Wound Cleaning Supplies', 'supply:Wound_Care', 60, 10.0000),
('Sutures', 'supply:Wound_Care', 40, 25.0000),

-- IV Supplies
('IV Catheter', 'supply:IV', 150, 3.5000),
('Saline Solution', 'supply:IV', 90, 2.0000),
('Syringes', 'supply:IV', 200, 0.5000),
('IV Fluids', 'supply:IV', 70, 6.0000),

-- Medication Supplies
('Pain Relievers', 'supply:Medication', 60, 5.0000),
('Antibiotics', 'supply:Medication', 75, 8.0000),
('Sedatives', 'supply:Medication', 50, 15.0000),

-- Monitoring Supplies
('ECG Leads', 'supply:Monitoring', 90, 10.0000),
('Blood Pressure Cuff', 'supply:Monitoring', 80, 15.0000),
('Thermometers', 'supply:Monitoring', 100, 10.0000),
('Pulse Oximeter', 'supply:Monitoring', 60, 20.0000),
('Glucometer', 'supply:Monitoring', 50, 25.0000),

-- Diagnostic Supplies
('Stethoscope', 'supply:Diagnostic', 120, 20.0000),
('Ophthalmoscope', 'supply:Diagnostic', 30, 40.0000),
('Urinalysis Kit', 'supply:Diagnostic', 150, 5.0000),
('Lab Test Kits', 'supply:Diagnostic', 100, 12.0000),

-- Resuscitation Supplies
('Defibrillator', 'supply:Resuscitation', 10, 1000.0000),
('Oxygen Tank', 'supply:Resuscitation', 40, 100.0000),
('Intubation Kit', 'supply:Resuscitation', 20, 75.0000),

-- PPE Supplies
('Gloves', 'supply:PPE', 500, 0.1000),
('Gowns', 'supply:PPE', 200, 2.0000),
('Masks', 'supply:PPE', 350, 1.5000),
('Face Shields', 'supply:PPE', 120, 5.0000),

-- Orthopedic Supplies
('Splints', 'supply:Orthopedic', 60, 15.0000),
('Braces', 'supply:Orthopedic', 50, 20.0000),
('Slings', 'supply:Orthopedic', 100, 10.0000),

-- Patient Transport Supplies
('Stretchers', 'supply:PatientTransport', 30, 150.0000),
('Backboards', 'supply:PatientTransport', 40, 60.0000),
('Wheelchair', 'supply:PatientTransport', 25, 100.0000),

-- Surgical Supplies
('Scalpel', 'supply:Surgical', 100, 3.0000),
('Forceps', 'supply:Surgical', 75, 5.0000),
('Scissors', 'supply:Surgical', 60, 6.0000),
('Hemostats', 'supply:Surgical', 80, 7.0000),
('Retractors', 'supply:Surgical', 40, 25.0000),

-- Miscellaneous Supplies
('Surgical Drapes', 'supply:Miscellaneous', 100, 10.0000),
('Antiseptics', 'supply:Miscellaneous', 200, 5.0000)
