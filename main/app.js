var express = require("express")
app = express()
mongoose = require("mongoose")
bodyParser = require("body-parser"),
    methodOverride = require("method-override")
expressSanitizer = require("express-sanitizer") //used to remove JS which can be entered by user during input

//app config
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(expressSanitizer()) //must be after body parser
app.use(methodOverride("_method"))

//mongoose config
mongoose.connect("mongodb://localhost/restful_blog_app", {
    useNewUrlParser: true
})


var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {
        type: Date,
        default: Date.now
    }
})

var Blog = mongoose.model("blog", blogSchema)

/*
Blog.create({
    title: "Test Blog",
    image: "https://images.unsplash.com/photo-1544097433-5bbf1c87e24e",
    body: "Hello, this is my first blog post"
})
*/

//routes
//INDEX
app.get("/blogs", function (request, respond) {
    Blog.find({}, function (error, blogs) {
        if (error) throw error;
        respond.render("index", {
            blogs: blogs
        })
    })
})

app.get("/", function (request, respond) {
    respond.redirect("/blogs")
})
//NEW
app.get("/blogs/new", function (request, respond) {
    respond.render("new")
})

app.post("/blogs", function (request, respond) {
    //create blog
    request.body.blog.body = request.sanitize(request.body.blog.body)
    Blog.create(request.body.blog, function (error, newBlog) {
        if (error) throw error;
        respond.redirect("/blogs")
    })

})

//SHOW
app.get("/blogs/:id", function (request, respond) {
    Blog.findById(request.params.id, function (error, foundBlog) {
        if (error) throw error;
        respond.render("show", {
            blog: foundBlog
        })
    })

})

//EDIT and UPDATE
app.get("/blogs/:id/edit", function (request, respond) {
    Blog.findById(request.params.id, function (error, foundBlog) {
        respond.render("edit", {
            blog: foundBlog
        });
    })

})


app.put("/blogs/:id", function (request, respond) {
    request.body.blog.body = request.sanitize(request.body.blog.body)
    Blog.findByIdAndUpdate(request.params.id, request.body.blog, function (error, updatedBlog) {
        if (error) {
            respond.redirect("/blogs")
        } else {
            respond.redirect("/blogs/" + request.params.id)
        }
    })
})

//DELETE
app.delete("/blogs/:id", function (request, respond) {
    //Destroy Blog
    Blog.findByIdAndRemove(request.params.id, function (error) {
        if (error) throw error
        respond.redirect("/blogs")
    })
    //REdirect
})







app.listen(3000, function () {
    console.log("server is running")
})