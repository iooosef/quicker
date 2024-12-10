USE quicker
INSERT INTO [dbo].[PatientAdmissions] 
    ([patientID], [patientName], [patientTriage], [patientStatus], [patientBedLocCode], [patientAdmitOn], [patientOutOn], [patientERCause], [patientBillingStatus]) 
VALUES 
    (1, N'Felipe Santos', 3, N'admitted-ER', N'LOC001', '2024-11-01 08:30:00', NULL, N'Dengue fever', 'unpiad'),
    (2, N'Miguel Espinosa', 4, N'discharged', N'LOC001', '2024-11-02 14:00:00', '2024-11-05 10:00:00', N'Mild trauma', 'paid'),
    (4, N'Lucky Chan', 2, N'admitted-ER', N'LOC002', '2024-11-15 18:45:00', NULL, N'Severe Hypertension', 'unpaid'),
    (6, N'Papi Bin Laden', 3, N'discharged', N'LOC002', '2024-11-20 11:15:00', '2024-11-23 16:30:00', N'Fractured arm', 'paid');
    
INSERT INTO [dbo].[PatientBillings] 
    ([admissionID], [billingItemDetails], [billingItemPrice], [billingItemQty], [billingItemDiscount]) 
VALUES 
    -- Felipe Santos
    (1, N'Emergency Room Fee', 2500.0000, 1, 0.0000),
    (1, N'Blood Chemistry', 50.0000, 1, 0.0000),
    (1, N'Complete Blood Count (CBC)', 30.0000, 1, 0.0000),
    (1, N'Oxygen Therapy', 50.0000, 1, 0.0000),

    -- Miguel Espinosa
    (2, N'Emergency Room Fee', 2500.0000, 1, 0.0000),
    (2, N'Sterile Dressing', 2.0000, 5, 0.0000), -- Example dressing for mild trauma
    (2, N'Bandages', 1.5000, 3, 0.0000),

    -- Lucky Chan
    (3, N'Emergency Room Fee', 2500.0000, 1, 0.0000),
    (3, N'Complete Blood Count (CBC)', 30.0000, 1, 0.0000),
    (3, N'Emergency Intubation', 1000.0000, 1, 0.0000),
    (3, N'Oxygen Mask', 5.0000, 1, 0.0000),

    -- Papi Bin Laden
    (6, N'Emergency Room Fee', 2500.0000, 1, 0.0000),
    (6, N'Fracture Reduction', 300.0000, 1, 0.0000),
    (6, N'Splints', 15.0000, 1, 0.0000),
    (6, N'X-Ray', 100.0000, 1, 0.0000);

	