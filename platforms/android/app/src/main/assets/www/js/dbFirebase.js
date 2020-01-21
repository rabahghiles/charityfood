class FirebaseFirestore {

    constructor() {
        
        this.db = firebase.initializeApp({

            apiKey: "AIzaSyDgBm4eWmKJk2zFaZ358VH4wDwCToJHjYE",
            authDomain: "charity-food.firebaseapp.com",
            databaseURL: "https://charity-food.firebaseio.com",
            projectId: "charity-food",
            storageBucket: "charity-food.appspot.com",
            messagingSenderId: "307113824448",
            appId: "1:307113824448:web:dba4b082e7f27968a55d25",
            measurementId: "G-RQ1RBDY5PQ"
    
        }).firestore();

    }

    
    getEstablishments(){

        let db = this.db;

        let p = new Promise(function(resolve, reject) {

            db.collection("establishments").get()
            .then(function(querySnapshot) {

                let establishments = [];

                querySnapshot.forEach(function(doc) {


                    establishments.push({
                        id: doc.id,
                        ... doc.data()
                    });

                });

                resolve(establishments);

            })
            .catch(function(error) {
                
                reject(error)
            
            });

        });

        return p;
    }

    getOrganism(docRef){
        
        let db = this.db;

        let p = new Promise(function(resolve, reject) {

            db.doc(docRef).get()
            .then(function(doc) {

                if (doc.exists) resolve(doc)
                else reject("L'organisme n'existe plus")

            })
            .catch(function(error){
                reject(error);
            });

        });

        return p;

    }

};