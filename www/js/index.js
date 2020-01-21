document.addEventListener('deviceready', function(){

    // Views
    let viewMap = document.getElementById("view-map");
    let viewFavoris = document.getElementById("view-favoris");
    
    // Nav items
    let navItems = document.getElementsByClassName("nav-item");

    // popups
    let organismPopup = document.getElementById("organism-popup");

    // data bases
    let firebaseDB = new FirebaseFirestore();
    let sqlLiteDB = new SQLiteDatabase();

    let views = new  Views(viewMap,viewFavoris,navItems,organismPopup,firebaseDB,sqlLiteDB);

    views.init();

})