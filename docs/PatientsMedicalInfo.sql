/*
   Tuesday, November 12, 202410:05:23 PM
   User: 
   Server: F1ITMOBILE2106
   Database: quicker
   Application: 
*/

/* To prevent any potential data loss issues, you should review this script in detail before running it outside the context of the database designer.*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
CREATE TABLE dbo.PatientsMedicalInfo
	(
	patientMedNfoID int NOT NULL IDENTITY (1, 1),
	patientID int NOT NULL,
	patientMedNfoHeight float(53) NOT NULL,
	patientMedNfoWeight float(53) NOT NULL,
	patientMedNfoAllergies nvarchar(MAX) NULL,
	patientMedNfoMedications nvarchar(MAX) NULL,
	patientMedNfoComorbidities nvarchar(MAX) NULL,
	patientMedNfoHistory nvarchar(MAX) NULL,
	patientMedNfoImmunization nvarchar(MAX) NULL,
	patientMedNfoFamilyHistory nvarchar(MAX) NULL,
	patientMedNfoCOVIDVaxx nvarchar(MAX) NULL
	)  ON [PRIMARY]
	 TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE dbo.PatientsMedicalInfo ADD CONSTRAINT
	PK_PatientsMedicalInfo PRIMARY KEY CLUSTERED 
	(
	patientMedNfoID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
ALTER TABLE dbo.PatientsMedicalInfo SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.PatientsMedicalInfo', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.PatientsMedicalInfo', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.PatientsMedicalInfo', 'Object', 'CONTROL') as Contr_Per 