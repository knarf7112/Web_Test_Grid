<%@ WebHandler Language="C#" Class="Handler" %>

using System;
using System.Web;

public class Handler : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        int i = context.Request.QueryString.Count;
        context.Response.ContentType = "text/html";
        
        context.Response.Write(@"<script>alert('run javscript ... ');</script>");//"Hello World");
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}