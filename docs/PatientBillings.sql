USE [quicker]
GO

/****** Object:  Table [dbo].[PatientBillings]    Script Date: 11/27/2024 04:48:53 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PatientBillings](
	[patientBillingID] [int] IDENTITY(1,1) NOT NULL,
	[admissionID] [int] NOT NULL,
	[billingItemDetails] [nvarchar](255) NOT NULL,
	[billingItemPrice] [decimal](19, 4) NOT NULL,
	[billingItemQty] [int] NOT NULL,
	[billingItemDiscount] [decimal](19, 4) NOT NULL,
 CONSTRAINT [PK_PatientBillings] PRIMARY KEY CLUSTERED 
(
	[patientBillingID] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

