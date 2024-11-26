INSERT INTO [dbo].[PatientAdmissions] 
    ([patientID], [patientName], [patientTriage], [patientStatus], [patientBedLocCode], [patientAdmitOn], [patientOutOn], [patientERCause]) 
VALUES 
    (1, N'Felipe Santos', 3, N'admitted-ER', N'LOC001', '2024-11-01 08:30:00', NULL, N'Dengue fever'),
    (2, N'Miguel Espinosa', 4, N'discharged', N'LOC001', '2024-11-02 14:00:00', '2024-11-05 10:00:00', N'Mild trauma'),
    (4, N'Lucky Chan', 2, N'admitted-ER', N'LOC002', '2024-11-15 18:45:00', NULL, N'Severe Hypertension'),
    (6, N'Papi Bin Laden', 3, N'discharged', N'LOC002', '2024-11-20 11:15:00', '2024-11-23 16:30:00', N'Fractured arm');