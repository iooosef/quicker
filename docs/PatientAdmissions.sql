/*
   Monday, November 25, 202411:43:47 AM
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
CREATE TABLE dbo.PatientAdmissions
	(
	admissionID int NOT NULL IDENTITY (1, 1),
	patientID int NULL,
	patientName nvarchar(255) NOT NULL,
	patientTriage int NOT NULL,
	patientStatus nvarchar(50) NOT NULL,
	patientBedLocCode nvarchar(50) NOT NULL,
	patientAdmitOn datetime NOT NULL,
	patientOutOn datetime NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.PatientAdmissions ADD CONSTRAINT
	PK_PatientAdmission PRIMARY KEY CLUSTERED 
	(
	admissionID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
ALTER TABLE dbo.PatientAdmissions SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.PatientAdmissions', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.PatientAdmissions', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.PatientAdmissions', 'Object', 'CONTROL') as Contr_Per 