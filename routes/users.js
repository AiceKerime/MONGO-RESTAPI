const { ObjectId } = require('bson');
const express = require('express');
const router = express.Router();

module.exports = (db) => {

  // ROUTER GET DATA (VIEW)
  router.get('/', async (req, res) => {
    try {
      const url = req.url == '/' ? '/?page=1&sortBy=string&sortMode=1' : req.url;
      const page = req.query.page || 1;
      const limit = 3;
      const offset = (page - 1) * limit;
      const wheres = {}
      const filter = `&idCheck=${req.query.idCheck}&id=${req.query.id}&stringCheck=${req.query.stringCheck}&string=${req.query.string}&integerCheck=${req.query.integerCheck}&integer=${req.query.integer}&floatCheck=${req.query.floatCheck}&float=${req.query.float}&dateCheck=${req.query.dateCheck}&startDate=${req.query.startDate}&endDate=${req.query.endDate}&booleanCheck=${req.query.booleanCheck}&boolean=${req.query.boolean}`

      // SORTING
      const sortMongo = {}

      let sortBy = req.query.sortBy || "_id"
      let sortMode = req.query.sortMode || "asc"

      sortMongo[sortBy] = sortMode == "asc" ? 1 : -1;

      // FILTERS
      if (req.query.string && req.query.stringCheck == 'on') {
        wheres["string"] = new RegExp(`${req.query.string}`, 'i')
      }

      if (req.query.integer && req.query.integerCheck == 'on') {
        wheres['integer'] = parseInt(req.query.integer)
      }

      if (req.query.float && req.query.floatCheck == 'on') {
        wheres['float'] = JSON.parse(req.query.float)
      }

      if (req.query.dateCheck == "on") {
        if (req.query.startDate != "" && req.query.endDate != "") {
          wheres["date"] = {
            $gte: new Date(`${req.query.startDate}`), $lte: new Date(`${req.query.endDate}`),
          }
        } else if (req.query.startDate) {
          wheres["date"] = { $gte: new Date(`${req.query.startDate}`) };
        } else if (req.query.endDate) {
          wheres["date"] = { $lte: new Date(`${req.query.endDate}`) };
        }
      }

      if (req.query.boolean && req.query.booleanCheck == 'on') {
        wheres['boolean'] = JSON.parse(req.query.boolean)
      }

      const result = await db.collection("dataBread").find(wheres).toArray()

      var total = result.length;
      const pages = Math.ceil(total / limit)

      const data = await db.collection("dataBread").find(wheres).skip(offset).limit(limit).sort(sortMongo).toArray()

      res.json(data)
    } catch (error) {
      console.log(error)
      res.send(error)
    }
  });

  // ROUTER ADD
  // router.get('/add', (req, res) => {
  //   res.render('users/add')
  // })

  router.post('/add', (req, res) => {
    const { string, integer, float, date, boolean } = req.body

    let Obj = {
      string: string,
      integer: Number(integer),
      float: parseFloat(float),
      date: date,
      boolean: JSON.parse(boolean)
    }

    db.collection("dataBread").insertOne(Obj).toArray((err) => {
      if (err) return res.json({ success: false })
      res.json({
        success: true,
      })
    })
  })

  // ROUTER EDIT
  // router.get('/edit/:id', async (req, res) => {
  //   try {
  //     const result = await db.collection("dataBread").findOne({ "_id": ObjectId(`${req.params.id}`) })

  //     res.json(result)

  //   } catch (err) {
  //     console.log(err)
  //     res.send(err)
  //   }
  // })

  router.patch('/edit/:id', async (req, res) => {
    try {
      const { string, integer, float, date, boolean } = req.body

      let Obj = {
        string: string,
        integer: Number(integer),
        float: parseFloat(float),
        date: date,
        boolean: JSON.parse(boolean)
      }

      const updateData = await db.collection("dataBread").updateOne({ "_id": ObjectId(`${req.params.id}`) }, { $set: Obj })

      res.json(updateData)

    } catch (err) {
      console.log(err)
      res.send(err)
    }
  })

  // ROUTER DELETE
  router.delete('/delete/:id', async (req, res) => {
    try {
      const deleteData = await db.collection("dataBread").deleteOne({ "_id": ObjectId(`${req.params.id}`) })

      res.json(deleteData)
    } catch (err) {
      console.log(err)
      res.send(err)
    }

  });

  return router;
};