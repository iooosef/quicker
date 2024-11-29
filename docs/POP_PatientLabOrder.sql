INSERT INTO quicker.dbo.PatientLabOrders
(admissionID, supplyID, labOrderedOn, labResultStatus)
VALUES
    (3, 8, DATEADD(MINUTE, -85, GETDATE()), 'Available'),
    (3, 9, DATEADD(MINUTE, -79, GETDATE()), 'Available'),
    (3, 1, DATEADD(MINUTE, -72, GETDATE()), 'Pending'),
    (5, 1, DATEADD(MINUTE, -27, GETDATE()), 'Pending'),
    (5, 2, DATEADD(MINUTE, -18, GETDATE()), 'Pending'),
    (5, 4, DATEADD(MINUTE, -5, GETDATE()), 'Pending')