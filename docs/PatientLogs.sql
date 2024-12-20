USE [quicker]
GO

/****** Object:  Table [dbo].[PatientLogs]    Script Date: 11/27/2024 04:51:11 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PatientLogs](
	[patientLogID] [int] IDENTITY(1,1) NOT NULL,
	[admissionID] [int] NOT NULL,
	[patientLogMsg] [nvarchar](max) NOT NULL,
	[patientLogBy] [nvarchar](255) NOT NULL,
	[patientLogOn] [datetime] NOT NULL,
 CONSTRAINT [PK_PatientLogs] PRIMARY KEY CLUSTERED 
(
	[patientLogID] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

