var myBookApp = angular.module('myBook', ['ui.bootstrap','ngStorage']);

myBookApp.controller('StoreCtrl',function ($window,$scope, $rootScope,$localStorage){
  $rootScope.navigation = [{label:"Navigation of your book will show here"}];
  $rootScope.bookmarks = [{cfi:"#",title:"You can delete this bookmark by click to the trash icon",label:"Your bookmark will appear here :)", value:" 0"}];
});

myBookApp.controller('NavBarCtrl',function ($window,$scope, $rootScope,$localStorage){

  $scope.addBook = function () {
    var importBook = document.getElementById("importBook");
    importBook.click();
    importBook.onchange = function () {
      var reader = new FileReader();
      reader.onload = function(e) {
        $rootScope.$broadcast("renderBook", e.target.result);
      }
      reader.readAsArrayBuffer(importBook.files[0])
    };
  };

  $scope.$on("getMetadata", function(event, metadata) {
    $rootScope.metadata = metadata;
    $rootScope.BookID = metadata.identifier;
  });

  $scope.$on("getNavigation", function (event, navigation){
    $rootScope.navigation = navigation;
  });

  $scope.$on("getBookmarks", function (event){
    if ($localStorage[$rootScope.BookID] === undefined) {
      $localStorage[$rootScope.BookID] = [{cfi:"#",title:"Click to the trash icon to delete this content", label:"This is the first bookmark :D", value:"5"}];
    };
    $rootScope.bookmarks = $localStorage[$rootScope.BookID];
  });

  $scope.gotoChapter = function (chapterCfi) {
    $rootScope.$broadcast("gotoCfi", chapterCfi)
  };

  $scope.setBookmark = function (){
    $rootScope.$broadcast("setBookmark");
  };

  $scope.deleteBookmark = function (index){
    $rootScope.bookmarks.splice(index, 1)
  };

  $scope.gotoBookmark = function (bookmarkCfi) {
    $rootScope.$broadcast("gotoCfi", bookmarkCfi)
  };

  $scope.setLayout = function (value){
    $rootScope.$broadcast("setLayout", value);
  };

  $scope.setSize = function (value){
    switch (value) {
      case 0:
        $scope.fontsize = 16
        break;
      case 1:
        $scope.fontsize = $scope.fontsize + 2;
        break;
      case 2:
        $scope.fontsize = $scope.fontsize - 2;
    }
    $rootScope.$broadcast("setStyle","font-size", $scope.fontsize);
  };

  $scope.setTheme = function (value){
    switch (value) {
      case 0:
        $rootScope.modeViewer = {'background':'#EEEEEE', 'color':'#333'};
        $rootScope.$broadcast("setStyle","color", '#333333');
        break;
      case 1:
        $rootScope.modeViewer = {'background':'#333333', 'color':'#EEE'};
        $rootScope.$broadcast("setStyle","color", '#EEEEEE');
        break;
      case 2:
        $rootScope.modeViewer = {'background':'#F4ECD8','color':'#5B4636'};
        $rootScope.$broadcast("setStyle","color", '#5B4636');
    }
  };

  $scope.backup = function () {

  };
  $scope.restore = function () {

  };
  $scope.reset = function () {

  };
});

myBookApp.controller("ViewerCtrl", function($window, $scope, $rootScope,$localStorage){
  $scope.Book = ePub();

  $scope.prevPage = function (){
    $scope.Book.prevPage()
  };

  $scope.nextPage = function (){
    $scope.Book.nextPage()
  };

  $window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
          $scope.Book.nextPage()
        return; };
    if (event.key === 'ArrowLeft') {
          $scope.Book.prevPage()
        return; }
   }, false);

   $scope.$on("renderBook", function (event, dataBook){
     var resetViewer = $window.document.getElementById("book");
     while (resetViewer.firstChild) {
         resetViewer.removeChild(resetViewer.firstChild);
     };
     $scope.Book = ePub(dataBook);
     $scope.Book.renderTo("book");

     $scope.Book.getMetadata().then(function(meta){
        $rootScope.$broadcast("getMetadata", meta);
     });

     $scope.Book.getToc().then(function(nav){
       $rootScope.$broadcast("getNavigation", nav);
     });

     $scope.Book.generatePagination().then(function(pagi){
       $rootScope.$broadcast("getBookmarks");
        console.log("Pagination generated");
     });
   });

  $scope.$on("setLayout", function (event, value){
       $scope.Book.forceSingle(value)
  });

  $scope.$on("setStyle", function (event, style, value){
    $scope.Book.setStyle(style, value)
  });

  $scope.$on("gotoCfi", function (event, localCfi){
    $scope.Book.gotoCfi(localCfi)
  });
  $scope.$on("setBookmark", function (event) {
    function bookmark (cfi){ this.cfi = cfi; this.label = new Date(); this.title = new Date(); this.value = $scope.Book.pagination.percentageFromCfi(cfi) * 100 };
    $rootScope.bookmarks.push(new bookmark ($scope.Book.getCurrentLocationCfi())) ;
  });
});
