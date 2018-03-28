var myApp = angular.module("avaamoApp", []);
myApp.run(function ($http) {
  $http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
});


myApp.controller("fileController", ['$scope', 'fileUpload', '$http', function (scope, fileUpload, http) {
  
  scope.formData = {};
  scope.isShowDetails = false;
  scope.finalWordsArray = [];
  scope.documentDetails = [];
  var APIkey = 'dict.1.1.20170610T055246Z.0f11bdc42e7b693a.eefbde961e10106a4efa7d852287caa49ecc68cf';
  scope.showContent = function ($fileContent) {
    var data = $fileContent;
    var wordsArray = splitByWords(data);
    var wordsMap = createWordMap(wordsArray);
    scope.finalWordsArray = sortByCount(wordsMap);


    for (let i = 1; i <= 100; i++) {
      //console.log("asdg" + scope.finalWordsArray[i].count);
      http.get('https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=' + APIkey + '&lang=en-ru&text=' + scope.finalWordsArray[i].name).then(function (data) {
        console.log(JSON.stringify(data));
        var temp = {
          word: scope.finalWordsArray[i].name,
          count: scope.finalWordsArray[i].count,
          mean: (data.data['def'][0].pos) ? data.data['def'][0].pos : '',
          pos: (data.data['def'][0].tr[0].mean) ? data.data['def'][0].tr[0].mean : []
        }
        scope.documentDetails.push(temp);
      });
    }
  };
  scope.getwordDetails = function (wordText) {
    alert(wordText);
    $.map(scope.finalWordsArray, function (elem, index) {
      if (elem.name == wordText)
        http.get('https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=' + APIkey + '&lang=en-ru&text=' + wordText).then(function (data) {
          console.log(JSON.stringify(data));
          scope.formData.wordCount = scope.finalWordsArray[index].count;
          scope.formData.pos = (data.data['def'][0].pos) ? data.data['def'][0].pos : '';
          scope.formData.mean = [];
          if (data.data['def'][0].tr[0].mean) {
            for (let i = 0; i < data.data['def'][0].tr[0].mean.length; i++) {
              scope.formData.mean.push(data.data['def'][0].tr[0].mean[i].text);
            }
          }
          scope.isShowDetails = true;
        });
    });

  }
  scope.changeSlider = function () {
    console.log(scope.formData.slider);
    scope.somedata=[];
   /* scope.myChartOpts={seriesDefaults: {
      // Make this a pie chart.
      renderer: jQuery.jqplot.PieRenderer,
      rendererOptions: {
        // Put data labels on the pie slices.
        // By default, labels show the percentage of the slice.
        showDataLabels: true
      }
    },
    legend: { show:true, location: 'e' }
  }*/

    for(let i = 1;i<=scope.formData.slider; i++){
      scope.somedata.push(scope.finalWordsArray[i]);
    }
  }
  scope.uploadFile = function () {
    var file = scope.myFile;
    var uploadUrl = "http://norvig.com/";
    fileUpload.uploadFileToUrl(file, uploadUrl);
  };

   
}]);

function splitByWords(text) {
  var wordsArray = text.split(/\s+/);
  return wordsArray;
}


function createWordMap(wordsArray) {
  var wordsMap = {};
  wordsArray.forEach(function (key) {
    if (wordsMap.hasOwnProperty(key)) {
      wordsMap[key]++;
    } else {
      wordsMap[key] = 1;
    }
  });
  return wordsMap;
}

function sortByCount(wordsMap) {
  var finalWordsArray = [];
  finalWordsArray = Object.keys(wordsMap).map(function (key) {
    return {
      name: key,
      count: wordsMap[key]
    };
  });

  finalWordsArray.sort(function (a, b) {
    return b.count - a.count;
  });
  return finalWordsArray;
}
myApp.directive('onReadFile', function ($parse) {
  return {
    restrict: 'A',
    scope: false,
    link: function (scope, element, attrs) {
      var fn = $parse(attrs.onReadFile);

      element.on('change', function (onChangeEvent) {
        var reader = new FileReader();

        reader.onload = function (onLoadEvent) {
          scope.$apply(function () {
            fn(scope, { $fileContent: onLoadEvent.target.result });
          });
        };

        reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
      });
    }
  };
});
myApp.directive('fileModel', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function () {
        scope.$apply(function () {
          modelSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);

myApp.service('fileUpload', ['$http', function ($http) {
  this.uploadFileToUrl = function (file, uploadUrl) {
    var fd = new FormData();
    fd.append('file', file);

    $http.post(uploadUrl, fd, {
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    });

  }
}]);
 /* myApp.value('charting', {
    pieChartOptions: {
      seriesDefaults: {
        // Make this a pie chart.
        renderer: $.jqplot.PieRenderer,
        rendererOptions: {
          // Put data labels on the pie slices.
          // By default, labels show the percentage of the slice.
          showDataLabels: true
        }
      },
      legend: { show:true, location: 'e' }
    }
  });*/