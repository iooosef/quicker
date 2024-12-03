INSERT INTO quicker.dbo.PatientTreatmentOrders
(admissionID, supplyID, treatmentOrderedOn)
VALUES
    (3, 12, DATEADD(MINUTE, -90, GETDATE())),
    (3, 15, DATEADD(MINUTE, -54, GETDATE())),
    (5, 19, DATEADD(MINUTE, -15, GETDATE()))