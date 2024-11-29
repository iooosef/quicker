INSERT INTO quicker.dbo.PatientTreatmentOrders
(admissionID, supplyID, treatmentOrderedOn)
VALUES
    (3, 11, DATEADD(MINUTE, -90, GETDATE())),
    (3, 14, DATEADD(MINUTE, -54, GETDATE())),
    (5, 18, DATEADD(MINUTE, -15, GETDATE()))