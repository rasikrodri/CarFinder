USE [HCL2]
GO
/****** Object:  StoredProcedure [dbo].[GetMakesofYear]    Script Date: 2/21/2015 6:24:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [dbo].[GetMakesOfYear]
	@year nvarchar(10)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
	SELECT DISTINCT make FROM Cars WHERE model_year = @year ORDER BY make DESC
END
