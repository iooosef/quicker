/*
   Tuesday, November 12, 202410:22:09 PM
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
CREATE TABLE dbo.PatientLogs
	(
	patientLogID int NOT NULL,
	patientID int NOT NULL,
	patientLogMsg nvarchar(MAX) NOT NULL,
	patientLogBy nvarchar(255) NOT NULL,
	patientLogOn datetime NOT NULL
	)  ON [PRIMARY]
	 TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE dbo.PatientLogs ADD CONSTRAINT
	PK_PatientLogs PRIMARY KEY CLUSTERED 
	(
	patientLogID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
ALTER TABLE dbo.PatientLogs SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.PatientLogs', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.PatientLogs', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.PatientLogs', 'Object', 'CONTROL') as Contr_Per 