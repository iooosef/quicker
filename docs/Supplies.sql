/*
   Tuesday, November 12, 20248:08:20 PM
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
CREATE TABLE dbo.Supplies
	(
	supplyID int NOT NULL IDENTITY (1, 1),
	supplyName nvarchar(MAX) NOT NULL,
	supplyType nvarchar(50) NOT NULL,
	supplyQty int NOT NULL,
	supplyPrice decimal(19, 4) NULL
	)  ON [PRIMARY]
	 TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE dbo.Supplies ADD CONSTRAINT
	PK_Supplies PRIMARY KEY CLUSTERED 
	(
	supplyID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
ALTER TABLE dbo.Supplies SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.Supplies', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.Supplies', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.Supplies', 'Object', 'CONTROL') as Contr_Per 
GO

INSERT INTO quicker.dbo.Supplies (supplyName, supplyType, supplyQty, supplyPrice)
VALUES
('Emergency Room Fee', 'base_fee', -1, 2500.0000)