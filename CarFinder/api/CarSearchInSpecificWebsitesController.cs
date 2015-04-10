using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;
using System.Web.Http.Description;

namespace CarFinder.api
{
    [ApiExplorerSettings(IgnoreApi=true)]
    public class CarSearchInSpecificWebsitesController : ApiController
    {
        public class CarInfo
        {
            /// <summary>
            /// what we ar going to search for
            /// </summary>
            public string year { get; set; }
            public string make { get; set; }
            public string  model { get; set; }
            public string trim { get; set; }

            /// <summary>
            /// Because the get function is run in a separate thread
            /// we need to store the index of the car that asked for th image
            /// so that we can latter set the image in that car
            /// </summary>
            public int itemIndex { get; set; }
        }

        // GET: api/CarSearchInSpecificWebsites
        public ExpandoObject Post(CarInfo carinfo)
        {
            carinfo.year = carinfo.year.Replace(" ", "+").Trim();
            carinfo.make = carinfo.make.Replace(" ", "+").Trim();
            carinfo.model = carinfo.model.Replace(" ", "+").Trim();
            carinfo.trim = carinfo.trim.Replace(" ", "+").Trim();

            var imagesFound = FindnetcarshowImages(carinfo);
            
            if (imagesFound.Count() != 0)
            {
                imagesFound.RemoveAt(0);//remove the firefox mozila logo

                var obj = new ExpandoObject() as IDictionary<string, Object>;
                obj.Add("images", imagesFound);
                obj.Add("index", carinfo.itemIndex.ToString());
                return obj as ExpandoObject;
            }
            else
            {
                var obj = new ExpandoObject() as IDictionary<string, Object>;
                obj.Add("image", "");
                obj.Add("index", carinfo.itemIndex.ToString());
                return obj as ExpandoObject;
            }
        }

        private List<ExpandoObject> FindnetcarshowImages(CarInfo carinfo)
        {
            List<ExpandoObject> imagesFound = new List<ExpandoObject>();

            //Do different searches first by year-make-model-trim
            Uri uri = new Uri("http://www.superbwallpapers.com/search/" +
                carinfo.year + "+" +
                carinfo.make + "+" +
                carinfo.model + //"+" +
                //carinfo.trim
                "/"
                );


            try
            {
                HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create(uri);

                //System.Net.WebHeaderCollection headers = request.GetResponse().Headers;

                ////Loops through all the headers
                //List<string> sb = new List<string>();
                //for (int i = 0; i < headers.Count; i++)
                //{
                //    //Adds all the headers to the stringbuilder.
                //    sb.Add(headers[i].ToString());
                //}

                request.Method = WebRequestMethods.Http.Get;
                HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                StreamReader reader = new StreamReader(response.GetResponseStream());
                string theHTML = reader.ReadToEnd();
                response.Close();

                if (!theHTML.Contains("Sorry, no wallpapers found. Please try other searches."))
                {
                    //Grab the first links to an image page
                    int atIndex = theHTML.IndexOf("<a href=\"/cars/");
                    if(atIndex != -1)
                    {
                        //grab the link
                        int end = theHTML.IndexOf(">",atIndex + 9);                        
                        string anchor = theHTML.Substring(atIndex, end - atIndex + 1);
                        end = anchor.IndexOf("title", 9)-1;
                        string link = anchor.Substring(9, end - 9).Trim();
                        link = link.Replace("\"", "");
                        while(link=="/cars/")
                        {
                            atIndex = theHTML.IndexOf("<a href=\"/cars/", atIndex + 9);
                            end = theHTML.IndexOf(">", atIndex + 9);
                            anchor = theHTML.Substring(atIndex, end - atIndex + 1);
                            end = anchor.IndexOf("title", 9) - 1;
                            link = anchor.Substring(9, end - 9).Trim();
                            link = link.Replace("\"", "");
                        }

                        //Second page
                        uri = new Uri("http://www.superbwallpapers.com" + link);
                        response = (HttpWebResponse)request.GetResponse();
                        reader = new StreamReader(response.GetResponseStream());
                        theHTML = reader.ReadToEnd();
                        response.Close();
                    }
                    
                    
                }
            }
            catch (WebException webEx)            
            {                
                HttpWebResponse response = webEx.Response as HttpWebResponse;
            }

            return imagesFound;
        }
    }
}
