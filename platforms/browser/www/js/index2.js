// import FirebaseFirestore from './dbFirebase.js';
// import SQLiteDatabase from './dbSQLite.js';
// import Views from './views.js';

document.addEventListener('deviceready', function(){

// document.addEventListener("DOMContentLoaded", function(){

    alert("hello word");

    // Views
    let viewMap = document.getElementById("view-map");
    let viewFavoris = document.getElementById("view-favoris");
    
    // Nav items
    let navItems = document.getElementsByClassName("nav-item");

    // popups
    let organismPopup = document.getElementById("organism-popup");

    // data bases
    let firebaseDB = new FirebaseFirestore();
    // let sqlLiteDB = new SQLiteDatabase();

    // sqlLiteDB.init()
    // .then( () => {

    //     sqlLiteDB.getFavoris()
    //     .then( favoris => {
            
    //         favoris.forEach(element => {
    //             alert(element.id)
    //         });

    //     })
    //     .catch( error => alert(error))

    // })
    // .catch( error => alert(error))

    let views = new  Views(viewMap,viewFavoris,navItems,organismPopup,firebaseDB);

    views.init();

})