using System;
using System.Collections;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;

namespace CarFinder.Controllers
{
    public class SearchForCarImageController : ApiController
    {
        public class SearchInfo
        {
            /// <summary>
            /// what we ar going to search for
            /// </summary>
            public string query { get; set; }

            /// <summary>
            /// Because the get function is run in a separate thread
            /// we need to store the index of the car that asked for th image
            /// so that we can latter set the image in that car
            /// </summary>
            public int itemIndex { get; set; }
        }

        /// <summary>
        /// It takes any string, goes to yahoo and searches for related images 
        /// 
        /// </summary>
        /// <param name="searchInfo">you must pass a string that represents the query 
        /// and an int representing the index int he array of the object that requested the images(nessesary if more than one object is requesting images so that we can asign the 
        /// images to the rigth object in the array</param>
        /// <returns>a Jason object with two Jason objects in it. The first one contains Json "imag" objects with "url" property that contains the url of the images. 
        /// The second one contains the index of the original object that requested the images, because of multi threading this will let you asign those
        /// images to the rigth object</returns>
        public ExpandoObject Post(SearchInfo searchInfo)
        {
            searchInfo.query = searchInfo.query.Replace(" ", "+");

            var imagesFound = FindYahooImages(searchInfo.query);            
            if (imagesFound.Count() != 0)
            {
                imagesFound.RemoveAt(0);//remove the firefox mozila logo

                var obj = new ExpandoObject() as IDictionary<string, Object>;
                obj.Add("images", imagesFound);
                obj.Add("index", searchInfo.itemIndex.ToString());
                return obj as ExpandoObject;
            }
            else
            {
                var obj = new ExpandoObject() as IDictionary<string, Object>;
                obj.Add("image", "");
                obj.Add("index", searchInfo.itemIndex.ToString());
                return obj as ExpandoObject;
            }
        }
        private List<string> FindGoogleImages(string searchCriteria)
        {
            Uri uri = new Uri("https://www.google.com/search?q=" + searchCriteria + "&es_sm=93&source=lnms&tbm=isch&sa=X&ei=E430VPWkE8rFggTws4HwCw&ved=0CAcQ_AUoAQ&biw=1242&bih=606");
            HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create(uri);
            request.Method = WebRequestMethods.Http.Get;
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            StreamReader reader = new StreamReader(response.GetResponseStream());
            string theHTML = reader.ReadToEnd();
            response.Close();

            List<string> imagesFound = new List<string>();
            //Grab the <img tag
            int atIndex = theHTML.IndexOf("<img");
            while (atIndex != -1)
            {
                //Find the first "> that is the end
                //We need to find exactly this ">
                int endIndex = theHTML.IndexOf("\">", atIndex) + 2;
                var imageTag = theHTML.Substring(atIndex, endIndex - atIndex);

                //find the index of src="
                int srcIndex = imageTag.IndexOf("src=\"") + 5;
                int dowbleCommaIndex = imageTag.IndexOf("\"", srcIndex);

                imagesFound.Add(imageTag.Substring(srcIndex, dowbleCommaIndex - srcIndex));

                atIndex = theHTML.IndexOf("<img", atIndex + 4);
            }
            return imagesFound;
        }
        private List<ExpandoObject> FindYahooImages(string searchCriteria)
        {
            Uri uri = new Uri("https://images.search.yahoo.com/search/images;_ylt=AwrBEiSa2_RUSxcAZB42m4lQ?p="  + searchCriteria +  "&fr2=piv-autos&fr=uh3_autos_vert_gs");
            HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create(uri);
            request.Method = WebRequestMethods.Http.Get;
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            StreamReader reader = new StreamReader(response.GetResponseStream());
            string theHTML = reader.ReadToEnd();
            response.Close();

            List<ExpandoObject> imagesFound = new List<ExpandoObject>();
            //Grab the <img tag
            int atIndex = theHTML.IndexOf("<img");
            while (atIndex != -1)
            {
                //Very rarely it gets the wrong index for no apparent reason
                //try
                //{
                    //Find the first "> that is the end
                    //We need to find exactly this ">
                    int endIndex = theHTML.IndexOf("/>", atIndex) + 2;
                    var imageTag = theHTML.Substring(atIndex, endIndex - atIndex);

                    //get the url
                    int srcIndex = imageTag.IndexOf("src=") + 5;//5 because of the ' i am not adding because it may be causin errors
                    int singleCommaIndex = imageTag.IndexOf("'", srcIndex);
                    int doubleCommaIndex = imageTag.IndexOf("\"", srcIndex);
                    int end;

                    if (singleCommaIndex == -1 || doubleCommaIndex == -1)
                    { 
                        int a = 0; }


                    if (singleCommaIndex == -1)
                    { 
                        end = doubleCommaIndex; }
                    else if (doubleCommaIndex == -1) 
                    { 
                        end = singleCommaIndex; }
                    else if (singleCommaIndex < doubleCommaIndex && singleCommaIndex != -1)
                    {
                        end = singleCommaIndex;}
                    else{
                        end = doubleCommaIndex;}

                    string url = imageTag.Substring(srcIndex, end - srcIndex);

                    string width = "0";
                    //if (imageTag.Contains("width="))
                    //{
                    //    //Get Width
                    //    int widthStart = imageTag.IndexOf("width=\"") + 7;
                    //    int widthEnd = imageTag.IndexOf("\"", widthStart);
                    //    width = imageTag.Substring(widthStart, widthEnd - widthStart);
                    //}

                    //Get Heigth
                    string height = "0";
                    //if (imageTag.Contains("height="))
                    //{
                    //    int heightStart = imageTag.IndexOf("height=\"") + 8;
                    //    int heightEnd = imageTag.IndexOf("\"", heightStart);
                    //    height = imageTag.Substring(heightStart, heightEnd - heightStart);
                    //}



                    var image = new ExpandoObject() as IDictionary<string, object>;
                    image.Add("url", url);
                    image.Add("width", width);
                    image.Add("heigth", height);

                    imagesFound.Add(image as ExpandoObject);

                    atIndex = theHTML.IndexOf("<img", atIndex + 4);
                //}
                //catch
                //{

                //}
                
            }
            return imagesFound;
        }

        private void GetPageHTML()
        {


            CookieContainer cookies = new CookieContainer();
            HttpWebRequest request = null;
            HttpWebResponse response = null;
            string returnData = string.Empty;

            //Need to retrieve cookies first
            request = (HttpWebRequest)WebRequest.Create(new Uri("https://www.google.com/search?q=bugatti+veyron&es_sm=93&source=lnms&tbm=isch&sa=X&ei=E430VPWkE8rFggTws4HwCw&ved=0CAcQ_AUoAQ&biw=1242&bih=606"));
            request.Method = "GET";
            request.CookieContainer = cookies;
            response = (HttpWebResponse)request.GetResponse();

            ////Set up the request
            //request = (HttpWebRequest)WebRequest.Create(new Uri("https://www.google.com/search?q=bugatti+veyron&es_sm=93&source=lnms&tbm=isch&sa=X&ei=E430VPWkE8rFggTws4HwCw&ved=0CAcQ_AUoAQ&biw=1242&bih=606"));
            //request.Method = "POST";
            //request.ContentType = "application/x-www-form-urlencoded";
            //request.UserAgent = "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.2.13) Gecko/20101203 Firefox/3.6.13";
            //request.Referer = "https://www.google.com/search?q=bugatti+veyron&es_sm=93&source=lnms&tbm=isch&sa=X&ei=E430VPWkE8rFggTws4HwCw&ved=0CAcQ_AUoAQ&biw=1242&bih=606";
            //request.AllowAutoRedirect = true;
            //request.KeepAlive = true;
            //request.CookieContainer = cookies;

            ////Format the POST data
            //StringBuilder postData = new StringBuilder();
            //postData.Append("lsd=AVqRGVie&display=");
            //postData.Append("&legacy_return=1");
            //postData.Append("&return_session=0");
            //postData.Append("&trynum=1");
            //postData.Append("&charset_test=%E2%82%AC%2C%C2%B4%2C%E2%82%AC%2C%C2%B4%2C%E6%B0%B4%2C%D0%94%2C%D0%84");
            //postData.Append("&timezone=0");
            //postData.Append("&lgnrnd=153743_eO6D");
            //postData.Append("&lgnjs=1355614667");
            ////postData.Append(String.Format("&email={0}", email));
            ////postData.Append(String.Format("&pass={0}", password));
            //postData.Append("&default_persistent=0");

            ////write the POST data to the stream
            //using (StreamWriter writer = new StreamWriter(request.GetRequestStream()))
            //    writer.Write(postData.ToString());

            response = (HttpWebResponse)request.GetResponse();

            //Read the web page (HTML) that we retrieve after sending the request
            using (StreamReader reader = new StreamReader(response.GetResponseStream()))
                returnData = reader.ReadToEnd();

            var eee = returnData;

        }
        private bool findSmallImagesFromGoogle()
        {
            string email = "rasik";
            string password = "1234";


            CookieContainer cookies = new CookieContainer();
            HttpWebRequest request = null;
            HttpWebResponse response = null;
            string returnData = string.Empty;

            //Need to retrieve cookies first
            request = (HttpWebRequest)WebRequest.Create(new Uri("https://www.facebook.com/login.php?login_attempt=1"));
            request.Method = "GET";
            request.CookieContainer = cookies;
            response = (HttpWebResponse)request.GetResponse();

            //Set up the request
            request = (HttpWebRequest)WebRequest.Create(new Uri("https://www.facebook.com/login.php?login_attempt=1"));
            request.Method = "POST";
            request.ContentType = "application/x-www-form-urlencoded";
            request.UserAgent = "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.2.13) Gecko/20101203 Firefox/3.6.13";
            request.Referer = "https://www.facebook.com/login.php?login_attempt=1";
            request.AllowAutoRedirect = true;
            request.KeepAlive = true;
            request.CookieContainer = cookies;

            //Format the POST data
            StringBuilder postData = new StringBuilder();
            postData.Append("lsd=AVqRGVie&display=");
            postData.Append("&legacy_return=1");
            postData.Append("&return_session=0");
            postData.Append("&trynum=1");
            postData.Append("&charset_test=%E2%82%AC%2C%C2%B4%2C%E2%82%AC%2C%C2%B4%2C%E6%B0%B4%2C%D0%94%2C%D0%84");
            postData.Append("&timezone=0");
            postData.Append("&lgnrnd=153743_eO6D");
            postData.Append("&lgnjs=1355614667");
            postData.Append(String.Format("&email={0}", email));
            postData.Append(String.Format("&pass={0}", password));
            postData.Append("&default_persistent=0");

            //write the POST data to the stream
            using (StreamWriter writer = new StreamWriter(request.GetRequestStream()))
                writer.Write(postData.ToString());

            response = (HttpWebResponse)request.GetResponse();

            //Read the web page (HTML) that we retrieve after sending the request
            using (StreamReader reader = new StreamReader(response.GetResponseStream()))
                returnData = reader.ReadToEnd();

            return !returnData.Contains("Please re-enter your password");
        }
    }
}
