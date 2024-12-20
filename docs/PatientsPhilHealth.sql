USE [quicker]
GO

/****** Object:  Table [dbo].[PatientsPhilHealth]    Script Date: 11/27/2024 04:49:51 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PatientsPhilHealth](
	[patientPhilHealthID] [int] IDENTITY(1,1) NOT NULL,
	[admissionID] [int] NOT NULL,
	[philHealthIDNum] [nvarchar](255) NOT NULL,
	[philHealthEmployer] [nvarchar](255) NULL,
	[philHealthSignature] [image] NOT NULL,
	[philHealthRequestOn] [datetime] NOT NULL,
	[philHealthStatus] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_PatientsPhilHealth] PRIMARY KEY CLUSTERED 
(
	[patientPhilHealthID] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

