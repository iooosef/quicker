USE [quicker]
GO

/****** Object:  Table [dbo].[PatientsHMO]    Script Date: 11/27/2024 04:50:18 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PatientsHMO](
	[patientHMOID] [int] IDENTITY(1,1) NOT NULL,
	[admissionID] [int] NOT NULL,
	[HMOIDNum] [nvarchar](255) NOT NULL,
	[HMOEmployer] [nvarchar](255) NULL,
	[HMOSignature] [image] NOT NULL,
	[HMORequestOn] [datetime] NOT NULL,
	[HMOStatus] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_PatientsHMO] PRIMARY KEY CLUSTERED 
(
	[patientHMOID] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

