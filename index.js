
// Variables
const	express=	require("express");
const	hbs=	require("express-handlebars");
const	path=	require("path");
const	app=	express();

app.engine(".html", hbs({
	defaultLayout:	"index",
	extname:	".html",
	layoutsDir:	path.join(__dirname, "views/layouts")
}));
app.use(express.static(path.join(__dirname, "/public")));

app.set("view engine", ".html");
app.set("views", path.join(__dirname, "views"));

app.get("/", function(req, res)	{
	res.render("graph", {
		head:	{
			title:	"Graph",
			stylesheets: [
				"/css/graph.css",
				"/css/modal.css",
				"/fontawesome/css/fontawesome-all.min.css"
			]
		}
	});
});

app.listen(process.env.PORT || 8080);
