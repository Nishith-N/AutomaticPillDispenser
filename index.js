const express = require("express");
const admin = require("firebase-admin");

const serviceAccount = require("./key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pilldispenser-93b2c-default-rtdb.firebaseio.com/", // Replace with your database URL
});

const db = admin.firestore();

const app = express();

app.use(express.json());

// Create a User
app.post('/api/createuser', (req, res) => {
  const data = req.body;
  const phone = req.body.phone
  const collectionRef = db.collection('users');
   collectionRef.get().then((snapshot) => {
     const documents = [];
     snapshot.forEach((doc) => {
       documents.push({ id: doc.id, ...doc.data() });
     });
     const filteredData = documents.filter((obj) => obj.phone === phone);
     if(!filteredData.length)
     {
      collectionRef
        .add(data)
        .then((docRef) => {
          res
            .status(201)
            .send({ message: "Document created", docId: docRef.id });
        })
        .catch((error) => {
          console.error("Error creating document:", error);
          res.status(500).send({ error: "Failed to create document" });
        });
     }
     else{
      res.status(500).send({ error: "User Already Exist" });
     }
   });
});

// Get a User
app.post('/api/user', (req, res) => {
  console.log("Inside login")
  console.log(req.body)
  const phone = req.body.phone
  const pass = req.body.pass
  let status = 500
  let response = {Error : "Password is Wrong"}
  const collectionRef = db.collection('users');
 collectionRef
   .get()
   .then((snapshot) => {
     const documents = [];
     snapshot.forEach((doc) => {
       documents.push({ id: doc.id, ...doc.data() });
     });
     const filteredData = documents.filter((obj) => obj.phone === phone);
     if(filteredData.length)
     {
       if (filteredData[0].pass === pass) {
        status = 200
        response = filteredData[0];
       }
     }
     else{
      response.Error = "Phone not Found";
     }
     console.log(status)
     res.status(status).send(response);
   })
   .catch((error) => {
     console.error("Error getting documents:", error);
     res.status(500).send({ error: "Failed to get documents" });
   });
});

// Create medicine Record
app.post('/api/add/medDetails', (req, res) => {
  const data = req.body;
  console.log("Inside Create Medicine");
  console.log(req.body);
  const collectionRef = db.collection("medicineDetails");
  collectionRef
    .add(data)
    .then((docRef) => {
      res.status(201).send({ message: 'Document created', docId: docRef.id });
    })
    .catch((error) => {
      console.error('Error creating document:', error);
      res.status(500).send({ error: 'Failed to create document' });
    });
});

// Get all medicine Records for a user
app.post("/api/medDetails", (req, res) => {
  const { phoneid } = req.body;
  console.log("Inside get medicine");
  console.log(req.body);
  const collectionRef = db.collection("medicineDetails");
  collectionRef
    .get()
    .then((snapshot) => {
      const documents = [];
      snapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      const filteredData = documents.filter((obj) => obj.phone === phoneid);
      const data = {data : filteredData}
      res.status(200).send(data);
    })
    .catch((error) => {
      console.error("Error getting documents:", error);
      res.status(500).send({ error: "Failed to get documents" });
    });
});

// Update a medicine Record
app.post('/api/update/medDetails/:id', (req, res) => {
  const { id } = req.params;
  const data = req.body;
  db.collection("medicineDetails")
    .doc(id)
    .get()
    .then((doc) => {
      if (doc.exists) {
        // Document found, access the data
        const dbData = doc.data();
        data.phone = dbData.phone
        const docRef = db.collection("medicineDetails").doc(id);
        docRef
          .update(data)
          .then(() => {
            res.status(200).send({ message: "Document updated" });
          })
          .catch((error) => {
            console.error("Error updating document:", error);
            res.status(500).send({ error: "Failed to update document" });
          });
        console.log("Document data:", data);
      } else {
        // Document not found
        console.log("Document does not exist");
      }
    })
   .catch((error) => {
    console.error('Error getting document:', error);
  });
});

// Delete a medicine Record
app.delete("/api/delete/medDetails/:id", (req, res) => {
  const { id } = req.params;
  const docRef = db.collection("medicineDetails").doc(id);
  docRef
    .delete()
    .then(() => {
      res.status(200).send({ message: "Document deleted" });
    })
    .catch((error) => {
      console.error("Error updating document:", error);
      res.status(500).send({ error: "Failed to update document" });
    });
});


// Get all medicine Records
app.get('/api/medicineDetails/:id', (req, res) => {
    const { id } = req.params;
  const collectionRef = db.collection('medicineDetails');
  collectionRef
    .get()
    .then((snapshot) => {
      const documents = [];
      snapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });

      const filteredData = documents.filter((obj) => obj.id === id);

      res.status(200).send(filteredData);
    })
    .catch((error) => {
      console.error('Error getting documents:', error);
      res.status(500).send({ error: 'Failed to get documents' });
    });
});


// Update a document
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const docRef = db.collection('users').doc(id);
  docRef
    .update(data)
    .then(() => {
      res.status(200).send({ message: 'Document updated' });
    })
    .catch((error) => {
      console.error('Error updating document:', error);
      res.status(500).send({ error: 'Failed to update document' });
    });
});

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const docRef = db.collection("users").doc(id);
  docRef
    .delete()
    .then(() => {
      res.status(200).send({ message: "Document deleted" });
    })
    .catch((error) => {
      console.error("Error updating document:", error);
      res.status(500).send({ error: "Failed to update document" });
    });
});


// Define routes and CRUD operations
// ...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
