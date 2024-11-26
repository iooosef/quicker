USE [quicker]
GO

/****** Object:  Table [dbo].[PatientTreatmentOrders]    Script Date: 11/12/2024 22:38:26 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PatientTreatmentOrders](
	[patientTreatmentsID] [int] IDENTITY(1,1) NOT NULL,
	[patientID] [int] NOT NULL,
	[supplyID] [int] NOT NULL,
	[treatmentOrderedOn] [datetime] NOT NULL,
 CONSTRAINT [PK_PatientTreatmentOrders] PRIMARY KEY CLUSTERED 
(
	[patientTreatmentsID] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

