/*
   Tuesday, November 12, 202410:00:05 PM
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
CREATE TABLE dbo.PatientConsents
	(
	consentID int NOT NULL IDENTITY (1, 1),
	patientID int NOT NULL,
	consentSignedOn datetime NOT NULL,
	consentSignature image NOT NULL
	)  ON [PRIMARY]
	 TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE dbo.PatientConsents ADD CONSTRAINT
	PK_PatientConsents PRIMARY KEY CLUSTERED 
	(
	consentID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
ALTER TABLE dbo.PatientConsents SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.PatientConsents', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.PatientConsents', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.PatientConsents', 'Object', 'CONTROL') as Contr_Per 