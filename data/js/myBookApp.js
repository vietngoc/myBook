const EventBus = new Vue();

var TOCBar = new Vue({

  el: '#TOCBar',
  data:{
    identifier:'',
    chapters:[],
    showBar: false,
  },

  methods: {

    gotoURI: function (uri) {
      EventBus.$emit('gotoURI',uri);
      console.log(uri);
    },

  },

  created:  function () {
  
    EventBus.$on('showTOCBar', () => {
      if (!this.showBar) {
        this.showBar = true;
      } else this.showBar = false;
    });

    EventBus.$on('setNavigation', (info) => {
      this.chapters = info.toc;
    })
  },
})

var BookmarkBar = new Vue({

  el: '#BookmarkBar',
  data:{
    identifier: '',
    Bookmarks:[],
    showBar: false,
  },

  methods: {

    model: function () {
      var model = [{
        cfi:"#",
        title:"Click here to edit bookmark",
        label:"Your bookmark is here :)"
      }];
      return model;
    },

    gotoURI: function (uri) {
      EventBus.$emit('gotoURI', uri)
    },

    edit: function (event,key) {
      this.Bookmarks[key].label = event.target.innerText;
    },

    push: function (cfi, label) {
      this.Bookmarks.push({
        cfi:cfi,
        label:label || new Date().toLocaleString(),
        title:Date()
      });
    },

    remove: function (key) {
      this.Bookmarks.splice(key, 1);
    },

  },

  created: function () {

    EventBus.$on('showBookmarkBar', () => {
      if (!this.showBar) {
        this.showBar = true
      } else this.showBar = false;
    }),

    EventBus.$on('setBookmarks', (id) => {
      this.Bookmarks = this.model();
      if (!localStorage.getItem(id)) {
        localStorage.setItem(id,JSON.stringify(this.Bookmarks))
      };
      this.identifier = id;
      this.Bookmarks = JSON.parse(localStorage.getItem(id));
    }),

    EventBus.$on('createBookmark',(cfi) => {
      this.push(cfi);
    }),

    EventBus.$on('saveBookmarks', (cfi) => {
      this.push(cfi,"The last reader");
      localStorage.setItem(this.identifier,JSON.stringify(this.Bookmarks));
    })

  }

})

var Customs = new Vue({

  el: "#CustomBar",
  data:{
    id: '',
    showBar: false,
  },

  methods: {

    sendBug: function () {
      window.open("https://www.github.com/vietngoc/mybook/issues", "_blank" );
    },

    setFlow: function (f) {

      switch (f) {
        case 'scrolled':
          EventBus.$emit('setFlow', 'scrolled');
          break;

        case 'paginated':
          EventBus.$emit('setFlow', 'paginated');
          break;
      
        default:
          EventBus.$emit('setFlow', 'paginated');
      }

    },

    setTheme: function (themes) {
      EventBus.$emit('setThemes',themes)
    },

  },

  created: function () {
    EventBus.$on('showCustomBar', () => {
      if (!this.showBar) {
        this.showBar = true;
      } else this.showBar = false;
    });
   },

});

var Navbar = new Vue ({
   el: '#Navbar',
   data: {
      identifier:"",
      title: "myBook",
      description: "Make browser to EPUB reader with pure power of JavaScript",
      creator: "",
      publisher: "",
      fontsize: 16
      },
   methods: {

      showCustomBar:function () {
        EventBus.$emit('showCustomBar');
      },

      showBookmarkBar: function () {
        EventBus.$emit('showBookmarkBar',);
      },

      showTOCBar: function () {
        EventBus.$emit('showTOCBar');
      },

      setFontSize: function (s) {
        switch (s) {
          case 1:
            if (this.fontsize <60) {this.fontsize = this.fontsize + 2;};
            break;
          case 0:
            if (this.fontsize > 0) { this.fontsize = this.fontsize - 2};
            break;
          default:
            this.fontsize = 16;
        };
        EventBus.$emit("setFontSize", this.fontsize);
      },

      openLibrary: function () {
        window.open("https://www.gutenberg.org/", "_blank");
      },

      addBook: function (a) {
        var addBook = document.querySelector("#addBook");
        addBook.click();
        addBook.onchange = function (b) {
        var reader = new FileReader();
          reader.readAsArrayBuffer(addBook.files[0])
          reader.onload = function (b) {
            EventBus.$emit('NewBook',b.target.result);
          }
        }
      }, 

      switchPage: function (p) {
        EventBus.$emit("switchPage",p)
      },

      addBookmark: function () {
        EventBus.$emit("getBookmark");
      },
        
   },

   created: function () {
     EventBus.$on('setMetadata', (info) => {
      this.identifier = info.identifier;
      this.title = info.title;
      this.description = info.description;
      this.creator = info.creator;
      this.publisher = info.publisher;
     });
    }
});

var Viewer = new Vue({
  el: '#Viewer',
  data: {
    Book:{}, 
    x:Number,y:Number
  },

  mounted: function init() {

    this.Book = new ePub('epub.epub',{});

    window.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {  this.rendition.next() };
      if (event.key === 'ArrowLeft') {  this.rendition.prev() }
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {  this.rendition.next() };
      if (event.key === 'ArrowUp') {  this.rendition.prev() }
    });

    window.addEventListener("beforeunload", (event) => {
      EventBus.$emit('saveBookmarks',this.rendition.location.start.cfi)
    });
  },

  methods: {

    resetViewer: function () {
      var resetViewer = document.querySelector("#book");
      while (resetViewer.firstChild) {
          resetViewer.removeChild(resetViewer.firstChild);
      };
    },

    themeViewer: function (t) {
      document.querySelector('#book').removeAttribute("class")
      document.querySelector('#book').classList.add(t);
    },

    sizeofViewer: function () {
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
      this.x = vw - 160;
      this.y = vh - 48;
      console.log(this.x,this.y, vw, vh);
    }

  },

  watch: {
    Book: function () {
  
      this.sizeofViewer();
      this.rendition = this.Book.renderTo("book", {width:this.x, height:this.y});
      this.rendition.display();
      
      this.rendition.themes.register('default',{});
      this.rendition.themes.register('light', {'body':{'background': '#EEE','color': '#333'}});
      this.rendition.themes.register('dark', {'body':{'background': 'rgb(28, 27, 34);','color': '#EEE !important'}});
      this.rendition.themes.register('sepia', {'body':{'background': '#F4ECD8','color': '#5B4636'}});
      console.log(this.rendition.getContents()); 
  
      this.Book.loaded.metadata.then((metadata) => { EventBus.$emit('setMetadata', metadata) });
      this.Book.loaded.navigation.then((navigation) => { EventBus.$emit('setNavigation', navigation); });
      this.Book.loaded.metadata.then((metadata) => { EventBus.$emit('setBookmarks', metadata.identifier) });
   
    }
  },

  created: function () {

    EventBus.$on('NewBook', (b) => {

      EventBus.$emit('saveBook');
      this.resetViewer();
      this.rendition.clear;
        
      this.Book = new ePub(b,{});
      console.log('Your book been added in library. Please wait while browser process it :)');

    }),

    EventBus.$on('gotoURI', (u) => {
      this.rendition.display(u);
    }),

    EventBus.$on('switchPage',(p)=>{
      switch (p) {
        case 0:
          this.rendition.prev();
          break;
        case 1:
          this.rendition.next()
          break;
        default:
          this.rendition.display(0)
      };
    }),

    EventBus.$on('setFlow', (f) => {
      this.rendition.flow(f);
      console.log(f);
    }),

    EventBus.$on("setFontSize", (s) => {
      this.rendition.themes.fontSize(s + 'px');
    }),

    EventBus.$on('setThemes', (t) => {
      switch (t) {
        case 'light':
          this.rendition.themes.select("light");
          this.themeViewer("light");
          break;
        case 'dark':
          this.rendition.themes.select("dark");
          this.themeViewer("dark");
          break;
        case 'sepia':
          this.rendition.themes.select("sepia");
          this.themeViewer('sepia');
          break;
        default:
          this.rendition.themes.select("default");
      }
        this.sizeofViewer();
        this.rendition.resize(240,320);
        this.rendition.resize(1440,740);
    }),

    EventBus.$on('getBookmark', () => {
       EventBus.$emit('createBookmark',this.rendition.location.start.cfi)
    }),

    EventBus.$on('saveBook', () => {
      EventBus.$emit('saveBookmarks',this.rendition.location.start.cfi)
    })

  }
})
