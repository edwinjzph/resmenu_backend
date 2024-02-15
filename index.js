const express = require('express');
const app = express();
const admin = require('firebase-admin')
const service = require('./service.json')
const hostname = '192.168.1.33';
app.use(express.json({limit : '1mb' }))
const cors = require('cors');
const { uuid } = require('uuidv4');
const { json } = require('express');
let date_ob = new Date();
const { firestore } = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.cert(service)
  });
  const db = admin.firestore();
app.use(cors({ origin: true }));



app.post('/fetchtemplate', async (req,res) =>{
  
const catedata ={}
const menudata ={}
console.log(req.body)
db.collection('users').where('resname','==',req.body.resname).get().then((querySnapshot) =>{

    querySnapshot.forEach((doc) =>{
        if(doc.exists){
            console.log(doc.id)
            db.collection('users').doc(doc.id).collection('templates').where('url','==',req.body.url).get().then((querySnapshot2)=>{
                querySnapshot2.forEach((docs) =>{
                    
                    if(docs.exists){
                  
                  const data =     db.collection('users').doc(doc.id).collection('templates').doc(docs.id).collection('menudata').get().then(querySnapshot3 =>{
                    querySnapshot3.forEach((doc2) =>{
                        menudata[doc2.id] =doc2.data()
                    })
                  })
                  data.then(() =>{
                    const data2 =     db.collection('users').doc(doc.id).collection('templates').doc(docs.id).collection('catedata').get().then(querySnapshot4 =>{
                        querySnapshot4.forEach((doc3) =>{
                            catedata[doc3.id] =doc3.data()
                        })
                      })
                      data2.then(() =>{
                        res.json({
                            catedata,menudata
                        })
                      })
                  })
            
            

                    }
                })
            })
        }
    })
})

 
})  


app.post('/customurl', async (req,res) =>{
    try{
    console.log(req.body)
       db.collection('users').doc(req.body.uid).collection('templates').where('url','==',req.body.url).get().then((querySnapshot) =>{
   
   
        res.json({exist: querySnapshot.empty})
    
      
     }
        )
 
    }catch(error){
        console.log(error)
            }
     
    }) 
app.post('/queue', async (req,res) =>{
  console.log(req.body)
  const {table,orderitems,quantity,totalprice,resname,templateurl} =req.body
  try{
    db.collection('users').where('resname','==',resname).get().then((querySnapshot) =>{
        querySnapshot.forEach((doc) =>{
            if(doc.exists){
                db.collection('users').doc(doc.id).collection('templates').where('url','==',templateurl).get().then((querySnapshot2)=>{
                    querySnapshot2.forEach((docs) =>{
                        db.collection('users').doc(doc.id).collection('templates').doc(docs.id).collection('queue').doc(uuid()).set({
                            table : table,
                            orderitems : orderitems.user,
                            quantity: quantity,
                            totalprice:totalprice
                        })
                 
                    })
                })
            }
        })
    })

 
    }catch(error){
        console.log(error)
            }


  res.json({
    status: "ok"
  })
         
        })
app.post('/confirmorder', async (req,res) =>{
console.log(req.body)
const date = `${date_ob.getDate()}-${date_ob.getMonth()}-${date_ob.getFullYear()}`
const monthly = `${date_ob.getMonth()}-${date_ob.getFullYear()}`
const year = `${date_ob.getFullYear()}`
console.log(date,monthly,year)

const {table,quantity,totalprice,orderitems} = req.body.orderdetails
           db.collection('users').doc(req.body.uid).collection('templates').doc(req.body.address).collection('orders').doc(req.body.orderid).set({
        table: table,
        quantity : quantity,
        totalprice: totalprice,
        orderitems: orderitems,
        timestampupdate: firestore.FieldValue.serverTimestamp()
           }).then(() =>{
            db.collection('users').doc(req.body.uid).collection('templates').doc(req.body.address).collection('queue').doc(req.body.orderid).delete().then(()=>{
                console.log("deleted successfully")
            })
            db.collection('users').doc(req.body.uid).collection('templates').doc(req.body.address).update({
                totalsales: firestore.FieldValue.increment(totalprice),
                totalQuantity: firestore.FieldValue.increment(quantity),
                totalorder: firestore.FieldValue.increment(1),
                timestamp: firestore.FieldValue.serverTimestamp()
            })
           })
      const docref =    db.collection('users').doc(req.body.uid).collection('templates').doc(req.body.address).collection('monthly_report').doc(monthly);
      docref.get().then((doc) =>{
if(doc.exists){
    docref.update({
        totalsales: firestore.FieldValue.increment(totalprice),
        totalQuantity: firestore.FieldValue.increment(quantity),
        totalorder: firestore.FieldValue.increment(1),
        timestamp: firestore.FieldValue.serverTimestamp()
       }).then(()=>{
        console.log("monthlty data added successfully")
    })
}else{
    docref.set({
        totalsales: firestore.FieldValue.increment(totalprice),
        totalQuantity: firestore.FieldValue.increment(quantity),
        totalorder: firestore.FieldValue.increment(1),
        timestamp: firestore.FieldValue.serverTimestamp()
       }).then(()=>{
        console.log("monthlty data added successfully")
    })
}
      })
    const docref2 =   db.collection('users').doc(req.body.uid).collection('templates').doc(req.body.address).collection('daily_report').doc(date);
    docref2.get().then((doc)=>{
        if(doc.exists){
            docref2.update({
                totalsales: firestore.FieldValue.increment(totalprice),
                totalQuantity: firestore.FieldValue.increment(quantity),
                totalorder: firestore.FieldValue.increment(1),
                timestamp: firestore.FieldValue.serverTimestamp()
               }).then(()=>{
                console.log("daily data added successfully")
            })
        }else{
            docref2.set({
                totalsales: firestore.FieldValue.increment(totalprice),
                totalQuantity: firestore.FieldValue.increment(quantity),
                totalorder: firestore.FieldValue.increment(1),
                timestamp: firestore.FieldValue.serverTimestamp()
               }).then(()=>{
                console.log("daily data added successfully")
            })
        }
    })
     const docref3= db.collection('users').doc(req.body.uid).collection('templates').doc(req.body.address).collection('yearly_report').doc(year);
     docref3.get().then((doc) =>{
        if(doc.exists){
            docref3.update({
                totalsales: firestore.FieldValue.increment(totalprice),
                totalQuantity: firestore.FieldValue.increment(quantity),
                totalorder: firestore.FieldValue.increment(1),
                timestamp: firestore.FieldValue.serverTimestamp()

               }).then(()=>{
                console.log("yearly data added successfully")
            })
        }else{
            docref3.set({
                totalsales: firestore.FieldValue.increment(totalprice),
                totalQuantity: firestore.FieldValue.increment(quantity),
                totalorder: firestore.FieldValue.increment(1),
                timestamp: firestore.FieldValue.serverTimestamp()
               }).then(()=>{
                console.log("yearly data added successfully")
            })
        }
     })
          
            res.json({
              status: "ok"
            })
                   
                  })
app.listen(3001,"localhost", () => {
    console.log(`Server running at http://localhost:3001`)
  }) 