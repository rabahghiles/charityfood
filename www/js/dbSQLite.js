class SQLiteDatabase {

    constructor() {

        const dbName = "favoris";
        const dbVersion = "1.0";
        const dbDescription = "Une base de données favoris";
        const dbSize = 20;

        this.db = window.openDatabase(dbName, dbVersion, dbDescription, dbSize);

    }

    init() {

        let db = this.db;
        
        let p = new Promise(function(resolve, reject) {

            db.transaction(function(tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS favoris (id text primary key, title text, adress text, adressmp text)',[],
                function(tx, rs){
                    resolve()
                },
                function(tx, error) {
                    reject("Erreur lors de la création de la base de données interne");
                });
            });
        
        });

        return p;
    
    }

    
    getFavoris(){

        let db = this.db;

        let p = new Promise(function(resolve, reject) {

            db.transaction(function(tx) {

                tx.executeSql('SELECT * FROM favoris',[], (tx, rs) => {

                    let favoris = [];
        
                    for(let i=0;i<rs.rows.length;i++){
                        favoris.push({
                            id: rs.rows.item(i).id,
                            title: rs.rows.item(i).title,
                            adress : rs.rows.item(i).adress,
                            adressmp : rs.rows.item(i).adressmp,
                        })
                    }

                    resolve(favoris);
                
                }, (tx, error) => reject("Erreur lors de la récupération des favoris"));
            });

        });

        return p;

    }

    addFavori(favori){
        
        let db = this.db;

        let p = new Promise( (resolve, reject) => {

            this.isInFavoris(favori.id)
            .then( response => {

                if ( response ) reject("L'établissement exite déja dans les favoris")
                else {

                    db.transaction(function(tx) {
            
                        tx.executeSql('INSERT INTO favoris (id,title,adress,adressmp) VALUES("'+favori.id+'","'+favori.title+'","'+favori.adress+'","'+favori.adressmp+'")',[],
                            function(tx, rs) { 
                                resolve("Etablissement ajouté aux favoris")
                            },
                            function(tx, error) {
                                reject("Erreur lors de l'ajout aux favoris") 
                            }
                        );
                    
                    });
                
                }

            })
            .catch( error => {
                reject(error);
            })

        });

        return p;
    }

    deleteFavori(id){

        let db = this.db;

        let p = new Promise( (resolve, reject) => {

            this.isInFavoris(id)
            .then( response => {

                if ( !response ) reject("L'établissement n'est plus dans les favoris")
                else {

                    db.transaction(function(tx) {
                        tx.executeSql('DELETE FROM favoris WHERE id="'+id+'"',[],
                            function(tx, rs) { resolve("L'établissement à bien été suprimé des favoris") },
                            function(tx, error) { reject("Erreur lors de la supression des favoris") }
                        );
                    });
                
                }

            })
            .catch( error => {
                reject(error);
            })

        });

        return p;
    }

    isInFavoris(id){

        let db = this.db;

        let p = new Promise(function(resolve, reject) {

            db.transaction(function(tx) {
                tx.executeSql('SELECT * FROM favoris WHERE id="'+id+'"',[],
                    function (tx, rs) {
                        if( rs.rows.length == 0 ){
                            resolve(false)
                        }else {
                            resolve(true)
                        }
                    },
                    function (tx, error) { reject("Error lors de la recherche d'un favoris") }
                );
            });

        });

        return p;

    }

};