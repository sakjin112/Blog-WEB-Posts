import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Blog Posts",
    password: "",
    port: 5432
  });

db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

let posts = [];


app.get("/", async (req, res) => {
    const result = await db.query("SELECT * FROM public.posts");
    posts = result.rows;
    console.log(posts);
    res.render("index.ejs", {
        posts: posts
    });
})

app.get("/newpost", (req, res) => {
    res.render("newPost.ejs");
})

app.post("/submit", async(req,res) => {
    console.log(req.body);
    let newPost = {
        id: posts.length + 1,
        title: req.body.blog_title,
        author: req.body.blog_author,
        content: req.body.blog_content,
        date: new Date()
    }

    await db.query("INSERT INTO public.posts (id, title, content, author, date) VALUES ($1, $2, $3, $4, $5)", 
        [newPost.id, newPost.title, newPost.content, newPost.author, newPost.date]);

    res.redirect("/");
})


app.get("/editpost/:id", async (req,res) => {
    console.log('called');
    const Id = req.params.id;
    const editPost = posts.find(post => post.id == Id);

    res.render("newPost.ejs", {
        posts: editPost
    })


    
})

app.post("/post/:id", async(req, res) => {
    console.log("called");
    console.log(req.body);
    const Id = req.params.id;
    const editPost = posts.find(post => post.id == Id);
    
    var newTitle = req.body.blog_title;
    var newAuthor = req.body.blog_author;
    var newContent = req.body.blog_content;

    await db.query("UPDATE public.posts SET title = $1, author = $2, content = $3, date = $4 WHERE id = $5", 
        [newTitle || editPost.title, newAuthor || editPost.author, newContent || editPost.content, new Date(), Id])


    res.redirect("/");

    
})



app.get("/delete/:id", async(req, res) => {
    const Id = req.params.id;
    console.log(Id);
    await db.query("DELETE FROM public.posts WHERE id = $1", [Id]);

    res.redirect("/");

})

app.get("/selectpost/:id", async (req, res) => {
    console.log("called");
    const Id = req.params.id;
    const result = await db.query("SELECT * FROM public.posts WHERE id = $1", [Id]);
    console.log(result.rows);
    const selectPost = result.rows;

    res.render("post.ejs", {
        post: selectPost
    } ) 
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})