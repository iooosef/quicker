USE [quicker]
GO
/****** Object:  Table [dbo].[Patients]    Script Date: 11/26/2024 12:03:23 ******/
SET IDENTITY_INSERT [dbo].[Patients] ON
INSERT [dbo].[Patients] ([patientID], [patientFullName], [patientGender], [patientDOB], [patientAddress], [patientContactNum], [patientEmergencyContactName], [patientEmergencyContactNum], [patientPWDID], [patientSeniorID]) VALUES (1, N'Felipe Santos', N'Male', CAST(0x000079EB00000000 AS DateTime), N'123 Narra Street', N'123-456-7890', N'Don Bosco Santos', N'987-654-3210', NULL, NULL),
(2, N'Miguel Espinosa', N'Female', CAST(0x000080B800000000 AS DateTime), N'456 Itakan Avenue', N'234-567-8901', N'Linda Espinosa', N'876-543-2109', N'PWD12345', NULL),
(3, N'Christina Santisima', N'Male', CAST(0x000067F100000000 AS DateTime), N'789 Palusot Road', N'345-678-9012', N'Adolf Kelsler', N'765-432-1098', NULL, N'SR67890'),
(4, N'Lucky Chan', N'Female', CAST(0x00005DBB00000000 AS DateTime), N'321 Tinira Boulevard', N'456-789-0123', N'Hap Chan', N'654-321-0987', NULL, N'SR12345'),
(5, N'Mai Lee Vought', N'Male', CAST(0x00008EAC00000000 AS DateTime), N'654 Sabog Lane', N'567-890-1234', N'Christopher Vought', N'543-210-9876', NULL, NULL),
(6, N'Papi Bin Laden', N'Male', CAST(0x0000911700000000 AS DateTime), N'250 Maasim Drive', N'123-456-7890', N'Barrack Bunganga', N'091-191-1911', NULL, NULL)
SET IDENTITY_INSERT [dbo].[Patients] OFF
