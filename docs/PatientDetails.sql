/*
   Tuesday, November 12, 20248:55:35 PM
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
CREATE TABLE dbo.PatientDetails
	(
	patientNfoID int NOT NULL IDENTITY (1, 1),
	patientID int NOT NULL,
	patientFullName nvarchar(MAX) NOT NULL,
	patientGender nvarchar(20) NOT NULL,
	patientDOB datetime NOT NULL,
	patientAddress nvarchar(MAX) NOT NULL,
	patientContactNum nvarchar(30) NOT NULL,
	patientEmergencyContactName nvarchar(MAX) NOT NULL,
	patientEmergencyContactNumber nvarchar(30) NOT NULL,
	patientPWDID nvarchar(60) NULL,
	patientSeniorID nvarchar(60) NULL
	)  ON [PRIMARY]
	 TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE dbo.PatientDetails ADD CONSTRAINT
	PK_PatientDetails PRIMARY KEY CLUSTERED 
	(
	patientNfoID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
ALTER TABLE dbo.PatientDetails SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.PatientDetails', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.PatientDetails', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.PatientDetails', 'Object', 'CONTROL') as Contr_Per 