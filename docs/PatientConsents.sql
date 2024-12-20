USE [quicker]
GO

/****** Object:  Table [dbo].[PatientConsents]    Script Date: 11/27/2024 04:22:03 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PatientConsents](
	[consentID] [int] IDENTITY(1,1) NOT NULL,
	[admissionID] [int] NOT NULL,
	[consentSignedOn] [datetime] NOT NULL,
	[consentSignature] [image] NOT NULL,
 CONSTRAINT [PK_PatientConsents] PRIMARY KEY CLUSTERED 
(
	[consentID] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO


