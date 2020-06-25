//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Disha:Test123@cluster0-gsetk.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

 const itemsSchema = {
   name : String
 };

 const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "Welcome to our todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete and item."
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name : String,
  items: [itemsSchema]
};

const List = mongoose.model("list", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        } 
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
});
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req, res){
  const listName = req.body.listName;
  const checkedItemId = req.body.checkbox;

if(listName === "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(err){
      console.log(err);
    } else{
      res.redirect("/");
    }
  });
} else {
  List.findOneAndUpdate({name: listName}, {$pull:{items:{_id: checkedItemId}}}, function(err, foundList){
    if(!err){
    res.redirect("/" + listName);
    }

  });
}

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundListName){
  if(!err){
    if(!foundListName){
      const list = new List({
        name: customListName,
        items: defaultItems
      });
    list.save();
    res.redirect("/" + customListName);
    } else{
      res.render("list", {listTitle: foundListName.name, newListItems: foundListName.items});
    }
  }
  });

});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
