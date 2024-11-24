/*
   Tuesday, November 12, 202410:10:22 PM
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
CREATE TABLE dbo.PatientsPhilHealth
	(
	patientPhilHealthID int NOT NULL IDENTITY (1, 1),
	patientID int NOT NULL,
	philHealthIDNum nvarchar(255) NOT NULL,
	philHealthEmployer nvarchar(255) NOT NULL,
	philHealthSignature image NOT NULL,
	philHealthRequestOn datetime NOT NULL,
	philHealthStatus nvarchar(50) NOT NULL
	)  ON [PRIMARY]
	 TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE dbo.PatientsPhilHealth ADD CONSTRAINT
	PK_PatientsPhilHealth PRIMARY KEY CLUSTERED 
	(
	patientPhilHealthID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
ALTER TABLE dbo.PatientsPhilHealth SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.PatientsPhilHealth', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.PatientsPhilHealth', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.PatientsPhilHealth', 'Object', 'CONTROL') as Contr_Per 