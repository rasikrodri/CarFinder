using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Dynamic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace CarFinder.api
{
    public class CarsController : ApiController
    {
        private SqlConnection conn = null;
        private SqlDataReader rdr = null;
        private string operate = ""; 

        /// <summary>
        /// Returns all the cars that have the specified attributes.
        /// At list one defined attribute has to be passed, the other ones can stay null
        /// You can do any combination
        /// </summary>
        /// <param name="year"></param>
        /// <param name="make"></param>
        /// <param name="model"></param>
        /// <param name="trim"></param>
        /// <param name="show_ammount"></param>
        /// <param name="page"></param>
        /// <returns>Array of Jason objects</returns>
        public IEnumerable<ExpandoObject> Get(string year, string make, string model, string trim, int show_ammount, int page)
        {
            List<ExpandoObject> rtval = new List<ExpandoObject>();

            using (conn = new SqlConnection("Server=tcp:mbmuw7kmu9.database.windows.net,1433;Database=martineza-carfinder;User ID=CoderFoundry@mbmuw7kmu9;Password=LearnToCode1;Trusted_Connection=False;Encrypt=True;Connection Timeout=30;"))
            //using (conn = new SqlConnection("Server=.\\SQLEXPRESS2014;Database=HCL2;Integrated Security=true"))
            {
                conn.Open();

                SqlCommand cmd = new SqlCommand("Antonios_GetCarsByAnyProperty", conn);
                //SqlCommand cmd = new SqlCommand("GetCars", conn);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                operate = Operators(year, make, model, trim);

                cmd.Parameters.AddWithValue("@op", operate);
                cmd.Parameters.AddWithValue("@year", year);
                cmd.Parameters.AddWithValue("@make", make);
                cmd.Parameters.AddWithValue("@model", model);
                cmd.Parameters.AddWithValue("@trim", trim);

                rdr = cmd.ExecuteReader();
                while (rdr.Read())
                {
                    var car = new ExpandoObject() as IDictionary<string, Object>;

                    for (int a = 0; a < rdr.FieldCount; a++)
                    {
                        car.Add(rdr.GetName(a), rdr[a].ToString());
                    }

                    car.Add("images", "");


                    rtval.Add(car as ExpandoObject);
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

            return GetItemsInCurrentPage(show_ammount, page, rtval).ToArray();
        }

        private string Operators(string yrs, string mke, string mod, string trm)
        {
            string op = "";

            if (yrs != null) op += "Y";
            if (mke != null) op += "M";
            if (mod != null) op += "D";
            if (trm != null) op += "T";

            return op;
        }

        private List<ExpandoObject> GetItemsInCurrentPage(int quantityperpage, int currentpage, List<ExpandoObject> items)
        {
            var newlist = new List<ExpandoObject>();
            int totalCars = items.Count;
            int totalPages = (int)Math.Ceiling((float)items.Count / (float)quantityperpage);
            
            //for example if we are in the last page and the items per page change to more items per page
            //then we will end up with less pages, we have to go to the new las page
            if(totalPages<currentpage)
            {
                currentpage = totalPages;
            }

            int startIndex = 0;
            if (currentpage > 0)
            {
                currentpage--;//nessesary
                startIndex = currentpage * quantityperpage;
            }
            

            int grabbed = 0;
            for(int i=startIndex;i<items.Count();i++)
            {
                if (grabbed == quantityperpage)
                {
                    break;
                }

                if (items.Count()> 0)
                {
                    newlist.Add(items[i]);
                }
                

                grabbed++;
            }

            //Set up paging            
            var paging = new ExpandoObject() as IDictionary<string, Object>;
            paging.Add("total_pages", totalPages);//total pages
            paging.Add("total_cars", totalCars);//total pages
            newlist.Insert(0, paging as ExpandoObject);

            return newlist;
        }
    }
}
