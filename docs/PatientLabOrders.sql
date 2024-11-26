USE [quicker]
GO

/****** Object:  Table [dbo].[PatientLabOrders]    Script Date: 11/27/2024 04:50:39 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PatientLabOrders](
	[patientLabsID] [int] IDENTITY(1,1) NOT NULL,
	[admissionID] [int] NOT NULL,
	[supplyID] [int] NOT NULL,
	[labOrderedOn] [datetime] NOT NULL,
	[labResultStatus] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_PatientLabOrders] PRIMARY KEY CLUSTERED 
(
	[patientLabsID] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

