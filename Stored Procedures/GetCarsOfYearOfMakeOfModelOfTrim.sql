-- ================================================
-- Template generated from Template Explorer using:
-- Create Procedure (New Menu).SQL
--
-- Use the Specify Values for Template Parameters 
-- command (Ctrl-Shift-M) to fill in the parameter 
-- values below.
--
-- This block of comments will not be included in
-- the definition of the procedure.
-- ================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE GetCarsOfYearOfMakeOfModelOfTrim
	-- Add the parameters for the stored procedure here
	@year nvarchar(50),
	@make nvarchar(50),
	@model nvarchar(50),
	@trim nvarchar(128)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
	SELECT DISTINCT * FROM Cars WHERE 
	model_year = @year AND 
	make = @make AND 
	model_name = @model AND 
	model_trim = @trim
	ORDER BY model_name DESC

END
GO
