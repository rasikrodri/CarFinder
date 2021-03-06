USE [HCL2]
GO
/****** Object:  StoredProcedure [dbo].[GetCarsWithMoreThan300HP]    Script Date: 2/21/2015 6:51:40 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE GetCarsWithMoreThan300HP
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
	SELECT DISTINCT * FROM Cars WHERE engine_power_ps != 'Not Available' AND
	engine_power_ps != ' ' AND
	 CAST(engine_power_ps AS INT)  > 300 ORDER BY engine_power_ps DESC
END
