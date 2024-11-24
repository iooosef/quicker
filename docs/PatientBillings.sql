/*
   Tuesday, November 12, 202410:35:49 PM
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
CREATE TABLE dbo.PatientBillings
	(
	patientBillingID int NOT NULL IDENTITY (1, 1),
	patientID int NOT NULL,
	billingItemDetails nvarchar(255) NOT NULL,
	billingItemPrice decimal(19, 4) NOT NULL,
	billingItemQty int NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.PatientBillings ADD CONSTRAINT
	PK_PatientBillings PRIMARY KEY CLUSTERED 
	(
	patientBillingID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
ALTER TABLE dbo.PatientBillings SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.PatientBillings', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.PatientBillings', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.PatientBillings', 'Object', 'CONTROL') as Contr_Per 