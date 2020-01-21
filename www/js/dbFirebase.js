class FirebaseFirestore {

    constructor() {
        
        this.db = firebase.initializeApp({

            apiKey: YOUR_API_KEY,
            authDomain: APPLICATION_AUTH_DOMAIN,
            databaseURL: DATABASE_URL,
            projectId: PROJECT_ID,
            appId: APPLICATION_ID
    
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