var directUpload = 'public/uploads/';
var multer  =   require('multer');
var upload = multer({ dest: directUpload});
var express =   require("express");
var bodyParser = require("body-parser");
var app =   express();
var mongojs = require('mongojs');
var db = mongojs('onlineinventory', ['items']);
app.use(express.static(__dirname + "//public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var multiparty = require('multiparty');
var form = new multiparty.Form();
var fs = require('fs');
var files;
var capsule;
var size_update;
var nodemailer = require('nodemailer');

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads');
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }

});

var upload = multer({ storage : storage }).array('userPhoto', 10);

app.get('/',function(req,res){
      res.sendFile(__dirname + "/index.html");
});

function insertItem(text, files){
  var insertitems = [];
  console.log(text);
  console.log(files);

  insertitems.push(text);
  insertitems.push(files[0].filepath);
  insertitems.push(files[1].filepath);
  db.items.insert(insertitems, function(err, doc) {
    if(err) {
      console.log("insertItem: " + err);
    }

  })
}

app.get('/items', function(req, res){
  console.log("request received.");
  db.items.find(function (err, docs) {
    if(err)
      res.end("nothing found!");
    console.log(docs);
    res.json(docs);
  })
})

app.get('/items/:id', function (req, res) {
  var id = req.params.id;
  console.log(id);
  db.items.findOne({_id: mongojs.ObjectId(id)}, function (err, doc) {
    if(err) {
      console.log(id + " not found");
      res.end("not found");
    }
    res.json(doc);
  })
})

app.post('/api/photo/edit/:id', function(req, res) {
  var id = req.params.id;
  console.log("from server: ", id);
  console.log("body: ", req.body);

  var sizelength = req.body.size.length;
  var sizetest = req.body.size;
  var type = typeof(sizetest);

  var sizes_update = {};
  sizes_update = new Object();
  sizes_update.sizes = [];

  var sizeDefs = function(s, q, u) {
          this.size = s;
          this.quantity = q;
          this.upc = u;
        }

  if(type === "object") {
    for(var i = 0; i < sizelength; i++) {
      sizes_update.sizes.push(new sizeDefs(req.body.size[i], parseInt(req.body.quantity[i]), req.body.upc[i]));
    }
    } else {
      sizes_update.sizes.push(new sizeDefs(req.body.size, parseInt(req.body.quantity), req.body.upc));
    }

  var sku_update = req.body.sku;
  var retailprice_update = parseFloat(req.body.retailprice);
  var costprice_update = parseFloat(req.body.costprice);
  var compareat_update = parseFloat(req.body.compareat);

  var datechanged = new Date();

  var approvalstatus;
  if(req.body.rickapproved == "on" && req.body.janaapproved == "on" && req.body.jenniferapproved == "on" && req.body.justinapproved == "on") {
    approvalstatus = "approved";
  } else if (req.body.janaapproved == "on" && req.body.jenniferapproved == "on" && req.body.justinapproved == "on") {
    approvalstatus = "final";
  } else {
    approvalstatus = "";
  }

  db.items.findAndModify({
    query: {_id: mongojs.ObjectId(id)},
    update: {$set: {dateentered: datechanged, rickapproved: req.body.rickapproved, janaapproved: req.body.janaapproved,
                    jenniferapproved: req.body.jenniferapproved, justinapproved: req.body.justinapproved, submittedby: req.body.submittedby, listdate: req.body.listdate, productname: req.body.productname, productdetails: req.body.productdetails, itemstatus: req.body.itemstatus, sku: sku_update,
                    ccc: req.body.ccc, retailprice: retailprice_update, costprice: costprice_update, sizes: sizes_update.sizes,
                    relatedproducts: req.body.relatedproducts, brandname: req.body.brandname, brandpermission: req.body.brandpermission, compareat: compareat_update,
                    madein: req.body.madein, gtitle: req.body.gtitle, gcondition: req.body.gcondition,
                    gavailibility: req.body.gavailibility, gproductcategory: req.body.gproductcategory, gproducttype: req.body.gproducttype, gcolor: req.body.gcolor,
                    gmaterial: req.body.gmaterial, gpattern: req.body.gpattern, ggender: req.body.ggender, gagegroup: req.body.gagegroup, gsizetype: req.body.gsizetype,
                    gsizesystem: req.body.gsizesystem, approvalstatus: approvalstatus
    }},
    new: true}, function(err, doc) {
      if(err) {
        console.log(err);

      }
      res.end("item updated");

      if (req.body.itemstatus === "unlisted") {
        var request = "unlist";
        emailTemplate(req.body.sku, req.body.submittedby, req.body.productname, req.body.listdate, request);
      } else if (approvalstatus === "approved") {
        var request = "approved";
        emailTemplate(req.body.sku, req.body.submittedby, req.body.productname, req.body.listdate, request);
      } else if (req.body.janaapproved === "on" && req.body.jenniferapproved === "on" && req.body.justinapproved === "on") {
        var request = "requirefinal";
        emailTemplate(req.body.sku, req.body.submittedby, req.body.productname, req.body.listdate, request);
      }
    }
  );
});

app.post('/api/photo',function(req,res){
    upload(req,res,function(err) {
        console.log(req.body);
        console.log(req.files);
        if(err) {
            return res.end("Error uploading file.");
        }

        var fileslength = req.files.length;
        console.log("fileslength", fileslength);
        var sizelength = req.body.size.length;
	 var sizetest = req.body.size;
	 var type = typeof(sizetest);

        var sizeDefs = function(s, q, u) {
          this.size = s;
          this.quantity = q;
          this.upc = u;
        }

        var todaysDate = new Date();

        files = new Object();

        files.dateentered = todaysDate;
        files.submittedby = req.body.submittedby;
        files.rickapproved = null;
        files.janaapproved = null;
        files.jenniferapproved = null;
        files.justinapproved = null;
        files.listdate = req.body.listdate;
        files.productname = req.body.productname;
        files.productdetails = req.body.productdetails;
        files.itemstatus = req.body.itemstatus;
        files.sku = req.body.sku;
        files.ccc = req.body.ccc;
        files.retailprice = parseFloat(req.body.retailprice);
        files.costprice = parseFloat(req.body.costprice);

        files.sizes = [];

        if(type === "object") {
          for(var i = 0; i < sizelength; i++) {
            files.sizes.push(new sizeDefs(req.body.size[i], parseInt(req.body.quantity[i]), req.body.upc[i]));
          }
        } else {
          files.sizes.push(new sizeDefs(req.body.size, parseInt(req.body.quantity), req.body.upc));
        }

        files.relatedproducts = req.body.relatedproducts;
        files.brandname = req.body.brandname;
        files.brandpermission = req.body.brandpermission;
        files.compareat = parseFloat(req.body.compareat);
        files.madein = req.body.madein;
        files.gtitle = req.body.gtitle;
        files.gcondition = req.body.gcondition;
        files.gavailibility = req.body.gavailibility;
        files.gproductcategory = req.body.gproductcategory;
        files.gproducttype = req.body.gproducttype;
        files.gcolor = req.body.gcolor;
        files.gmaterial = req.body.gmaterial;
        files.gpattern = req.body.gpattern;
        files.ggender = req.body.ggender;
        files.gagegroup = req.body.gagegroup;
        files.gsizetype = req.body.gsizetype;
        files.gsizesystem = req.body.gsizesystem;
        files.approvalstatus = "";

        switch (fileslength) {
          case 1:
            files.img1 = req.files[0].filename;
            files.img2 = "";
            files.img3 = "";
            files.img4 = "";
            files.img5 = "";
            break;
          case 2:
            files.img1 = req.files[0].filename;
            files.img2 = req.files[1].filename;
            files.img3 = "";
            files.img4 = "";
            files.img5 = "";
            break;
          case 3:
            files.img1 = req.files[0].filename;
            files.img2 = req.files[1].filename;
            files.img3 = req.files[2].filename;
            files.img4 = "";
            files.img5 = "";
            break;
          case 4:
            files.img1 = req.files[0].filename;
            files.img2 = req.files[1].filename;
            files.img3 = req.files[2].filename;
            files.img4 = req.files[3].filename;
            files.img5 = "";
            break;
          case 5:
            files.img1 = req.files[0].filename;
            files.img2 = req.files[1].filename;
            files.img3 = req.files[2].filename;
            files.img4 = req.files[3].filename;
            files.img5 = req.files[4].filename;
            break;
          case 6:
            files.img1 = req.files[0].filename;
            files.img2 = req.files[1].filename;
            files.img3 = req.files[2].filename;
            files.img4 = req.files[3].filename;
            files.img5 = req.files[4].filename;
            files.img6 = req.files[5].filename;
            break;
          case 7:
            files.img1 = req.files[0].filename;
            files.img2 = req.files[1].filename;
            files.img3 = req.files[2].filename;
            files.img4 = req.files[3].filename;
            files.img5 = req.files[4].filename;
            files.img6 = req.files[5].filename;
            files.img7 = req.files[6].filename;
            break;
          case 8:
            files.img1 = req.files[0].filename;
            files.img2 = req.files[1].filename;
            files.img3 = req.files[2].filename;
            files.img4 = req.files[3].filename;
            files.img5 = req.files[4].filename;
            files.img6 = req.files[5].filename;
            files.img7 = req.files[6].filename;
            files.img8 = req.files[7].filename;
            break;
          case 9:
            files.img1 = req.files[0].filename;
            files.img2 = req.files[1].filename;
            files.img3 = req.files[2].filename;
            files.img4 = req.files[3].filename;
            files.img5 = req.files[4].filename;
            files.img6 = req.files[5].filename;
            files.img7 = req.files[6].filename;
            files.img8 = req.files[7].filename;
            files.img9 = req.files[8].filename;
            break;
          case 10:
            files.img1 = req.files[0].filename;
            files.img2 = req.files[1].filename;
            files.img3 = req.files[2].filename;
            files.img4 = req.files[3].filename;
            files.img5 = req.files[4].filename;
            files.img6 = req.files[5].filename;
            files.img7 = req.files[6].filename;
            files.img8 = req.files[7].filename;
            files.img9 = req.files[8].filename;
            files.img10 = req.files[9].filename;
            break;
          default:
            files.img1 = '';
        }

        var jsonfiles = JSON.stringify(files);
        console.log(jsonfiles);
        capsule = files;
        db.items.insert(capsule);
        res.end("Item Captured");
        var request = "added";

       emailTemplate(files.sku, files.submittedby, files.productname, files.listdate, request);
    });
});

app.delete('/uploads/:img', function(req, res) {
  var imgname = req.params.img;

  console.log(imgname);
  fs.unlinkSync(directUpload + imgname );
});

app.put('/items/imgs1/:id', function(req, res) {
  var id = req.params.id;
  db.items.findAndModify({
    query: {_id: mongojs.ObjectId(id)},
    update: {$set: {img1: ""}},
    new: true}, function(err, doc) {
      if(err) {
        console.log(err);
      }
      res.json(doc);
    }

  );
});

app.put('/items/imgs2/:id', function(req, res) {
  var id = req.params.id;
  db.items.findAndModify({
    query: {_id: mongojs.ObjectId(id)},
    update: {$set: {img2: ""}},
    new: true}, function(err, doc) {
      if(err) {
        console.log(err);
      }
      res.json(doc);
    }

  );
});

app.put('/items/imgs3/:id', function(req, res) {
  var id = req.params.id;
  db.items.findAndModify({
    query: {_id: mongojs.ObjectId(id)},
    update: {$set: {img3: ""}},
    new: true}, function(err, doc) {
      if(err) {
        console.log(err);
      }
      res.json(doc);
    }

  );
});

app.put('/items/imgs4/:id', function(req, res) {
  var id = req.params.id;
  db.items.findAndModify({
    query: {_id: mongojs.ObjectId(id)},
    update: {$set: {img4: ""}},
    new: true}, function(err, doc) {
      if(err) {
        console.log(err);
      }
      res.json(doc);
    }

  );
});

app.put('/items/imgs5/:id', function(req, res) {
  var id = req.params.id;
  db.items.findAndModify({
    query: {_id: mongojs.ObjectId(id)},
    update: {$set: {img5: ""}},
    new: true}, function(err, doc) {
      if(err) {
        console.log(err);
      }
      res.json(doc);
    }

  );
});

app.put('/items/imgs6/:id', function(req, res) {
  var id = req.params.id;
  db.items.findAndModify({
    query: {_id: mongojs.ObjectId(id)},
    update: {$set: {img6: ""}},
    new: true}, function(err, doc) {
      if(err) {
        console.log(err);
      }
      res.json(doc);
    }

  );
});

app.put('/items/imgs7/:id', function(req, res) {
  var id = req.params.id;
  db.items.findAndModify({
    query: {_id: mongojs.ObjectId(id)},
    update: {$set: {img7: ""}},
    new: true}, function(err, doc) {
      if(err) {
        console.log(err);
      }
      res.json(doc);
    }

  );
});

app.put('/items/imgs8/:id', function(req, res) {
  var id = req.params.id;
  db.items.findAndModify({
    query: {_id: mongojs.ObjectId(id)},
    update: {$set: {img8: ""}},
    new: true}, function(err, doc) {
      if(err) {
        console.log(err);
      }
      res.json(doc);
    }

  );
});

app.put('/items/imgs9/:id', function(req, res) {
  var id = req.params.id;
  db.items.findAndModify({
    query: {_id: mongojs.ObjectId(id)},
    update: {$set: {img9: ""}},
    new: true}, function(err, doc) {
      if(err) {
        console.log(err);
      }
      res.json(doc);
    }

  );
});

app.put('/items/imgs10/:id', function(req, res) {
  var id = req.params.id;
  db.items.findAndModify({
    query: {_id: mongojs.ObjectId(id)},
    update: {$set: {img10: ""}},
    new: true}, function(err, doc) {
      if(err) {
        console.log(err);
      }
      res.json(doc);
    }

  );
});


app.post('/api/photo/single/:id',function(req,res){

    upload(req,res,function(err) {
        if(req.files[0].filename !== undefined) {
        var item_id = mongojs.ObjectId(req.params.id);
        console.log("picture update: " + item_id);
        var imgslot = req.body.img;
        var filename = req.files[0].filename;
        //console.log(item_id);
        console.log(req.body);
        console.log(req.files);
        if(err) {
            return res.end("Error uploading file.");
        }

        if(imgslot == "img1") {
            db.items.findAndModify({
            query: {"_id": item_id},
            update: {$set: {img1: filename}},
            new: true},
            function(err, doc) {
              if(err) {
                console.log(err);
              }

            }
            );
        }

        if(imgslot == "img2") {
            db.items.findAndModify({
            query: {_id: item_id},
            update: {$set: {img2: filename}},
            new: true}, function(err, doc) {
              if(err) {
                console.log(err);
              }

            }

            );
        }

        if(imgslot == "img3") {
            db.items.findAndModify({
            query: {_id: item_id},
            update: {$set: {img3: filename}},
            new: true}, function(err, doc) {
              if(err) {
                console.log(err);
              }

            }

            );
        }

        if(imgslot == "img4") {
            db.items.findAndModify({
            query: {_id: item_id},
            update: {$set: {img4: filename}},
            new: true}, function(err, doc) {
              if(err) {
                console.log(err);
              }

            }

            );
        }

        if(imgslot == "img5") {
            db.items.findAndModify({
            query: {_id: item_id},
            update: {$set: {img5: filename}},
            new: true}, function(err, doc) {
              if(err) {
                console.log(err);
              }

            }

            );
        }

        if(imgslot == "img6") {
            db.items.findAndModify({
            query: {_id: item_id},
            update: {$set: {img6: filename}},
            new: true}, function(err, doc) {
              if(err) {
                console.log(err);
              }

            }

            );
        }

        if(imgslot == "img7") {
            db.items.findAndModify({
            query: {_id: item_id},
            update: {$set: {img7: filename}},
            new: true}, function(err, doc) {
              if(err) {
                console.log(err);
              }

            }

            );
        }

        if(imgslot == "img8") {
            db.items.findAndModify({
            query: {_id: item_id},
            update: {$set: {img8: filename}},
            new: true}, function(err, doc) {
              if(err) {
                console.log(err);
              }

            }

            );
        }

        if(imgslot == "img9") {
            db.items.findAndModify({
            query: {_id: item_id},
            update: {$set: {img9: filename}},
            new: true}, function(err, doc) {
              if(err) {
                console.log(err);
              }

            }

            );
        }

        if(imgslot == "img10") {
            db.items.findAndModify({
            query: {_id: item_id},
            update: {$set: {img10: filename}},
            new: true}, function(err, doc) {
              if(err) {
                console.log(err);
              }

            }

            );
        }

        res.end("image updated");
        } else {
          res.end("No image selected");
        }
    });
});

var transport = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'fconline2017@gmail.com',
    pass: 'fc123456'
  }
});

function sendMail(email) {

 var mailto;

 if(email.request === "added") {
   mailto = 'tgevers@factory-connection.com, jrains@factory-connection.com, jmcrae@factory-connection.com, jana@factory-connection.com';
   var messagebody = '<div style="background-color:;width:800px;height:800px;font-family:Arial;">' + '<h2 style=""font-style:italic;">' + 'An item was added to FC Online!' + '</h2>' + '<hr>' +
    '&nbsp;&nbsp;<span style="display:inline-block;">Submitted By:&nbsp;&nbsp;' + '<b style="display:inline-block;">' +  email.submittedby  + '</b></span><hr>' +
    '&nbsp;&nbsp;<span style="display:inline-block;">SKU:&nbsp;&nbsp;' + '<b style="display:inline-block;">' + email.sku + '</b></span><hr>' +
    '&nbsp;&nbsp;<span style="display:inline-block;">Product Name:&nbsp;&nbsp;' + '<b style="display:inline-block;">' + email.productname + '</b></span><hr>' +
    '&nbsp;&nbsp;<span style="display:inline-block;">Miva List Date:&nbsp;&nbsp;' + '<b style="display:inline-block;">' + email.listdate + '</b></span><hr>' +
    '<img height="44px" width="141px" style="position:absolute;" src="https://storage.googleapis.com/fcmiva/fcmivahomepage.PNG"><br><br>' +
    '&nbsp;&nbsp;<a style="font-height:15px" href="http://192.168.1.243:2017" style="display:inline-block;">Link to FC - Online Management Tool:&nbsp;&nbsp;</a></span><hr>' +
    '</div>';
 } else if (email.request === "requirefinal") {
   mailto = 'tgevers@factory-connection.com, rmarini@factory-connection.com';
   var messagebody = '<div style="background-color:;width:800px;height:800px;font-family:Arial;">' + '<h2 style=""font-style:italic;">' + 'An item needs your approval.' + '</h2>' + '<hr>' +
    '&nbsp;&nbsp;<span style="display:inline-block;">Submitted By:&nbsp;&nbsp;' + '<b style="display:inline-block;">' +  email.submittedby  + '</b></span><hr>' +
    '&nbsp;&nbsp;<span style="display:inline-block;">SKU:&nbsp;&nbsp;' + '<b style="display:inline-block;">' + email.sku + '</b></span><hr>' +
    '&nbsp;&nbsp;<span style="display:inline-block;">Product Name:&nbsp;&nbsp;' + '<b style="display:inline-block;">' + email.productname + '</b></span><hr>' +
    '&nbsp;&nbsp;<span style="display:inline-block;">Miva List Date:&nbsp;&nbsp;' + '<b style="display:inline-block;">' + email.listdate + '</b></span><hr>' +
    '<img height="44px" width="141px" style="position:absolute;" src="https://storage.googleapis.com/fcmiva/fcmivahomepage.PNG"><br><br>' +
    '&nbsp;&nbsp;<a style="font-height:15px" href="http://192.168.1.243:2017" style="display:inline-block;">Link to FC - Online Management Tool:&nbsp;&nbsp;</a></span><hr>' +
    '</div>';
 } else if (email.request === "approved") {
   mailto = 'tgevers@factory-connection.com';
   var messagebody = '<div style="background-color:#6bdb76;width:800px;height:800px;font-family:Arial;">' + '<h2 style=""font-style:italic;">' + 'An item needs to be listed!' + '</h2>' + '<hr>' +
    '&nbsp;&nbsp;<span style="display:inline-block;">Submitted By:&nbsp;&nbsp;' + '<b style="display:inline-block;">' +  email.submittedby  + '</b></span><hr>' +
    '&nbsp;&nbsp;<span style="display:inline-block;">SKU:&nbsp;&nbsp;' + '<b style="display:inline-block;">' + email.sku + '</b></span><hr>' +
    '&nbsp;&nbsp;<span style="display:inline-block;">Product Name:&nbsp;&nbsp;' + '<b style="display:inline-block;">' + email.productname + '</b></span><hr>' +
    '&nbsp;&nbsp;<span style="display:inline-block;">Miva List Date:&nbsp;&nbsp;' + '<b style="display:inline-block;">' + email.listdate + '</b></span><hr>' +
    '<img height="44px" width="141px" style="position:absolute;" src="https://storage.googleapis.com/fcmiva/fcmivahomepage.PNG"><br><br>' +
    '&nbsp;&nbsp;<a style="font-height:15px" href="http://192.168.1.243:2017" style="display:inline-block;">Link to FC - Online Management Tool:&nbsp;&nbsp;</a></span><hr>' +
    '</div>';
 } else if (email.request === "unlist") {
   mailto = 'tgevers@factory-connection.com';
   var messagebody = '<div style="background-color:#ffb5b5;width:800px;height:800px;font-family:Arial;">' + '<h2 style=""font-style:italic;">' + 'Unlist an item!' + '</h2>' + '<hr>' +
    '&nbsp;&nbsp;<span style="display:inline-block;">Submitted By:&nbsp;&nbsp;' + '<b style="display:inline-block;">' +  email.submittedby  + '</b></span><hr>' +
    '&nbsp;&nbsp;<span style="display:inline-block;">SKU:&nbsp;&nbsp;' + '<b style="display:inline-block;">' + email.sku + '</b></span><hr>' +
    '&nbsp;&nbsp;<span style="display:inline-block;">Product Name:&nbsp;&nbsp;' + '<b style="display:inline-block;">' + email.productname + '</b></span><hr>' +
    '&nbsp;&nbsp;<span style="display:inline-block;">Miva List Date:&nbsp;&nbsp;' + '<b style="display:inline-block;">' + email.listdate + '</b></span><hr>' +
    '<img height="44px" width="141px" style="position:absolute;" src="https://storage.googleapis.com/fcmiva/fcmivahomepage.PNG"><br><br>' +
    '&nbsp;&nbsp;<a style="font-height:15px" href="http://192.168.1.243:2017" style="display:inline-block;">Link to FC - Online Management Tool:&nbsp;&nbsp;</a></span><hr>' +
    '</div>';
 }

 if (email.request === "added") {
    transport.sendMail({
      from: 'fconline2017@gmail.com',
      to: mailto,
      subject: 'Item Added - FC Online Management',
      html: messagebody,
      text: 'An item was added to FC Online'
    });
  } else if (email.request === "requirefinal") {
      transport.sendMail({
      from: 'fconline2017@gmail.com',
      to: mailto,
      subject: 'An item needs your approval - FC Online Management',
      html: messagebody,
      text: 'An item needs your approval'
    });
  } else if (email.request === "approved") {
      transport.sendMail({
      from: 'fconline2017@gmail.com',
      to: mailto,
      subject: 'List an item on Miva - FC Online Management',
      html: messagebody,
      text: 'An item needs to be listed!'
    });
   } else if (email.request === "unlist") {
      transport.sendMail({
      from: 'fconline2017@gmail.com',
      to: mailto,
      subject: 'Unlist an item! - FC Online Management',
      html: messagebody,
      text: 'Unlist an item!'
    });
   }
}
function emailTemplate(sku, submittedby, productname, listdate, request) {

  var emailbody = {};

  emailbody.request = request;
  emailbody.sku = sku;
  emailbody.submittedby = submittedby;
  emailbody.productname =  productname;
  emailbody.listdate = listdate;

  sendMail(emailbody);

}


app.listen(process.env.PORT || 2017, process.env.IP || "0.0.0.0", function(){
    console.log("Working on port 2017");
});
