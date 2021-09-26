//jshint esversion:6
//Deployed this app on heroku

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const app = express();
const _ = require('lodash');
mongoose.connect("mongodb+srv://admin-Nishant:mishranishant@cluster0.fjkic.mongodb.net/todolist")
    .then(() => console.log("Connected Succesfully"))
    .catch(err => console.log(err));

//Creating the Schema
const listItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

//Creating the model

const Item = new mongoose.model("Item", listItemSchema);

//CREATING the another schema
const itemSchema = new mongoose.Schema({
    name: String,
    items: [listItemSchema]
});

const List = new mongoose.model("List", itemSchema);


app.set('view engine', 'ejs');

app.use(express.urlencoded({
    extended: true
}));
app.use(express.static("public"));


// const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

const item1 = new Item({
    name: "Wakeup early"
})
const item2 = new Item({
    name: "Predecided Schedule"
})
const item3 = new Item({
    name: "Repeat above steps"
})

const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {
    Item.find({}, function(err, founditems) {
        // console.log(founditems);
        if (founditems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved the document");
                }
                res.redirect("/");
            });
        } else {

            res.render("list", { listTitle: "today", newListItems: founditems });
        }
    });


});

app.post("/", function(req, res) {

    const itemName = req.body.newItem;
    const listname = req.body.list;

    const item = new Item({ //Inserting the new item in the document
        name: itemName
    })

    if (listname == "today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listname }, function(err, foundlist) {
            foundlist.items.push(item);
            foundlist.save();
            res.redirect("/" + listname);
        })
    }

});

app.post("/delete", (req, res) => {

    const checkedboxId = req.body.checkbox;
    const listName = req.body.listname;
    if (listName === "today") {
        Item.findByIdAndRemove(checkedboxId, function(err) {
            if (!err) {
                console.log("successfully deleted the checked item");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedboxId } } }, function(err, updateItem) {
            if (!err) {

                res.redirect("/" + listName);
            }
        })
    }






    // console.log(req.body.checkbox);
});

app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);
    // console.log(req.params.customListName);

    List.findOne({ name: customListName }, function(err, foundItem) {
        if (!err) {
            if (!foundItem) {
                // console.log("Item doesn't exits");
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);

            } else {
                // console.log("Item exists");
                res.render("list", { listTitle: foundItem.name, newListItems: foundItem.items });
            }
        }
    });


});

app.get("/work", function(req, res) {
    res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function(req, res) {
    res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function() {
    console.log("Server started on port 3000");
});