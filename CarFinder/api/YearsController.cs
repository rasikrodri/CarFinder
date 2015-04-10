using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace CSharpExcersicesWebApi.Controllers
{
    public class YearsController : ApiController
    {
        private SqlConnection conn = null;
        private SqlDataReader rdr = null;

        /// <summary>
        /// Returns all the years availabe in the database
        /// </summary>
        /// <returns></returns>
        public IEnumerable<string> Get()
        {
            List<string> rtval = new List<string>();

            using (conn = new SqlConnection("Server=tcp:mbmuw7kmu9.database.windows.net,1433;Database=martineza-carfinder;User ID=CoderFoundry@mbmuw7kmu9;Password=LearnToCode1;Trusted_Connection=False;Encrypt=True;Connection Timeout=30;"))
            //using (conn = new SqlConnection("Server=.\\SQLEXPRESS2014;Database=HCL2;Integrated Security=true"))
            {
                conn.Open();

                SqlCommand cmd = new SqlCommand("GetYears", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                rdr = cmd.ExecuteReader();
                while(rdr.Read())
                {
                    rtval.Add(rdr["model_Year"].ToString());
                }

                //close the connection and reader
                if(rdr != null)
                {
                    rdr.Close();
                }
                if (conn != null)
                {
                    conn.Close();
                }
            }

            return rtval.ToArray<string>();
        }
    }
}