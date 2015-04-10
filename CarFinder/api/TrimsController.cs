using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace CarFinder.api
{
    public class TrimsController : ApiController
    {
        private SqlConnection conn = null;
        private SqlDataReader rdr = null;

        /// <summary>
        /// It takes a year, a make and a model and it returns all the model for that year, make and model
        /// </summary>
        /// <param name="year"></param>
        /// <param name="make"></param>
        /// <param name="model"></param>
        /// <returns></returns>
        public IEnumerable<string> Get(string year, string make, string model)
        {
            List<string> rtval = new List<string>();

            using (conn = new SqlConnection("Server=tcp:mbmuw7kmu9.database.windows.net,1433;Database=martineza-carfinder;User ID=CoderFoundry@mbmuw7kmu9;Password=LearnToCode1;Trusted_Connection=False;Encrypt=True;Connection Timeout=30;"))
            //using (conn = new SqlConnection("Server=.\\SQLEXPRESS2014;Database=HCL2;Integrated Security=true"))
            {
                conn.Open();

                SqlCommand cmd = new SqlCommand("GetTrimsByYearMakeAndModel", conn);
                cmd.Parameters.AddWithValue("@year", year);
                cmd.Parameters.AddWithValue("@make", make);
                cmd.Parameters.AddWithValue("@model", model);
                cmd.CommandType = CommandType.StoredProcedure;
                rdr = cmd.ExecuteReader();
                while (rdr.Read())
                {
                    rtval.Add(rdr["model_trim"].ToString());
                }

                //close the connection and reader
                if (rdr != null)
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
