var counter = 0,

	// The View model
	app = {
		select: function(ev) {
			this.setIndex($.view(ev.currentTarget).index);
		},
		setIndex: function(index) {
			if (this.selectedIndex !== index) {
				$.observable(this)
					.setProperty("selectedIndex", index);
			}
		},
		addMovie: function() {
			$.observable(this.movies).insert({
				title: "NewTitle" + counter ,
				languages: [
					{name: "NewLanguage" + counter++}
				]}
			);
			// Set selection on the added item
			this.setIndex(this.movies.length - 1);
		},
		removeMovie: function(ev) {
			this.setIndex();
			var thisIndex = $.view(ev.currentTarget).index;
			$.observable(this.movies).remove(thisIndex);
		},
		addLanguage: function() {
			var selectedMovie = this.movies[this.selectedIndex];
			$.observable(selectedMovie.languages).insert({
				name: "NewLanguage" + counter++
			});
		},
		removeLanguage: function(ev) {
			var selectedMovie = this.movies[this.selectedIndex];
			var thisIndex = $.view(ev.currentTarget).index;
			$.observable(selectedMovie.languages).remove(thisIndex);
		},
		resetData: function() {
			$.observable(this.movies).refresh([
				{title:"Meet Joe Black", languages: [{name: "English"},{name: "French"}]},
				{title:"Eyes Wide Shut", languages: [{name: "German"},{name: "French"},{name: "Spanish"}]}]);
			$.observable(this).removeProperty("selectedIndex");
			this.saveData();
		},
		saveData: function() {
			$.post("/save/data", {movieData : JSON.stringify(this.movies)}, function(msg) {
				app.showMsg(msg);
			});
		},
		showMsg: function(msg) {
			$.observable(app).setProperty("msg", msg);
		}
	};

app.movies = movies; // The movies data was rendered by server in a script block - see {{clientData "movies" /}} in layout.html

function bgColor() { // Used my movie-list.html template. This is the client-side version,
	//  used by data-linked background color - set dynamically based on current index/selection.
	return this.ctx.root.selectedIndex === this.index
		? "yellow"
		: (this.index%2 ? "#fdfdfe" : "#efeff2");
}
bgColor.depends = ["#index", "~root.selectedIndex"]; // Update based on index or selection

$.views.helpers("bgColor", bgColor, $.templates("@templates/movie-list.html")); // Provide as helper just for the movie-list template

//////////////////////////////////////////////////////////////

$.link(true, ".movieApp", app); // Data-link all the content that was already server-rendered. The server rendering used
// the layout template (server-side only) plus the movie-list template that is also used client-side use to render any added rows.

$.observable(app.movies).observeAll(function() {
	app.showMsg(""); // If there have been any changes made to the movies data we clear the Saved... message and this
  // also drives the Save button disabled property and the "navigate away" behavior.
});

// "Navigate away" behavior
$(window).on('beforeunload', function(){
	return app.msg === "" ? "You have unsaved changes." : undefined;
});